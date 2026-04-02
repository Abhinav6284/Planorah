from unittest.mock import patch

from django.test import TestCase
from django.contrib.auth import get_user_model

from assistant.models import (
    AssistantActionExecution,
    AssistantActionProposal,
    AssistantConversation,
    AssistantTurn,
)
from assistant.serializers import AssistantV2TurnSerializer
from assistant.services.orchestrator import confirm_action, run_turn


class AssistantV2TurnSerializerTests(TestCase):
    def test_text_channel_requires_message(self):
        serializer = AssistantV2TurnSerializer(
            data={
                "channel": "text",
                "message": "",
            }
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("message", serializer.errors)

    def test_voice_channel_allows_empty_message(self):
        serializer = AssistantV2TurnSerializer(
            data={
                "channel": "voice",
                "message": "",
            }
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)


class AssistantConfirmActionTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            email="assistant-test@example.com",
            username="assistant_test_user",
            password="testpass123",
        )
        self.conversation = AssistantConversation.objects.create(
            user=self.user,
            channel="text",
            context_source="assistant",
        )
        self.turn = AssistantTurn.objects.create(
            conversation=self.conversation,
            channel="text",
            user_input_text="hello",
            transcript="hello",
            assistant_text="hi",
            status=AssistantTurn.STATUS_OK,
        )
        self.proposal = AssistantActionProposal.objects.create(
            conversation=self.conversation,
            turn=self.turn,
            action_type="task.update_status",
            summary="Update task",
            args={"task_id": "abc", "status": "in_progress"},
            args_preview={"task_id": "abc", "status": "in_progress"},
            requires_confirmation=True,
        )

    def test_unconfirmed_action_sets_cancelled(self):
        payload = confirm_action(
            user=self.user,
            conversation_id=str(self.conversation.id),
            proposal_id=str(self.proposal.id),
            confirmed=False,
        )
        self.proposal.refresh_from_db()
        self.assertEqual(payload["execution_status"], AssistantActionExecution.STATUS_CANCELLED)
        self.assertEqual(self.proposal.status, AssistantActionProposal.STATUS_CANCELLED)
        self.assertEqual(AssistantActionExecution.objects.filter(proposal=self.proposal).count(), 0)

    def test_existing_execution_is_reused(self):
        existing = AssistantActionExecution.objects.create(
            user=self.user,
            conversation=self.conversation,
            proposal=self.proposal,
            status=AssistantActionExecution.STATUS_SUCCEEDED,
            result={"ok": True},
        )
        before_count = AssistantActionExecution.objects.filter(proposal=self.proposal).count()
        payload = confirm_action(
            user=self.user,
            conversation_id=str(self.conversation.id),
            proposal_id=str(self.proposal.id),
            confirmed=True,
        )
        after_count = AssistantActionExecution.objects.filter(proposal=self.proposal).count()

        self.assertEqual(payload["execution_status"], AssistantActionExecution.STATUS_SUCCEEDED)
        self.assertEqual(payload["result"], {"ok": True})
        self.assertEqual(before_count, after_count)
        self.assertEqual(after_count, 1)
        self.assertEqual(str(existing.id), str(AssistantActionExecution.objects.get(proposal=self.proposal).id))


class AssistantRunTurnTests(TestCase):
    def setUp(self):
        user_model = get_user_model()
        self.user = user_model.objects.create_user(
            email="assistant-turn@example.com",
            username="assistant_turn_user",
            password="testpass123",
        )

    @patch("assistant.services.orchestrator.build_backend_context", return_value={"context_source": "assistant"})
    @patch("assistant.services.orchestrator.generate_assistant_json")
    def test_unsupported_action_proposals_do_not_crash_turn(self, mock_llm, _mock_context):
        mock_llm.return_value = {
            "status": "ok",
            "assistant_text": "Chaliye dekhte hain.",
            "language": "hinglish",
            "ui_blocks": [],
            "action_proposals": [
                {
                    "action_type": "unknown.action",
                    "summary": "Do unsupported thing",
                    "args": {},
                    "args_preview": {},
                    "requires_confirmation": True,
                    "is_async": False,
                }
            ],
        }

        payload = run_turn(
            user=self.user,
            channel="text",
            context_source="assistant",
            frontend_context={},
            message="please do it",
            language_preference="hinglish",
        )

        self.assertEqual(payload["status"], AssistantTurn.STATUS_CLARIFICATION)
        self.assertEqual(payload["action_proposals"], [])
        self.assertIn("ui_blocks", payload)
        self.assertNotIn("tts", payload)

    @patch("assistant.services.orchestrator.build_backend_context", return_value={"context_source": "assistant"})
    @patch("assistant.services.orchestrator.generate_assistant_json")
    def test_supported_action_creates_confirmable_proposal(self, mock_llm, _mock_context):
        mock_llm.return_value = {
            "status": "ok",
            "assistant_text": "Task update karne ke liye confirm karo.",
            "language": "hinglish",
            "ui_blocks": [],
            "action_proposals": [
                {
                    "action_type": "task.update_status",
                    "summary": "Mark task in progress",
                    "args": {"task_id": "abc", "status": "in_progress"},
                    "args_preview": {"task_id": "abc", "status": "in_progress"},
                    "requires_confirmation": True,
                    "is_async": False,
                }
            ],
        }

        payload = run_turn(
            user=self.user,
            channel="text",
            context_source="assistant",
            frontend_context={},
            message="mark task done",
            language_preference="hinglish",
        )

        self.assertEqual(payload["status"], AssistantTurn.STATUS_NEEDS_CONFIRMATION)
        self.assertEqual(len(payload["action_proposals"]), 1)
        self.assertEqual(payload["action_proposals"][0]["action_type"], "task.update_status")
        self.assertNotIn("tts", payload)

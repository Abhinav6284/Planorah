"""
AI Onboarding Call Service
──────────────────────────
Builds a hyper-personalised system prompt and first message from the user's
onboarding data, then triggers an outbound AI call via the configured provider.

The call runs in a background thread so it never blocks the HTTP response.
"""

import os
import threading
import logging

from .providers import get_provider

logger = logging.getLogger(__name__)


# ───────────────────────────────────────────────
# Platform feature catalogue (injected into prompt)
# ───────────────────────────────────────────────

PLANORAH_FEATURES = """
## What Planorah Offers:

📍 **AI Roadmap Builder**
   Generate a fully structured, milestone-based learning or project roadmap
   tailored to your goal — with timelines, resources, and difficulty levels.

✅ **Smart Task Manager**
   Break your roadmap into daily/weekly executable tasks. Set deadlines,
   mark completions, and track your pace automatically.

📄 **AI Resume Builder**
   Generate an ATS-optimised resume in seconds from your profile, skills,
   and experiences — tailored to any target role.

🔍 **ATS Scanner**
   Paste any job description and instantly see how well your resume matches —
   with a score, missing keywords, and improvement tips.

🎤 **Interview Prep (AI Mock Interviews)**
   Practice role-specific interview questions with instant AI feedback on
   your answers, covering technical and behavioural areas.

📅 **AI Scheduler**
   Planorah auto-schedules your weekly study/work sessions based on your
   committed hours and roadmap milestones.

🌐 **Portfolio Builder**
   Create a professional, shareable portfolio page that showcases your
   projects, skills, and achievements.

🐙 **GitHub Integration**
   Link your repositories so your coding activity and contributions appear
   directly on your Planorah profile.

🔥 **Streak & XP System**
   Earn XP for every task completed and build daily streaks — gamified
   consistency keeps you accountable.

🤖 **AI Assistant (24/7 Chat)**
   Planorah's chat assistant knows your goals, roadmap, and tasks — ask it
   anything about your plan or the platform.

📊 **Progress Analytics**
   Deep insights into your completion rate, learning velocity, streak
   history, and readiness score.
"""


# ───────────────────────────────────────────────
# Prompt builders
# ───────────────────────────────────────────────

def _fmt(val: str | None, fallback: str = "Not specified") -> str:
    """Safely format a field value."""
    return val.replace("_", " ").title() if val else fallback


def build_system_prompt(user, profile) -> str:
    name = user.first_name or user.username
    education_stage = _fmt(profile.education_stage)
    purpose = _fmt(profile.purpose)
    domain = _fmt(profile.domain)
    goal = profile.goal_statement or "their personal goal"
    weekly_hours = profile.weekly_hours or 5
    validation_mode = _fmt(profile.validation_mode, "Automatic")

    # Format stage-specific onboarding JSON into readable bullet points
    onboarding_data = profile.onboarding_data or {}
    onboarding_details_lines = []
    if isinstance(onboarding_data, dict):
        for key, value in onboarding_data.items():
            if value:
                formatted_key = key.replace("_", " ").title()
                onboarding_details_lines.append(
                    f"  • {formatted_key}: {value}")
    onboarding_details = (
        "\n### Stage-Specific Details:\n" + "\n".join(onboarding_details_lines)
        if onboarding_details_lines
        else ""
    )

    # Pick top 3 features most relevant to the user's purpose
    purpose_to_features = {
        "skill_learning":       ["AI Roadmap Builder", "Smart Task Manager", "AI Scheduler"],
        "project_building":     ["AI Roadmap Builder", "GitHub Integration", "Portfolio Builder"],
        "research_work":        ["AI Roadmap Builder", "Smart Task Manager", "Progress Analytics"],
        "teaching_mentoring":   ["AI Roadmap Builder", "Portfolio Builder", "Progress Analytics"],
        "personal_goal":        ["Smart Task Manager", "Streak & XP System", "Progress Analytics"],
    }
    raw_purpose = profile.purpose or "skill_learning"
    top_features = purpose_to_features.get(
        raw_purpose, ["AI Roadmap Builder", "Smart Task Manager", "AI Assistant"])
    features_str = "\n".join(
        f"  {i+1}. {f}" for i, f in enumerate(top_features))

    prompt = f"""You are Aria, Planorah's personal AI onboarding guide. You are calling {name} immediately after they completed onboarding on Planorah — an AI-powered productivity and learning platform.

## User Profile:
- Name: {name}
- Email: {user.email}
- Education Stage: {education_stage}
- Domain / Field: {domain}
- Primary Purpose on Planorah: {purpose}
- Goal: {goal}
- Weekly Hours Committed: {weekly_hours} hours/week
- Validation Mode: {validation_mode}
{onboarding_details}

{PLANORAH_FEATURES}

## Your Objectives on This Call:
1. Warmly welcome {name} to Planorah and congratulate them on completing onboarding.
2. Briefly confirm their goal — "{goal}" — and ask if that's accurate.
3. Highlight these 3 features that are MOST relevant to their purpose ({purpose}):
{features_str}
4. Give them ONE clear first action to take right now (e.g., "Go to the Roadmap section and hit Generate — it will build your personalised roadmap in 30 seconds").
5. Let them ask questions — answer based on the Planorah features above.
6. Close with motivation: remind them that with {weekly_hours} hours/week and a clear goal, Planorah will get them there.

## Tone & Rules:
- Friendly, warm, concise — not salesy or robotic.
- Keep the total call under 3 minutes.
- Always use {name}'s name at least twice.
- Never make up features that don't exist; stick to the list above.
- If asked something you don't know, say "Great question — you can always reach our support team at support@planorah.me."
- End the call naturally when the user seems satisfied or says goodbye.
"""
    return prompt


def build_first_message(user, profile) -> str:
    name = user.first_name or user.username
    goal = profile.goal_statement or "your goal"
    return (
        f"Hey {name}! This is Aria calling from Planorah. "
        f"I noticed you just finished your onboarding — congrats on taking that first step! "
        f"I'm your personal AI guide, and I just wanted to quickly walk you through "
        f"how Planorah can help you with {goal}. "
        f"Do you have about two minutes?"
    )


# ───────────────────────────────────────────────
# Main trigger
# ───────────────────────────────────────────────

def trigger_onboarding_call(user, profile) -> None:
    """
    Entry point: kick off the onboarding AI call for a newly onboarded user.

    • Validates phone number is present.
    • Picks the configured provider.
    • Spawns a daemon thread so the HTTP response is not blocked.
    • Logs the result in AICallLog.
    """
    phone = (user.phone_number or "").strip()
    if not phone:
        logger.info(
            f"[AICall] Skipping call for {user.email} — no phone number on record."
        )
        return

    provider = get_provider()
    if provider is None:
        logger.info(
            f"[AICall] No provider configured — skipping call for {user.email}."
        )
        return

    system_prompt = build_system_prompt(user, profile)
    first_message = build_first_message(user, profile)
    provider_name = os.getenv("AI_CALL_PROVIDER", "unknown").lower()
    metadata = {
        "user_id": str(user.id),
        "email": user.email,
        "trigger": "onboarding_complete",
        "platform": "planorah",
    }

    def _run_call():
        from ai_calls.models import AICallLog

        log = AICallLog.objects.create(
            user=user,
            phone_number=phone,
            provider=provider_name,
            trigger="onboarding_complete",
            status="initiated",
        )
        try:
            result = provider.initiate_call(
                phone, system_prompt, first_message, metadata)

            if result.get("success"):
                log.call_id = result.get("call_id") or ""
                log.status = "success"
                logger.info(
                    f"[AICall] Onboarding call initiated ✓ | user={user.email} | "
                    f"provider={provider_name} | call_id={result.get('call_id')}"
                )
            else:
                log.status = "failed"
                log.error_message = result.get(
                    "error", "Unknown error from provider")
                logger.error(
                    f"[AICall] Call failed | user={user.email} | "
                    f"provider={provider_name} | error={log.error_message}"
                )

        except Exception as exc:
            log.status = "failed"
            log.error_message = str(exc)
            logger.error(
                f"[AICall] Unexpected exception | user={user.email} | error={exc}",
                exc_info=True,
            )
        finally:
            log.save()

    thread = threading.Thread(
        target=_run_call, daemon=True, name=f"ai_call_{user.id}")
    thread.start()
    logger.debug(f"[AICall] Background call thread started for {user.email}.")

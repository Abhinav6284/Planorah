from rest_framework import serializers


class AssistantV2TurnSerializer(serializers.Serializer):
    channel = serializers.ChoiceField(choices=["text", "voice"])
    context_source = serializers.CharField(required=False, allow_blank=True, default="assistant")
    frontend_context = serializers.JSONField(required=False, default=dict)
    conversation_id = serializers.UUIDField(required=False)
    message = serializers.CharField(required=False, allow_blank=True, default="")
    language_preference = serializers.CharField(required=False, allow_blank=True, default="hinglish")
    voice_name = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_frontend_context(self, value):
        if value in (None, ""):
            return {}
        if not isinstance(value, dict):
            raise serializers.ValidationError("frontend_context must be a JSON object")
        return value

    def validate(self, attrs):
        channel = attrs.get("channel")
        if channel == "text" and not str(attrs.get("message") or "").strip():
            raise serializers.ValidationError({"message": "message is required for text channel"})
        return attrs


class AssistantV2ConfirmSerializer(serializers.Serializer):
    conversation_id = serializers.UUIDField()
    proposal_id = serializers.UUIDField()
    confirmed = serializers.BooleanField()
    idempotency_key = serializers.CharField(required=False, allow_blank=True, default="")


class AssistantV2JobSerializer(serializers.Serializer):
    job_id = serializers.UUIDField()


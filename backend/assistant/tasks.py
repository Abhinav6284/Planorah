from celery import shared_task
from django.utils import timezone

from assistant.models import AssistantActionExecution, AssistantJob
from assistant.services.orchestrator import execute_action_execution


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=True, retry_kwargs={"max_retries": 2})
def run_assistant_action_job(self, execution_id: str, job_id: str):
    job = AssistantJob.objects.select_related("execution").get(id=job_id)
    job.status = AssistantJob.STATUS_RUNNING
    job.save(update_fields=["status", "updated_at"])

    payload = execute_action_execution(execution_id)
    execution_status = payload.get("execution_status")

    if execution_status == AssistantActionExecution.STATUS_SUCCEEDED:
        job.status = AssistantJob.STATUS_SUCCEEDED
        job.result = payload.get("result") or {}
        job.error = ""
    elif execution_status == AssistantActionExecution.STATUS_CANCELLED:
        job.status = AssistantJob.STATUS_CANCELLED
        job.result = payload.get("result") or {}
        job.error = payload.get("error") or ""
    else:
        job.status = AssistantJob.STATUS_FAILED
        job.result = payload.get("result") or {}
        job.error = payload.get("error") or ""

    job.completed_at = timezone.now()
    job.save(update_fields=["status", "result", "error", "completed_at", "updated_at"])
    return payload


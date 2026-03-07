import logging

from .utils import update_streak

logger = logging.getLogger(__name__)


def record_activity(user, activity_type="generic"):
    """
    Central activity pipeline.
    Use this instead of calling update_streak directly.
    """
    try:
        update_streak(user, activity_type)
    except Exception:
        logger.exception(
            "Failed to record activity for user %s", getattr(user, "id", None)
        )

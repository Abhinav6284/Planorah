"""
Centralized constants for the Planorah Behavioral Intelligence System.
All thresholds, weights, event types, and identities are defined here.
No hardcoded values in services or views.
"""


class EventType:
    """All behavioral event types tracked by the system."""

    # Task Events
    TASK_STARTED = 'task_started'
    TASK_COMPLETED = 'task_completed'
    TASK_SKIPPED = 'task_skipped'
    TASK_DELAYED = 'task_delayed'
    TASK_REOPENED = 'task_reopened'
    TASK_ABANDONED = 'task_abandoned'

    # Session Events
    SESSION_STARTED = 'session_started'
    SESSION_ENDED = 'session_ended'
    SESSION_QUIT = 'session_quit'
    SESSION_INTERRUPTED = 'session_interrupted'

    # Roadmap Events
    ROADMAP_OPENED = 'roadmap_opened'
    ROADMAP_PROGRESS_UPDATED = 'roadmap_progress_updated'
    ROADMAP_ABANDONED = 'roadmap_abandoned'
    ROADMAP_COMPLETED = 'roadmap_completed'
    ROADMAP_SWITCHED = 'roadmap_switched'

    # AI Interaction Events
    AI_COACH_OPENED = 'ai_coach_opened'
    AI_STRATEGY_REQUESTED = 'ai_strategy_requested'
    VOICE_COACH_USED = 'voice_coach_used'
    INSIGHT_CLICKED = 'insight_clicked'


# Flat list for model choices field
ALL_EVENT_TYPES = [
    (EventType.TASK_STARTED, 'Task Started'),
    (EventType.TASK_COMPLETED, 'Task Completed'),
    (EventType.TASK_SKIPPED, 'Task Skipped'),
    (EventType.TASK_DELAYED, 'Task Delayed'),
    (EventType.TASK_REOPENED, 'Task Reopened'),
    (EventType.TASK_ABANDONED, 'Task Abandoned'),
    (EventType.SESSION_STARTED, 'Session Started'),
    (EventType.SESSION_ENDED, 'Session Ended'),
    (EventType.SESSION_QUIT, 'Session Quit'),
    (EventType.SESSION_INTERRUPTED, 'Session Interrupted'),
    (EventType.ROADMAP_OPENED, 'Roadmap Opened'),
    (EventType.ROADMAP_PROGRESS_UPDATED, 'Roadmap Progress Updated'),
    (EventType.ROADMAP_ABANDONED, 'Roadmap Abandoned'),
    (EventType.ROADMAP_COMPLETED, 'Roadmap Completed'),
    (EventType.ROADMAP_SWITCHED, 'Roadmap Switched'),
    (EventType.AI_COACH_OPENED, 'AI Coach Opened'),
    (EventType.AI_STRATEGY_REQUESTED, 'AI Strategy Requested'),
    (EventType.VOICE_COACH_USED, 'Voice Coach Used'),
    (EventType.INSIGHT_CLICKED, 'Insight Clicked'),
]

EVENT_TYPE_VALUES = {choice[0] for choice in ALL_EVENT_TYPES}

# Map task status changes to event types
TASK_STATUS_EVENT_MAP = {
    'in_progress': EventType.TASK_STARTED,
    'completed': EventType.TASK_COMPLETED,
    'skipped': EventType.TASK_SKIPPED,
    'delayed': EventType.TASK_DELAYED,
    'reopened': EventType.TASK_REOPENED,
    'abandoned': EventType.TASK_ABANDONED,
}

# Map session status changes to event types
SESSION_STATUS_EVENT_MAP = {
    'active': EventType.SESSION_STARTED,
    'completed': EventType.SESSION_ENDED,
    'cancelled': EventType.SESSION_QUIT,
}

# ---------------------------------------------------------------------------
# Score Weights
# ---------------------------------------------------------------------------

MOMENTUM_WEIGHTS = {
    'consistency': 0.30,
    'active_days': 0.20,
    'completion_rate': 0.35,
    'skip_penalty': 0.15,
}

BURNOUT_WEIGHTS = {
    'long_sessions': 0.30,
    'skip_spikes': 0.25,
    'falling_consistency': 0.25,
    'session_intensity': 0.20,
}

DROPOFF_WEIGHTS = {
    'inactivity': 0.30,
    'rising_skips': 0.25,
    'weak_momentum': 0.25,
    'low_engagement': 0.20,
}

# ---------------------------------------------------------------------------
# Thresholds
# ---------------------------------------------------------------------------

THRESHOLDS = {
    # Burnout
    'burnout_low': 30,
    'burnout_moderate': 50,
    'burnout_high': 70,
    'burnout_critical': 85,

    # Momentum
    'momentum_critical': 20,
    'momentum_low': 30,
    'momentum_moderate': 50,
    'momentum_healthy': 60,
    'momentum_strong': 75,

    # Dropoff
    'dropoff_low': 30,
    'dropoff_moderate': 50,
    'dropoff_high': 70,
    'dropoff_critical': 85,

    # Activity
    'inactivity_days_warning': 3,
    'inactivity_days_critical': 7,

    # Skip rate
    'skip_rate_normal': 15,
    'skip_rate_warning': 30,
    'skip_rate_critical': 50,

    # Session
    'long_session_minutes': 120,
    'optimal_session_minutes_min': 20,
    'optimal_session_minutes_max': 50,

    # Recovery
    'recovery_speed_fast': 2,
    'recovery_speed_threshold_days': 5,

    # Procrastination
    'hard_avoidance_threshold': 40,

    # Loop detection
    'avoidance_skip_diff': 20,
    'fake_productivity_session_threshold': 5,
    'fake_productivity_completion_threshold': 30,
    'planning_addiction_ratio': 3,
}

# ---------------------------------------------------------------------------
# Identity Types
# ---------------------------------------------------------------------------

IDENTITY_TYPES = {
    'momentum_builder': {
        'display': 'Momentum Builder',
        'description': 'You build progress through consistent small wins.',
    },
    'recovery_fighter': {
        'display': 'Recovery Fighter',
        'description': 'You bounce back quickly after setbacks.',
    },
    'deep_worker': {
        'display': 'Deep Worker',
        'description': 'You thrive in long, focused work sessions.',
    },
    'consistency_architect': {
        'display': 'Consistency Architect',
        'description': 'You execute with machine-like consistency.',
    },
    'chaos_starter': {
        'display': 'Chaos Starter',
        'description': 'High energy, but execution needs structure.',
    },
    'steady_climber': {
        'display': 'Steady Climber',
        'description': 'Slow and steady progress, always moving forward.',
    },
    'sprint_master': {
        'display': 'Sprint Master',
        'description': 'You work in intense bursts with high output.',
    },
    'night_owl': {
        'display': 'Night Owl',
        'description': 'Your best work happens after dark.',
    },
    'early_bird': {
        'display': 'Early Bird',
        'description': 'You start strong and execute early.',
    },
}

# ---------------------------------------------------------------------------
# Insight Types
# ---------------------------------------------------------------------------

INSIGHT_TYPES = {
    'behavioral': 'Behavioral Insight',
    'momentum': 'Momentum Insight',
    'prediction': 'Prediction Insight',
    'roadmap': 'Roadmap Insight',
    'identity': 'Identity Insight',
    'loop': 'Loop Insight',
    'adaptation': 'Adaptation Insight',
}

INSIGHT_PRIORITIES = ['critical', 'high', 'medium', 'low']

INSIGHT_TONES = ['encouraging', 'cautioning', 'celebrating', 'neutral']

# ---------------------------------------------------------------------------
# Pattern / Loop Types
# ---------------------------------------------------------------------------

PATTERN_TYPES = {
    'motivation_crash': {
        'display': 'Motivation Crash Loop',
        'description': 'High effort → overload → burnout → inactivity → restart',
    },
    'avoidance': {
        'display': 'Avoidance Loop',
        'description': 'Hard task opened → skipped → easier task completed',
    },
    'planning_addiction': {
        'display': 'Planning Addiction Loop',
        'description': 'Frequent roadmap changes → low execution',
    },
    'fake_productivity': {
        'display': 'Fake Productivity Loop',
        'description': 'High app usage → low meaningful completion',
    },
}

PATTERN_TYPE_CHOICES = [(k, v['display']) for k, v in PATTERN_TYPES.items()]

# ---------------------------------------------------------------------------
# Adaptation Types
# ---------------------------------------------------------------------------

ADAPTATION_TYPES = {
    'workload_reduction': {
        'display': 'Workload Reduction',
        'description': 'Reduce tasks and shorten milestones',
    },
    'challenge_increase': {
        'display': 'Challenge Increase',
        'description': 'Tighten pacing and increase difficulty',
    },
    'easy_win_injection': {
        'display': 'Easy Win Injection',
        'description': 'Insert quick-win tasks to rebuild momentum',
    },
    'theory_practical_rebalance': {
        'display': 'Theory-to-Practical Rebalance',
        'description': 'Increase practical tasks to match behavior',
    },
}

ADAPTATION_TYPE_CHOICES = [(k, v['display']) for k, v in ADAPTATION_TYPES.items()]

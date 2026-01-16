from django.db import models
from django.conf import settings
from django.utils import timezone


class UserState(models.TextChoices):
    """User lifecycle states following the phase-gating system"""
    ONBOARDING = "ONBOARDING", "Onboarding"
    GOAL_SELECTED = "GOAL_SELECTED", "Goal Selected"
    EXECUTING = "EXECUTING", "Executing Roadmap"
    EXECUTION_INCOMPLETE = "EXECUTION_INCOMPLETE", "Execution Incomplete"
    OUTPUT_ELIGIBLE = "OUTPUT_ELIGIBLE", "Output Eligible"
    JOB_READY = "JOB_READY", "Job Ready"


class EventType(models.TextChoices):
    """Event types for lifecycle event sourcing"""
    # Phase 0-1
    ACCOUNT_CREATED = "ACCOUNT_CREATED", "Account Created"
    EMAIL_VERIFIED = "EMAIL_VERIFIED", "Email Verified"
    
    # Phase 1
    INTAKE_SUBMITTED = "INTAKE_SUBMITTED", "Reality Intake Submitted"
    
    # Phase 2
    GOAL_LOCKED = "GOAL_LOCKED", "Goal Locked"
    
    # Phase 3-4
    TASK_ATTEMPT = "TASK_ATTEMPT", "Task Attempt Submitted"
    TASK_VALIDATED = "TASK_VALIDATED", "Task Validated"
    
    # Phase 5
    WARNING_EVENT = "WARNING_EVENT", "Inactivity Warning"
    EXECUTION_INCOMPLETE_EVENT = "EXECUTION_INCOMPLETE", "Execution Incomplete Event"
    RESET_SUGGESTED = "RESET_SUGGESTED", "Reset Suggested"
    
    # Phase 6
    OUTPUT_ELIGIBILITY_GRANTED = "OUTPUT_ELIGIBILITY_GRANTED", "Output Eligibility Granted"
    
    # Phase 7-8
    RESUME_GENERATED = "RESUME_GENERATED", "Resume Generated"
    JOB_APPLIED = "JOB_APPLIED", "Job Application Sent"
    
    # Phase 9
    GOAL_RESET = "GOAL_RESET", "Goal Reset"


class LifecycleEvent(models.Model):
    """
    Immutable event log for user lifecycle tracking.
    All user actions and state changes are recorded here.
    """
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='lifecycle_events'
    )
    event_type = models.CharField(
        max_length=50,
        choices=EventType.choices
    )
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)
    data = models.JSONField(
        default=dict,
        help_text="Event payload - structure depends on event_type"
    )
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'event_type']),
            models.Index(fields=['user', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.event_type} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"


class RealityIntake(models.Model):
    """
    Structured data capture for Phase 1 - Reality Intake.
    NO free text fields - all dropdowns and structured inputs.
    """
    
    EDUCATION_LEVEL_CHOICES = [
        ('high_school', 'High School'),
        ('bachelors', "Bachelor's Degree"),
        ('masters', "Master's Degree"),
        ('phd', 'PhD'),
        ('bootcamp', 'Bootcamp Graduate'),
        ('self_taught', 'Self-Taught'),
    ]
    
    DOMAIN_CHOICES = [
        ('computer_science', 'Computer Science'),
        ('information_technology', 'Information Technology'),
        ('software_engineering', 'Software Engineering'),
        ('data_science', 'Data Science / AI / ML'),
        ('web_development', 'Web Development'),
        ('mobile_development', 'Mobile Development'),
        ('devops', 'DevOps / Cloud'),
        ('cybersecurity', 'Cybersecurity'),
        ('game_development', 'Game Development'),
        ('embedded_systems', 'Embedded Systems'),
        ('other_engineering', 'Other Engineering'),
        ('business', 'Business / Management'),
        ('design', 'Design / UX/UI'),
        ('marketing', 'Marketing'),
        ('other', 'Other'),
    ]
    
    TARGET_ROLE_CHOICES = [
        ('software_engineer_intern', 'Software Engineer Intern'),
        ('software_engineer', 'Software Engineer'),
        ('frontend_developer', 'Frontend Developer'),
        ('backend_developer', 'Backend Developer'),
        ('fullstack_developer', 'Full Stack Developer'),
        ('data_scientist', 'Data Scientist'),
        ('ml_engineer', 'Machine Learning Engineer'),
        ('devops_engineer', 'DevOps Engineer'),
        ('cloud_engineer', 'Cloud Engineer'),
        ('mobile_developer', 'Mobile Developer'),
        ('qa_engineer', 'QA Engineer'),
        ('security_engineer', 'Security Engineer'),
        ('product_manager', 'Product Manager'),
        ('ui_ux_designer', 'UI/UX Designer'),
    ]
    
    TIMELINE_CHOICES = [
        (3, '3 months'),
        (6, '6 months'),
        (12, '12 months'),
        (18, '18 months'),
        (24, '24 months'),
    ]
    
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reality_intake'
    )
    
    # Education & Background
    education_level = models.CharField(
        max_length=50,
        choices=EDUCATION_LEVEL_CHOICES
    )
    branch_domain = models.CharField(
        max_length=50,
        choices=DOMAIN_CHOICES
    )
    
    # Current Skills (stored as list of skill IDs)
    current_skills = models.JSONField(
        default=list,
        help_text="List of skill identifiers selected by user"
    )
    
    # Time Commitment
    weekly_hours = models.IntegerField(
        help_text="Hours per week available for learning"
    )
    
    # Goal
    target_role = models.CharField(
        max_length=50,
        choices=TARGET_ROLE_CHOICES
    )
    target_timeline_months = models.IntegerField(
        choices=TIMELINE_CHOICES
    )
    
    # Computed Metrics
    reality_gap_score = models.FloatField(
        default=0.0,
        help_text="Computed difficulty score based on gap between current and target"
    )
    
    # Locking
    intake_locked = models.BooleanField(
        default=False,
        help_text="True after goal confirmation (point of no return)"
    )
    locked_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Reality Intake"
        verbose_name_plural = "Reality Intakes"
    
    def __str__(self):
        return f"{self.user.username} - {self.target_role} in {self.target_timeline_months} months"
    
    def compute_reality_gap_score(self):
        """
        Calculate reality gap score based on:
        - Education level
        - Current skills count
        - Target role difficulty
        - Timeline urgency
        
        Lower score = easier | Higher score = harder
        """
        score = 0.0
        
        # Education level factor (0-3)
        education_scores = {
            'phd': 0,
            'masters': 0.5,
            'bachelors': 1.0,
            'bootcamp': 2.0,
            'high_school': 2.5,
            'self_taught': 3.0,
        }
        score += education_scores.get(self.education_level, 2.0)
        
        # Skills count factor (0-3) - more skills = easier
        skill_count = len(self.current_skills)
        if skill_count >= 10:
            score += 0
        elif skill_count >= 5:
            score += 1.0
        elif skill_count >= 2:
            score += 2.0
        else:
            score += 3.0
        
        # Target role difficulty (0-3)
        role_difficulty = {
            'software_engineer_intern': 1.0,
            'frontend_developer': 1.5,
            'backend_developer': 2.0,
            'fullstack_developer': 2.5,
            'ml_engineer': 3.0,
            'security_engineer': 3.0,
            'data_scientist': 2.5,
        }
        score += role_difficulty.get(self.target_role, 2.0)
        
        # Timeline pressure (0-2) - shorter timeline = harder
        if self.target_timeline_months <= 3:
            score += 2.0
        elif self.target_timeline_months <= 6:
            score += 1.0
        else:
            score += 0.5
        
        self.reality_gap_score = round(score, 2)
        return self.reality_gap_score
    
    def lock_goal(self):
        """Lock the goal after user confirmation - point of no return"""
        if not self.intake_locked:
            self.intake_locked = True
            self.locked_at = timezone.now()
            self.save()
            
            # Create event
            LifecycleEvent.objects.create(
                user=self.user,
                event_type=EventType.GOAL_LOCKED,
                data={
                    'target_role': self.target_role,
                    'target_timeline_months': self.target_timeline_months,
                    'reality_gap_score': self.reality_gap_score,
                }
            )

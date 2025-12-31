"""
Task auto-generation logic for roadmaps.
This module handles creating tasks from roadmap milestones with proper daily breakdown.
Each multi-day task is split into individual daily tasks with clear objectives.
"""
from datetime import timedelta
from django.utils import timezone
from .models import Task


# Daily commitment in minutes (configurable)
DEFAULT_DAILY_COMMITMENT_MINUTES = 60


def auto_create_tasks_from_roadmap(roadmap):
    """
    Auto-generate tasks from roadmap milestones.
    Creates individual daily tasks with clear objectives.
    
    CRITICAL: Multi-day tasks are split into individual daily tasks,
    each with its own clear objective and independent completion tracking.
    
    Args:
        roadmap: Roadmap instance
    
    Returns:
        List of created Task instances
    """
    milestones = roadmap.milestones.all().order_by('order')
    
    all_created_tasks = []
    current_day = 1
    
    # Parse daily commitment from roadmap (e.g., "2 hours/day" -> 120 minutes)
    daily_minutes = parse_daily_commitment(roadmap.daily_commitment)
    
    for milestone in milestones:
        # Calculate days for this specific milestone
        milestone_days = calculate_roadmap_days(milestone.duration)
        if milestone_days == 0:
            milestone_days = 7
            
        # Generate daily tasks for this milestone
        # This now creates INDIVIDUAL daily tasks, not grouped multi-day tasks
        daily_tasks_data = generate_daily_tasks_for_milestone(
            milestone, 
            roadmap.difficulty_level,
            milestone_days,
            daily_minutes
        )
        
        # Create tasks with proper day assignments
        created_tasks = create_daily_tasks(
            daily_tasks_data,
            start_day=current_day,
            roadmap=roadmap
        )
        
        all_created_tasks.extend(created_tasks)
        
        # Update offset for next milestone
        current_day += milestone_days
    
    return all_created_tasks


def parse_daily_commitment(commitment_str):
    """
    Parse daily commitment string to minutes.
    
    Examples:
        "2 hours/day" -> 120
        "60 minutes/day" -> 60
        "1.5 hours" -> 90
    """
    if not commitment_str:
        return DEFAULT_DAILY_COMMITMENT_MINUTES
        
    commitment_str = commitment_str.lower().strip()
    
    try:
        if 'hour' in commitment_str:
            # Extract number (handle decimals like 1.5)
            import re
            numbers = re.findall(r'[\d.]+', commitment_str)
            if numbers:
                hours = float(numbers[0])
                return int(hours * 60)
        elif 'minute' in commitment_str or 'min' in commitment_str:
            import re
            numbers = re.findall(r'\d+', commitment_str)
            if numbers:
                return int(numbers[0])
    except:
        pass
    
    return DEFAULT_DAILY_COMMITMENT_MINUTES


def create_daily_tasks(daily_tasks_data, start_day, roadmap):
    """
    Create individual daily tasks from the generated task data.
    
    Args:
        daily_tasks_data: List of task dictionaries with day assignments
        start_day: The day number to start from (e.g., Day 1, Day 8)
        roadmap: Roadmap instance
    
    Returns:
        List of created Task instances
    """
    created_tasks = []
    start_date = timezone.now().date()
    
    for task_data in daily_tasks_data:
        actual_day = start_day + task_data.get('day_offset', 0)
        
        # Count existing tasks on this day for ordering
        existing_count = len([t for t in created_tasks if t.day == actual_day])
        
        task = Task.objects.create(
            user=roadmap.user,
            roadmap=roadmap,
            milestone=task_data.get('milestone'),
            title=task_data['title'],
            description=task_data['description'],
            day=actual_day,
            due_date=start_date + timedelta(days=actual_day - 1),
            order_in_day=existing_count,
            estimated_minutes=task_data.get('estimated_minutes', 60),
            tags=task_data.get('tags', [])
        )
        
        created_tasks.append(task)
    
    return created_tasks


def calculate_roadmap_days(duration_str):
    """
    Convert duration string to total days.
    
    Examples:
        "2 weeks" -> 14
        "3 months" -> 90
        "1 year" -> 365
        "5 days" -> 5
    """
    if not duration_str:
        return 30
        
    duration_str = duration_str.lower().strip()
    
    if 'day' in duration_str:
        try:
            import re
            numbers = re.findall(r'\d+', duration_str)
            if numbers:
                return int(numbers[0])
        except:
            return 7
    elif 'week' in duration_str:
        try:
            weeks = int(duration_str.split()[0])
            return weeks * 7
        except:
            return 7
    elif 'month' in duration_str:
        try:
            months = int(duration_str.split()[0])
            return months * 30  # Approximate
        except:
            return 30
    elif 'year' in duration_str:
        try:
            years = int(duration_str.split()[0])
            return years * 365
        except:
            return 365
    else:
        # Default to months if unclear
        try:
            val = int(duration_str.split()[0])
            return val * 30  # Assume months if just a number
        except:
            return 30  # Default 1 month


def generate_daily_tasks_for_milestone(milestone, difficulty_level, duration_days, daily_minutes):
    """
    Generate individual daily tasks for a milestone.
    
    CRITICAL: This function creates ONE task per day with clear objectives.
    Multi-day work is broken down into daily chunks.
    
    Example:
        Instead of: "Complete Project Setup (4 days)"
        We create:
            Day 1: Environment setup (60 min)
            Day 2: Core structure (60 min)
            Day 3: Feature implementation (60 min)
            Day 4: Testing & refinement (60 min)
    
    Args:
        milestone: Milestone instance
        difficulty_level: User's current level (beginner/intermediate/advanced)
        duration_days: Number of days available for this milestone
        daily_minutes: Target minutes per day
    
    Returns:
        List of task dictionaries with day_offset field
    """
    daily_tasks = []
    current_day = 0
    
    # 1. Topic-based daily tasks (Study sessions)
    topics = milestone.topics or []
    if not topics and milestone.description:
        # Create a study task that spans multiple days
        study_days = min(3, duration_days // 3)
        if study_days < 1:
            study_days = 1
            
        study_subtasks = [
            ("Introduction & Core Concepts", "Understand the fundamental concepts and why they matter."),
            ("Deep Dive & Examples", "Study detailed examples and edge cases."),
            ("Summary & Notes", "Review key points and create study notes.")
        ]
        
        for i in range(study_days):
            if current_day >= duration_days:
                break
            subtask = study_subtasks[i] if i < len(study_subtasks) else study_subtasks[-1]
            daily_tasks.append({
                'title': f"📚 Day {current_day + 1}: {milestone.title} - {subtask[0]}",
                'description': f"{subtask[1]}\n\nFocus area: {milestone.description[:200]}...",
                'estimated_minutes': daily_minutes,
                'tags': ['study', milestone.title.lower().replace(' ', '_')],
                'milestone': milestone,
                'day_offset': current_day
            })
            current_day += 1
    
    # Process each topic as a separate daily task
    for i, topic in enumerate(topics):
        if current_day >= duration_days:
            break
            
        title = topic.get('title', 'Unknown Topic') if isinstance(topic, dict) else str(topic)
        desc = topic.get('description', '') if isinstance(topic, dict) else ''
        
        daily_tasks.append({
            'title': f"📚 Day {current_day + 1}: Study {title}",
            'description': f"Today's objective: Master the concept of {title}.\n\n{desc}",
            'estimated_minutes': daily_minutes,
            'tags': ['study', title.lower().replace(' ', '_')],
            'milestone': milestone,
            'day_offset': current_day
        })
        current_day += 1
    
    # 2. Resource-based daily tasks (Review sessions)
    resources = milestone.resources or []
    for i, resource in enumerate(resources):
        if current_day >= duration_days:
            break
            
        res_title = resource.get('title', 'Resource')
        res_url = resource.get('url', '#')
        res_type = resource.get('type', 'Resource')
        
        daily_tasks.append({
            'title': f"📖 Day {current_day + 1}: Review {res_title}",
            'description': f"Today's objective: Go through this {res_type.lower()} and take notes.\n\nResource: {res_url}",
            'estimated_minutes': min(daily_minutes, 45),
            'tags': ['resource', 'reading', res_type.lower()],
            'milestone': milestone,
            'day_offset': current_day
        })
        current_day += 1
    
    # 3. Project-based daily tasks - PROPERLY SPLIT INTO DAILY WORK
    projects = milestone.projects.all()
    for project in projects:
        if current_day >= duration_days:
            break
            
        # Calculate project days based on estimated hours
        project_hours = project.estimated_hours or 10
        daily_hours = daily_minutes / 60
        project_days = max(4, int(project_hours / daily_hours))  # Minimum 4 days per project
        
        # Limit to available days
        available_days = duration_days - current_day
        project_days = min(project_days, available_days)
        
        if project_days < 1:
            continue
        
        # Define daily breakdown for projects
        project_phases = get_project_daily_breakdown(project, project_days, daily_minutes)
        
        for phase in project_phases:
            if current_day >= duration_days:
                break
                
            daily_tasks.append({
                'title': f"{phase['emoji']} Day {current_day + 1}: {project.title} - {phase['title']}",
                'description': phase['description'],
                'estimated_minutes': phase['minutes'],
                'tags': ['project', phase['tag'], project.title.lower().replace(' ', '_')],
                'milestone': milestone,
                'day_offset': current_day
            })
            current_day += 1
    
    # 4. Practice tasks for remaining days
    while current_day < duration_days:
        practice_types = [
            ("💪 Practice & Apply", "Apply what you've learned through hands-on exercises."),
            ("🔄 Review & Reinforce", "Revisit key concepts and solidify understanding."),
            ("🎯 Challenge Yourself", "Push your limits with advanced exercises.")
        ]
        
        practice = practice_types[current_day % len(practice_types)]
        
        daily_tasks.append({
            'title': f"{practice[0]} Day {current_day + 1}: {milestone.title}",
            'description': f"Today's objective: {practice[1]}\n\nFocus on practical application of concepts from {milestone.title}.",
            'estimated_minutes': daily_minutes,
            'tags': ['practice', milestone.title.lower().replace(' ', '_')],
            'milestone': milestone,
            'day_offset': current_day
        })
        current_day += 1
    
    return daily_tasks


def get_project_daily_breakdown(project, days, daily_minutes):
    """
    Generate a detailed daily breakdown for a project.
    
    This ensures each day has:
    - Clear objective
    - Specific deliverable
    - Reasonable time commitment
    
    Args:
        project: Project instance
        days: Number of days available
        daily_minutes: Target minutes per day
    
    Returns:
        List of phase dictionaries
    """
    phases = []
    
    # Define standard phases based on project difficulty
    if project.difficulty == 'easy':
        standard_phases = [
            {'emoji': '🛠️', 'title': 'Environment Setup', 'tag': 'setup',
             'desc': 'Set up development environment and project structure.'},
            {'emoji': '💻', 'title': 'Core Implementation', 'tag': 'coding',
             'desc': 'Implement the main features and logic.'},
            {'emoji': '🎨', 'title': 'UI/Styling', 'tag': 'styling',
             'desc': 'Add styling and improve user interface.'},
            {'emoji': '✨', 'title': 'Testing & Polish', 'tag': 'testing',
             'desc': 'Test all features and fix any bugs.'}
        ]
    elif project.difficulty == 'hard':
        standard_phases = [
            {'emoji': '🛠️', 'title': 'Environment & Architecture', 'tag': 'setup',
             'desc': 'Set up environment and plan architecture.'},
            {'emoji': '🗃️', 'title': 'Data Models & Database', 'tag': 'database',
             'desc': 'Design and implement data models.'},
            {'emoji': '💻', 'title': 'Core Logic (Part 1)', 'tag': 'coding',
             'desc': 'Implement primary business logic.'},
            {'emoji': '💻', 'title': 'Core Logic (Part 2)', 'tag': 'coding',
             'desc': 'Complete core features and integrations.'},
            {'emoji': '🔗', 'title': 'API Integration', 'tag': 'integration',
             'desc': 'Connect components and external APIs.'},
            {'emoji': '🎨', 'title': 'UI Implementation', 'tag': 'styling',
             'desc': 'Build user interface components.'},
            {'emoji': '🐛', 'title': 'Debugging & Edge Cases', 'tag': 'debugging',
             'desc': 'Handle edge cases and fix bugs.'},
            {'emoji': '✨', 'title': 'Testing & Documentation', 'tag': 'testing',
             'desc': 'Write tests and documentation.'}
        ]
    else:  # medium
        standard_phases = [
            {'emoji': '🛠️', 'title': 'Setup & Planning', 'tag': 'setup',
             'desc': 'Set up project and plan implementation.'},
            {'emoji': '🗃️', 'title': 'Data Structure', 'tag': 'structure',
             'desc': 'Implement data models and state management.'},
            {'emoji': '💻', 'title': 'Core Features', 'tag': 'coding',
             'desc': 'Build the main functionality.'},
            {'emoji': '🔗', 'title': 'Integration', 'tag': 'integration',
             'desc': 'Connect all components together.'},
            {'emoji': '🎨', 'title': 'UI & Polish', 'tag': 'styling',
             'desc': 'Improve UI and user experience.'},
            {'emoji': '✨', 'title': 'Testing & Review', 'tag': 'testing',
             'desc': 'Test and review the project.'}
        ]
    
    # Select phases based on available days
    selected_phases = []
    if days <= len(standard_phases):
        # Select key phases evenly distributed
        step = len(standard_phases) / days
        for i in range(days):
            idx = min(int(i * step), len(standard_phases) - 1)
            selected_phases.append(standard_phases[idx])
    else:
        # Repeat phases or add extended work
        selected_phases = standard_phases.copy()
        extra_days = days - len(standard_phases)
        
        # Add continuation tasks
        for i in range(extra_days):
            base_phase = standard_phases[i % len(standard_phases)]
            selected_phases.append({
                'emoji': base_phase['emoji'],
                'title': f"{base_phase['title']} (Continued)",
                'tag': base_phase['tag'],
                'desc': f"Continue work on {base_phase['title'].lower()}."
            })
    
    # Build final phases with descriptions
    for phase in selected_phases:
        desc = f"Today's objective: {phase['desc']}\n\n"
        desc += f"Project: {project.title}\n"
        desc += f"Description: {project.description[:150]}..." if len(project.description) > 150 else f"Description: {project.description}"
        
        if project.tech_stack:
            tech_list = ", ".join(project.tech_stack[:5])
            desc += f"\n\nTech Stack: {tech_list}"
        
        phases.append({
            'emoji': phase['emoji'],
            'title': phase['title'],
            'description': desc,
            'minutes': daily_minutes,
            'tag': phase['tag']
        })
    
    return phases

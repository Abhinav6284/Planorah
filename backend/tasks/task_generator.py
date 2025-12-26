"""
Task auto-generation logic for roadmaps.
This module handles creating tasks from roadmap milestones with even day distribution.
"""
from datetime import timedelta
from django.utils import timezone
from .models import Task


def auto_create_tasks_from_roadmap(roadmap):
    """
    Auto-generate tasks from roadmap milestones.
    Distributes tasks evenly across each milestone's specific duration.
    
    Args:
        roadmap: Roadmap instance
    
    Returns:
        List of created Task instances
    """
    milestones = roadmap.milestones.all().order_by('order')
    
    all_created_tasks = []
    current_day_offset = 1
    
    for milestone in milestones:
        # Calculate days for this specific milestone
        # Default to 7 days if duration is missing or unparseable
        milestone_days = calculate_roadmap_days(milestone.duration)
        if milestone_days == 0:
            milestone_days = 7
            
        # Generate tasks for this milestone
        milestone_tasks_data = generate_tasks_for_milestone(milestone, roadmap.difficulty_level)
        
        # Distribute these tasks across the milestone's duration
        created_tasks = distribute_tasks_for_milestone(
            milestone_tasks_data,
            start_day=current_day_offset,
            duration_days=milestone_days,
            roadmap=roadmap
        )
        
        all_created_tasks.extend(created_tasks)
        
        # Update offset for next milestone
        current_day_offset += milestone_days
    
    return all_created_tasks


def distribute_tasks_for_milestone(task_data_list, start_day, duration_days, roadmap):
    """
    Distribute tasks evenly across a specific day range for a milestone.
    
    Args:
        task_data_list: List of task dictionaries
        start_day: The day number to start from (e.g., Day 1, Day 8)
        duration_days: Duration of the milestone in days
        roadmap: Roadmap instance
    
    Returns:
        List of created Task instances
    """
    created_tasks = []
    num_tasks = len(task_data_list)
    
    if num_tasks == 0:
        return []
        
    start_date = timezone.now().date()
    
    for i, task_data in enumerate(task_data_list):
        # Spread tasks evenly across the duration
        # Formula: day_index = (i * duration_days) // num_tasks
        # This ensures tasks are spaced out over the full duration
        day_index = (i * duration_days) // num_tasks
        
        # Ensure we don't exceed duration (though math above handles it)
        if day_index >= duration_days:
            day_index = duration_days - 1
            
        actual_day = start_day + day_index
        
        task = Task.objects.create(
            user=roadmap.user,
            roadmap=roadmap,
            milestone=task_data.get('milestone'),
            title=task_data['title'],
            description=task_data['description'],
            day=actual_day,
            due_date=start_date + timedelta(days=actual_day - 1),
            order_in_day=len([t for t in created_tasks if t.day == actual_day]),
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
    """
    if not duration_str:
        return 30
        
    duration_str = duration_str.lower().strip()
    
    if 'week' in duration_str:
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
            return val * 30 # Assume months if just a number? Or maybe days?
            # Let's assume if it's just a number it might be days, but usually it says "X months"
        except:
            return 30  # Default 1 month


def generate_tasks_for_milestone(milestone, difficulty_level):
    """
    Break down milestone into actionable tasks.
    
    Args:
        milestone: Milestone instance
        difficulty_level: User's current level (beginner/intermediate/advanced)
    
    Returns:
        List of task dictionaries
    """
    tasks = []
    
    # 1. Topic-based tasks (Study)
    topics = milestone.topics or []
    if not topics and milestone.description:
        # Fallback if no specific topics
        tasks.append({
            'title': f"📚 Study: {milestone.title} Fundamentals",
            'description': milestone.description,
            'estimated_minutes': 90,
            'tags': ['study', milestone.title.lower().replace(' ', '_')]
        })
    
    for topic in topics:
        title = topic.get('title', 'Unknown Topic')
        desc = topic.get('description', '')
        tasks.append({
            'title': f"📚 Study: {title}",
            'description': f"Focus on understanding: {desc}",
            'estimated_minutes': 60,
            'tags': ['study', title.lower().replace(' ', '_')]
        })

    # 2. Resource-based tasks (Review)
    resources = milestone.resources or []
    for resource in resources:
        res_title = resource.get('title', 'Resource')
        res_url = resource.get('url', '#')
        tasks.append({
            'title': f"📖 Review: {res_title}",
            'description': f"Go through this resource: {res_url}",
            'estimated_minutes': 45,
            'tags': ['resource', 'reading']
        })

    # 3. Project-based tasks (Build)
    projects = milestone.projects.all()
    for project in projects:
        # Break project into phases
        
        # Phase 1: Setup
        tasks.append({
            'title': f"🛠️ Setup: {project.title}",
            'description': f"Initialize project. {project.description[:100]}...",
            'estimated_minutes': 45,
            'tags': ['project', 'setup']
        })
        
        # Phase 2: Core Implementation (Multiple chunks if hard)
        if project.difficulty == 'hard':
            tasks.append({
                'title': f"💻 Build Core (Part 1): {project.title}",
                'description': "Implement the main logic and data structures.",
                'estimated_minutes': 120,
                'tags': ['project', 'coding']
            })
            tasks.append({
                'title': f"💻 Build Core (Part 2): {project.title}",
                'description': "Connect components and handle edge cases.",
                'estimated_minutes': 120,
                'tags': ['project', 'coding']
            })
        else:
            tasks.append({
                'title': f"💻 Build: {project.title}",
                'description': "Implement the core features.",
                'estimated_minutes': 90,
                'tags': ['project', 'coding']
            })
            
        # Phase 3: Polish
        tasks.append({
            'title': f"✨ Polish & Review: {project.title}",
            'description': "Refactor code, add comments, and test functionality.",
            'estimated_minutes': 60,
            'tags': ['project', 'review']
        })

    # 4. Practice/Drill tasks (if low task count)
    if len(tasks) < 3:
        tasks.append({
            'title': f"💪 Practice: {milestone.title} Exercises",
            'description': "Apply what you've learned in small coding exercises.",
            'estimated_minutes': 60,
            'tags': ['practice']
        })

    # Add milestone reference
    for task in tasks:
        task['milestone'] = milestone
    
    return tasks

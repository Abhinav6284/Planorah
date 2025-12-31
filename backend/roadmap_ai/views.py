import os
import json
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Roadmap, Milestone, Project
from .serializers import RoadmapSerializer, RoadmapDetailSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_roadmap(request):
    """Generate AI-powered roadmap using Gemini"""

    # Lazy import - only load when function is called
    try:
        import google.generativeai as genai
        from google.generativeai.types import GenerationConfig
    except (ImportError, TypeError):
        return Response({
            "error": "Gemini AI is not available. Please install google-generativeai package."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return Response({
            "error": "GEMINI_API_KEY environment variable is not set."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Configure Gemini with API key
    genai.configure(api_key=api_key)
    print(f"🔑 Gemini API configured with key: {api_key[:10]}...{api_key[-4:]}")

    user = request.user
    goal = request.data.get('goal', '')
    duration = request.data.get('duration', '6 months')
    current_level = request.data.get('current_level', 'beginner')
    interests = request.data.get('interests', [])

    category = request.data.get('category', 'career')
    tech_stack = request.data.get('tech_stack', '')
    output_format = request.data.get('output_format', 'Milestone-based')
    learning_constraints = request.data.get('learning_constraints', '')
    motivation_style = request.data.get('motivation_style', 'Milestones')
    success_definition = request.data.get('success_definition', '')

    # Define distinct, full-length prompts for each category
    prompts = {
        'project': f"""
You are an elite Technical Project Manager and Senior Architect.
Your goal is to create a "Blessing-Level" project execution roadmap for a student building: "{goal}".
This roadmap must be so precise and perfect that it feels like a cheat code for success.

**Student Profile:**
- **Goal:** {goal}
- **Tech Stack:** {tech_stack}
- **Level:** {current_level}
- **Timeline:** {duration}
- **Constraints:** {learning_constraints}
- **Success Definition:** {success_definition}

**CRITICAL INSTRUCTIONS FOR PROJECT ROADMAP:**
1.  **NO GENERIC ADVICE:** Do not say "Learn State Management". Say "Implement Redux Toolkit with Thunk for async actions".
2.  **Structure:** Break this down into the Software Development Life Cycle (SDLC):
    - Phase 1: Setup & Architecture (Environment, DB Design, API planning)
    - Phase 2: MVP Core Features (The absolute essentials)
    - Phase 3: Advanced Features (The "Wow" factors)
    - Phase 4: Polish, Testing & Deployment (CI/CD, Hosting, UI Polish)
3.  **Milestones:** Each milestone MUST be a functional deliverable.
4.  **Topics:** Technical concepts required. Be specific (e.g., "JWT vs Session", "Optimistic UI Updates").
5.  **Projects:** The "Project" field for each milestone should be the specific component being built.
6.  **Format:** Use the "{output_format}" structure.

**ELITE EXTRAS (MUST INCLUDE):**
- **Insider Tips:** Secrets only seniors know (e.g., "Use a UUID for PKs to avoid enumeration attacks").
- **Common Pitfalls:** What usually kills this project? (e.g., "N+1 Query problems in Django").
- **Production Grade:** How to make it real-world ready (e.g., "Add Sentry for error tracking").
- **FAQs:** 5-7 burning questions students usually have (e.g., "Hosting options?", "Scalability?").

**Response Format (Strict JSON):**
{{
  "title": "Project Name: {goal}",
  "overview": "Technical overview of the architecture and stack.",
  "estimated_duration": "{duration}",
  "daily_commitment": "e.g. '3 hours/day'",
  "difficulty_level": "{current_level}",
  "category": "project",
  "milestones": [
    {{
      "title": "Phase 1: [Phase Name]",
      "description": "Technical specs for this phase.",
      "order": 1,
      "duration": "e.g., 1 week",
      "topics": [
        {{"title": "Specific Concept 1", "description": "Technical concept explanation"}}
      ],
      "resources": [
        {{"title": "Gold Standard Resource", "url": "https://...", "type": "Documentation/Tutorial"}}
      ],
      "projects": [
        {{
          "title": "Component Name",
          "description": "Implementation details.",
          "difficulty": "medium",
          "estimated_hours": 10,
          "tech_stack": ["{tech_stack}"], 
          "learning_outcomes": ["Functional Feature X"],
          "insider_tip": "Pro tip for this specific component."
        }}
      ]
    }}
  ],
  "prerequisites": ["Req 1"],
  "career_outcomes": ["Portfolio Item"],
  "tips": ["Deployment tip", "Production Standard Tip"],
  "faqs": [
    {{
      "question": "Common question about this path?",
      "answer": "Detailed answer."
    }}
  ]
}}
""",
        'career': f"""
You are a Senior Career Coach and Hiring Manager at a FAANG company.
Your goal is to create a "Blessing-Level" job-ready roadmap for a student aiming to become: "{goal}".
This roadmap must be so precise and perfect that it feels like a cheat code for getting hired.

**Student Profile:**
- **Target Role:** {goal}
- **Current Level:** {current_level}
- **Timeline:** {duration}
- **Interests:** {', '.join(interests) if interests else 'General'}
- **Motivation:** {motivation_style}

**CRITICAL INSTRUCTIONS FOR CAREER ROADMAP:**
1.  **NO GENERIC ADVICE:** Do not say "Learn React". Say "Master React Hooks (useMemo, useCallback) and Context API".
2.  **Structure:** Break this down into "Job Ready" stages:
    - Phase 1: Foundations (The basics everyone needs)
    - Phase 2: Core Competencies (The skills that get you hired)
    - Phase 3: Advanced Specialization (What makes you stand out)
    - Phase 4: Job Hunt Prep (Resume, Portfolio, LeetCode/Interview prep)
3.  **Milestones:** Competency levels.
4.  **Projects:** Portfolio pieces that demonstrate the specific skills learned.
5.  **Format:** Use the "{output_format}" structure.

- **Interview Killers:** Specific, tough interview questions for each stage.
- **Resume Power Phrases:** How to describe this skill on a resume.
- **Hidden Gems:** Resources that aren't mainstream but are amazing.
- **Major Project:** A final "Capstone Project" that combines all skills into a portfolio-worthy application.
- **FAQs:** 5-7 burning questions students usually have (e.g., "Degree needed?", "Salary expectations?").

**Response Format (Strict JSON):**
{{
  "title": "Career Path: {goal}",
  "overview": "Market-aligned career strategy.",
  "estimated_duration": "{duration}",
  "daily_commitment": "e.g. '2 hours/day'",
  "difficulty_level": "{current_level}",
  "category": "career",
  "milestones": [
    {{
      "title": "Level 1: [Skill Group]",
      "description": "Why this skill gets you hired.",
      "order": 1,
      "duration": "e.g., 2 weeks",
      "topics": [
        {{"title": "Specific Skill 1", "description": "Theory and practice"}}
      ],
      "resources": [
        {{"title": "Hidden Gem Resource", "url": "https://...", "type": "Course"}}
      ],
      "projects": [
        {{
          "title": "Portfolio Project",
          "description": "What to build to show this skill.",
          "difficulty": "medium",
          "estimated_hours": 20,
          "tech_stack": ["Tool 1"], 
          "learning_outcomes": ["Resume Point 1"],
          "interview_question": "A tough interview question related to this project."
        }}
      ]
    }},
    {{
      "title": "Capstone: [Major Project Name]",
      "description": "Final major project to showcase mastery.",
      "order": 99,
      "duration": "e.g., 4 weeks",
      "topics": [],
      "resources": [],
      "projects": [
        {{
          "title": "Capstone Project",
          "description": "Comprehensive project details.",
          "difficulty": "hard",
          "estimated_hours": 40,
          "tech_stack": ["Full Stack"],
          "learning_outcomes": ["Full System Architecture"],
          "interview_question": "Walk me through your Capstone architecture."
        }}
      ]
    }}
  ],
  "prerequisites": ["Basic Computer Skills"],
  "career_outcomes": ["Junior Developer", "Freelancer"],
  "tips": ["Networking tip", "Resume Tip"],
  "faqs": [
    {{
      "question": "Common career question?",
      "answer": "Detailed answer."
    }}
  ]
}}
""",
        'research': f"""
You are a PhD Research Supervisor and Professor.
Your goal is to guide a student through a rigorous research process on: "{goal}".
This roadmap must be so precise and perfect that it feels like a cheat code for publishing a paper.

**Student Profile:**
- **Research Topic:** {goal}
- **Domain:** {tech_stack}
- **Level:** {current_level}
- **Timeline:** {duration}
- **Output Format:** {output_format}

**CRITICAL INSTRUCTIONS FOR RESEARCH ROADMAP:**
1.  **NO GENERIC ADVICE:** Cite specific papers, theories, or methodologies relevant to {goal}.
2.  **Structure:** Follow the Scientific Method/Academic Process:
    - Phase 1: Literature Review (Reading key papers, understanding state-of-the-art)
    - Phase 2: Hypothesis & Methodology (Formulating the problem)
    - Phase 3: Experimentation/Implementation (Data collection, coding models)
    - Phase 4: Analysis & Writing (Results, Paper drafting)
3.  **Milestones:** Research stages.
4.  **Topics:** Key papers, theories, mathematical concepts.
5.  **Projects:** Experiments, mini-papers, or presentations.

**ELITE EXTRAS (MUST INCLUDE):**
- **Seminal Papers:** The "Must-Reads" that defined the field.
- **SOTA:** The current State-of-the-Art approaches.
- **Methodology Pitfalls:** Common mistakes in experimental design.
- **FAQs:** 5-7 common research questions (e.g., "How to find datasets?", "Where to publish?").

**Response Format (Strict JSON):**
{{
  "title": "Research Plan: {goal}",
  "overview": "Academic abstract of the research path.",
  "estimated_duration": "{duration}",
  "daily_commitment": "e.g. '4 hours/day'",
  "difficulty_level": "{current_level}",
  "category": "research",
  "milestones": [
    {{
      "title": "Stage 1: [Research Stage]",
      "description": "Academic guidance.",
      "order": 1,
      "duration": "e.g., 3 weeks",
      "topics": [
        {{"title": "Specific Paper/Theory", "description": "Summary of key concept"}}
      ],
      "resources": [
        {{"title": "Seminal Paper Title", "url": "https://arxiv.org/...", "type": "Paper"}}
      ],
      "projects": [
        {{
          "title": "Experiment/Review",
          "description": "Methodology details.",
          "difficulty": "hard",
          "estimated_hours": 30,
          "tech_stack": ["Python", "LaTeX"], 
          "learning_outcomes": ["Research Finding"],
          "methodology_tip": "Avoid this common error in analysis."
        }}
      ]
    }}
  ],
  "prerequisites": ["Statistics", "Basic Coding"],
  "career_outcomes": ["Researcher", "PhD Candidate"],
  "tips": ["Publication tip"],
  "faqs": [
    {{
      "question": "Common research question?",
      "answer": "Detailed answer."
    }}
  ]
}}
""",
        'skill_mastery': f"""
You are a Master Coach in Deliberate Practice.
Your goal is to help a student achieve absolute mastery in: "{goal}".
This roadmap must be so precise and perfect that it feels like a cheat code for mastery.

**Student Profile:**
- **Skill:** {goal}
- **Current Level:** {current_level}
- **Timeline:** {duration}
- **Motivation:** {motivation_style}
- **Constraints:** {learning_constraints}

**CRITICAL INSTRUCTIONS FOR SKILL MASTERY ROADMAP:**
1.  **NO GENERIC ADVICE:** Focus on specific techniques, drills, and nuanced understanding.
2.  **Structure:** Focus on Depth and Repetition:
    - Phase 1: Deconstruction (Breaking the skill into smallest parts)
    - Phase 2: Drill & Repetition (Isolated practice of sub-skills)
    - Phase 3: Integration (Combining sub-skills)
    - Phase 4: Mastery & Flow (High-level performance/challenges)
3.  **Milestones:** Proficiency levels (Novice, Competent, Proficient, Expert).
4.  **Topics:** Deep dives into nuance and technique.
5.  **Projects:** "Drills" or "Challenges" rather than traditional projects.

**ELITE EXTRAS (MUST INCLUDE):**
- **Mental Models:** How experts visualize this concept.
- **Feedback Loops:** How to self-correct without a teacher.
- **Drill Sequences:** Specific practice routines.
- **Major Challenge:** A final "Mastery Challenge" or "Major Project" to prove expertise.
- **FAQs:** 5-7 common learning questions (e.g., "How long to practice?", "Plateaus?").

**Response Format (Strict JSON):**
{{
  "title": "Mastery Path: {goal}",
  "overview": "Strategy for deep skill acquisition.",
  "estimated_duration": "{duration}",
  "daily_commitment": "e.g. '1 hour/day'",
  "difficulty_level": "{current_level}",
  "category": "skill_mastery",
  "milestones": [
    {{
      "title": "Level 1: [Sub-skill]",
      "description": "Technique focus.",
      "order": 1,
      "duration": "e.g., 1 week",
      "topics": [
        {{"title": "Technique 1", "description": "How to practice"}}
      ],
      "resources": [
        {{"title": "Guide/Video", "url": "https://...", "type": "Tutorial"}}
      ],
      "projects": [
        {{
          "title": "Drill/Challenge",
          "description": "Specific exercise instructions.",
          "difficulty": "hard",
          "estimated_hours": 5,
          "tech_stack": ["N/A"], 
          "learning_outcomes": ["Muscle Memory/Intuition"]
        }}
      ]
    }}
  ],
  "prerequisites": ["Discipline"],
  "career_outcomes": ["Expert", "Specialist"],
  "tips": ["Focus tip"],
  "faqs": [
    {{
      "question": "Common mastery question?",
      "answer": "Detailed answer."
    }}
  ]
}}
"""
    }

    # Select the specific prompt based on category
    prompt = prompts.get(category, prompts['career'])

    try:
        # Call Gemini API with proper error handling
        # Using Gemini 2.5 Flash Lite - lightweight and cost-effective
        model = genai.GenerativeModel(
            'gemini-2.5-flash-lite')  # type: ignore
        print(f"🤖 Using model: gemini-2.5-flash-lite")

        # Use proper GenerationConfig
        generation_config = GenerationConfig(
            temperature=0.7,
            top_p=0.95,
            max_output_tokens=8192
        )

        # Generate content and assign to response variable
        print(f"📝 Generating roadmap for goal: {goal[:50]}...")
        response = model.generate_content(prompt, generation_config=generation_config)
        print(f"✅ Response received successfully")

        # Safety check: Ensure valid response from AI
        if not response or not hasattr(response, "text") or not response.text:
            return Response({
                "error": "AI did not return a valid response",
                "details": "The Gemini API returned an empty or invalid response. Please try again."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Parse JSON response
        response_text = response.text.strip()

        # Remove markdown code blocks if present
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0]
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0]

        response_text = response_text.strip()

        # Parse JSON
        roadmap_data = json.loads(response_text)

        # Validate difficulty_level
        valid_difficulty = ['beginner', 'intermediate', 'advanced']
        difficulty = roadmap_data.get('difficulty_level', current_level)
        if difficulty not in valid_difficulty:
            difficulty = current_level

        # Create Roadmap in database
        roadmap = Roadmap.objects.create(
            user=user,
            title=roadmap_data.get('title', goal),
            goal=goal,
            overview=roadmap_data.get('overview', ''),
            estimated_duration=roadmap_data.get(
                'estimated_duration', duration),
            difficulty_level=difficulty,
            category=roadmap_data.get('category', category),
            tech_stack=roadmap_data.get('tech_stack', tech_stack),
            output_format=roadmap_data.get('output_format', output_format),
            learning_constraints=roadmap_data.get('learning_constraints', learning_constraints),
            motivation_style=roadmap_data.get('motivation_style', motivation_style),
            success_definition=roadmap_data.get('success_definition', success_definition),
            prerequisites=roadmap_data.get('prerequisites', []),
            career_outcomes=roadmap_data.get('career_outcomes', []),
            tips=roadmap_data.get('tips', []),
            faqs=roadmap_data.get('faqs', [])
        )

        # type: ignore[attr-defined]
        # type: ignore[attr-defined]
        # print(f"✅ Roadmap created: ID={roadmap.id}")

        # Create Milestones and Projects
        milestones_data = roadmap_data.get('milestones', [])
        for idx, milestone_data in enumerate(milestones_data):
            milestone = Milestone.objects.create(
                roadmap=roadmap,
                title=milestone_data.get('title', f'Milestone {idx + 1}'),
                description=milestone_data.get('description', ''),
                order=milestone_data.get('order', idx + 1),
                duration=milestone_data.get('duration', ''),
                topics=milestone_data.get('topics', []),
                resources=milestone_data.get('resources', [])
            )

            print(f"  ✅ Milestone {idx + 1} created: {milestone.title}")

            # Create projects for this milestone
            projects_data = milestone_data.get('projects', [])
            for pidx, project_data in enumerate(projects_data):
                # Validate project difficulty
                valid_project_diff = ['easy', 'medium', 'hard']
                proj_difficulty = project_data.get('difficulty', 'medium')
                if proj_difficulty not in valid_project_diff:
                    proj_difficulty = 'medium'

                Project.objects.create(
                    milestone=milestone,
                    title=project_data.get('title', f'Project {pidx + 1}'),
                    description=project_data.get('description', ''),
                    difficulty=proj_difficulty,
                    estimated_hours=project_data.get('estimated_hours', 0),
                    tech_stack=project_data.get('tech_stack', []),
                    learning_outcomes=project_data.get('learning_outcomes', [])
                )
                print(
                    f"    ✅ Project {pidx + 1} created: {project_data.get('title', 'Untitled')}")

        print("=" * 70)
        print("🎉 Roadmap generation completed successfully!")
        print("=" * 70)
        
        # Auto-generate tasks from roadmap
        try:
            from tasks.task_generator import auto_create_tasks_from_roadmap
            created_tasks = auto_create_tasks_from_roadmap(roadmap)
            print(f"✅ Auto-generated {len(created_tasks)} tasks from roadmap!")
        except Exception as task_error:
            print(f"⚠️ Task generation failed: {str(task_error)}")
            import traceback
            traceback.print_exc()
            # Don't fail the whole request if task generation fails

        serializer = RoadmapDetailSerializer(roadmap)
        return Response({
            **serializer.data,
            'tasks_created': True,
            'tasks_count': len(created_tasks) if 'created_tasks' in locals() else 0
        }, status=status.HTTP_201_CREATED)

    except json.JSONDecodeError as e:
        print(f"❌ JSON Parse Error: {str(e)}")
        print(
            f"Response text: {response_text[:1000] if 'response_text' in locals() else 'N/A'}")
        return Response({
            "error": "Failed to parse AI response",
            "details": f"JSON parsing failed: {str(e)}",
            "raw_response": response_text[:500] if 'response_text' in locals() else "No response"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    except Exception as e:
        print(f"❌ Unexpected Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            "error": "Failed to generate roadmap",
            "details": str(e),
            "type": type(e).__name__,
            "tasks_created": False,
            "tasks_error": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_roadmaps(request):
    """Get all roadmaps for authenticated user"""
    try:
        roadmaps = Roadmap.objects.filter(
            user=request.user).order_by('-created_at')
        serializer = RoadmapSerializer(roadmaps, many=True)
        return Response(serializer.data)
    except Exception as e:
        print(f"❌ Error fetching roadmaps: {str(e)}")
        return Response({
            "error": "Failed to fetch roadmaps",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_roadmap_detail(request, roadmap_id):
    """Get detailed roadmap with milestones and projects"""
    try:
        roadmap = Roadmap.objects.get(id=roadmap_id, user=request.user)
        serializer = RoadmapDetailSerializer(roadmap)
        return Response(serializer.data)
    except Roadmap.DoesNotExist:
        return Response({"error": "Roadmap not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"❌ Error fetching roadmap detail: {str(e)}")
        return Response({
            "error": "Failed to fetch roadmap details",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_roadmap(request, roadmap_id):
    """Delete a roadmap"""
    try:
        roadmap = Roadmap.objects.get(id=roadmap_id, user=request.user)
        roadmap.delete()
        print(f"✅ Roadmap {roadmap_id} deleted by {request.user.username}")
        return Response({"message": "Roadmap deleted successfully"}, status=status.HTTP_200_OK)
    except Roadmap.DoesNotExist:
        return Response({"error": "Roadmap not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"❌ Error deleting roadmap: {str(e)}")
        return Response({
            "error": "Failed to delete roadmap",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_milestone_progress(request, milestone_id):
    """Update milestone completion status"""
    try:
        milestone = Milestone.objects.get(
            id=milestone_id, roadmap__user=request.user)
        milestone.is_completed = request.data.get('completed', False)

        # Update completed_at timestamp
        milestone.save()
        print(
            f"✅ Milestone {milestone_id} updated: completed={milestone.is_completed}")
        return Response({"message": "Milestone updated"}, status=status.HTTP_200_OK)
    except Milestone.DoesNotExist:
        return Response({"error": "Milestone not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"❌ Error updating milestone: {str(e)}")
        return Response({
            "error": "Failed to update milestone",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def schedule_roadmap(request, roadmap_id):
    """
    Schedule roadmap tasks on the calendar starting from a given date.
    Expects 'start_date' in request body (YYYY-MM-DD).
    Creates calendar Events for each task so they appear on the scheduler.
    """
    from datetime import datetime, timedelta
    from django.utils import timezone
    from scheduler.models import Event
    from tasks.models import Task
    
    try:
        roadmap = Roadmap.objects.get(id=roadmap_id, user=request.user)
        start_date_str = request.data.get('start_date')

        if not start_date_str:
            return Response({"error": "start_date is required"}, status=status.HTTP_400_BAD_REQUEST)

        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").date()
        
        # Get all tasks for this roadmap
        tasks = Task.objects.filter(roadmap=roadmap).order_by('day', 'order_in_day')
        
        if not tasks.exists():
            return Response({
                "error": "No tasks found for this roadmap. Please generate tasks first.",
                "tasks_found": 0
            }, status=status.HTTP_400_BAD_REQUEST)
        
        created_events = []
        scheduled_tasks = []
        
        # Schedule each task
        for task in tasks:
            # Calculate the actual date for this task based on its day number
            task_date = start_date + timedelta(days=task.day - 1)
            
            # Update task's due_date
            task.due_date = task_date
            task.save()
            
            # Calculate time slots based on order_in_day
            # Start at 9 AM, each task gets a slot based on its estimated minutes
            base_hour = 9
            slot_offset = task.order_in_day * 2  # 2 hour slots
            start_hour = base_hour + slot_offset
            
            # Cap at reasonable hours (9 AM to 8 PM)
            if start_hour > 20:
                start_hour = 9 + (task.order_in_day % 6) * 2
            
            # Create timezone-aware datetimes
            naive_start = datetime.combine(task_date, datetime.min.time().replace(hour=start_hour, minute=0))
            duration_hours = max(1, task.estimated_minutes // 60)
            naive_end = datetime.combine(task_date, datetime.min.time().replace(hour=min(start_hour + duration_hours, 23), minute=0))
            
            start_datetime = timezone.make_aware(naive_start)
            end_datetime = timezone.make_aware(naive_end)
            
            # Create calendar Event for this task
            event = Event.objects.create(
                user=request.user,
                title=task.title,
                description=task.description or f"Task from roadmap: {roadmap.title}",
                start_time=start_datetime,
                end_time=end_datetime,
                linked_task=task,  # Link to navigate from calendar to task
            )
            
            print(f"  ✅ Created event {event.id}: {task.title} on {task_date}")
            created_events.append(event.id)
            
            scheduled_tasks.append({
                "id": task.id,
                "title": task.title,
                "due_date": str(task_date),
                "event_id": event.id
            })

        # Also update milestone dates for reference
        milestones = roadmap.milestones.all().order_by('order')
        current_date = start_date
        
        for milestone in milestones:
            duration_str = milestone.duration.lower() if milestone.duration else ""
            days_to_add = 7
            
            if 'week' in duration_str:
                try:
                    days_to_add = int(duration_str.split()[0]) * 7
                except:
                    pass
            elif 'month' in duration_str:
                try:
                    days_to_add = int(duration_str.split()[0]) * 30
                except:
                    pass
            elif 'day' in duration_str:
                try:
                    days_to_add = int(duration_str.split()[0])
                except:
                    pass

            milestone.start_date = current_date
            milestone.end_date = current_date + timedelta(days=days_to_add)
            milestone.save()
            current_date = milestone.end_date + timedelta(days=1)

        print(f"✅ Scheduled roadmap {roadmap_id} with {len(created_events)} task events")
        
        return Response({
            "message": f"Roadmap scheduled successfully! {len(created_events)} tasks added to calendar.",
            "tasks_scheduled": len(scheduled_tasks),
            "events_created": len(created_events),
            "tasks": scheduled_tasks[:10]  # Return first 10 for confirmation
        }, status=status.HTTP_200_OK)

    except Roadmap.DoesNotExist:
        return Response({"error": "Roadmap not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"❌ Error scheduling roadmap: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            "error": "Failed to schedule roadmap",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_roadmap_projects(request):
    """
    Get all projects from all roadmaps for the authenticated user.
    Projects are auto-pulled from roadmap milestones with progress tracking.
    """
    try:
        from tasks.models import Task
        
        user_roadmaps = Roadmap.objects.filter(user=request.user)
        all_projects = []
        
        for roadmap in user_roadmaps:
            milestones = roadmap.milestones.all()
            
            for milestone in milestones:
                for project in milestone.projects.all():
                    # Calculate project progress based on related tasks
                    project_tasks = Task.objects.filter(
                        roadmap=roadmap,
                        milestone=milestone,
                        tags__contains=['project']
                    )
                    
                    total_tasks = project_tasks.count()
                    completed_tasks = project_tasks.filter(status='completed').count()
                    in_progress_tasks = project_tasks.filter(status='in_progress').count()
                    
                    # Calculate progress percentage
                    progress = 0
                    if total_tasks > 0:
                        progress = int((completed_tasks / total_tasks) * 100)
                    
                    # Determine status
                    if progress == 100:
                        status_val = 'completed'
                    elif progress > 0 or in_progress_tasks > 0:
                        status_val = 'in_progress'
                    else:
                        status_val = 'not_started'
                    
                    all_projects.append({
                        'id': project.id,
                        'title': project.title,
                        'description': project.description,
                        'difficulty': project.difficulty,
                        'estimated_hours': project.estimated_hours,
                        'tech_stack': project.tech_stack,
                        'learning_outcomes': project.learning_outcomes,
                        'roadmap_id': roadmap.id,
                        'roadmap_title': roadmap.title,
                        'milestone_id': milestone.id,
                        'milestone_title': milestone.title,
                        'progress': progress,
                        'status': status_val,
                        'total_tasks': total_tasks,
                        'completed_tasks': completed_tasks,
                        'completed': project.completed,
                    })
        
        return Response(all_projects)
        
    except Exception as e:
        print(f"❌ Error fetching roadmap projects: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            "error": "Failed to fetch projects",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_roadmap_progress(request):
    """
    Get progress summary for all user roadmaps.
    """
    try:
        from tasks.models import Task
        
        user_roadmaps = Roadmap.objects.filter(user=request.user)
        progress_data = []
        
        for roadmap in user_roadmaps:
            tasks = Task.objects.filter(roadmap=roadmap)
            total_tasks = tasks.count()
            completed_tasks = tasks.filter(status='completed').count()
            
            milestones = roadmap.milestones.all()
            total_milestones = milestones.count()
            completed_milestones = milestones.filter(is_completed=True).count()
            
            progress = 0
            if total_tasks > 0:
                progress = int((completed_tasks / total_tasks) * 100)
            
            progress_data.append({
                'id': roadmap.id,
                'title': roadmap.title,
                'goal': roadmap.goal,
                'progress': progress,
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'total_milestones': total_milestones,
                'completed_milestones': completed_milestones,
                'difficulty_level': roadmap.difficulty_level,
                'estimated_duration': roadmap.estimated_duration,
            })
        
        return Response(progress_data)
        
    except Exception as e:
        print(f"❌ Error fetching roadmap progress: {str(e)}")
        return Response({
            "error": "Failed to fetch progress",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Student Projects ViewSet
from rest_framework import viewsets
from rest_framework.decorators import action
from .models import StudentProject
from .serializers import StudentProjectSerializer, StudentProjectCreateSerializer


class StudentProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing student-uploaded projects.
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return StudentProjectCreateSerializer
        return StudentProjectSerializer
    
    def get_queryset(self):
        return StudentProject.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get statistics about student projects."""
        queryset = self.get_queryset()
        
        total = queryset.count()
        with_github = queryset.exclude(github_url__isnull=True).exclude(github_url='').count()
        public = queryset.filter(visibility='public').count()
        
        return Response({
            'total_projects': total,
            'projects_on_github': with_github,
            'public_projects': public,
            'private_projects': total - public,
        })


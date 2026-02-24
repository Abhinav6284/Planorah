import os
import json
import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from dotenv import load_dotenv

from roadmap_ai.models import Roadmap, Milestone
from tasks.models import Task

# Load environment variables
load_dotenv()

# Get API key
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY") or getattr(settings, 'GEMINI_API_KEY', None)


def build_user_context(user):
    """Build a context string with user's roadmaps and tasks."""
    context_parts = []
    
    # Get user's roadmaps
    roadmaps = Roadmap.objects.filter(user=user).prefetch_related('milestones')
    
    if roadmaps.exists():
        context_parts.append("## User's Learning Roadmaps:\n")
        for roadmap in roadmaps[:5]:  # Limit to 5 roadmaps to avoid token overflow
            context_parts.append(f"\n### {roadmap.title}")
            context_parts.append(f"- Goal: {roadmap.goal}")
            context_parts.append(f"- Duration: {roadmap.estimated_duration}")
            context_parts.append(f"- Level: {roadmap.difficulty_level}")
            context_parts.append(f"- Category: {roadmap.category}")
            
            # Add milestones
            milestones = roadmap.milestones.all().order_by('order')[:10]
            if milestones:
                context_parts.append("- Milestones:")
                for m in milestones:
                    status_icon = "✅" if m.is_completed else "⏳"
                    context_parts.append(f"  {status_icon} {m.title} ({m.duration})")
                    
                    # Add resources if available
                    if m.resources:
                        for res in m.resources[:3]:
                            if isinstance(res, dict):
                                context_parts.append(f"    - Resource: {res.get('title', 'N/A')} - {res.get('url', '')}")
    
    # Get user's tasks
    tasks = Task.objects.filter(user=user).order_by('day', '-status')
    
    pending_tasks = tasks.filter(status__in=['not_started', 'in_progress'])[:15]
    completed_tasks = tasks.filter(status='completed')[:5]
    
    if pending_tasks.exists():
        context_parts.append("\n## Pending Tasks:\n")
        for task in pending_tasks:
            status_map = {
                'not_started': '⬜',
                'in_progress': '🔄',
                'needs_revision': '⚠️'
            }
            icon = status_map.get(task.status, '⬜')
            context_parts.append(f"{icon} Day {task.day}: {task.title} ({task.estimated_minutes} min) - Roadmap: {task.roadmap.title if task.roadmap else 'General'}")
    
    if completed_tasks.exists():
        context_parts.append("\n## Recently Completed:\n")
        for task in completed_tasks:
            context_parts.append(f"✅ {task.title}")
    
    # Task statistics
    total_tasks = tasks.count()
    completed_count = tasks.filter(status='completed').count()
    if total_tasks > 0:
        progress = (completed_count / total_tasks) * 100
        context_parts.append(f"\n## Progress: {completed_count}/{total_tasks} tasks completed ({progress:.1f}%)")
    
    return "\n".join(context_parts)


SYSTEM_PROMPT = """You are Planorah Assistant, a helpful AI companion for students using the Planorah learning platform.

Your ONLY purpose is to help users with:
1. Understanding their learning roadmaps and progress
2. Answering questions about their tasks and schedule
3. Providing guidance on what to study next
4. Explaining how features work within the platform
5. Motivating and encouraging their learning journey

FORMATTING RULES (VERY IMPORTANT):
- ALWAYS use bullet points (- or •) when listing items, tasks, or options
- Use **bold** for important terms, task names, and roadmap titles
- Use headers (##, ###) to organize longer responses
- Keep responses well-structured and scannable
- Use emojis strategically to make responses more engaging (📚 for learning, ✅ for completed, ⏳ for pending, etc.)
- Break down complex information into clear, digestible points
- For progress summaries, use a format like: "✅ Completed: X | ⏳ Pending: Y"

CONTENT RULES:
- ONLY answer questions related to the user's tasks, roadmaps, learning progress, and the Planorah platform
- If asked about unrelated topics (coding help, general knowledge, etc.), politely redirect them to ask about their learning journey
- Be encouraging and supportive
- Keep responses concise and actionable
- When referencing tasks or milestones, use the specific names from their data
- If they ask about resources, refer to the resources in their roadmap milestones

NEVER:
- Answer general programming questions (tell them to check their roadmap resources)
- Discuss topics unrelated to learning/productivity
- Make up information not present in their context
- Write plain text paragraphs without structure - ALWAYS use bullet points and formatting

PLATFORM FEATURES (for reference):
- Dashboard: Overview of progress and widgets
- Tasks: View and manage daily learning tasks
- Learning Path: View and generate AI roadmaps
- Resume Builder: Create and manage resumes
- Job Finder: Search for jobs
- Calendar: Schedule and view events

Current user context is provided below. Use this to give personalized responses.
"""


class GeminiAPIError(Exception):
    """Custom exception for Gemini API errors."""
    pass

def call_gemini_api(prompt, max_retries=3):
    """Call Gemini API directly via HTTP with retry logic."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    headers = {
        "Content-Type": "application/json"
    }
    
    payload = {
        "contents": [{
            "parts": [{
                "text": prompt
            }]
        }],
        "generationConfig": {
            "temperature": 0.7,
            "topP": 0.9,
            "maxOutputTokens": 1024
        }
    }
    
    last_error = None
    for attempt in range(max_retries):
        try:
            response = requests.post(url, headers=headers, json=payload, timeout=30)
            
            # Handle specific HTTP status codes
            if response.status_code == 429:
                raise GeminiAPIError("I'm receiving too many requests right now. Please wait a minute and try again.")
            elif response.status_code == 400:
                raise GeminiAPIError("There was an issue with the API configuration. Please contact support.")
            elif response.status_code == 403:
                raise GeminiAPIError("The AI service is unavailable. Please try again later.")
            elif not response.ok:
                raise GeminiAPIError(f"AI service returned an error (code {response.status_code}). Please try again.")
            
            data = response.json()
            
            # Extract text from response
            if "candidates" in data and len(data["candidates"]) > 0:
                candidate = data["candidates"][0]
                if "content" in candidate and "parts" in candidate["content"]:
                    parts = candidate["content"]["parts"]
                    if len(parts) > 0 and "text" in parts[0]:
                        return parts[0]["text"]
            
            return "I'm sorry, I couldn't generate a response. Please try again."
            
        except requests.exceptions.SSLError as e:
            last_error = e
            print(f"⚠️ SSL error on attempt {attempt + 1}/{max_retries}: {str(e)}")
            import time
            time.sleep(1)  # Wait before retry
            continue
        except requests.exceptions.ConnectionError as e:
            last_error = e
            print(f"⚠️ Connection error on attempt {attempt + 1}/{max_retries}: {str(e)}")
            import time
            time.sleep(1)
            continue
    
    # All retries failed
    raise requests.exceptions.RequestException(f"Failed after {max_retries} attempts: {last_error}")



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def chat(request):
    """Handle chat messages with the AI assistant."""
    
    if not GEMINI_API_KEY:
        return Response({
            "error": "AI service is not configured."
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    user = request.user
    message = request.data.get('message', '').strip()
    
    if not message:
        return Response({
            "error": "Message is required."
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Build user context
        user_context = build_user_context(user)
        
        # Build the full prompt
        full_prompt = f"""{SYSTEM_PROMPT}

---
USER LEARNING CONTEXT:
{user_context}
---

User Question: {message}

Assistant Response:"""
        
        # Call Gemini via HTTP
        assistant_response = call_gemini_api(full_prompt)
        
        return Response({
            "message": assistant_response.strip(),
            "success": True
        })
        
    except GeminiAPIError as e:
        print(f"⚠️ Gemini API error: {str(e)}")
        return Response({
            "message": "I'm getting too many requests right now. Please wait a minute and try again. In the meantime, focus on your top pending task and complete one small milestone.",
            "error": str(e),
            "success": False,
            "rate_limited": True
        }, status=status.HTTP_200_OK)
    except requests.exceptions.RequestException as e:
        print(f"❌ Gemini API error: {str(e)}")
        return Response({
            "error": "Sorry, I couldn't connect to the AI service. Please try again.",
            "details": str(e)
        }, status=status.HTTP_502_BAD_GATEWAY)
    except Exception as e:
        print(f"❌ Assistant error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({
            "error": "Sorry, I encountered an error. Please try again.",
            "details": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


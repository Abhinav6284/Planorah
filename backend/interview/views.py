import os
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import InterviewSession, InterviewMessage
from .serializers import InterviewSessionSerializer, InterviewMessageSerializer

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except (ImportError, TypeError):
    GENAI_AVAILABLE = False

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_interview(request):
    """Start a new interview session"""
    user = request.user
    job_role = request.data.get('job_role')
    topic = request.data.get('topic', 'General')
    
    if not job_role:
        return Response({"error": "Job role is required"}, status=400)
        
    session = InterviewSession.objects.create(user=user, job_role=job_role, topic=topic)
    
    # Generate first question
    initial_question = "Tell me about yourself and why you applied for this role."
    
    # Check if we want AI to generate the first question customized?
    # For now, let's stick to a solid default or quick gen.
    if GENAI_AVAILABLE:
        try:
            api_key = os.environ.get("GEMINI_API_KEY")
            if api_key:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-2.0-flash')
                prompt = f"Generate an opening interview question for a {job_role} candidate. Keep it professional and concise."
                response = model.generate_content(prompt)
                initial_question = response.text.strip()
        except:
            pass # Fallback to default
            
    InterviewMessage.objects.create(session=session, sender='ai', content=initial_question)
    
    return Response(InterviewSessionSerializer(session).data, status=201)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request, session_id):
    """User sends a message, AI responds with feedback and next question"""
    try:
        session = InterviewSession.objects.get(id=session_id, user=request.user)
    except InterviewSession.DoesNotExist:
        return Response({"error": "Session not found"}, status=404)
        
    user_content = request.data.get('content')
    if not user_content:
        return Response({"error": "Content required"}, status=400)
        
    # Save user message
    InterviewMessage.objects.create(session=session, sender='user', content=user_content)
    
    # AI Processing
    ai_response_text = "Thank you. Let's move on."
    feedback_text = ""
    
    if GENAI_AVAILABLE:
        try:
            api_key = os.environ.get("GEMINI_API_KEY")
            if api_key:
                genai.configure(api_key=api_key)
                model = genai.GenerativeModel('gemini-2.0-flash')
                
                # Context building (simple: last few messages)
                history = session.messages.order_by('-created_at')[:5]
                history_text = "\n".join([f"{msg.sender.upper()}: {msg.content}" for msg in reversed(history)])
                
                prompt = f"""
                You are an expert technical interviewer for the role: {session.job_role} ({session.topic}).
                
                Conversation History:
                {history_text}
                
                Task:
                1. Analyze the CANDIDATE's last answer. specific strengths/weaknesses.
                2. Generate the NEXT interview question.
                
                Output Format:
                FEEDBACK: [Analysis of their answer]
                QUESTION: [Next Question]
                """
                
                response = model.generate_content(prompt)
                raw_text = response.text.strip()
                
                # Naive parsing
                if "FEEDBACK:" in raw_text and "QUESTION:" in raw_text:
                    parts = raw_text.split("QUESTION:")
                    feedback_text = parts[0].replace("FEEDBACK:", "").strip()
                    ai_response_text = parts[1].strip()
                else:
                    ai_response_text = raw_text
                    
        except Exception as e:
            print(f"AI Error: {e}")
            
    # Save AI response (as feedback to user, or next question? Model supports feedback field on user msg? 
    # Actually my model has feedback on specific message. 
    # Let's attach logic: The user just spoke. We want to give feedback on THAT message.
    # So we update the USER's last message with feedback.
    # And create a NEW AI message with the next question.
    
    user_msg = session.messages.filter(sender='user').last()
    if user_msg and feedback_text:
        user_msg.feedback = feedback_text
        user_msg.save()
        
    InterviewMessage.objects.create(session=session, sender='ai', content=ai_response_text)
    
    return Response(InterviewSessionSerializer(session).data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_session(request, session_id):
    try:
        session = InterviewSession.objects.get(id=session_id, user=request.user)
        return Response(InterviewSessionSerializer(session).data)
    except InterviewSession.DoesNotExist:
        return Response({"error": "Not found"}, status=404)

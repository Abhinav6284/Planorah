import os
import json
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import ATSAnalysis
from .serializers import ATSAnalysisSerializer

try:
    import google.generativeai as genai
    from google.generativeai.types import GenerationConfig
    GENAI_AVAILABLE = True
except (ImportError, TypeError):
    GENAI_AVAILABLE = False


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def analyze_resume(request):
    """
    Analyze resume against a JD using Gemini.
    """
    if not GENAI_AVAILABLE:
        return Response({"error": "AI Service unavailable"}, status=503)

    user = request.user
    resume_text = request.data.get('resume_text', '')
    job_description = request.data.get('job_description', '')
    job_role = request.data.get('job_role', 'Target Role')

    if not resume_text or not job_description:
        return Response({"error": "Resume text and Job Description are required"}, status=400)

    # Prompt
    prompt = f"""
    Act as an expert ATS (Applicant Tracking System) Scanner.
    
    Job Role: {job_role}
    
    Job Description:
    {job_description}
    
    Candidate Resume:
    {resume_text}
    
    Task:
    Compare the resume against the job description.
    
    Output strictly in JSON format with these keys:
    {{
        "match_score": (integer 0-100),
        "missing_keywords": ["list", "of", "important", "missing", "terms"],
        "strength_areas": ["list", "of", "matched", "strong", "points"],
        "improvement_areas": ["list", "of", "specific", "suggestions"],
        "summary_feedback": "A short paragraph summarizing the fit."
    }}
    """

    try:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
             return Response({"error": "API Key missing"}, status=500)
             
        genai.configure(api_key=api_key)
        # Using flash for speed/cost
        model = genai.GenerativeModel('gemini-2.0-flash', generation_config={"response_mime_type": "application/json"})
        
        response = model.generate_content(prompt)
        result_text = response.text.strip()
        
        # Clean markdown json blocks if present
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0]
        elif "```" in result_text:
             result_text = result_text.split("```")[1].split("```")[0]
             
        analysis_data = json.loads(result_text)
        
        # Save to DB
        ats_scan = ATSAnalysis.objects.create(
            user=user,
            resume_text=resume_text,
            job_description=job_description,
            job_role=job_role,
            match_score=analysis_data.get('match_score', 0),
            missing_keywords=analysis_data.get('missing_keywords', []),
            strength_areas=analysis_data.get('strength_areas', []),
            improvement_areas=analysis_data.get('improvement_areas', []),
            summary_feedback=analysis_data.get('summary_feedback', '')
        )
        
        # Update Streak
        try:
            from users.utils import update_streak
            update_streak(user, "ats_scan")
        except Exception as e:
            pass  # print(f"Error updating streak: {e}")

        return Response(ATSAnalysisSerializer(ats_scan).data, status=201)

    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_ats_history(request):
    history = ATSAnalysis.objects.filter(user=request.user).order_by('-created_at')
    return Response(ATSAnalysisSerializer(history, many=True).data)

"""
planora/services.py
AI-powered services for Planora study platform.
Uses Gemini AI (consistent with the rest of the platform).
"""
import os
import json
import logging
import re
from datetime import date, timedelta

logger = logging.getLogger(__name__)


def _get_gemini_model():
    """Lazy-load and configure the Gemini model."""
    import google.generativeai as genai  # noqa: PLC0415
    api_key = os.environ.get('GEMINI_API_KEY')
    if not api_key:
        raise EnvironmentError('GEMINI_API_KEY environment variable is not set.')
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-2.5-flash-lite')


def _parse_json_response(text: str) -> dict | list:
    """
    Extract JSON from Gemini response text.
    Handles markdown code-fenced blocks gracefully.
    """
    raw_text = (text or "").strip()
    if not raw_text:
        raise ValueError("AI response was empty.")

    candidates: list[str] = [raw_text]

    # Add fenced JSON blocks when present.
    fenced_blocks = re.findall(
        r"```(?:json)?\s*([\s\S]*?)\s*```",
        raw_text,
        flags=re.IGNORECASE,
    )
    candidates.extend(block.strip() for block in fenced_blocks if block.strip())

    # Try extracting a balanced top-level JSON object/array from mixed text.
    extracted = _extract_balanced_json(raw_text)
    if extracted:
        candidates.append(extracted.strip())

    seen: set[str] = set()
    for candidate in candidates:
        if not candidate or candidate in seen:
            continue
        seen.add(candidate)
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            continue

    preview = raw_text.replace("\n", " ")[:200]
    raise ValueError(f"Unable to parse AI JSON response. Preview: {preview}")


def _extract_balanced_json(text: str) -> str | None:
    """Return the first balanced JSON object/array found in text."""
    starts = [idx for idx in (text.find("["), text.find("{")) if idx != -1]
    if not starts:
        return None

    start = min(starts)
    opener = text[start]
    closer = "]" if opener == "[" else "}"

    depth = 0
    in_string = False
    escaped = False

    for idx in range(start, len(text)):
        char = text[idx]

        if in_string:
            if escaped:
                escaped = False
                continue
            if char == "\\":
                escaped = True
                continue
            if char == '"':
                in_string = False
            continue

        if char == '"':
            in_string = True
            continue

        if char == opener:
            depth += 1
        elif char == closer:
            depth -= 1
            if depth == 0:
                return text[start:idx + 1]

    return None


# ---------------------------------------------------------------------------
# Syllabus → Topic Structure
# ---------------------------------------------------------------------------

def generate_topics_from_syllabus(syllabus_text: str, exam_pattern: dict | None = None) -> list[dict]:
    """
    Parse syllabus text + optional exam pattern and return a structured list
    of topics with importance and depth assigned.
    """
    exam_context = ''
    if exam_pattern:
        dist = exam_pattern.get('marks_distribution', [])
        exam_context = f"\nExam pattern: {json.dumps(dist)}"

    prompt = f"""
You are an expert academic content analyst for a student study platform.
Analyse the following syllabus and extract a structured list of topics.
{exam_context}

Syllabus:
\"\"\"
{syllabus_text}
\"\"\"

Rules:
1. Extract ALL distinct topics from the syllabus.
2. For each topic, assign:
   - importance: "high" | "medium" | "low"  (based on likely exam weightage)
   - depth: "short" | "medium" | "long"     (expected answer length in exam)
   - subtopics: list of sub-topics (strings, max 5)
   - expected_questions: list of likely exam questions (strings, max 3)
3. Order topics logically (fundamentals first).
4. Return ONLY a valid JSON array — no extra text.

Output format:
[
  {{
    "name": "Topic Name",
    "description": "One-sentence description",
    "importance": "high",
    "depth": "long",
    "subtopics": ["subtopic 1", "subtopic 2"],
    "expected_questions": ["Question 1?", "Question 2?"]
  }}
]
"""
    model = _get_gemini_model()
    response = model.generate_content(prompt)
    return _parse_json_response(response.text)


# ---------------------------------------------------------------------------
# Notes Generator
# ---------------------------------------------------------------------------

def generate_notes_for_topic(topic_name: str, subject_name: str, importance: str, depth: str) -> dict:
    """
    Generate structured exam-ready notes for a topic.
    Returns a dict with keys: definition, explanation, key_points, examples, conclusion.
    """
    depth_map = {'short': '2–3 sentences', 'medium': '1 paragraph', 'long': '2–3 paragraphs'}
    depth_guidance = depth_map.get(depth, '1 paragraph')

    prompt = f"""
You are an elite academic tutor creating exam-ready notes for students.

Subject: {subject_name}
Topic: {topic_name}
Importance: {importance} (weight this topic accordingly)
Expected answer depth: {depth_guidance}

Generate highly structured, exam-oriented notes in JSON format.
Focus on what students need to WRITE in an exam — not just understand.

Return ONLY valid JSON. No markdown outside the JSON.

{{
  "definition": "Clear, exam-ready one-liner definition.",
  "explanation": "Detailed explanation with depth appropriate for a {depth} answer.",
  "key_points": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
  "examples": [
    {{"title": "Example 1", "content": "Concrete, memorable example."}},
    {{"title": "Example 2", "content": "Another example if relevant."}}
  ],
  "formulas_or_diagrams": "Any formulas, equations, or diagram hints (empty string if none)",
  "exam_tip": "Specific tip for answering questions on this topic in an exam.",
  "conclusion": "Concise summary paragraph suitable for ending an exam answer."
}}
"""
    model = _get_gemini_model()
    response = model.generate_content(prompt)
    return _parse_json_response(response.text)


# ---------------------------------------------------------------------------
# Study Guide Generator
# ---------------------------------------------------------------------------

def generate_study_guide_for_topic(topic_name: str, subject_name: str, importance: str) -> dict:
    """
    Generate a step-by-step study guide for a topic.
    Returns a dict with order_of_learning, key_focus_areas, common_mistakes, revision_strategy.
    """
    prompt = f"""
You are an expert study coach helping a student master: "{topic_name}" in {subject_name}.
This topic has {importance} importance for the exam.

Generate a practical, actionable study guide in JSON format.
Return ONLY valid JSON. No markdown outside the JSON.

{{
  "order_of_learning": [
    {{"step": 1, "action": "What to do first", "duration": "e.g. 20 mins"}},
    {{"step": 2, "action": "What to do next", "duration": "e.g. 15 mins"}}
  ],
  "key_focus_areas": ["Most important concept 1", "Most important concept 2", "Most important concept 3"],
  "common_mistakes": ["Mistake students commonly make 1", "Mistake 2", "Mistake 3"],
  "revision_strategy": {{
    "first_pass": "How to study this topic for the first time (1–2 sentences)",
    "second_pass": "How to revise 2–3 days before exam",
    "day_before": "What to review the night before the exam"
  }},
  "resources_tips": ["Useful resource or tip 1", "Tip 2"],
  "time_estimate": "Total recommended study time, e.g. '90 minutes'"
}}
"""
    model = _get_gemini_model()
    response = model.generate_content(prompt)
    return _parse_json_response(response.text)


# ---------------------------------------------------------------------------
# Study Planner
# ---------------------------------------------------------------------------

def generate_study_plan(
    subject_name: str,
    topics: list[dict],
    exam_date: date,
    daily_hours: float,
) -> list[dict]:
    """
    Generate a day-by-day study plan.
    Returns a list of {date, sessions: [{topic_name, duration_minutes, focus}], notes}.
    """
    today = date.today()
    days_remaining = (exam_date - today).days

    if days_remaining <= 0:
        return []

    topics_summary = json.dumps([
        {'name': t['name'], 'status': t.get('status', 'not_started'), 'importance': t.get('importance', 'medium')}
        for t in topics
    ])

    prompt = f"""
You are a smart academic planner building a day-by-day study plan for an exam.

Subject: {subject_name}
Exam date: {exam_date.isoformat()}
Days remaining: {days_remaining}
Daily study hours available: {daily_hours}
Today's date: {today.isoformat()}

Topics to cover (with current status and importance):
{topics_summary}

Rules:
1. Allocate more time to HIGH importance and WEAK/NOT STARTED topics.
2. Spread topics sensibly across days — don't overload any single day.
3. Reserve the last 2 days for full revision.
4. Each day should have 1–4 sessions.
5. Return ONLY valid JSON — no markdown outside JSON.

Output format (array of days):
[
  {{
    "date": "YYYY-MM-DD",
    "sessions": [
      {{
        "topic_name": "Topic Name",
        "duration_minutes": 60,
        "focus": "Brief description of what to focus on in this session"
      }}
    ],
    "notes": "Any special note for this day (e.g. 'Revision day', 'Rest if tired')"
  }}
]

Generate plan for all {days_remaining} days starting from today.
"""
    model = _get_gemini_model()
    response = model.generate_content(prompt)
    return _parse_json_response(response.text)

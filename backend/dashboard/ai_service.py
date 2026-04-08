import json
import os
from typing import Dict, List

import requests
from django.conf import settings


GEMINI_API_KEY = os.getenv('GEMINI_API_KEY') or getattr(settings, 'GEMINI_API_KEY', None)
GEMINI_MODEL = os.getenv('GEMINI_LLM_MODEL', 'gemini-2.5-flash')


def _safe_json_from_text(text: str) -> Dict:
    raw = (text or '').strip()
    if not raw:
        return {}
    start = raw.find('{')
    end = raw.rfind('}')
    if start == -1 or end == -1 or end < start:
        return {}
    try:
        return json.loads(raw[start:end + 1])
    except json.JSONDecodeError:
        return {}


def _normalize_coach_payload(payload: Dict) -> Dict:
    return {
        'task': str(payload.get('task') or '').strip() or 'Complete one focused study block',
        'reason': str(payload.get('reason') or '').strip() or 'This is the highest leverage next step for your current momentum.',
        'difficulty': str(payload.get('difficulty') or 'medium').strip().lower() if str(payload.get('difficulty') or '').strip().lower() in {'easy', 'medium', 'hard'} else 'medium',
        'estimated_time': str(payload.get('estimated_time') or '25 min').strip() or '25 min',
        'alternatives': [str(item).strip() for item in payload.get('alternatives', []) if str(item).strip()][:4],
    }


def _gemini_structured_call(system_prompt: str, user_payload: Dict) -> Dict:
    if not GEMINI_API_KEY:
        raise ValueError('GEMINI_API_KEY missing')

    response = requests.post(
        f'https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}',
        headers={'Content-Type': 'application/json'},
        json={
            'contents': [
                {
                    'parts': [
                        {
                            'text': f"{system_prompt}\n\nInput:\n{json.dumps(user_payload)}\n\nReturn valid JSON only."
                        }
                    ]
                }
            ],
            'generationConfig': {
                'temperature': 0.4,
                'topP': 0.9,
                'maxOutputTokens': 600,
            },
        },
        timeout=30,
    )
    response.raise_for_status()

    candidates = response.json().get('candidates') or []
    if not candidates:
        raise ValueError('Gemini empty response')

    parts = candidates[0].get('content', {}).get('parts') or []
    if not parts:
        raise ValueError('Gemini empty content')

    text = parts[0].get('text') or ''
    parsed = _safe_json_from_text(text)
    if not parsed:
        raise ValueError('Gemini invalid JSON')
    return parsed


def generate_coach_recommendation(payload: Dict) -> Dict:
    system_prompt = (
        'You are an elite execution coach for students. '
        'Return ONLY JSON with keys: task, reason, difficulty, estimated_time, alternatives. '
        'difficulty must be easy|medium|hard. alternatives must be an array of short task titles.'
    )

    try:
        data = _gemini_structured_call(system_prompt, payload)
    except Exception:
        data = {
            'task': 'Start one 25-minute deep work sprint on your most important pending task',
            'reason': 'A short start reduces friction and builds daily consistency.',
            'difficulty': 'medium',
            'estimated_time': '25 min',
            'alternatives': [
                'Revise one weak topic for 30 minutes',
                'Solve 10 focused practice questions',
            ],
        }

    return _normalize_coach_payload(data)


def generate_exam_plan(payload: Dict) -> Dict:
    system_prompt = (
        'You create exam execution plans. '
        'Return ONLY JSON with keys: topics and revision_schedule. '
        'topics is array of objects: {topic, priority, status}. '
        'revision_schedule is array of objects: {day, focus, duration}. '
        'priority should be high|medium|low and status should be pending by default.'
    )

    try:
        data = _gemini_structured_call(system_prompt, payload)
    except Exception:
        data = {
            'topics': [
                {'topic': 'Core Concepts', 'priority': 'high', 'status': 'pending'},
                {'topic': 'Problem Solving', 'priority': 'high', 'status': 'pending'},
                {'topic': 'Revision & Mock Tests', 'priority': 'medium', 'status': 'pending'},
            ],
            'revision_schedule': [
                {'day': 'Day 1', 'focus': 'Core Concepts', 'duration': '90 min'},
                {'day': 'Day 2', 'focus': 'Problem Solving', 'duration': '90 min'},
                {'day': 'Day 3', 'focus': 'Mixed Revision', 'duration': '60 min'},
            ],
        }

    topics: List[Dict] = []
    for item in data.get('topics', []):
        topic = str(item.get('topic') or '').strip()
        if not topic:
            continue
        priority = str(item.get('priority') or 'medium').lower()
        if priority not in {'high', 'medium', 'low'}:
            priority = 'medium'
        topics.append({
            'topic': topic,
            'priority': priority,
            'status': str(item.get('status') or 'pending').strip() or 'pending',
        })

    revision_schedule: List[Dict] = []
    for item in data.get('revision_schedule', []):
        day = str(item.get('day') or '').strip()
        focus = str(item.get('focus') or '').strip()
        duration = str(item.get('duration') or '60 min').strip() or '60 min'
        if day and focus:
            revision_schedule.append({'day': day, 'focus': focus, 'duration': duration})

    if not topics:
        topics = [{'topic': 'Core Topics', 'priority': 'high', 'status': 'pending'}]

    if not revision_schedule:
        revision_schedule = [{'day': 'Day 1', 'focus': topics[0]['topic'], 'duration': '60 min'}]

    return {
        'topics': topics,
        'revision_schedule': revision_schedule,
    }

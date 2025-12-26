import requests
from django.conf import settings


def generate_roadmap(prompt: str):
    """
    Sends a roadmap generation request to Google Gemini API.
    """
    API_KEY = settings.GEMINI_API_KEY
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key={API_KEY}"

    payload = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ]
    }

    response = requests.post(url, json=payload)

    if response.status_code == 200:
        data = response.json()
        try:
            return data["candidates"][0]["content"]["parts"][0]["text"]
        except KeyError:
            return "Unexpected response format from Gemini."
    else:
        return f"Error: {response.status_code}, {response.text}"

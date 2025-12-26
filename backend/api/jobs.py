from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
import requests
import json


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def search_jobs(request):
    """
    Search for jobs across multiple free job APIs.
    Returns a simple list of jobs with title, company, source, and apply URL.
    """
    data = request.data
    query = data.get('query', '')
    location = data.get('location', 'Remote')
    
    if not query:
        return JsonResponse({"error": "Query required"}, status=400)
    
    jobs = []
    
    # 1. Remotive API (Free remote jobs)
    try:
        remotive_response = requests.get(
            f"https://remotive.com/api/remote-jobs?search={query}&limit=15",
            timeout=5
        )
        if remotive_response.status_code == 200:
            remotive_data = remotive_response.json()
            for job in remotive_data.get('jobs', [])[:15]:
                jobs.append({
                    'id': f"remotive_{job.get('id')}",
                    'title': job.get('title', ''),
                    'company': job.get('company_name', ''),
                    'location': job.get('candidate_required_location', 'Remote'),
                    'source': 'Remotive',
                    'url': job.get('url', ''),
                    'posted': job.get('publication_date', '')[:10] if job.get('publication_date') else ''
                })
    except Exception as e:
        print(f"Remotive API error: {e}")
    
    # 2. Arbeitnow API (Free job listings)
    try:
        arbeit_response = requests.get(
            f"https://www.arbeitnow.com/api/job-board-api?search={query}&page=1",
            timeout=5
        )
        if arbeit_response.status_code == 200:
            arbeit_data = arbeit_response.json()
            for job in arbeit_data.get('data', [])[:10]:
                jobs.append({
                    'id': f"arbeit_{job.get('slug')}",
                    'title': job.get('title', ''),
                    'company': job.get('company_name', ''),
                    'location': job.get('location', 'Remote'),
                    'source': 'Arbeitnow',
                    'url': job.get('url', ''),
                    'posted': job.get('created_at', '')[:10] if job.get('created_at') else ''
                })
    except Exception as e:
        print(f"Arbeitnow API error: {e}")
    
    # 3. GitHub Jobs alternative - Himalayas.app (Free)
    try:
        himalayas_response = requests.get(
            f"https://himalayas.app/jobs/api?q={query}&limit=10",
            timeout=5
        )
        if himalayas_response.status_code == 200:
            him_data = himalayas_response.json()
            for job in him_data.get('jobs', [])[:10]:
                jobs.append({
                    'id': f"himalayas_{job.get('id')}",
                    'title': job.get('title', ''),
                    'company': job.get('companyName', ''),
                    'location': job.get('location', 'Remote'),
                    'source': 'Himalayas',
                    'url': f"https://himalayas.app/jobs/{job.get('id')}",
                    'posted': ''
                })
    except Exception as e:
        print(f"Himalayas API error: {e}")
    
    # 4. Add fallback links to major job boards
    if len(jobs) < 5:
        fallback_boards = [
            {
                'id': 'linkedin_search',
                'title': f'{query} Jobs on LinkedIn',
                'company': 'LinkedIn',
                'location': location,
                'source': 'LinkedIn',
                'url': f'https://www.linkedin.com/jobs/search/?keywords={query}&location={location}',
                'posted': ''
            },
            {
                'id': 'indeed_search',
                'title': f'{query} Jobs on Indeed',
                'company': 'Indeed',
                'location': location,
                'source': 'Indeed',
                'url': f'https://www.indeed.com/jobs?q={query}&l={location}',
                'posted': ''
            },
            {
                'id': 'glassdoor_search',
                'title': f'{query} Jobs on Glassdoor',
                'company': 'Glassdoor',
                'location': location,
                'source': 'Glassdoor',
                'url': f'https://www.glassdoor.com/Job/jobs.htm?sc.keyword={query}',
                'posted': ''
            },
            {
                'id': 'wellfound_search',
                'title': f'{query} Jobs on Wellfound',
                'company': 'Wellfound',
                'location': 'Startups',
                'source': 'Wellfound',
                'url': f'https://wellfound.com/jobs?q={query}',
                'posted': ''
            }
        ]
        jobs.extend(fallback_boards)
    
    return JsonResponse({
        'jobs': jobs,
        'total': len(jobs),
        'query': query
    })

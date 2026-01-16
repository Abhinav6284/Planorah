"""
Task validators - objective, server-side validation engines.

Each validator handles a specific proof_type and must return:
{
    'status': 'PASS' | 'FAIL',
    'score': 0-100,
    'checks_performed': {...},
    'findings': [...],
    'errors': [...]
}
"""

import requests
import re
from datetime import datetime, timedelta
from rest_framework.exceptions import ValidationError


class GitHubValidator:
    """
    Automated GitHub repository validator.

    Checks:
    - Repository exists and is public
    - Minimum commit count
    - Required files present
    - Required keywords in code

    Scoring:
    - Commits: 40%
    - File structure: 30%
    - Keyword match: 30%
    """

    def __init__(self, repo_url, acceptance_rules, user):
        """
        Args:
            repo_url: https://github.com/owner/repo
            acceptance_rules: {
                'min_commits': 10,
                'required_files': ['src/', 'README.md'],
                'required_keywords': ['class', 'function']
            }
            user: Django user object
        """
        self.repo_url = repo_url.rstrip('/')
        self.acceptance_rules = acceptance_rules
        self.user = user
        self.checks_performed = {}
        self.findings = []
        self.errors = []
        self.score = 0

        # Parse repo URL
        self.owner, self.repo = self._parse_repo_url()
        self.api_url = f"https://api.github.com/repos/{self.owner}/{self.repo}"

    def _parse_repo_url(self):
        """Extract owner/repo from GitHub URL"""
        match = re.match(
            r'https://github\.com/([^/]+)/([^/]+)/?$', self.repo_url)
        if not match:
            raise ValidationError(
                "Invalid GitHub URL format. Use: https://github.com/owner/repo")
        return match.group(1), match.group(2)

    def _get_repo_data(self):
        """Fetch repo metadata from GitHub API"""
        try:
            response = requests.get(self.api_url, timeout=10)
            if response.status_code == 404:
                self.errors.append("Repository not found")
                return None
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            self.errors.append(f"GitHub API error: {str(e)}")
            return None

    def _check_public(self, repo_data):
        """Check if repository is public"""
        is_public = not repo_data.get('private', False)
        self.checks_performed['is_public'] = is_public

        if not is_public:
            self.findings.append("Repository must be public")
            return False

        return True

    def _check_commit_count(self, repo_data):
        """Check minimum commit count"""
        min_commits = self.acceptance_rules.get('min_commits', 0)
        commit_count = repo_data.get('commits_count', 0)

        # GitHub API doesn't return exact commit count in repo data
        # We need to fetch commit list
        try:
            commits_url = f"{self.api_url}/commits"
            response = requests.get(commits_url, params={
                                    'per_page': 1}, timeout=10)

            if response.status_code == 200:
                # GitHub returns Link header with pagination info
                link_header = response.headers.get('Link', '')
                if 'last' in link_header:
                    # Extract last page number
                    match = re.search(r'page=(\d+)>; rel="last"', link_header)
                    if match:
                        commit_count = int(match.group(1))
                else:
                    # Single page = less than 30 commits
                    commit_count = len(response.json())
        except:
            commit_count = 0

        self.checks_performed['commit_count'] = commit_count
        self.checks_performed['min_commits_required'] = min_commits

        if commit_count < min_commits:
            self.findings.append(
                f"Insufficient commits: {commit_count}/{min_commits}")
            return False

        return True

    def _check_required_files(self):
        """Check if required files exist"""
        required_files = self.acceptance_rules.get('required_files', [])
        if not required_files:
            self.checks_performed['required_files_check'] = 'SKIPPED'
            return True

        found_files = []
        try:
            # Check main branch
            tree_url = f"{self.api_url}/git/trees/main?recursive=1"
            response = requests.get(tree_url, timeout=10)

            if response.status_code == 404:
                # Try master branch
                tree_url = f"{self.api_url}/git/trees/master?recursive=1"
                response = requests.get(tree_url, timeout=10)

            if response.status_code == 200:
                repo_files = [item['path'] for item in response.json()['tree']]

                for required in required_files:
                    # Check if file or directory exists
                    if any(f.startswith(required) for f in repo_files):
                        found_files.append(required)
        except:
            pass

        self.checks_performed['required_files'] = {
            'required': required_files,
            'found': found_files
        }

        if len(found_files) < len(required_files):
            self.findings.append(
                f"Missing required files: {set(required_files) - set(found_files)}")
            return False

        return True

    def _check_keywords(self):
        """Check for required keywords in repository"""
        required_keywords = self.acceptance_rules.get('required_keywords', [])
        if not required_keywords:
            self.checks_performed['keywords_check'] = 'SKIPPED'
            return True

        found_keywords = []
        search_url = f"https://api.github.com/search/code"

        try:
            for keyword in required_keywords:
                # Search for keyword in repo
                params = {
                    'q': f'repo:{self.owner}/{self.repo} {keyword}',
                    'per_page': 1
                }
                response = requests.get(search_url, params=params, timeout=10)

                if response.status_code == 200:
                    if response.json()['total_count'] > 0:
                        found_keywords.append(keyword)
        except:
            pass

        self.checks_performed['keywords'] = {
            'required': required_keywords,
            'found': found_keywords
        }

        if len(found_keywords) < len(required_keywords):
            self.findings.append(
                f"Missing keywords: {set(required_keywords) - set(found_keywords)}")
            return False

        return True

    def validate(self):
        """
        Run full validation and return score.

        Returns:
            {
                'status': 'PASS' | 'FAIL',
                'score': 0-100,
                'checks_performed': {...},
                'findings': [...],
                'errors': [...]
            }
        """
        repo_data = self._get_repo_data()

        if not repo_data or self.errors:
            return {
                'status': 'FAIL',
                'score': 0,
                'checks_performed': self.checks_performed,
                'findings': self.findings,
                'errors': self.errors
            }

        # Run all checks
        is_public = self._check_public(repo_data)
        has_commits = self._check_commit_count(repo_data)
        has_files = self._check_required_files()
        has_keywords = self._check_keywords()

        # Calculate score
        score = 0
        max_score = 100

        # 40% for commits
        if has_commits:
            score += 40

        # 30% for files
        if has_files:
            score += 30

        # 30% for keywords
        if has_keywords:
            score += 30

        self.score = score

        status = 'PASS' if score >= 70 else 'FAIL'  # Assuming 70 is pass threshold

        return {
            'status': status,
            'score': score,
            'checks_performed': self.checks_performed,
            'findings': self.findings,
            'errors': self.errors
        }


class QuizValidator:
    """
    Automated quiz validator.

    Validates quiz answers against answer key.
    Scoring: (correct_answers / total_questions) * 100
    """

    def __init__(self, quiz_answers, acceptance_rules, user):
        """
        Args:
            quiz_answers: {'question_id': 'answer_text', ...}
            acceptance_rules: {'answer_key': {'q1': 'a', 'q2': 'b'}, ...}
            user: Django user
        """
        self.quiz_answers = quiz_answers
        self.acceptance_rules = acceptance_rules
        self.user = user
        self.checks_performed = {}
        self.findings = []
        self.errors = []
        self.score = 0

    def validate(self):
        """Grade the quiz"""
        answer_key = self.acceptance_rules.get('answer_key', {})

        if not answer_key:
            self.errors.append("No answer key provided")
            return {
                'status': 'FAIL',
                'score': 0,
                'checks_performed': self.checks_performed,
                'findings': self.findings,
                'errors': self.errors
            }

        correct = 0
        graded = 0

        for question_id, correct_answer in answer_key.items():
            user_answer = self.quiz_answers.get(question_id, '')

            # Normalize answers (lowercase, strip whitespace)
            user_answer = str(user_answer).lower().strip()
            correct_answer = str(correct_answer).lower().strip()

            graded += 1
            if user_answer == correct_answer:
                correct += 1

        if graded == 0:
            self.errors.append("No answers to grade")
            score = 0
        else:
            score = int((correct / graded) * 100)

        self.score = score
        self.checks_performed['correct_answers'] = correct
        self.checks_performed['total_questions'] = graded
        self.checks_performed['percentage'] = score

        status = 'PASS' if score >= 70 else 'FAIL'  # Assuming 70 is pass

        return {
            'status': status,
            'score': score,
            'checks_performed': self.checks_performed,
            'findings': self.findings,
            'errors': self.errors
        }


def run_validation(task, proof_payload, acceptance_rules):
    """
    Dispatch to correct validator based on proof_type.

    Args:
        task: Task model instance
        proof_payload: dict with proof data
        acceptance_rules: dict with validation rules

    Returns:
        validation_result dict
    """

    if task.proof_type == 'GITHUB_REPO':
        repo_url = proof_payload.get('repo_url')
        if not repo_url:
            return {
                'status': 'FAIL',
                'score': 0,
                'checks_performed': {},
                'findings': ['No repository URL provided'],
                'errors': ['Missing proof_payload.repo_url']
            }

        validator = GitHubValidator(repo_url, acceptance_rules, None)
        return validator.validate()

    elif task.proof_type == 'QUIZ':
        quiz_answers = proof_payload.get('answers', {})
        validator = QuizValidator(quiz_answers, acceptance_rules, None)
        return validator.validate()

    else:
        # FILE_UPLOAD and URL types require manual validation
        return {
            'status': 'PENDING',
            'score': None,
            'checks_performed': {},
            'findings': ['Awaiting manual review'],
            'errors': []
        }

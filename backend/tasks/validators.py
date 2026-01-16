"""
Objective task validators.
Server-side only validation for strict correctness.
"""
import re
import hashlib
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone as dt_timezone, timedelta
from collections import Counter


class GitHubValidator:
    """
    Validates GitHub repository proof.
    Checks:
    - Repository is public (40% weight)
    - Minimum commit count (30% weight)
    - Required files exist (20% weight)
    - Keyword matches in repo (10% weight)
    """

    def __init__(self, repo_url: str, user_id: int, rules: Dict[str, Any], authenticated_username: Optional[str] = None, task_started_at: Optional[datetime] = None):
        """
        Args:
            repo_url: Full GitHub repo URL (https://github.com/user/repo)
            user_id: User ID (for logging)
            rules: {
                'min_commits': 10,
                'required_files': ['file.txt', 'src/main.py'],
                'required_keywords': ['test', 'function'],
                'github_token': 'optional_token_for_private_repos',
                'max_commit_concentration': 0.7,  # Max % of commits in 1-hour window
                'require_author_match': True,  # GitHub username must match authenticated user
                'allow_forks': False,  # Whether forked repos are allowed
                'min_repo_age_hours': 24  # Minimum repo age vs task start time
            }
            authenticated_username: GitHub username of authenticated user (for author checking)
            task_started_at: When task was assigned (for anti-gaming checks)
        """
        self.repo_url = repo_url.rstrip('/')
        self.user_id = user_id
        self.rules = rules or {}
        self.authenticated_username = authenticated_username
        self.task_started_at = task_started_at
        self.errors = []
        self.warnings = []
        self.checks_performed = {}
        self.score = 0

    def validate(self) -> Dict[str, Any]:
        """Run validation and return result."""
        try:
            # Parse repo URL
            if not self._parse_repo_url():
                return {
                    'status': 'FAIL',
                    'score': 0,
                    'reason': 'Invalid GitHub URL format',
                    'errors': self.errors,
                    'checks_performed': self.checks_performed
                }

            # Get repo data
            repo_data = self._get_repo_data()
            if not repo_data or self.errors:
                return {
                    'status': 'FAIL',
                    'score': 0,
                    'reason': 'Cannot access repository',
                    'errors': self.errors,
                    'checks_performed': self.checks_performed
                }

            # CRITICAL SECURITY CHECKS (blocking)
            # Fork detection
            fork_check = self._check_fork_status(repo_data)
            self.checks_performed['fork_check'] = fork_check
            if not fork_check['passed']:
                return {
                    'status': 'FAIL',
                    'score': 0,
                    'reason': fork_check['reason'],
                    'errors': self.errors,
                    'warnings': self.warnings,
                    'checks_performed': self.checks_performed
                }

            # Repo age vs task start (anti-gaming)
            age_check = self._check_repo_age(repo_data)
            self.checks_performed['repo_age'] = age_check
            if not age_check['passed']:
                return {
                    'status': 'FAIL',
                    'score': 0,
                    'reason': age_check['reason'],
                    'errors': self.errors,
                    'warnings': self.warnings,
                    'checks_performed': self.checks_performed
                }

            # Check if public (20% weight)
            is_public = self._check_public(repo_data)
            self.checks_performed['public'] = is_public
            if is_public:
                self.score += 20

            # Author consistency check (20% weight)
            author_check = self._check_author_consistency()
            self.checks_performed['author_match'] = author_check
            if author_check['passed']:
                self.score += 20
            elif author_check.get('critical', False):
                # Critical failure - username mismatch
                return {
                    'status': 'FAIL',
                    'score': 0,
                    'reason': author_check['reason'],
                    'errors': self.errors,
                    'warnings': self.warnings,
                    'checks_performed': self.checks_performed
                }

            # Commit spread analysis (anti-gaming, 20% weight)
            commit_spread = self._check_commit_spread()
            self.checks_performed['commit_spread'] = commit_spread
            if commit_spread['passed']:
                self.score += 20
            else:
                self.warnings.append(commit_spread.get(
                    'reason', 'Suspicious commit pattern'))

            # Check commit count (15% weight)
            has_commits = self._check_commit_count(repo_data)
            self.checks_performed['min_commits'] = has_commits
            if has_commits:
                self.score += 15

            # Check required files (15% weight)
            has_files = self._check_required_files()
            self.checks_performed['required_files'] = has_files
            if has_files:
                self.score += 15

            # Check keywords (10% weight)
            has_keywords = self._check_keywords()
            self.checks_performed['keywords'] = has_keywords
            if has_keywords:
                self.score += 10

            status = 'PASS' if self.score >= 70 else 'FAIL'

            return {
                'status': status,
                'score': self.score,
                'repo_owner': self.owner,
                'repo_name': self.repo_name,
                'checks_performed': self.checks_performed,
                'errors': self.errors,
                'warnings': self.warnings
            }

        except Exception as e:
            self.errors.append(str(e))
            return {
                'status': 'FAIL',
                'score': 0,
                'reason': 'Validation error',
                'errors': self.errors,
                'checks_performed': self.checks_performed
            }

    def _parse_repo_url(self) -> bool:
        """Extract owner and repo name from URL."""
        # Match https://github.com/owner/repo or https://github.com/owner/repo.git
        match = re.match(
            r'https?://github\.com/([^/]+)/([^/]+?)(?:\.git)?/?$', self.repo_url)
        if not match:
            self.errors.append(f"Invalid GitHub URL: {self.repo_url}")
            return False

        self.owner, self.repo_name = match.groups()
        return True

    def _get_repo_data(self) -> Dict[str, Any]:
        """Fetch repository metadata from GitHub API."""
        url = f"https://api.github.com/repos/{self.owner}/{self.repo_name}"
        headers = {}

        if self.rules.get('github_token'):
            headers['Authorization'] = f"token {self.rules['github_token']}"

        try:
            response = requests.get(url, headers=headers, timeout=5)
            if response.status_code == 404:
                self.errors.append("Repository not found")
                return {}
            if response.status_code == 403:
                self.errors.append("Rate limited or forbidden")
                return {}
            response.raise_for_status()
            return response.json()
        except Exception as e:
            self.errors.append(f"GitHub API error: {str(e)}")
            return {}

    def _check_public(self, repo_data: Dict[str, Any]) -> bool:
        """Verify repository is public."""
        is_public = not repo_data.get('private', False)
        if not is_public:
            self.errors.append("Repository must be public")
        return is_public

    def _check_commit_count(self, repo_data: Dict[str, Any]) -> bool:
        """Check if repo has minimum commits."""
        min_commits = self.rules.get('min_commits', 1)

        # Get commit count
        url = f"https://api.github.com/repos/{self.owner}/{self.repo_name}/commits"
        headers = {}

        if self.rules.get('github_token'):
            headers['Authorization'] = f"token {self.rules['github_token']}"

        try:
            response = requests.get(url, headers=headers, params={
                                    'per_page': 1}, timeout=5)
            response.raise_for_status()

            # Get total count from Link header
            link_header = response.headers.get('Link', '')
            if 'last' in link_header:
                match = re.search(r'page=(\d+)[^0-9]', link_header)
                commit_count = int(match.group(1)) if match else 1
            else:
                commit_count = len(response.json()) if response.json() else 0

            has_commits = commit_count >= min_commits
            if not has_commits:
                self.errors.append(
                    f"Need {min_commits} commits, found {commit_count}")
            return has_commits

        except Exception as e:
            self.errors.append(f"Cannot check commits: {str(e)}")
            return False

    def _check_required_files(self) -> bool:
        """Check if required files exist in repo."""
        required_files = self.rules.get('required_files', [])
        if not required_files:
            return True

        url = f"https://api.github.com/repos/{self.owner}/{self.repo_name}/contents"
        headers = {}

        if self.rules.get('github_token'):
            headers['Authorization'] = f"token {self.rules['github_token']}"

        try:
            response = requests.get(url, headers=headers, timeout=5)
            response.raise_for_status()

            repo_contents = response.json()
            available_files = {
                item['name'] for item in repo_contents if isinstance(repo_contents, list)}

            missing = []
            for required_file in required_files:
                if required_file not in available_files:
                    missing.append(required_file)

            if missing:
                self.errors.append(f"Missing files: {', '.join(missing)}")
                return False
            return True

        except Exception as e:
            self.errors.append(f"Cannot check files: {str(e)}")
            return False

    def _check_keywords(self) -> bool:
        """Check if repo description/README contains keywords."""
        required_keywords = self.rules.get('required_keywords', [])
        if not required_keywords:
            return True

        # Check repo description
        url = f"https://api.github.com/repos/{self.owner}/{self.repo_name}/readme"
        headers = {'Accept': 'application/vnd.github.v3.raw'}

        if self.rules.get('github_token'):
            headers['Authorization'] = f"token {self.rules['github_token']}"

        try:
            response = requests.get(url, headers=headers, timeout=5)
            readme_content = response.text if response.status_code == 200 else ""

            content_to_search = readme_content.lower()

            found_keywords = []
            for keyword in required_keywords:
                if keyword.lower() in content_to_search:
                    found_keywords.append(keyword)

            has_keywords = len(found_keywords) >= len(required_keywords)
            if not has_keywords:
                missing = [
                    k for k in required_keywords if k not in found_keywords]
                self.errors.append(f"Missing keywords: {', '.join(missing)}")
            return has_keywords

        except Exception as e:
            self.errors.append(f"Cannot check keywords: {str(e)}")
            return False

    def _check_fork_status(self, repo_data: Dict[str, Any]) -> Dict[str, Any]:
        """Check if repo is a fork and apply stricter rules."""
        is_fork = repo_data.get('fork', False)
        allow_forks = self.rules.get('allow_forks', False)

        if is_fork and not allow_forks:
            self.errors.append(
                "Forked repositories are not accepted for this task")
            return {
                'passed': False,
                'is_fork': True,
                'reason': 'Forked repos require manual review or are not allowed'
            }

        if is_fork:
            self.warnings.append(
                "Repository is a fork - extra scrutiny applied")

        return {
            'passed': True,
            'is_fork': is_fork
        }

    def _check_repo_age(self, repo_data: Dict[str, Any]) -> Dict[str, Any]:
        """Check repo creation date vs task start time (anti-gaming)."""
        if not self.task_started_at:
            # No task start time provided - skip check
            return {'passed': True, 'reason': 'No task start time to compare'}

        min_hours = self.rules.get('min_repo_age_hours', 24)
        if min_hours <= 0:
            return {'passed': True}

        created_at_str = repo_data.get('created_at')
        if not created_at_str:
            self.errors.append("Cannot determine repository creation date")
            return {'passed': False, 'reason': 'Repository creation date unavailable'}

        try:
            # Parse GitHub ISO 8601 timestamp
            repo_created_at = datetime.fromisoformat(
                created_at_str.replace('Z', '+00:00'))

            # Make task_started_at timezone-aware if it isn't
            if self.task_started_at.tzinfo is None:
                from django.utils import timezone as django_tz
                task_started_aware = django_tz.make_aware(self.task_started_at)
            else:
                task_started_aware = self.task_started_at

            time_diff = (repo_created_at -
                         task_started_aware).total_seconds() / 3600  # hours

            if time_diff > -min_hours:  # Repo created too close to or after task start
                self.errors.append(
                    f"Repository created {abs(time_diff):.1f}h relative to task start. "
                    f"Minimum required: {min_hours}h before task."
                )
                return {
                    'passed': False,
                    'reason': f'Repository appears to be created for this task (age: {abs(time_diff):.1f}h)'
                }

            return {'passed': True, 'repo_age_hours': abs(time_diff)}

        except Exception as e:
            self.errors.append(f"Error checking repo age: {str(e)}")
            return {'passed': False, 'reason': 'Cannot verify repository age'}

    def _check_author_consistency(self) -> Dict[str, Any]:
        """Verify commit authors match authenticated user."""
        if not self.authenticated_username:
            # No username to check against - skip but warn
            self.warnings.append(
                "No authenticated username provided - cannot verify authorship")
            return {'passed': True, 'reason': 'Authorship check skipped'}

        require_match = self.rules.get('require_author_match', True)
        if not require_match:
            return {'passed': True, 'reason': 'Author matching not required'}

        # Fetch commits with author info
        url = f"https://api.github.com/repos/{self.owner}/{self.repo_name}/commits"
        headers = {}
        if self.rules.get('github_token'):
            headers['Authorization'] = f"token {self.rules['github_token']}"

        try:
            response = requests.get(url, headers=headers, params={
                                    'per_page': 100}, timeout=10)
            response.raise_for_status()
            commits = response.json()

            if not commits:
                return {'passed': True, 'reason': 'No commits to check'}

            # Count commits by author
            authors = []
            for commit in commits:
                author_data = commit.get('author', {})
                if author_data:
                    login = author_data.get('login', 'unknown')
                    authors.append(login)

            author_counts = Counter(authors)
            total_commits = len(authors)
            user_commits = author_counts.get(self.authenticated_username, 0)
            user_percentage = (user_commits / total_commits *
                               100) if total_commits > 0 else 0

            # User must have authored at least 70% of commits
            if user_percentage < 70:
                self.errors.append(
                    f"Only {user_percentage:.1f}% of commits authored by {self.authenticated_username}. "
                    f"Required: 70%. Top authors: {dict(author_counts.most_common(3))}"
                )
                return {
                    'passed': False,
                    'critical': True,
                    'reason': f'Authorship mismatch: {user_percentage:.1f}% by authenticated user',
                    'authors': dict(author_counts)
                }

            return {
                'passed': True,
                'user_commit_percentage': user_percentage,
                'authors': dict(author_counts)
            }

        except Exception as e:
            self.errors.append(f"Cannot verify authorship: {str(e)}")
            return {'passed': False, 'reason': 'Authorship verification failed'}

    def _check_commit_spread(self) -> Dict[str, Any]:
        """Check commit time distribution to detect gaming (batch commits)."""
        max_concentration = self.rules.get('max_commit_concentration', 0.7)

        # Fetch commits with timestamps
        url = f"https://api.github.com/repos/{self.owner}/{self.repo_name}/commits"
        headers = {}
        if self.rules.get('github_token'):
            headers['Authorization'] = f"token {self.rules['github_token']}"

        try:
            response = requests.get(url, headers=headers, params={
                                    'per_page': 100}, timeout=10)
            response.raise_for_status()
            commits = response.json()

            if len(commits) < 5:
                # Too few commits to meaningfully analyze spread
                return {'passed': True, 'reason': 'Too few commits to analyze'}

            # Extract commit timestamps
            timestamps = []
            for commit in commits:
                commit_data = commit.get('commit', {})
                author_data = commit_data.get('author', {})
                date_str = author_data.get('date')
                if date_str:
                    timestamps.append(datetime.fromisoformat(
                        date_str.replace('Z', '+00:00')))

            if len(timestamps) < 5:
                return {'passed': True, 'reason': 'Insufficient timestamp data'}

            # Check for suspicious concentration
            timestamps.sort()
            total_commits = len(timestamps)

            # Sliding 1-hour window
            max_in_window = 0
            for i, start_time in enumerate(timestamps):
                window_end = start_time.replace(
                    tzinfo=dt_timezone.utc) + timedelta(hours=1)
                count_in_window = sum(
                    1 for t in timestamps if start_time <= t <= window_end)
                max_in_window = max(max_in_window, count_in_window)

            concentration = max_in_window / total_commits

            if concentration > max_concentration:
                self.warnings.append(
                    f"{concentration*100:.1f}% of commits within 1-hour window. "
                    f"Maximum allowed: {max_concentration*100:.1f}%. Possible batch commit gaming."
                )
                return {
                    'passed': False,
                    'reason': f'Suspicious commit concentration: {concentration*100:.1f}%',
                    'max_in_one_hour': max_in_window,
                    'total_commits': total_commits
                }

            return {
                'passed': True,
                'concentration': concentration,
                'max_in_one_hour': max_in_window
            }

        except Exception as e:
            # Don't fail validation if we can't check spread - just warn
            self.warnings.append(f"Cannot analyze commit spread: {str(e)}")
            return {'passed': True, 'reason': 'Spread check unavailable'}


class QuizValidator:
    """
    Validates quiz answers.
    Grades user answers against answer key.
    Score = (correct / total) * 100
    """

    def __init__(self, user_answers: Dict[str, str], user_id: int, rules: Dict[str, Any]):
        """
        Args:
            user_answers: {'question_1': 'answer_text', 'question_2': 'answer_text', ...}
            user_id: User ID (for logging)
            rules: {
                'answer_key': {'question_1': 'expected_answer', ...},
                'case_sensitive': False,
                'trim_whitespace': True
            }
        """
        self.user_answers = user_answers or {}
        self.user_id = user_id
        self.rules = rules or {}
        self.score = 0
        self.errors = []

    def validate(self) -> Dict[str, Any]:
        """Run validation and return result."""
        try:
            answer_key = self.rules.get('answer_key', {})
            if not answer_key:
                return {
                    'status': 'FAIL',
                    'score': 0,
                    'reason': 'No answer key provided',
                    'errors': ['Cannot grade without answer key'],
                    'details': {}
                }

            # Grade each question
            correct_count = 0
            total_count = len(answer_key)
            details = {}

            for question_id, expected_answer in answer_key.items():
                user_answer = self.user_answers.get(question_id, '').strip()

                case_sensitive = self.rules.get('case_sensitive', False)

                if not case_sensitive:
                    user_answer = user_answer.lower()
                    expected_answer = expected_answer.lower()

                is_correct = user_answer == expected_answer
                if is_correct:
                    correct_count += 1

                details[question_id] = {
                    'correct': is_correct,
                    'user_answer': user_answer,
                    'expected': expected_answer
                }

            # Calculate score
            self.score = (correct_count / total_count *
                          100) if total_count > 0 else 0
            status = 'PASS' if self.score >= 70 else 'FAIL'

            return {
                'status': status,
                'score': round(self.score, 2),
                'correct': correct_count,
                'total': total_count,
                'percentage': round(self.score, 2),
                'details': details,
                'errors': self.errors
            }

        except Exception as e:
            self.errors.append(str(e))
            return {
                'status': 'FAIL',
                'score': 0,
                'reason': 'Validation error',
                'errors': self.errors,
                'details': {}
            }


def run_validation(task, proof_payload: Dict[str, Any], acceptance_rules: Dict[str, Any], user=None, task_started_at: Optional[datetime] = None) -> Dict[str, Any]:
    """
    Dispatch validation based on task validator type.

    Args:
        task: Task model instance
        proof_payload: Proof data submitted by user
        acceptance_rules: Validator-specific rules from task
        user: User instance (for GitHub username extraction)
        task_started_at: When task was created/assigned (for anti-gaming checks)

    Returns:
        Validation result dict with 'status', 'score', and validator-specific data
    """
    validator_type = task.validator_type

    if validator_type == 'AUTO_GITHUB':
        # Extract GitHub username if available
        github_username = None
        if user and hasattr(user, 'github_username'):
            github_username = user.github_username
        elif user and hasattr(user, 'username'):
            # Fallback to regular username if no GitHub-specific field
            github_username = user.username

        validator = GitHubValidator(
            repo_url=proof_payload.get('repo_url', ''),
            user_id=task.user.id,
            rules=acceptance_rules,
            authenticated_username=github_username,
            task_started_at=task_started_at
        )
        return validator.validate()

    elif validator_type == 'AUTO_QUIZ':
        validator = QuizValidator(
            user_answers=proof_payload.get('answers', {}),
            user_id=task.user.id,
            rules=acceptance_rules
        )
        return validator.validate()

    elif validator_type == 'MANUAL':
        # Manual validation - return PENDING status
        return {
            'status': 'PENDING',
            'score': None,
            'reason': 'Awaiting manual review',
            'message': 'A human reviewer will evaluate your submission'
        }

    else:
        # No validation
        return {
            'status': 'PASS',
            'score': 100,
            'reason': 'No validation required'
        }

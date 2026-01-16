"""
Explainability Layer - Clear, actionable feedback for every FAIL.
CRITICAL: Users must understand WHY they failed and WHAT to do next.
"""
from typing import Dict, Any, List, Optional


class FailureExplainer:
    """
    Generates clear, actionable explanations for validation failures.
    ONE SENTENCE RULE: Every failure must be explainable in one clear sentence.
    """

    @staticmethod
    def explain_github_failure(validator_output: Dict[str, Any]) -> Dict[str, Any]:
        """
        Explain GitHub validation failure with exact rules violated.

        Returns:
            {
                'summary': 'One sentence explanation',
                'rules_violated': [...],
                'score_breakdown': {...},
                'next_steps': [...]
            }
        """
        score = validator_output.get('score', 0)
        checks = validator_output.get('checks_performed', {})
        errors = validator_output.get('errors', [])
        warnings = validator_output.get('warnings', [])

        # Identify what went wrong
        violated_rules = []
        score_breakdown = {}
        next_steps = []

        # Fork check
        fork_check = checks.get('fork_check', {})
        if not fork_check.get('passed', True):
            violated_rules.append({
                'rule': 'No Forked Repositories',
                'issue': 'This repository is a fork',
                'requirement': 'Submit original repositories only'
            })
            next_steps.append(
                'Create your own repository from scratch, not by forking')

        # Repo age check
        age_check = checks.get('repo_age', {})
        if not age_check.get('passed', True):
            violated_rules.append({
                'rule': 'Repository Age',
                'issue': age_check.get('reason', 'Repository too new'),
                'requirement': 'Repository must exist before task was assigned'
            })
            next_steps.append(
                'Use an existing repository or wait 24 hours after creation')

        # Author consistency
        author_check = checks.get('author_match', {})
        if not author_check.get('passed', True):
            percentage = author_check.get('user_commit_percentage', 0)
            violated_rules.append({
                'rule': 'Author Consistency',
                'issue': f'Only {percentage:.0f}% of commits by you (need 70%)',
                'requirement': 'You must author at least 70% of commits'
            })
            next_steps.append(
                'Submit a repository where you authored most of the work')
            score_breakdown['author_consistency'] = f'{percentage:.0f}% (need 70%)'
        else:
            score_breakdown['author_consistency'] = '✓ Passed (20 points)'

        # Commit spread
        spread_check = checks.get('commit_spread', {})
        if not spread_check.get('passed', True):
            concentration = spread_check.get('concentration', 1.0) * 100
            violated_rules.append({
                'rule': 'Natural Commit Pattern',
                'issue': f'{concentration:.0f}% of commits in 1-hour window',
                'requirement': 'Commits should be spread over time (max 70% in 1 hour)'
            })
            next_steps.append(
                'Work consistently over time; avoid batch committing all at once')
            score_breakdown['commit_spread'] = f'⚠️ Suspicious: {concentration:.0f}% clustered'
        else:
            score_breakdown['commit_spread'] = '✓ Passed (20 points)'

        # Public repository
        if checks.get('public', False):
            score_breakdown['repository_public'] = '✓ Passed (20 points)'
        else:
            violated_rules.append({
                'rule': 'Public Repository',
                'issue': 'Repository is private or not accessible',
                'requirement': 'Repository must be public'
            })
            next_steps.append('Make your repository public in GitHub settings')
            score_breakdown['repository_public'] = '✗ Failed (0/20 points)'

        # Commit count
        if checks.get('min_commits', False):
            score_breakdown['commit_count'] = '✓ Passed (15 points)'
        else:
            for error in errors:
                if 'commits' in error.lower():
                    violated_rules.append({
                        'rule': 'Minimum Commits',
                        'issue': error,
                        'requirement': 'Meet minimum commit requirement'
                    })
                    next_steps.append(
                        'Add more meaningful commits showing your work')
            score_breakdown['commit_count'] = '✗ Failed (0/15 points)'

        # Required files
        if checks.get('required_files', False):
            score_breakdown['required_files'] = '✓ Passed (15 points)'
        else:
            for error in errors:
                if 'Missing files' in error:
                    violated_rules.append({
                        'rule': 'Required Files',
                        'issue': error,
                        'requirement': 'Include all required files'
                    })
                    next_steps.append(
                        'Add the missing required files to your repository')
            score_breakdown['required_files'] = '✗ Failed (0/15 points)'

        # Keywords
        if checks.get('keywords', False):
            score_breakdown['keywords'] = '✓ Passed (10 points)'
        else:
            score_breakdown['keywords'] = '✗ Failed (0/10 points)'

        # Generate summary
        if score < 70:
            summary = f"Validation failed with {score:.0f}/100 points. "
            if violated_rules:
                summary += f"Key issues: {violated_rules[0]['rule']}"
                if len(violated_rules) > 1:
                    summary += f" and {len(violated_rules) - 1} other(s)"
            else:
                summary += "Score too low - review all requirements"
        else:
            summary = "Validation passed all checks"

        return {
            'summary': summary,
            'rules_violated': violated_rules,
            'score_breakdown': score_breakdown,
            'total_score': f'{score:.0f}/100',
            'next_steps': next_steps or ['Review all requirements and try again'],
            'all_errors': errors,
            'warnings': warnings
        }

    @staticmethod
    def explain_quiz_failure(validator_output: Dict[str, Any]) -> Dict[str, Any]:
        """Explain quiz validation failure."""
        score = validator_output.get('score', 0)
        correct = validator_output.get('correct', 0)
        total = validator_output.get('total', 0)

        summary = f"Quiz score: {score:.0f}% ({correct}/{total} correct). Need 70% to pass."

        next_steps = [
            'Review the incorrect answers',
            'Study the related material again',
            'Try again when ready'
        ]

        return {
            'summary': summary,
            'rules_violated': [{
                'rule': 'Minimum Quiz Score',
                'issue': f'{correct}/{total} questions correct ({score:.0f}%)',
                'requirement': 'Answer at least 70% correctly'
            }],
            'score_breakdown': {
                'correct_answers': f'{correct}/{total}',
                'percentage': f'{score:.0f}%',
                'required': '70%'
            },
            'total_score': f'{score:.0f}/100',
            'next_steps': next_steps
        }

    @staticmethod
    def explain_manual_pending() -> Dict[str, Any]:
        """Explain manual validation pending status."""
        return {
            'summary': 'Your submission is waiting for human review',
            'rules_violated': [],
            'score_breakdown': {
                'status': 'Pending Manual Review',
                'estimated_time': '24-48 hours'
            },
            'total_score': 'Pending',
            'next_steps': [
                'A human reviewer will evaluate your submission',
                'You will receive detailed feedback within 48 hours',
                'Check back regularly for updates'
            ]
        }

    @staticmethod
    def explain_prevalidation_failure(prevalidation_result: Dict[str, Any]) -> Dict[str, Any]:
        """Explain pre-validation rejection."""
        errors = prevalidation_result.get('errors', [])
        reason = prevalidation_result.get(
            'reason', 'Submission did not meet basic requirements')

        violated_rules = [{
            'rule': 'Basic Submission Requirements',
            'issue': error,
            'requirement': 'Fix the issue before resubmitting'
        } for error in errors]

        return {
            'summary': f"Submission rejected: {reason}",
            'rules_violated': violated_rules,
            'score_breakdown': {
                'status': 'Pre-validation Failed',
                'issues': len(errors)
            },
            'total_score': 'N/A',
            'next_steps': [
                'Fix the issues listed above',
                'Ensure your submission meets basic requirements',
                'Submit again when ready'
            ],
            'all_errors': errors
        }

    @staticmethod
    def explain_eligibility_block(eligibility_data: Dict[str, Any]) -> Dict[str, Any]:
        """Explain why user is blocked from output generation."""
        core_status = eligibility_data.get('core_status', {})
        support_status = eligibility_data.get('support_status', {})

        issues = []
        next_steps = []

        # Core tasks incomplete
        if not core_status.get('all_passed', False):
            remaining = core_status.get('remaining', [])
            issues.append(f"{len(remaining)} core task(s) incomplete")
            next_steps.append(
                'Complete all core tasks (required for eligibility)')
            for task in remaining[:3]:  # Show first 3
                next_steps.append(f"  → {task.get('title', 'Untitled task')}")

        # Support tasks below threshold
        if not support_status.get('passed', True):
            score = support_status.get('weighted_score', 0)
            issues.append(f"Support task score: {score:.1f}% (need 70%)")
            next_steps.append('Improve your support task scores to reach 70%')

        summary = "Not eligible for output generation. " + "; ".join(issues)

        return {
            'summary': summary,
            'rules_violated': [{
                'rule': 'Output Eligibility Requirements',
                'issue': issue,
                'requirement': 'Meet all eligibility criteria'
            } for issue in issues],
            'score_breakdown': {
                'core_tasks': f"{core_status.get('completed', 0)}/{core_status.get('total', 0)} completed",
                'support_score': f"{support_status.get('weighted_score', 0):.1f}%"
            },
            'total_score': 'Not Eligible',
            'next_steps': next_steps
        }


def generate_clear_feedback(validation_status: str, validator_output: Dict[str, Any],
                            proof_type: Optional[str] = None, prevalidation_result: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Master function to generate clear feedback for any validation result.

    Args:
        validation_status: 'PASS', 'FAIL', or 'PENDING'
        validator_output: Validator output dict
        proof_type: Type of proof submitted
        prevalidation_result: Pre-validation result if applicable

    Returns:
        Clear, actionable explanation
    """
    if prevalidation_result and prevalidation_result.get('status') == 'rejected':
        return FailureExplainer.explain_prevalidation_failure(prevalidation_result)

    if validation_status == 'PENDING':
        return FailureExplainer.explain_manual_pending()

    if validation_status == 'PASS':
        return {
            'summary': 'Validation passed! Task completed successfully.',
            'rules_violated': [],
            'score_breakdown': {'status': '✅ PASSED'},
            'total_score': f"{validator_output.get('score', 100):.0f}/100",
            'next_steps': ['Continue to your next task']
        }

    # FAIL status
    if proof_type == 'GITHUB_REPO':
        return FailureExplainer.explain_github_failure(validator_output)
    elif proof_type == 'QUIZ':
        return FailureExplainer.explain_quiz_failure(validator_output)
    else:
        # Generic failure explanation
        return {
            'summary': f"Validation failed with score {validator_output.get('score', 0):.0f}/100",
            'rules_violated': [{
                'rule': 'Validation Requirements',
                'issue': validator_output.get('reason', 'Requirements not met'),
                'requirement': 'Review task requirements and try again'
            }],
            'score_breakdown': validator_output,
            'total_score': f"{validator_output.get('score', 0):.0f}/100",
            'next_steps': ['Review the detailed feedback above', 'Fix the issues and try again']
        }

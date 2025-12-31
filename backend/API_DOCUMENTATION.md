# Backend API Documentation - Career Execution Platform

## Base URL
```
/api/
```

## Authentication
All endpoints (except public ones) require JWT authentication:
```
Authorization: Bearer <access_token>
```

---

## Plans API

### GET /api/plans/
List all active subscription plans.

**Response:**
```json
[
  {
    "id": 1,
    "name": "explorer",
    "display_name": "Explorer",
    "price_inr": "49.00",
    "validity_days": 14,
    "roadmap_limit": 1,
    "is_short_roadmap": true,
    "project_limit_min": 1,
    "project_limit_max": 1,
    "resume_limit": 1,
    "ats_scan_limit": 1,
    "portfolio_analytics": false,
    "custom_subdomain": false
  }
]
```

### GET /api/plans/compare/
Get plans with feature comparison format.

---

## Subscriptions API

### GET /api/subscriptions/current/
Get current active subscription.

**Response:**
```json
{
  "id": 1,
  "plan": 2,
  "plan_details": { ... },
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-01-31T00:00:00Z",
  "grace_end_date": "2024-02-14T00:00:00Z",
  "status": "active",
  "days_remaining": 25,
  "is_active": true,
  "is_in_grace": false,
  "roadmaps_used": 0,
  "projects_used": 1,
  "resumes_used": 0,
  "ats_scans_used": 0
}
```

### GET /api/subscriptions/usage/
Get detailed usage information.

**Response:**
```json
{
  "plan_name": "Starter Builder",
  "status": "active",
  "days_remaining": 25,
  "roadmaps_used": 0,
  "roadmap_limit": 1,
  "can_create_roadmap": true,
  "projects_used": 1,
  "project_limit": 3,
  "can_create_project": true,
  "resumes_used": 0,
  "resume_limit": 2,
  "can_create_resume": true,
  "ats_scans_used": 0,
  "ats_scan_limit": 3,
  "can_run_ats_scan": true
}
```

### POST /api/subscriptions/activate/
Activate a new subscription after payment.

**Request:**
```json
{
  "plan_id": 2,
  "payment_id": "pay_xxx"
}
```

### POST /api/subscriptions/renew/
Renew an expired subscription.

### POST /api/subscriptions/{id}/cancel/
Cancel a subscription.

### GET /api/subscriptions/check_expiry/
Check and update subscription expiry status.

---

## Portfolio API

### GET /api/portfolio/my_portfolio/
Get or create user's portfolio.

**Response:**
```json
{
  "id": 1,
  "slug": "username",
  "custom_subdomain": null,
  "status": "active",
  "title": "My Portfolio",
  "bio": "",
  "headline": "Software Developer",
  "github_url": "",
  "linkedin_url": "",
  "public_url": "https://planorah.me/p/username",
  "is_publicly_viewable": true,
  "is_fully_accessible": true,
  "portfolio_projects": []
}
```

### PATCH /api/portfolio/update_settings/
Update portfolio settings.

**Request:**
```json
{
  "title": "My Developer Portfolio",
  "bio": "Full-stack developer...",
  "headline": "Software Developer",
  "github_url": "https://github.com/username",
  "show_email": false,
  "theme": "dark"
}
```

### POST /api/portfolio/set_subdomain/
Set custom subdomain (Placement Pro only).

**Request:**
```json
{
  "subdomain": "myname"
}
```

### POST /api/portfolio/add_project/
Add project to portfolio.

**Request:**
```json
{
  "project_id": 1
}
```

### POST /api/portfolio/remove_project/
Remove project from portfolio.

### GET /api/portfolio/analytics/
Get portfolio analytics (Career Ready+).

**Response:**
```json
{
  "daily": [
    {
      "date": "2024-01-01",
      "page_views": 50,
      "unique_visitors": 30,
      "project_clicks": 10,
      "github_clicks": 5,
      "resume_downloads": 2
    }
  ],
  "totals": {
    "total_page_views": 500,
    "total_unique_visitors": 300,
    "total_project_clicks": 100,
    "total_github_clicks": 50,
    "total_resume_downloads": 20
  }
}
```

### GET /api/portfolio/public/{slug}/ (Public)
Get public portfolio view.

---

## GitHub Integration API

### GET /api/github/status/
Check GitHub connection status.

**Response:**
```json
{
  "connected": true,
  "github_username": "username",
  "github_avatar_url": "https://...",
  "is_connected": true
}
```

### POST /api/github/connect/
Connect GitHub account via OAuth.

**Request:**
```json
{
  "code": "oauth_code",
  "redirect_uri": "https://..."
}
```

### POST /api/github/disconnect/
Disconnect GitHub account.

### POST /api/github/publish/
Publish project to GitHub.

**Request:**
```json
{
  "project_id": 1,
  "repo_name": "my-project",
  "is_private": false,
  "commit_message": "Initial commit"
}
```

**Response:**
```json
{
  "message": "Project published to GitHub",
  "repo_url": "https://github.com/username/my-project",
  "clone_url": "https://github.com/username/my-project.git"
}
```

### GET /api/github/repositories/
List all published repositories.

### GET /api/github/logs/
Get publish logs.

---

## Billing API

### POST /api/billing/payments/create_order/
Create a payment order.

**Request:**
```json
{
  "plan_id": 2,
  "coupon_code": "SAVE10"
}
```

**Response:**
```json
{
  "order_id": "PLN-20240101120000-1",
  "amount": 89.00,
  "currency": "INR",
  "plan_name": "Starter Builder",
  "payment_id": 1
}
```

### POST /api/billing/payments/verify/
Verify payment and activate subscription.

**Request:**
```json
{
  "order_id": "PLN-xxx",
  "payment_id": "pay_xxx",
  "signature": "signature"
}
```

### GET /api/billing/payments/history/
Get payment history.

### GET /api/billing/invoices/
List all invoices.

### GET /api/billing/invoices/{id}/
Get invoice details.

### POST /api/billing/coupons/validate/
Validate and apply coupon.

**Request:**
```json
{
  "code": "SAVE10",
  "plan_id": 2
}
```

**Response:**
```json
{
  "valid": true,
  "coupon_code": "SAVE10",
  "discount_type": "percentage",
  "discount_value": 10.00,
  "original_price": 99.00,
  "discounted_price": 89.10,
  "discount_amount": 9.90
}
```

---

## Analytics API

### GET /api/analytics/dashboard/
Get dashboard statistics.

**Response:**
```json
{
  "subscription_status": "active",
  "plan_name": "Starter Builder",
  "days_remaining": 25,
  "roadmaps_used": 0,
  "roadmaps_limit": 1,
  "projects_used": 1,
  "projects_limit": 3,
  "resumes_used": 0,
  "resumes_limit": 2,
  "ats_scans_used": 0,
  "ats_scans_limit": 3,
  "current_streak": 5,
  "tasks_completed_today": 3,
  "overall_completion": 45.5
}
```

### GET /api/analytics/progress/
Get overall user progress.

### GET /api/analytics/roadmaps/
Get progress for all roadmaps.

### GET /api/analytics/activity_chart/?days=30
Get activity chart data.

### GET /api/analytics/usage_logs/?limit=50
Get usage logs.

### POST /api/analytics/log_activity/
Log user activity.

**Request:**
```json
{
  "action": "task_complete",
  "resource_type": "task",
  "resource_id": 1
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You need an active subscription to access this feature."
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

---

## Subscription Enforcement

The following permissions are enforced:

| Permission | Description |
|------------|-------------|
| `HasActiveSubscription` | Requires active subscription |
| `HasActiveOrGraceSubscription` | Allows grace period access |
| `CanCreateRoadmap` | Checks roadmap limit |
| `CanCreateProject` | Checks project limit |
| `CanCreateResume` | Checks resume limit |
| `CanRunATSScan` | Checks ATS scan limit/rate |
| `CanAccessPortfolioAnalytics` | Requires Career Ready+ |
| `CanUseCustomSubdomain` | Requires Placement Pro |

---

## Management Commands

### Initialize Plans
```bash
python manage.py init_plans
```

### Check Subscription Expiry
```bash
python manage.py check_expiry
```

This should be run daily via cron to update subscription statuses and portfolio visibility.

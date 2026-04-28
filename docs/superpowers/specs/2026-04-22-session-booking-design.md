# Session Booking System — Design Spec
**Date:** 2026-04-22  
**Status:** Approved

---

## Overview

A request-based 1:1 session booking system that allows subscribed Planorah users to request mentor sessions within their plan's monthly quota. The client submits a request with an optional topic and description; the admin team confirms within 12 hours with a scheduled time and meeting link. No real-time slot picker — fully async, managed by the Planorah team.

---

## Scope

- New `sessions` Django app with `SessionRequest` model
- Subscription-gated request flow (Free plan blocked, paid tiers limited by `sessions_per_month`)
- Django admin customization for managing requests
- Admin confirmation triggers in-app notification + Gmail email to user
- React frontend: request modal, sessions list, remaining quota display

---

## Data Model

New app: `backend/sessions/`

### `SessionRequest`

| Field | Type | Notes |
|---|---|---|
| `user` | FK → `CustomUser` | The subscriber making the request |
| `topic_tags` | MultiSelectField / JSONField | Choices: `roadmap`, `portfolio`, `career`, `resume`, `problem`, `other` — optional, multi-select |
| `description` | TextField (blank=True) | Free-text context — optional |
| `status` | CharField | `requested` → `confirmed` → `completed` → `cancelled` |
| `created_at` | DateTimeField | auto_now_add=True |
| `confirmed_at` | DateTimeField (null=True) | Set when admin confirms |
| `scheduled_at` | DateTimeField (null=True) | Actual meeting time, set by admin |
| `meeting_link` | URLField (blank=True) | Google Meet / Zoom link, set by admin |
| `admin_notes` | TextField (blank=True) | Internal only, never exposed to user |
| `month_year` | CharField(7) | Format `"YYYY-MM"`, auto-set on create for monthly quota tracking |

**Status choices:**
- `requested` — initial state after user submits
- `confirmed` — admin has set scheduled_at + meeting_link
- `completed` — session has taken place
- `cancelled` — cancelled by admin or user

---

## Subscription Gate Logic

On every `POST /api/sessions/request/`:

1. Verify user has an active (or grace) subscription
2. Check `plan.sessions_per_month > 0` — Free plan = 0, reject with 403
3. Count `SessionRequest` for this user where `month_year = current_month` and `status != cancelled`
4. If count >= `sessions_per_month` → 403: "You've used all your sessions for this month. Upgrade to get more."
5. If within limit → create `SessionRequest` with `status=requested`, `month_year=YYYY-MM`

---

## API Endpoints

Base prefix: `/api/sessions/`  
Auth: JWT required on all endpoints.

| Method | URL | Description |
|---|---|---|
| `POST` | `/api/sessions/request/` | Submit a new session request |
| `GET` | `/api/sessions/` | List all user's session requests (ordered by created_at desc) |
| `GET` | `/api/sessions/remaining/` | Returns `{ used: int, limit: int, remaining: int, month: "YYYY-MM" }` |

**POST `/api/sessions/request/` request body:**
```json
{
  "topic_tags": ["roadmap", "portfolio"],
  "description": "I'm stuck on my milestone 3 tasks and need direction."
}
```
Both fields are optional.

**GET `/api/sessions/` response:**
```json
[
  {
    "id": 1,
    "topic_tags": ["roadmap"],
    "description": "Need help with milestone planning.",
    "status": "confirmed",
    "created_at": "2026-04-22T10:30:00Z",
    "scheduled_at": "2026-04-23T15:00:00Z",
    "meeting_link": "https://meet.google.com/abc-xyz",
    "confirmed_at": "2026-04-22T18:00:00Z"
  }
]
```
`admin_notes` is never included in user-facing responses.

---

## Admin Panel (Django Admin)

`SessionRequest` registered in `sessions/admin.py`:

- **List display:** `user`, `topic_tags`, `status`, `created_at`, `scheduled_at`, `meeting_link`
- **List filters:** `status`, `month_year`
- **Search:** by user email / username
- **Readonly fields:** `user`, `created_at`, `month_year`
- **Editable fields:** `status`, `scheduled_at`, `meeting_link`, `admin_notes`

**Confirmation trigger (post_save signal):**  
When `status` changes to `confirmed`:
1. Create an in-app `Notification` record for the user
2. Send Gmail email to user's registered email with scheduled time + meeting link
3. Set `confirmed_at = now()`

Notification message: _"Your 1:1 session has been confirmed for [date/time]. Join here: [meeting_link]"_  
Email subject: _"Your Planorah session is confirmed!"_

---

## Frontend

### Components

**1. `RequestSessionButton` (dashboard / mentor section)**
- Visible to all users
- Disabled with tooltip if: Free plan OR sessions remaining = 0
- On click → opens `RequestSessionModal`

**2. `RequestSessionModal`**
- Topic tag chips: Roadmap, Portfolio, Career, Resume, Problem, Other (multi-select, optional)
- Free-text description textarea (optional, placeholder: "Describe what you'd like to discuss...")
- Submit → POST `/api/sessions/request/` → success toast → modal closes → sessions list refreshes

**3. `SessionsSection` (dashboard or `/sessions` page)**
- Header: "Sessions — 3 of 5 remaining this month"
- List of `SessionRequest` cards, ordered newest first
- Status badges: Requested (yellow), Confirmed (green), Completed (grey), Cancelled (red)
- Confirmed cards show scheduled time + prominent "Join Session" link

**4. In-App Notification**
- Added to existing notification system on confirmation
- Text: "Your session is confirmed! [date/time] — Join here"
- Clicking navigates to the sessions section

### State Management

New Zustand store: `useSessionsStore`

```
{
  sessions: SessionRequest[],
  remaining: { used, limit, remaining, month },
  isLoading: boolean,
  fetchSessions(),
  fetchRemaining(),
  submitRequest(topic_tags, description),
}
```

---

## Error States

| Scenario | Response |
|---|---|
| Free plan user tries to request | Button disabled + tooltip "Upgrade to access 1:1 sessions" |
| Monthly quota exhausted | 403 from API, toast: "You've used all sessions this month" |
| No active subscription | 403, redirect to subscription page |
| Admin cancels | Status updated, in-app notification + email sent to user |

---

## Out of Scope (this version)

- Real-time availability calendar / slot picker
- Mentor selection or assignment UI
- In-app messaging thread per session
- Preferred time windows
- Session recording or notes sharing


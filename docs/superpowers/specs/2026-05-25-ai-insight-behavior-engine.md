# AI Insight Behavioral Engine — Specification

**Date:** 2026-05-25  
**Status:** Implemented (Phase 1)  
**Components:** `backend/dashboard/views.py`, `frontend/src/components/Dashboard/ExecutionDashboard.jsx`

## Overview

The AI Insight system was upgraded from a static dashboard card into the first phase of a behavioral intelligence engine.

The goal is no longer just to show motivational copy. The system now tries to answer:

`Why is this user succeeding or failing right now?`

This turns Planorah from a dashboard with analytics into the beginning of a behavior-aware operating system for students.

## What Was Created

### 1. Behavioral Intelligence Layer in the Backend

Added a new behavioral-analysis layer inside `dashboard/onboarding-insights/`.

This layer now derives:

- behavioral inputs
- behavioral metrics
- behavior loops
- prediction output
- strategy output
- roadmap adaptation output
- future-self style direction output
- identity type output

### 2. Dynamic AI Insight Card in the Execution Dashboard

The right-column `AI Insight` card in the execution dashboard now consumes live behavioral-engine output instead of showing a fixed `coach.reason` string.

The card now displays:

- insight type
- insight confidence
- insight title and description
- momentum, burnout, and drop-off metrics
- prediction block
- strategy block
- roadmap adaptation block
- dynamic CTA label

### 3. Documentation of the New Engine Contract

The backend response contract now includes new structured fields so the system can evolve without turning the card into a hardcoded UI.

## What Changed

### Backend Changes

File: `backend/dashboard/views.py`

The existing onboarding-insights endpoint was expanded rather than replaced.

New behavior added:

- Reads real execution behavior from `ExecutionTask`, `FocusSession`, `UserStats`, `UserProfile`, and `Roadmap`.
- Extracts emotional onboarding signals from stored onboarding fields such as:
  - `pressure_response`
  - `mock_test_response`
  - `dream_vs_effort`
  - `daily_time`
- Builds a behavioral context object before AI or fallback generation.
- Computes rule-based behavioral metrics from current data.
- Passes a richer analysis snapshot to Gemini when available.
- Falls back to rule-based intelligence if Gemini is unavailable.
- Preserves existing onboarding widget compatibility by keeping older fields like:
  - `summary`
  - `today_action`
  - `action_points`
  - `strengths`
  - `risks`
  - `week_plan`

### Frontend Changes

File: `frontend/src/components/Dashboard/ExecutionDashboard.jsx`

The execution dashboard now:

- fetches `dashboard/onboarding-insights/` during dashboard bootstrap
- stores the behavioral payload in local component state
- renders a dynamic AI Insight card using that payload
- changes CTA behavior depending on insight type

CTA behavior now works like this:

- if the system surfaces a roadmap-risk state, the button routes the user to roadmap review
- otherwise, the button opens the AI coach / voice panel

## Technical Changes

### Backend Implementation Details

File changed:

- `backend/dashboard/views.py`

Technical additions made inside this file:

- Added `_clamp_score()` to normalize computed metrics into a bounded `0-100` range.
- Added `_safe_percentage()` to avoid division errors while computing behavior-derived percentages.
- Added `_label_from_map()` to translate stored onboarding enum values into readable behavioral labels.
- Added `_extract_emotional_onboarding_answers()` to convert onboarding fields into emotional and psychological signals.
- Added `_resolve_active_hours()` to infer the user's strongest time window from recent focus-session timestamps.
- Added `_build_behavioral_context()` as the main aggregation function for behavioral inputs, metrics, and loops.
- Expanded `_build_rule_based_guidance()` so fallback output is no longer generic onboarding guidance only; it now emits the same high-level intelligence structure as the AI path.
- Expanded `_call_gemini_for_onboarding()` prompt contract so Gemini now receives behavioral context in addition to onboarding profile data.
- Expanded the Gemini parsing layer so the backend can safely parse and return:
  - `identity_type`
  - `insight_card`
  - `prediction`
  - `strategy`
  - `roadmap_adaptation`
  - `future_self`
  - `behavioral_loops`
- Updated `get_onboarding_insights()` so it now:
  - builds `behavioral_context`
  - merges it into the analysis snapshot passed to AI
  - initializes new structured response fields
  - returns fallback intelligence when Gemini is unavailable

### Backend Data Sources Used

The new backend logic reads from these existing models:

- `users.UserProfile`
- `dashboard.UserStats`
- `dashboard.ExecutionTask`
- `dashboard.FocusSession`
- `roadmap_ai.Roadmap`

Technical notes on how they are used:

- `UserProfile`
  - onboarding profile snapshot
  - `education_stage`
  - `weekly_hours`
  - `goal_statement`
  - `goal_type`
  - `target_role`
  - `field_of_study`
  - `readiness_score`
  - `consistency_score`
  - raw `onboarding_data`
- `ExecutionTask`
  - recent completed task count
  - recent skipped task count
  - long-task skip patterns
  - hard-task avoidance patterns
- `FocusSession`
  - average session duration
  - recent activity days
  - preferred active hours
- `UserStats`
  - streak fallback
  - task completion totals
- `Roadmap`
  - latest roadmap category
  - latest roadmap difficulty

### Backend Metrics Logic

The following values are computed in code, not stored directly:

- `momentum_score`
  - derived from streak, completion rate, active days, consistency score, and skip penalties
- `burnout_risk`
  - derived from stress signals, long sessions, falling consistency, high weekly load, and skip-heavy behavior
- `dropoff_risk`
  - derived from low streak, skipped work, falling consistency, weak active-day count, and weak recent completion
- `recovery_speed`
  - derived from recent-vs-previous completion and active-day trend
- `procrastination_index`
  - derived from long-task skip behavior and hard-task skip behavior

### Backend Response Contract

The endpoint `GET /dashboard/onboarding-insights/` now returns the older onboarding widget fields plus new structured behavioral-engine fields.

New response fields added:

```json
{
  "behavioral_inputs": {
    "streaks": 0,
    "completed_tasks": 0,
    "skipped_tasks": 0,
    "roadmap_type": "Career",
    "roadmap_difficulty": "Intermediate",
    "active_hours": "Night",
    "consistency_trend": "rising",
    "emotional_onboarding_answers": [],
    "session_duration": 25,
    "user_goals": "Become interview ready"
  },
  "behavioral_metrics": {
    "momentum_score": 72,
    "burnout_risk": 34,
    "dropoff_risk": 41,
    "recovery_speed": 68,
    "procrastination_index": 29,
    "completion_rate": 63,
    "consistency_score": 58
  },
  "behavioral_loops": [],
  "identity_type": "Consistency Architect",
  "insight_card": {
    "type": "Momentum Insight",
    "title": "You are in a high-consistency window",
    "description": "Execution is stabilizing right now.",
    "action_label": "Lock Momentum",
    "confidence": 78
  },
  "prediction": {
    "title": "Momentum can compound",
    "description": "If this rhythm holds, readiness should rise.",
    "confidence": 72
  },
  "strategy": {
    "headline": "Design your week around behavioral fit",
    "tactics": []
  },
  "roadmap_adaptation": {
    "status": "light_adjustment",
    "reason": "Momentum is strong enough for tighter structure.",
    "changes": []
  },
  "future_self": {
    "current_path": "Progress stays inconsistent.",
    "optimized_path": "Adaptive pacing improves execution speed."
  }
}
```

### AI / Fallback Technical Contract

There are now two generation modes behind the same endpoint:

- AI mode
  - Gemini receives a richer snapshot combining onboarding profile and behavioral context.
  - Gemini is expected to return strict JSON for both legacy and new fields.
- Rule-based mode
  - Uses deterministic logic in `_build_rule_based_guidance()`.
  - Preserves the same top-level response shape as much as possible.

This means the frontend does not need separate rendering logic for AI and fallback states.

### Frontend Implementation Details

File changed:

- `frontend/src/components/Dashboard/ExecutionDashboard.jsx`

Technical changes made in this file:

- Added `useNavigate` import for conditional CTA routing.
- Added `behavioralInsight` state via `useState(null)`.
- Expanded the initial dashboard `Promise.all(...)` bootstrap call to include:

```javascript
api.get('dashboard/onboarding-insights/')
```

- Stores the response payload in `behavioralInsight`.
- Derives UI-ready objects from that payload:
  - `insightCard`
  - `behavioralMetrics`
  - `prediction`
  - `strategy`
  - `roadmapAdaptation`
- Added `handleInsightAction()` for CTA routing logic.

### Frontend Rendering Changes

The old AI card rendered only:

- heading
- one reason string from `coach?.reason`
- one fixed `Get Strategy` button

The new card renders:

- dynamic insight type badge
- confidence badge
- insight title
- insight description
- three metric cells
  - momentum
  - burnout
  - drop-off
- prediction panel
- strategy panel
- roadmap adaptation panel
- dynamic CTA label

### Frontend CTA Logic

The CTA now behaves like this in code:

- if `insightCard.type === 'Roadmap Insight'`
  - route to `/roadmap/list`
- if `roadmapAdaptation.status === 'recommended'`
  - route to `/roadmap/list`
- otherwise
  - open the voice coach panel

### What Was Not Changed Technically

Important technical non-changes in this phase:

- No new database tables were added.
- No existing model schema was changed.
- No migration files were created.
- No new backend endpoint was added.
- No existing onboarding widget contract was removed.
- No automatic roadmap write-back was implemented yet.

This phase is intentionally implemented as an inference layer on top of current storage.

### Validation and Safety

Technical validation completed after implementation:

- Django project check passed:

```bash
cd /Users/abhinavgoyal9729/Planorah/backend && source venv/bin/activate && python3 manage.py check
```

- File-level error checks passed for:
  - `backend/dashboard/views.py`
  - `frontend/src/components/Dashboard/ExecutionDashboard.jsx`
  - this documentation file

### Technical Debt / Follow-Up Work

From an implementation perspective, the biggest remaining technical gaps are:

- move computed metrics into persistent behavioral tables
- store generated insights historically for comparison over time
- add scheduled daily summarization instead of only on-demand inference
- connect roadmap adaptation output to real task / roadmap mutation logic
- build dedicated APIs for future-self simulation and identity evolution

## What Data The Engine Uses Right Now

### Behavioral Inputs

Current inputs already wired into the engine:

- streaks
- completed tasks
- skipped tasks
- roadmap type
- roadmap difficulty
- active hours
- consistency trend
- emotional onboarding answers
- session duration
- user goals

### Data Sources

These values are pulled from existing models:

- `UserProfile`
- `UserStats`
- `ExecutionTask`
- `FocusSession`
- `Roadmap`

## What The Engine Produces Right Now

### Structured Outputs

The backend now returns these new fields:

- `behavioral_inputs`
- `behavioral_metrics`
- `behavioral_loops`
- `identity_type`
- `insight_card`
- `prediction`
- `strategy`
- `roadmap_adaptation`
- `future_self`

### Behavioral Metrics

The current phase computes:

- `momentum_score`
- `burnout_risk`
- `dropoff_risk`
- `recovery_speed`
- `procrastination_index`
- `completion_rate`
- `consistency_score`

### Insight Types

The system can currently emit card types such as:

- Behavioral Insight
- Prediction Insight
- Momentum Insight
- Roadmap Insight
- Identity Insight

## What Is Working Right Now

### Working End-to-End

The following is implemented and working:

1. The backend endpoint builds a behavioral context from real stored user data.
2. The backend generates a behavioral response even if Gemini fails.
3. The execution dashboard loads that response during bootstrap.
4. The AI Insight card renders live behavioral intelligence instead of static copy.
5. The card shows metrics for momentum, burnout, and drop-off.
6. The card shows a prediction block.
7. The card shows a strategy block.
8. The card shows a roadmap adaptation block.
9. The CTA changes based on the insight state.

### Validation Completed

The backend passed:

```bash
cd /Users/abhinavgoyal9729/Planorah/backend && source venv/bin/activate && python3 manage.py check
```

No system-check issues were reported.

Frontend and backend file-level error checks for the touched files also returned clean.

## How It Works

## Flow

### Step 1. Dashboard Loads

When the execution dashboard mounts, it fetches:

- profile
- statistics
- activity chart
- roadmaps
- subjects
- onboarding insights

### Step 2. Backend Builds Behavioral Context

The endpoint:

- reads recent execution tasks
- reads recent focus sessions
- reads streak / stats data
- reads roadmap metadata
- reads onboarding answers

Then it derives:

- preferred active time window
- completion vs skip patterns
- long-task friction
- hard-task avoidance
- trend direction
- emotional pressure signals

### Step 3. Backend Produces Intelligence

The engine then creates:

- a primary insight card
- a prediction
- a behavior-based strategy
- a roadmap adaptation suggestion
- a user identity label
- future-path language

If Gemini is available, the model receives both onboarding and behavioral context.

If Gemini is unavailable, a rule-based system still returns a full structured payload.

### Step 4. Frontend Renders the Card

The dashboard card renders:

- insight type and confidence
- insight title and explanation
- behavioral metrics
- prediction summary
- strategy guidance
- roadmap adaptation guidance
- contextual CTA

## Current Decision Logic

The rule-based engine currently prioritizes outcomes like this:

1. If burnout risk is high, show a burnout-focused prediction insight.
2. If drop-off risk is high, show a roadmap-risk insight.
3. If momentum is high, show a momentum insight.
4. Otherwise, show a friction-reduction behavioral insight.

This gives the card a daily-behavior feel rather than a fixed widget feel.

## What Was Not Built Yet

This is important.

Phase 1 does **not** yet include:

- a dedicated behavioral metrics database table
- persistent AI insight history storage
- automatic roadmap mutation in the database
- true future-self simulation timelines
- a full identity-engine progression history
- user activity tables specifically designed for long-term behavioral modeling

Right now, the system is an inference layer built on top of existing models.

That means it is already useful, but it is not yet the final behavioral operating system architecture.

## Why This Matters

Before this change, the AI Insight experience was essentially:

- one static coach reason
- one generic CTA

After this change, the system is now designed around:

- behavior detection
- risk recognition
- execution psychology
- adaptive strategic guidance

That is the foundation for the larger product idea:

`Planorah learns how a student actually works, then redesigns success around that behavior.`

## Recommended Next Phases

### Phase 2

Add persistence tables for:

- daily activity snapshots
- behavioral metrics
- generated insights

### Phase 3

Implement real adaptation workflows:

- shorten milestones automatically
- reduce overload automatically
- insert recovery windows automatically
- rebalance roadmap pace automatically

### Phase 4

Build the future-self simulation layer:

- current behavior path
- optimized path
- burnout path
- projected readiness timeline

---

**Implementation summary:** Phase 1 behavioral engine is live.  
**UI summary:** AI Insight card is now behavior-driven.  
**Architecture summary:** Existing onboarding insights endpoint is now the first core intelligence system for Planorah.
# Pricing Page Redesign — Design Spec

**Date:** 2026-04-30  
**Status:** Approved

---

## Goal

Redesign the Plans & Pricing page to look professional and polished — frosted glass card aesthetic, monthly/yearly billing toggle, and custom yearly prices stored as separate plan entries in the database.

---

## Visual Design

**Card style:** Frosted glassmorphism  
- `background: rgba(255,255,255,0.03)`  
- `backdrop-filter: blur(16px)`  
- `border: 1px solid rgba(255,255,255,0.08)`  
- `box-shadow: 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`  
- Hover: subtle `translateY(-2px)` lift

**Popular card (Pro):** Slightly brighter glass (`rgba(255,255,255,0.05)`), stronger border, "MOST POPULAR" pill badge pinned to top center.

**CTA buttons:**
- Popular (Pro): white fill, dark text (`primary`)
- All others: semi-transparent glass button (`secondary`)
- Current plan: ghost/disabled style

**Color palette:** Near-black background (`#050505`), white text, zinc grays for secondary text, `#22c55e` for checkmarks and the "1 month free" badge.

---

## Page Layout

```
[Header: "Plans & Pricing" + subtitle]
[Current plan banner — shows active plan + "View Details" button]
[Monthly | Yearly toggle pill + "1 month free" green badge]
[4-column card grid: Free · Starter · Pro · Elite]
[All Plans Include — 3-column feature grid]
[Footer note about portfolio expiry]
```

---

## Monthly / Yearly Toggle

- Default: Monthly
- Yearly selected: cards show monthly-equivalent price with "billed annually" subtext
- "1 month free" green pill badge appears next to the toggle
- Free plan is unaffected by the toggle (always ₹0 / forever)

---

## Pricing Table

| Plan | Monthly | Yearly display (per mo) | Annual total |
|------|---------|------------------------|--------------|
| Free | ₹0 | ₹0 | — |
| Starter | ₹99/mo | ₹91/mo | ₹1,089/yr (11 × ₹99) |
| Pro | ₹249/mo | ₹200/mo | ₹2,400/yr (custom) |
| Elite | ₹499/mo | ₹429/mo | ₹5,148/yr (custom) |

---

## Architecture — Approach B: Separate Yearly Plan Entries

Three new plan rows are added to the database:

| id | name | display_name | price_inr | validity_days | billing_period |
|----|------|--------------|-----------|---------------|----------------|
| (new) | starter_yearly | Starter | 1089 | 365 | yearly |
| (new) | pro_yearly | Pro | 2400 | 365 | yearly |
| (new) | elite_yearly | Elite | 5148 | 365 | yearly |

> The frontend identifies yearly plans by `plan.name.endsWith('_yearly')`. No schema migration needed for a `billing_period` column.

The toggle on the frontend maps:
- Monthly → original plan IDs (`free`, `starter`, `pro`, `elite`)
- Yearly → new plan IDs (`starter_yearly`, `pro_yearly`, `elite_yearly`)

The existing checkout flow, subscription service, and plan cards all work without changes — they just receive a different plan ID.

---

## Component Changes

### `PricingPage.jsx`

1. Add `billingPeriod` state: `'monthly' | 'yearly'`
2. Toggle pill UI + "1 month free" badge
3. Filter displayed plans based on toggle:
   - Monthly: show `free`, `starter`, `pro`, `elite`
   - Yearly: show `free`, `starter_yearly`, `pro_yearly`, `elite_yearly`
4. Update `isPopular` check to match both `pro` and `pro_yearly`

### `PlanCard` component

1. Replace flat background with glassmorphism styles (inline or Tailwind arbitrary values)
2. Hover lift animation (already using Framer Motion — add `whileHover`)
3. "MOST POPULAR" badge styling updated to white pill
4. "Current Plan" badge: green pill pinned top-right
5. Price display: show `/mo` with "billed annually · ₹X,XXX/year" subtext when yearly
6. Button variants: `primary` (white fill) for popular, `secondary` (glass) for others, `current` (ghost disabled) for current plan

### `FALLBACK_PLANS` constant

Add 3 yearly fallback entries matching the new DB rows (same fields as monthly counterparts, `price_inr` = annual total, `validity_days = 365`).

---

## Backend Changes

1. **Migration:** Insert 3 new rows into the `plans` table (`starter_yearly`, `pro_yearly`, `elite_yearly`)
2. **Optional:** Add `billing_period` column to `plans` table (`monthly` / `yearly`, default `monthly`)
3. No changes to checkout, subscription, or API endpoints

---

## What Does NOT Change

- Checkout flow (`/billing/checkout`) — receives plan object, unchanged
- Subscription service — unchanged
- Current subscription banner logic — unchanged
- Features comparison section — unchanged
- The "All Plans Include" section — unchanged content, glass card wrapper updated

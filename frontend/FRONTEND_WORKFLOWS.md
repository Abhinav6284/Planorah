# Frontend Workflows - Career Execution Platform

## User States and Access Control

### 1. Subscription States

| State | Description | Access Level |
|-------|-------------|--------------|
| `no_subscription` | User has never subscribed | Can view pricing, limited access |
| `active` | Valid subscription | Full access to plan features |
| `grace` | 7-14 days after expiry | Read-only access, can renew |
| `expired` | Past grace period | No access, must renew |
| `cancelled` | User cancelled | Grace period, then expired |

### 2. Portfolio States

| State | Public URL | Resume Download | GitHub Links | Analytics |
|-------|------------|-----------------|--------------|-----------|
| `active` | Full access | Yes | Yes | If plan allows |
| `grace` | Full access | Yes | Yes | No |
| `read_only` | Name + titles only | No | No | No |
| `archived` | 404 error | No | No | No |

## Page Flow

### Authentication Flow
```
Landing Page → Login/Register → OTP Verification → Onboarding → Dashboard
```

### Subscription Flow
```
Pricing Page → Select Plan → Payment → Verify → Subscription Active → Dashboard
```

### Upgrade Blocking Points

1. **Roadmap Creation**
   - Check: `subscription.can_create_roadmap`
   - Block: Show upgrade modal if limit reached

2. **Project Creation**
   - Check: `subscription.can_create_project`
   - Block: Show upgrade modal if limit reached

3. **Resume Creation**
   - Check: `subscription.can_create_resume`
   - Block: Show upgrade modal if limit reached

4. **ATS Scan**
   - Check: `subscription.can_run_ats_scan`
   - Block: Show upgrade modal or "try again tomorrow" for rate-limited plans

5. **Portfolio Analytics**
   - Check: `subscription.plan.portfolio_analytics`
   - Block: Show upgrade modal to Career Ready or higher

6. **Custom Subdomain**
   - Check: `subscription.plan.custom_subdomain`
   - Block: Show upgrade modal to Placement Pro

## Component Structure

### New Components Needed

```
src/components/
├── Subscription/
│   ├── PricingPage.jsx           # Display all plans with comparison
│   ├── PlanCard.jsx              # Individual plan display
│   ├── SubscriptionStatus.jsx    # Current subscription status widget
│   ├── UsageMeter.jsx            # Visual usage meters
│   └── UpgradeModal.jsx          # Modal shown when limits reached
├── Portfolio/
│   ├── PortfolioEditor.jsx       # Edit portfolio settings
│   ├── PortfolioPreview.jsx      # Preview before publish
│   ├── ProjectSelector.jsx       # Add/remove projects
│   ├── SubdomainSettings.jsx     # Custom subdomain setup
│   └── PortfolioAnalytics.jsx    # Analytics dashboard
├── Billing/
│   ├── PaymentPage.jsx           # Payment flow
│   ├── PaymentHistory.jsx        # Past payments
│   ├── InvoiceList.jsx           # View invoices
│   └── CouponInput.jsx           # Apply coupon codes
└── GitHub/
    ├── GitHubConnect.jsx         # OAuth connection
    ├── PublishButton.jsx         # Publish project to GitHub
    └── RepositoryList.jsx        # List published repos
```

### Public Portfolio Page

```
src/pages/
└── PublicPortfolio.jsx           # Public portfolio view at /p/:slug
```

## API Services

### Available Services

```javascript
// Plans
import { planService } from './api/planService';
planService.getAll();
planService.getComparison();

// Subscriptions
import { subscriptionService } from './api/subscriptionService';
subscriptionService.getCurrent();
subscriptionService.getUsage();
subscriptionService.activate(planId, paymentId);
subscriptionService.renew(planId, paymentId);
subscriptionService.cancel(subscriptionId);

// Portfolio
import { portfolioService } from './api/portfolioService';
portfolioService.getMyPortfolio();
portfolioService.updateSettings(data);
portfolioService.setSubdomain(subdomain);
portfolioService.addProject(projectId);
portfolioService.removeProject(projectId);
portfolioService.getAnalytics();

// GitHub
import { githubService } from './api/githubService';
githubService.getStatus();
githubService.connect(code);
githubService.disconnect();
githubService.publish(projectId, repoName, isPrivate);

// Billing
import { billingService } from './api/billingService';
billingService.createOrder(planId, couponCode);
billingService.verifyPayment(orderId, paymentId, signature);
billingService.validateCoupon(code, planId);

// Analytics
import { analyticsService } from './api/analyticsService';
analyticsService.getDashboard();
analyticsService.getProgress();
analyticsService.getActivityChart(days);
analyticsService.logActivity(action);
```

## State Management

### Subscription Context

```javascript
// src/context/SubscriptionContext.jsx
const SubscriptionContext = createContext();

export function SubscriptionProvider({ children }) {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const data = await subscriptionService.getCurrent();
      setSubscription(data);
    } catch (error) {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const canAccess = (feature) => {
    if (!subscription) return false;
    if (subscription.status !== 'active') return false;
    // Feature-specific checks
    switch (feature) {
      case 'create_roadmap':
        return subscription.can_create_roadmap;
      case 'create_project':
        return subscription.can_create_project;
      case 'create_resume':
        return subscription.can_create_resume;
      case 'ats_scan':
        return subscription.can_run_ats_scan;
      case 'portfolio_analytics':
        return subscription.plan_details.portfolio_analytics;
      case 'custom_subdomain':
        return subscription.plan_details.custom_subdomain;
      default:
        return true;
    }
  };

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      loading,
      canAccess,
      refresh: loadSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}
```

## UI Components

### Usage Meter Component

```jsx
function UsageMeter({ used, limit, label }) {
  const percentage = limit === -1 ? 0 : (used / limit) * 100;
  const isUnlimited = limit === -1;
  
  return (
    <div className="usage-meter">
      <div className="flex justify-between text-sm">
        <span>{label}</span>
        <span>{isUnlimited ? 'Unlimited' : `${used}/${limit}`}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
        <div
          className={`h-2 rounded-full ${percentage > 80 ? 'bg-red-500' : 'bg-green-500'}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}
```

### Upgrade Modal Component

```jsx
function UpgradeModal({ feature, onClose }) {
  const navigate = useNavigate();
  
  const featureMessages = {
    create_roadmap: 'You have reached your roadmap limit.',
    create_project: 'You have reached your project limit.',
    create_resume: 'You have reached your resume limit.',
    ats_scan: 'You have used all your ATS scans.',
    portfolio_analytics: 'Portfolio analytics is available in Career Ready and above.',
    custom_subdomain: 'Custom subdomain is available in Placement Pro plan.'
  };
  
  return (
    <Modal onClose={onClose}>
      <h2>Upgrade Required</h2>
      <p>{featureMessages[feature]}</p>
      <button onClick={() => navigate('/pricing')}>
        View Plans
      </button>
    </Modal>
  );
}
```

## Routes to Add

```javascript
// Add to App.js Routes
<Route path="/pricing" element={<PricingPage />} />
<Route path="/billing" element={<BillingPage />} />
<Route path="/billing/history" element={<PaymentHistory />} />
<Route path="/portfolio/edit" element={<PortfolioEditor />} />
<Route path="/portfolio/analytics" element={<PortfolioAnalytics />} />
<Route path="/p/:slug" element={<PublicPortfolio />} />
```

## Cost Control Indicators

### Dashboard Widgets

1. **Days Remaining Badge**
   - Show prominently when < 7 days remaining
   - Yellow warning at 7 days
   - Red alert at 3 days

2. **Usage Progress Bars**
   - Roadmaps used / limit
   - Projects used / limit
   - Resumes created / limit
   - ATS scans used / limit (or daily rate)

3. **Quick Actions**
   - "Upgrade Plan" button when approaching limits
   - "Renew Now" button in grace period

### Grace Period UI

When `subscription.status === 'grace'`:
- Show banner: "Your subscription has expired. Renew within X days to maintain full access."
- Disable all creation actions
- Allow read/view operations
- Show renewal CTA prominently

### Read-Only Portfolio UI

When `portfolio.status === 'read_only'`:
- Show minimal information
- Hide resume download button
- Hide GitHub deep links
- Show message: "Portfolio owner's subscription has expired"

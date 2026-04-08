// ─── helpers ──────────────────────────────────────────────────────────────────
function rDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}
function fmt(d) { return d.toISOString().split('T')[0] }

const NAMES = [
  'Alex Morgan','Jamie Chen','Sam Rivera','Taylor Kim','Jordan Lee',
  'Casey Park','Morgan Blake','Riley Quinn','Avery Santos','Drew Patel',
  'Reese Thompson','Skyler Davis','Harper Wilson','Finley Brown','Logan Martinez',
  'Emery Garcia','Rowan Johnson','Sage White','Quinn Anderson','Hayden Thomas',
  'Blake Jackson','Cameron Harris','Dakota Lewis','Elliot Walker','Frankie Hall',
  'Kendall Young','Lane Allen','Marlowe Hill','Nash Scott','Oakley Green',
  'Parker Adams','Remy Baker','Sloane Carter','Sterling Collins','Sutton Evans',
  'Tatum Foster','Toby Gonzalez','Vesper Hayes','Wren Hughes','Xander Jenkins',
  'Yael King','Zara Mitchell','Zoe Moore','Zion Murphy','Ace Nelson',
  'Aria Owens','Atlas Price','Aurora Reed',
]

const PLANS    = ['Free', 'Pro', 'Premium', 'Enterprise']
const STATUSES = ['active', 'inactive', 'suspended', 'pending']
const COLORS   = ['#F59E0B','#6366F1','#EC4899','#22C55E','#06B6D4','#8B5CF6']

// ─── users ────────────────────────────────────────────────────────────────────
export const mockUsers = NAMES.map((name, i) => ({
  id:        `usr_${String(i + 1).padStart(4, '0')}`,
  name,
  email:     `${name.toLowerCase().replace(' ', '.')}@example.com`,
  status:    i % 7 === 0 ? 'suspended' : i % 4 === 0 ? 'inactive' : 'active',
  plan:      PLANS[i % 4],
  role:      i < 3 ? 'superadmin' : i < 8 ? 'admin' : 'user',
  joinedAt:  fmt(rDate(new Date('2023-01-01'), new Date('2024-10-01'))),
  lastLogin: fmt(rDate(new Date('2024-09-01'), new Date('2025-04-08'))),
  xp:        Math.floor(Math.random() * 6000) + 200,
  avatarColor: COLORS[i % 6],
}))

// ─── subscriptions ────────────────────────────────────────────────────────────
const PLAN_PRICE = { Free: 0, Pro: 12, Premium: 29, Enterprise: 99 }

export const mockSubscriptions = mockUsers
  .filter(u => u.plan !== 'Free')
  .map((u, i) => ({
    id:              `sub_${String(i + 1).padStart(4, '0')}`,
    userId:          u.id,
    userName:        u.name,
    userEmail:       u.email,
    plan:            u.plan,
    status:          ['active','active','active','canceled','past_due'][i % 5],
    billingCycle:    i % 3 === 0 ? 'annual' : 'monthly',
    amount:          PLAN_PRICE[u.plan],
    startDate:       fmt(rDate(new Date('2023-01-01'), new Date('2024-06-01'))),
    nextBillingDate: fmt(rDate(new Date('2025-04-08'), new Date('2026-04-08'))),
    paymentHistory:  Array.from({ length: 4 }, (_, j) => ({
      id:     `pay_${i}_${j}`,
      amount: PLAN_PRICE[u.plan],
      date:   fmt(rDate(new Date('2023-01-01'), new Date('2025-04-08'))),
      status: j === 1 && i % 8 === 0 ? 'failed' : 'paid',
    })),
  }))

// ─── analytics time series ────────────────────────────────────────────────────
function buildSeries(months = 12) {
  const out = []
  let users = 820, rev = 8400
  const now = new Date('2025-04-08')
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    users = Math.floor(users * (1 + Math.random() * 0.18 + 0.04))
    rev   = Math.floor(rev   * (1 + Math.random() * 0.15 + 0.05))
    out.push({
      month:      d.toLocaleString('default', { month: 'short', year: '2-digit' }),
      users,
      revenue:    rev,
      newUsers:   Math.floor(users * (Math.random() * 0.12 + 0.04)),
      churn:      Math.floor(Math.random() * 28 + 4),
      engagement: Math.floor(Math.random() * 35 + 55),
    })
  }
  return out
}
export const analyticsData = buildSeries(12)

// ─── KPIs ─────────────────────────────────────────────────────────────────────
export const kpiData = {
  totalUsers:          mockUsers.length,
  activeUsers:         mockUsers.filter(u => u.status === 'active').length,
  mrr:                 mockSubscriptions.filter(s => s.status === 'active' && s.billingCycle === 'monthly')
                         .reduce((s, sub) => s + sub.amount, 0),
  arr:                 mockSubscriptions.filter(s => s.status === 'active')
                         .reduce((s, sub) => s + sub.amount * (sub.billingCycle === 'annual' ? 1 : 12), 0),
  activeSubscriptions: mockSubscriptions.filter(s => s.status === 'active').length,
  growth:              18.4,
  churnRate:           3.2,
  avgRevPerUser:       41.8,
}

// ─── recent activity ──────────────────────────────────────────────────────────
export const recentActivity = [
  { id: 1, type: 'signup',       user: 'Aurora Reed',     detail: 'New user registered',           time: '2 min ago'  },
  { id: 2, type: 'upgrade',      user: 'Zion Murphy',     detail: 'Upgraded to Premium',            time: '15 min ago' },
  { id: 3, type: 'payment',      user: 'Atlas Price',     detail: 'Payment of $29 received',        time: '1 hr ago'   },
  { id: 4, type: 'delete',       user: 'Ace Nelson',      detail: 'Account deleted',                time: '2 hr ago'   },
  { id: 5, type: 'cancel',       user: 'Aria Owens',      detail: 'Subscription canceled',          time: '3 hr ago'   },
  { id: 6, type: 'signup',       user: 'Wren Hughes',     detail: 'New user registered',            time: '4 hr ago'   },
  { id: 7, type: 'payment_fail', user: 'Xander Jenkins',  detail: 'Payment failed – retrying',      time: '5 hr ago'   },
  { id: 8, type: 'upgrade',      user: 'Vesper Hayes',    detail: 'Upgraded to Pro',                time: '6 hr ago'   },
  { id: 9, type: 'suspend',      user: 'Toby Gonzalez',   detail: 'Account suspended by admin',     time: '8 hr ago'   },
  { id:10, type: 'signup',       user: 'Tatum Foster',    detail: 'New user registered',            time: '10 hr ago'  },
]

// ─── feature flags ────────────────────────────────────────────────────────────
export const defaultFeatureFlags = [
  { id:'ff_001', key:'new_onboarding',   label:'New Onboarding Flow',   enabled:true,  description:'Redesigned 4-step onboarding experience'      },
  { id:'ff_002', key:'ai_suggestions',   label:'AI Suggestions',        enabled:true,  description:'AI-powered task and goal suggestions'         },
  { id:'ff_003', key:'portfolio_v2',     label:'Portfolio V2 Editor',   enabled:true,  description:'Drag-and-drop portfolio editor (v2)'          },
  { id:'ff_004', key:'voice_notes',      label:'Voice Notes Beta',      enabled:false, description:'Voice-to-text note capture feature'           },
  { id:'ff_005', key:'analytics_dash',   label:'User Analytics',        enabled:true,  description:'User-facing analytics for premium plans'      },
  { id:'ff_006', key:'team_workspaces',  label:'Team Workspaces',       enabled:false, description:'Multi-user collaborative workspaces'          },
  { id:'ff_007', key:'advanced_xp',      label:'Advanced XP System',    enabled:true,  description:'Extended gamification: streaks & badges'      },
  { id:'ff_008', key:'api_access',       label:'API Access (Beta)',      enabled:false, description:'REST API access for premium users'            },
  { id:'ff_009', key:'dark_mode_force',  label:'Force Dark Mode',       enabled:false, description:'Override user theme preference to dark mode'  },
  { id:'ff_010', key:'email_digest',     label:'Weekly Email Digest',   enabled:true,  description:'Send weekly progress digest emails'           },
]

// ─── simulate async fetch ─────────────────────────────────────────────────────
export const delay = (ms = 600) => new Promise(r => setTimeout(r, ms))

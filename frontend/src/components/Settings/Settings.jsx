import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Settings as SettingsIcon, 
  CreditCard, 
  Tag, 
  Receipt, 
  Check, 
  Shield, 
  Monitor, 
  LogOut,
  History,
  Lock,
  ChevronLeft
} from 'lucide-react';

import { useTheme } from '../../context/ThemeContext';
import { userService } from '../../api/userService';
import { subscriptionService } from '../../api/subscriptionService';
import { planService } from '../../api/planService';
import { billingService } from '../../api/billingService';
import { resolveAvatarUrl } from '../../utils/avatar';

// --- Shared Components ---

const MAX_AVATAR_UPLOAD_BYTES = 900 * 1024;
const AVATAR_MAX_DIMENSION = 1024;

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read selected image.'));
    reader.readAsDataURL(file);
});

const loadImage = (src) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to process selected image.'));
    image.src = src;
});

const canvasToBlob = (canvas, type, quality) => new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
        if (!blob) {
            reject(new Error('Failed to compress selected image.'));
            return;
        }
        resolve(blob);
    }, type, quality);
});

const optimizeAvatarFile = async (file) => {
    if (!file?.type?.startsWith('image/')) {
        throw new Error('Please select a valid image file.');
    }
    if (file.size <= MAX_AVATAR_UPLOAD_BYTES) return file;
    const dataUrl = await readFileAsDataUrl(file);
    const image = await loadImage(dataUrl);

    const longestEdge = Math.max(image.width, image.height);
    const scale = longestEdge > AVATAR_MAX_DIMENSION ? AVATAR_MAX_DIMENSION / longestEdge : 1;
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not initialize image processing.');
    context.drawImage(image, 0, 0, width, height);

    let mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
    let quality = 0.9;
    let blob = await canvasToBlob(canvas, mimeType, quality);

    if (blob.size > MAX_AVATAR_UPLOAD_BYTES && mimeType === 'image/png') {
        mimeType = 'image/jpeg';
        quality = 0.85;
        blob = await canvasToBlob(canvas, mimeType, quality);
    }

    while (blob.size > MAX_AVATAR_UPLOAD_BYTES && quality > 0.3) {
        quality -= 0.1;
        blob = await canvasToBlob(canvas, mimeType, quality);
    }

    if (blob.size > MAX_AVATAR_UPLOAD_BYTES) {
        throw new Error('Image is too large. Please choose a smaller image (under 900 KB).');
    }

    const outputName = file.name.replace(/\.[^.]+$/, mimeType === 'image/png' ? '.png' : '.jpg');
    return new File([blob], outputName, { type: mimeType, lastModified: Date.now() });
};

function SettingsSectionTitle({ title, subtitle }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--el-text)', marginBottom: 8, letterSpacing: '-0.02em' }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 14, color: 'var(--el-text-muted)' }}>{subtitle}</p>}
    </div>
  );
}

function SettingsCard({ children, style = {} }) {
  return (
    <div style={{
      background: 'var(--el-bg)',
      border: '1px solid var(--el-border)',
      borderRadius: 16,
      padding: 24,
      boxShadow: 'var(--el-shadow-card)',
      ...style
    }}>
      {children}
    </div>
  );
}

// --- Sections ---

function ProfileSection({ user, stats, onEdit }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <SettingsCard style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', background: 'var(--el-bg-secondary)',
          overflow: 'hidden', flexShrink: 0, border: '1px solid var(--el-border)'
        }}>
          {user.avatar ? (
            <img src={resolveAvatarUrl(user.avatar)} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>👤</div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--el-text)', marginBottom: 2 }}>{user.name}</h1>
          <p style={{ fontSize: 13, color: 'var(--el-text-muted)', marginBottom: 8 }}>@{user.username} · {user.role}</p>
          <p style={{ fontSize: 13, color: 'var(--el-text)', maxWidth: 600, lineHeight: 1.5 }}>{user.bio}</p>
        </div>
        <button 
          onClick={onEdit}
          style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: 'var(--el-bg)', border: '1px solid var(--el-border)',
            color: 'var(--el-text)', cursor: 'pointer', transition: 'all 0.1s',
            boxShadow: 'var(--el-shadow-inset)'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--el-bg-secondary)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--el-bg)'}
        >
          Edit Profile
        </button>
      </SettingsCard>

      <div>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--el-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Your Impact</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { label: 'Total Tasks', value: stats?.overview?.total_tasks || 0, sub: `${stats?.overview?.completed_tasks || 0} completed` },
            { label: 'Streak', value: `${stats?.streak?.current || 0} days`, sub: `Longest: ${stats?.streak?.longest || 0}` },
            { label: 'Rate', value: `${stats?.overview?.completion_rate || 0}%`, sub: 'Consistent progress' }
          ].map(s => (
            <SettingsCard key={s.label} style={{ padding: 20 }}>
              <div style={{ fontSize: 11, color: 'var(--el-text-muted)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--el-text)' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--el-text-secondary)', marginTop: 4 }}>{s.sub}</div>
            </SettingsCard>
          ))}
        </div>
      </div>
    </div>
  );
}

function AccountSection({ user, isOAuth, onDelete }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SettingsCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--el-text)' }}>Email Address</div>
              <div style={{ fontSize: 13, color: 'var(--el-text-muted)' }}>{user.email}</div>
            </div>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 6, background: 'var(--el-bg-secondary)', color: 'var(--el-text-muted)', fontWeight: 700 }}>PRIMARY</span>
          </div>
          
          <div style={{ borderTop: '1px solid var(--el-border)', paddingTop: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--el-text)', marginBottom: 4 }}>Authentication</div>
            <div style={{ fontSize: 13, color: 'var(--el-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {isOAuth ? (
                <>Connected via GitHub <Shield style={{ width: 14, height: 14, color: '#22c55e' }} /></>
              ) : (
                <>Standard Email/Password Auth <Lock style={{ width: 14, height: 14 }} /></>
              )}
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard style={{ border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>Danger Zone</h3>
        <p style={{ fontSize: 13, color: 'var(--el-text-muted)', marginBottom: 16 }}>
          Permanently delete your account. This action cannot be undone.
        </p>
        <button 
          onClick={onDelete}
          style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444', cursor: 'pointer'
          }}
        >
          Delete Account
        </button>
      </SettingsCard>
    </div>
  );
}

function PreferencesSection() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <SettingsCard>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--el-text)', marginBottom: 4 }}>Appearance</div>
            <div style={{ fontSize: 13, color: 'var(--el-text-muted)' }}>Toggle between light and dark mode</div>
          </div>
          <div style={{ display: 'flex', background: 'var(--el-bg-secondary)', padding: 3, borderRadius: 10, gap: 2, border: '1px solid var(--el-border)' }}>
            <button 
              onClick={() => theme === 'dark' && toggleTheme()}
              style={{
                padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: theme === 'light' ? 'var(--el-bg)' : 'transparent',
                color: theme === 'light' ? 'var(--el-text)' : 'var(--el-text-muted)',
                boxShadow: theme === 'light' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              Light
            </button>
            <button 
              onClick={() => theme === 'light' && toggleTheme()}
              style={{
                padding: '6px 14px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: 'none', cursor: 'pointer',
                background: theme === 'dark' ? 'var(--el-bg)' : 'transparent',
                color: theme === 'dark' ? 'var(--el-text)' : 'var(--el-text-muted)',
                boxShadow: theme === 'dark' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                transition: 'all 0.15s'
              }}
            >
              Dark
            </button>
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}

function SubscriptionSection({ subscription, usage, onUpgrade, onHistory }) {
  if (!subscription) return (
    <SettingsCard style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>📋</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--el-text)', marginBottom: 8 }}>No Active Subscription</h3>
      <p style={{ fontSize: 14, color: 'var(--el-text-muted)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
        Unlock premium features like AI-powered roadmaps, ATS scanner, and unlimited job searches.
      </p>
      <button 
        onClick={onUpgrade}
        style={{
          padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 700,
          background: 'var(--el-text)', color: 'var(--el-bg)', border: 'none', cursor: 'pointer'
        }}
      >
        View Plans
      </button>
    </SettingsCard>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <SettingsCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--el-text)' }}>{subscription.plan_details?.display_name}</h3>
              <span style={{ 
                fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                background: subscription.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                color: subscription.status === 'active' ? '#22c55e' : '#eab308'
              }}>
                {subscription.status.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--el-text-muted)' }}>
              ₹{subscription.plan_details?.price_inr} · {subscription.plan_details?.validity_days} days plan
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--el-text)' }}>{subscription.days_remaining}</div>
            <div style={{ fontSize: 12, color: 'var(--el-text-muted)' }}>days remaining</div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--el-text-muted)', marginBottom: 6 }}>
            <span>Started {new Date(subscription.start_date).toLocaleDateString()}</span>
            <span>Expires {new Date(subscription.end_date).toLocaleDateString()}</span>
          </div>
          <div style={{ height: 6, width: '100%', background: 'var(--el-bg-secondary)', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--el-border)' }}>
            <div style={{ 
              height: '100%', background: 'var(--el-text)', 
              width: `${Math.max(5, 100 - (subscription.days_remaining / subscription.plan_details?.validity_days) * 100)}%` 
            }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button 
            onClick={onUpgrade}
            style={{
              flex: 1, padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 700,
              background: 'var(--el-text)', color: 'var(--el-bg)', border: 'none', cursor: 'pointer'
            }}
          >
            Change Plan
          </button>
          <button 
            onClick={onHistory}
            style={{
              flex: 1, padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: 'var(--el-bg)', border: '1px solid var(--el-border)', color: 'var(--el-text)', cursor: 'pointer'
            }}
          >
            Billing History
          </button>
        </div>
      </SettingsCard>

      {usage && (
        <SettingsCard>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--el-text)', marginBottom: 20 }}>Usage Tracking</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: 'var(--el-text-muted)' }}>Roadmaps</span>
                <span style={{ fontWeight: 600, color: 'var(--el-text)' }}>{usage.roadmap_limit === -1 ? 'Unlimited' : `${usage.roadmaps_used} / ${usage.roadmap_limit}`}</span>
              </div>
              <div style={{ height: 4, width: '100%', background: 'var(--el-bg-secondary)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--el-text)', width: usage.roadmap_limit === -1 ? '0%' : `${(usage.roadmaps_used / usage.roadmap_limit) * 100}%` }} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                <span style={{ color: 'var(--el-text-muted)' }}>ATS Scans</span>
                <span style={{ fontWeight: 600, color: 'var(--el-text)' }}>{usage.ats_scan_limit === -1 ? 'Unlimited' : `${usage.ats_scans_used} / ${usage.ats_scan_limit}`}</span>
              </div>
              <div style={{ height: 4, width: '100%', background: 'var(--el-bg-secondary)', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: 'var(--el-text)', width: usage.ats_scan_limit === -1 ? '0%' : `${(usage.ats_scans_used / usage.ats_scan_limit) * 100}%` }} />
              </div>
            </div>
          </div>
        </SettingsCard>
      )}
    </div>
  );
}

function PricingSection({ plans, currentSubscription, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
      {plans.map(plan => {
        const isCurrent = currentSubscription?.plan_details?.id === plan.id;
        const isPopular = plan.name === 'pro';

        return (
          <SettingsCard key={plan.id} style={{ 
            display: 'flex', flexDirection: 'column',
            border: isPopular ? '1px solid var(--el-text)' : '1px solid var(--el-border)',
            position: 'relative'
          }}>
            {isPopular && (
              <div style={{ 
                position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
                background: 'var(--el-text)', color: 'var(--el-bg)', fontSize: 9, fontWeight: 800, 
                padding: '2px 10px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                Recommended
              </div>
            )}
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--el-text)', marginBottom: 4 }}>{plan.display_name}</h4>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--el-text)' }}>₹{plan.price_inr}</span>
                <span style={{ fontSize: 12, color: 'var(--el-text-muted)' }}>/ {plan.validity_days}d</span>
              </div>
            </div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {[
                plan.roadmap_limit === -1 ? 'Unlimited Roadmaps' : `${plan.roadmap_limit} Roadmaps`,
                plan.resume_full ? 'Full Resume Builder' : 'Basic Resume Builder',
                plan.ats_scan_limit === -1 ? 'Unlimited ATS Scans' : plan.ats_scan_limit > 0 ? `${plan.ats_scan_limit} ATS Scans` : null,
                plan.quicky_ai_daily_limit === -1 ? 'Unlimited AI Queries' : `${plan.quicky_ai_daily_limit} AI Queries/d`,
                plan.has_portfolio_live ? 'Live Portfolio' : null
              ].filter(Boolean).map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--el-text-secondary)' }}>
                  <Check style={{ width: 14, height: 14, color: '#22c55e' }} /> {f}
                </div>
              ))}
            </div>

            <button 
              disabled={isCurrent}
              onClick={() => onSelect(plan)}
              style={{
                width: '100%', padding: '10px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                background: isCurrent ? 'var(--el-bg-secondary)' : isPopular ? 'var(--el-text)' : 'var(--el-bg)',
                color: isCurrent ? 'var(--el-text-muted)' : isPopular ? 'var(--el-bg)' : 'var(--el-text)',
                border: isCurrent ? 'none' : '1px solid var(--el-border)',
                cursor: isCurrent ? 'default' : 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {isCurrent ? 'Current Plan' : 'Select Plan'}
            </button>
          </SettingsCard>
        );
      })}
    </div>
  );
}

function BillingHistorySection({ payments, invoices }) {
  const [activeTab, setActiveTab] = useState('payments');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
        {['payments', 'invoices'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '6px 16px', fontSize: 13, fontWeight: 600, borderRadius: 8, cursor: 'pointer',
              background: activeTab === tab ? 'var(--el-text)' : 'transparent',
              color: activeTab === tab ? 'var(--el-bg)' : 'var(--el-text-muted)',
              border: 'none', transition: 'all 0.15s'
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(activeTab === 'payments' ? payments : invoices).length === 0 ? (
              <SettingsCard style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ color: 'var(--el-text-muted)', fontSize: 14 }}>No {activeTab} history available.</p>
              </SettingsCard>
            ) : (
              (activeTab === 'payments' ? payments : invoices).map(item => (
                <SettingsCard key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--el-text)' }}>{item.plan_details?.display_name || item.invoice_number}</div>
                    <div style={{ fontSize: 12, color: 'var(--el-text-muted)' }}>{new Date(item.created_at).toLocaleDateString()} {item.receipt_number ? `· ${item.receipt_number}` : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--el-text)' }}>₹{item.amount || item.total}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: (item.status === 'completed' || activeTab === 'invoices') ? '#22c55e' : '#eab308' }}>
                            {(item.status || 'PAID').toUpperCase()}
                        </div>
                    </div>
                    {item.pdf_url && (
                        <a href={item.pdf_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--el-text)', opacity: 0.7 }}>
                            <Receipt style={{ width: 18, height: 18 }} />
                        </a>
                    )}
                  </div>
                </SettingsCard>
              ))
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- Main Component ---

export default function Settings() {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('profile');
    
    // User & Stats state
    const [user, setUser] = useState({ name: "", username: "", role: "", bio: "", email: "", avatar: null });
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOAuth, setIsOAuth] = useState(false);

    // Subscription & Billing state
    const [subscription, setSubscription] = useState(null);
    const [usage, setUsage] = useState(null);
    const [plans, setPlans] = useState([]);
    const [payments, setPayments] = useState([]);
    const [invoices, setInvoices] = useState([]);

    // Edit Modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [editPreview, setEditPreview] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Delete Modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
      const hash = location.hash.replace('#', '');
      if (['profile', 'subscription', 'plans', 'billing'].includes(hash)) {
        setActiveTab(hash);
      }
    }, [location.hash]);

    const fetchData = useCallback(async () => {
      try {
        setLoading(true);
        const [profileRes, statsRes, authRes, subRes, plansRes, billingRes, invoicesRes] = await Promise.all([
          userService.getProfile(),
          userService.getStatistics(),
          userService.checkAuthType(),
          subscriptionService.getCurrent().catch(() => null),
          planService.getAll().catch(() => ({ results: [] })),
          billingService.getHistory().catch(() => []),
          billingService.getInvoices().catch(() => [])
        ]);

        const profile = profileRes.profile || {};
        setUser({
          name: `${profileRes.first_name || ''} ${profileRes.last_name || ''}`.trim() || profileRes.username,
          username: profileRes.username,
          role: profile.target_role || "Student",
          bio: profile.bio || "Passionate about learning and building the future. 🚀",
          email: profileRes.email,
          avatar: profileRes.avatar || profile.avatar,
        });

        setStats(statsRes);
        setIsOAuth(authRes.is_oauth);
        setSubscription(subRes);
        if (subRes) {
          const usageRes = await subscriptionService.getUsage();
          setUsage(usageRes);
        }
        setPlans(plansRes.results || plansRes);
        setPayments(billingRes);
        setInvoices(invoicesRes);

      } catch (err) {
        console.error("Settings: Failed to load data", err);
      } finally {
        setLoading(false);
      }
    }, []);

    useEffect(() => {
      fetchData();
    }, [fetchData]);

    const handleEditProfile = () => {
      setEditForm({ ...user });
      setEditPreview(user.avatar ? resolveAvatarUrl(user.avatar) : null);
      setShowEditModal(true);
    };

    const handleSaveProfile = async () => {
      setSaving(true);
      setMessage(null);
      try {
        const formData = new FormData();
        formData.append('name', editForm.name);
        formData.append('target_role', editForm.role);
        formData.append('bio', editForm.bio);
        if (editForm.avatarFile) {
          formData.append('avatar', editForm.avatarFile);
        }

        await userService.updateProfile(formData);
        setUser({ ...user, ...editForm });
        setMessage({ type: 'success', text: 'Profile updated!' });
        setTimeout(() => {
          setShowEditModal(false);
          setMessage(null);
          fetchData(); // Refresh
        }, 1000);
      } catch (err) {
        setMessage({ type: 'error', text: err.response?.data?.details || 'Failed to update profile.' });
      } finally {
        setSaving(false);
      }
    };

    const handleDeleteAccount = async () => {
      if (!deleteConfirm) return;
      setDeleting(true);
      try {
        await userService.deleteAccount(deleteConfirm, isOAuth);
        localStorage.clear();
        window.location.href = '/login';
      } catch (err) {
        setDeleteError(err.response?.data?.details || 'Verification failed. Please check your credentials.');
      } finally {
        setDeleting(false);
      }
    };

    const sideNavItems = [
      { id: 'profile', label: 'General', icon: User },
      { id: 'subscription', label: 'Subscription', icon: CreditCard },
      { id: 'plans', label: 'Plans & Pricing', icon: Tag },
      { id: 'billing', label: 'Billing History', icon: History },
    ];

    if (loading) {
      return (
        <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--el-text-muted)' }}>
          Loading settings...
        </div>
      );
    }

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
            <div style={{ marginBottom: 48 }}>
              <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--el-text)', letterSpacing: '-0.04em', marginBottom: 8 }}>Settings</h1>
              <p style={{ fontSize: 15, color: 'var(--el-text-muted)' }}>Manage your profile, billing, and system preferences.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 60 }}>
                {/* Side Navigation */}
                <aside style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {sideNavItems.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        window.location.hash = item.id;
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        borderRadius: 10, fontSize: 14, fontWeight: activeTab === item.id ? 700 : 500,
                        border: 'none', cursor: 'pointer', transition: 'all 0.1s',
                        background: activeTab === item.id ? 'var(--el-bg-secondary)' : 'transparent',
                        color: activeTab === item.id ? 'var(--el-text)' : 'var(--el-text-muted)',
                        textAlign: 'left',
                        boxShadow: activeTab === item.id ? 'var(--el-shadow-inset)' : 'none'
                      }}
                    >
                      <item.icon style={{ width: 16, height: 16, opacity: activeTab === item.id ? 1 : 0.6 }} />
                      {item.label}
                    </button>
                  ))}
                  <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--el-border)' }}>
                    <button
                      onClick={() => {
                        localStorage.clear();
                        window.location.href = '/login';
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                        borderRadius: 10, fontSize: 14, fontWeight: 500, color: '#ef4444',
                        background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left'
                      }}
                    >
                      <LogOut style={{ width: 16, height: 16 }} />
                      Log Out
                    </button>
                  </div>
                </aside>

                {/* Main Content Area */}
                <main>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                    >
                      {activeTab === 'profile' && (
                        <>
                          <SettingsSectionTitle title="General" subtitle="Your public profile, appearance, and account settings." />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                            <ProfileSection user={user} stats={stats} onEdit={handleEditProfile} />
                            
                            <div style={{ borderTop: '1px solid var(--el-border)', paddingTop: 40 }}>
                                <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--el-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Appearance</h3>
                                <PreferencesSection />
                            </div>

                            <div style={{ borderTop: '1px solid var(--el-border)', paddingTop: 40 }}>
                                <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--el-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>Account & Security</h3>
                                <AccountSection user={user} isOAuth={isOAuth} onDelete={() => setShowDeleteModal(true)} />
                            </div>
                          </div>
                        </>
                      )}
                      {activeTab === 'subscription' && (
                        <>
                          <SettingsSectionTitle title="Subscription" subtitle="Manage your current plan and platform usage." />
                          <SubscriptionSection 
                            subscription={subscription} 
                            usage={usage} 
                            onUpgrade={() => setActiveTab('plans')}
                            onHistory={() => setActiveTab('billing')}
                          />
                        </>
                      )}
                      {activeTab === 'plans' && (
                        <>
                          <SettingsSectionTitle title="Plans & Pricing" subtitle="Choose the best plan for your professional needs." />
                          <PricingSection 
                            plans={plans} 
                            currentSubscription={subscription} 
                            onSelect={(plan) => navigate('/billing/checkout', { state: { plan } })} 
                          />
                        </>
                      )}
                      {activeTab === 'billing' && (
                        <>
                          <SettingsSectionTitle title="Billing History" subtitle="View your past transactions and download invoices." />
                          <BillingHistorySection payments={payments} invoices={invoices} />
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </main>
            </div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', inset: 0, zIndex: 1000,
                            background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            style={{
                                width: '100%', maxWidth: 500, background: 'var(--el-bg)', borderRadius: 20,
                                overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.2)', border: '1px solid var(--el-border)'
                            }}
                        >
                            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--el-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                                <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: 'var(--el-text-muted)', cursor: 'pointer', padding: 0 }}><ChevronLeft /></button>
                                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--el-text)' }}>Edit Profile</h2>
                            </div>
                            <div style={{ padding: 32, display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                    <div style={{
                                        width: 80, height: 80, borderRadius: '50%', background: 'var(--el-bg-secondary)',
                                        border: '1px solid var(--el-border)', overflow: 'hidden', position: 'relative'
                                    }}>
                                        {editPreview ? (
                                            <img src={editPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👤</div>
                                        )}
                                        <label style={{
                                            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontSize: 10, fontWeight: 800, opacity: 0, cursor: 'pointer', transition: 'opacity 0.2s'
                                        }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                                            REPLACE
                                            <input type="file" hidden accept="image/*" onChange={async (e) => {
                                                const file = e.target.files[0];
                                                if (file) {
                                                  const optimized = await optimizeAvatarFile(file);
                                                  setEditForm({ ...editForm, avatarFile: optimized });
                                                  setEditPreview(URL.createObjectURL(optimized));
                                                }
                                            }} />
                                        </label>
                                    </div>
                                    <div style={{ fontSize: 12, color: 'var(--el-text-muted)', lineHeight: 1.5 }}>
                                        <strong>Upload new avatar</strong><br/>
                                        PNG or JPG. Max 900KB.
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--el-text)', marginBottom: 8 }}>Full Name</label>
                                        <input 
                                          style={{ 
                                            width: '100%', padding: '12px 14px', borderRadius: 10, 
                                            background: 'var(--el-bg)', border: '1px solid var(--el-border)',
                                            color: 'var(--el-text)', fontSize: 14, outline: 'none',
                                            boxShadow: 'var(--el-shadow-inset)'
                                          }} 
                                          value={editForm.name || ''} 
                                          onChange={e => setEditForm({...editForm, name: e.target.value})} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--el-text)', marginBottom: 8 }}>Role / Occupation</label>
                                        <input 
                                          style={{ 
                                            width: '100%', padding: '12px 14px', borderRadius: 10, 
                                            background: 'var(--el-bg)', border: '1px solid var(--el-border)',
                                            color: 'var(--el-text)', fontSize: 14, outline: 'none',
                                            boxShadow: 'var(--el-shadow-inset)'
                                          }} 
                                          value={editForm.role || ''} 
                                          onChange={e => setEditForm({...editForm, role: e.target.value})} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--el-text)', marginBottom: 8 }}>Bio</label>
                                        <textarea 
                                          style={{ 
                                            width: '100%', padding: '12px 14px', borderRadius: 10, 
                                            background: 'var(--el-bg)', border: '1px solid var(--el-border)',
                                            color: 'var(--el-text)', fontSize: 14, height: 100, resize: 'none', outline: 'none',
                                            boxShadow: 'var(--el-shadow-inset)', lineHeight: 1.5
                                          }} 
                                          value={editForm.bio || ''} 
                                          onChange={e => setEditForm({...editForm, bio: e.target.value})} 
                                        />
                                    </div>
                                </div>

                                {message && (
                                    <div style={{ 
                                      padding: '12px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                                      background: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                      color: message.type === 'success' ? '#22c55e' : '#ef4444'
                                    }}>
                                      {message.text}
                                    </div>
                                )}
                            </div>
                            <div style={{ padding: '24px 32px', background: 'var(--el-bg-secondary)', borderTop: '1px solid var(--el-border)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <button onClick={() => setShowEditModal(false)} style={{ padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: 'none', background: 'transparent', color: 'var(--el-text-muted)', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleSaveProfile} disabled={saving} style={{ padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', background: 'var(--el-text)', color: 'var(--el-bg)', cursor: 'pointer' }}>
                                  {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {/* Delete Modal */}
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => setShowDeleteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            onClick={e => e.stopPropagation()} 
                            style={{ width: '100%', maxWidth: 400, background: 'var(--el-bg)', borderRadius: 20, padding: 32, border: '1px solid var(--el-border)' }}
                        >
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ef4444', marginBottom: 12 }}>Delete Account</h2>
                            <p style={{ fontSize: 14, color: 'var(--el-text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                                This is permanent. All your roadmaps, tasks, and settings will be wiped from our servers forever.
                            </p>
                            
                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--el-text)', marginBottom: 8 }}>
                                {isOAuth ? 'Type DELETE to confirm' : 'Enter password to confirm'}
                            </label>
                            <input 
                                type={isOAuth ? 'text' : 'password'}
                                style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid var(--el-border)', background: 'var(--el-bg)', color: 'var(--el-text)', marginBottom: 16, outline: 'none', boxShadow: 'var(--el-shadow-inset)' }}
                                value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)}
                            />

                            {deleteError && <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 16, fontWeight: 600 }}>{deleteError}</div>}

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                                <button onClick={() => setShowDeleteModal(false)} style={{ padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: 'none', background: 'transparent', color: 'var(--el-text-muted)', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={handleDeleteAccount} disabled={deleting} style={{ padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer' }}>
                                  {deleting ? 'Deleting...' : 'Delete Permanently'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/**
 * Base API client for the Planorah Admin Panel.
 * Reads JWT from localStorage, auto-refreshes on 401.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getTokens() {
  try {
    return JSON.parse(localStorage.getItem('admin_tokens') || 'null')
  } catch {
    return null
  }
}

function saveTokens(tokens) {
  localStorage.setItem('admin_tokens', JSON.stringify(tokens))
}

function clearTokens() {
  localStorage.removeItem('admin_tokens')
  localStorage.removeItem('admin_user')
}

async function refreshAccessToken() {
  const tokens = getTokens()
  if (!tokens?.refresh) throw new Error('No refresh token')
  const res = await fetch(`${BASE_URL}/api/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: tokens.refresh }),
  })
  if (!res.ok) {
    clearTokens()
    throw new Error('Session expired')
  }
  const data = await res.json()
  saveTokens({ ...tokens, access: data.access })
  return data.access
}

/**
 * Core fetch wrapper — adds Authorization header, handles 401 retry with refresh.
 */
async function apiFetch(path, options = {}) {
  const tokens = getTokens()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (tokens?.access) {
    headers['Authorization'] = `Bearer ${tokens.access}`
  }

  let res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  // Token expired — try refresh once
  if (res.status === 401 && tokens?.refresh) {
    try {
      const newAccess = await refreshAccessToken()
      headers['Authorization'] = `Bearer ${newAccess}`
      res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
    } catch {
      clearTokens()
      window.location.href = '/login'
      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: `HTTP ${res.status}` }))
    throw new Error(err.detail || JSON.stringify(err))
  }

  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function loginWithCredentials(email, password) {
  // Get JWT tokens
  const tokenData = await apiFetch('/api/token/', {
    method: 'POST',
    body: JSON.stringify({ username: email, password }),
  }).catch(async () => {
    // Try with email as username field
    return apiFetch('/api/token/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  })
  saveTokens({ access: tokenData.access, refresh: tokenData.refresh })

  // Fetch current admin user info
  const user = await apiFetch('/api/admin/me/')
  if (!user.role) {
    clearTokens()
    throw new Error('Access denied: not a staff account')
  }
  localStorage.setItem('admin_user', JSON.stringify(user))
  return { tokens: tokenData, user }
}

export function logout() {
  clearTokens()
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('admin_user') || 'null')
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return !!getTokens()?.access
}

// ── Admin API ─────────────────────────────────────────────────────────────────

export const adminApi = {
  // Dashboard
  getStats: () => apiFetch('/api/admin/stats/'),
  getAnalytics: (months = 12, days = 30) =>
    apiFetch(`/api/admin/analytics/?months=${months}&days=${days}`),

  // Users
  getUsers: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiFetch(`/api/admin/users/?${q}`)
  },
  getUserDetail: (id) => apiFetch(`/api/admin/users/${id}/`),
  userAction: (id, action) =>
    apiFetch(`/api/admin/users/${id}/action/`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }),

  // Subscriptions
  getSubscriptions: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return apiFetch(`/api/admin/subscriptions/?${q}`)
  },
  subscriptionAction: (id, action, extra = {}) =>
    apiFetch(`/api/admin/subscriptions/${id}/action/`, {
      method: 'POST',
      body: JSON.stringify({ action, ...extra }),
    }),

  // Feature flags
  getFlags: () => apiFetch('/api/admin/flags/'),
  toggleFlag: (id) =>
    apiFetch(`/api/admin/flags/${id}/toggle/`, { method: 'POST' }),

  // Logs
  getLogs: (limit = 20) =>
    apiFetch(`/api/admin/logs/?limit=${limit}`),
}

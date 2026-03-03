const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000'

export const endpoints = {
  login: '/api/auth/login/',
  refresh: '/api/auth/token/refresh/',
  register: '/api/auth/register/',
  verify: '/api/auth/verify-email/',
  resend_verification: '/api/auth/resend-verification/',
  me: '/api/auth/me/',
}

function jsonHeaders() {
  return { 'Content-Type': 'application/json' }
}

export async function login(email: string, password: string) {
  const res = await fetch(API_BASE + endpoints.login, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `Login failed: ${res.status}`)
  }
  const data = await res.json()
  // expected { access: '...', refresh: '...'} or { token, refresh }
  const access = data.access || data.token || data.access_token
  const refresh = data.refresh || data.refresh_token
  if (access) localStorage.setItem('access_token', access)
  if (refresh) localStorage.setItem('refresh_token', refresh)
  return data
}

export function setTokens({ access, refresh }: { access?: string; refresh?: string }){
  if (access) localStorage.setItem('access_token', access)
  if (refresh) localStorage.setItem('refresh_token', refresh)
}

export function getAccessToken(){ return localStorage.getItem('access_token') }
export function getRefreshToken(){ return localStorage.getItem('refresh_token') }
export function clearTokens(){ localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token') }

export async function register(payload: { email: string; password: string; name?: string }){
  const res = await fetch(API_BASE + endpoints.register, {
    method: 'POST', headers: jsonHeaders(), body: JSON.stringify(payload)
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function fetchWithAuth(path: string, opts: RequestInit = {}){
  // helper to perform the fetch with current access token
  async function doFetch(token?: string){
    const headers = Object.assign({}, opts.headers || {}, token ? { Authorization: `Bearer ${token}` } : {})
    return fetch(API_BASE + path, { ...opts, headers })
  }

  let token: string | undefined = getAccessToken() || undefined
  let res = await doFetch(token)

  if (res.status === 401) {
    // try to refresh using refresh token
    const refresh = getRefreshToken()
    if (refresh) {
      try {
        const r = await fetch(API_BASE + endpoints.refresh, {
          method: 'POST',
          headers: jsonHeaders(),
          body: JSON.stringify({ refresh }),
        })
        if (r.ok) {
          const data = await r.json()
          const newAccess = (data.access || data.token || data.access_token) as string | undefined
          const newRefresh = (data.refresh || data.refresh_token) as string | undefined
          if (newAccess) localStorage.setItem('access_token', newAccess)
          if (newRefresh) localStorage.setItem('refresh_token', newRefresh)
          // retry original request with new access token
          token = newAccess
          res = await doFetch(token)
        } else {
          // refresh failed
          clearTokens()
          throw new Error('Unauthorized')
        }
      } catch {
        clearTokens()
        throw new Error('Unauthorized')
      }
    } else {
      clearTokens()
      throw new Error('Unauthorized')
    }
  }

  if (!res.ok) throw new Error(await res.text())
  // try to parse JSON, but return raw text on parse failure
  try { return await res.json() } catch { return await res.text() }
}

export async function verifyEmail(token: string){
  const res = await fetch(API_BASE + endpoints.verify, { method: 'POST', headers: jsonHeaders(), body: JSON.stringify({ token }) })
  if(!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function resendVerification(email: string){
  const res = await fetch(API_BASE + endpoints.resend_verification, { method: 'POST', headers: jsonHeaders(), body: JSON.stringify({ email }) })
  if(!res.ok) throw new Error(await res.text())
  return res.json()
}

const api = {
  API_BASE,
  endpoints,
  login,
  register,
  setTokens,
  getAccessToken,
  clearTokens,
  fetchWithAuth,
  verifyEmail,
  resendVerification,
}

export default api

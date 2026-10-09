const API_BASE = 'https://restapiv1.cupzproject.my.id/api'
const API_KEY = process.env.CUPZ_API_KEY || process.env.API_KEY || ''

function errorText(data, fallback) {
  if (!data) return fallback
  if (typeof data === 'string') return data
  return data.message || data.error || data.detail || data.why || fallback
}

function unwrap(data) {
  if (!data || typeof data !== 'object') return data
  return data.data && typeof data.data === 'object' ? { ...data, ...data.data } : data
}

async function call(path, body) {
  if (!API_KEY) return { ok: false, why: 'API key belum dikonfigurasi. Set CUPZ_API_KEY di environment Vercel.' }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(body)
    })

    const text = await response.text()
    let data = null
    try { data = text ? JSON.parse(text) : null } catch { data = text }

    if (!response.ok || (data && data.success === false)) {
      return { ok: false, why: errorText(data, `API error ${response.status}`), raw: data, status: response.status }
    }

    return { ok: true, raw: data, data: unwrap(data) }
  } catch (e) {
    return { ok: false, why: e.message || 'gagal menghubungi API', raw: null }
  }
}

async function link(email) {
  const r = await call('/send-link', { email })
  return { ok: r.ok, why: r.why, raw: r.raw, data: r.data }
}

async function auth(email, magicLink) {
  const r = await call('/verify-link', { email, magicLink })
  if (!r.ok) return r

  const d = r.data || {}
  const profile = d.profile || d.user || d.account || null
  const id = d.idToken || d.id_token || d.token || d.accessToken || d.access_token || null
  const ref = d.refreshToken || d.refresh_token || null
  const uid = d.uid || d.localId || d.local_id || profile?.uid || profile?.localId || profile?.local_id || '-'

  return {
    ok: true,
    email: d.email || profile?.email || email,
    id,
    ref,
    uid,
    baru: Boolean(d.isNewUser ?? d.is_new_user ?? d.newUser ?? d.baru),
    user: profile,
    premium: d.premium || d.membership || d.subscription || null,
    order: d.orderId || d.order_id || d.order || null,
    premiumResponse: d.premiumResponse || d.premium_response || d,
    raw: r.raw,
    data: d
  }
}

module.exports = { link, auth }

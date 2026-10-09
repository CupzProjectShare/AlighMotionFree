const express = require('express')
const auth = require('../../../lib/auth')
const { friendlyApiError } = require('../../../lib/errors')

const router = express.Router()

router.post('/', async (req, res) => {
  const { email, magicLink } = req.body
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, message: 'email wajib diisi.' })
  }
  if (!magicLink || !magicLink.trim()) {
    return res.status(400).json({ success: false, message: 'link dari email wajib diisi.' })
  }

  const em = email.trim().toLowerCase()
  let v
  try {
    v = await auth.auth(em, magicLink.trim())
  } catch (err) {
    return res.status(500).json({ success: false, message: 'aktivasi gagal karena terjadi error server.', code: 'SERVER_ERROR' })
  }
  if (!v.ok) {
    return res.status(v.status >= 400 && v.status < 500 ? v.status : 400).json({
      success: false,
      message: friendlyApiError(v.why),
      code: v.why
    })
  }

  const d = v.data || {}
  const premium = v.premium || d.premium || d.membership || d.subscription || null
  const status = String(d.status || premium?.status || d.membershipStatus || d.membership_status || '').toUpperCase()
  const active = Boolean(
    d.premiumActive ?? d.premium_active ?? d.isPremium ?? d.is_premium ??
    premium?.active ?? premium?.isActive ?? premium?.is_active ??
    status.includes('ACTIVE')
  )
  const now = new Date()
  const until = d.validUntilTimestamp ? new Date(Number(d.validUntilTimestamp)) : new Date(now)
  if (!d.validUntilTimestamp && !d.validUntil && !d.valid_until) until.setFullYear(until.getFullYear() + 1)

  return res.json({
    success: true,
    message: active ? 'verifikasi berhasil, premium aktif.' : 'verifikasi berhasil.',
    data: {
      uid: v.uid,
      email: v.email || em,
      emailVerified: d.emailVerified ?? d.email_verified ?? true,
      displayName: d.displayName ?? d.display_name ?? v.user?.displayName ?? null,
      photoUrl: d.photoUrl ?? d.photo_url ?? v.user?.photoUrl ?? null,
      createdAt: d.createdAt || d.created_at || null,
      lastLoginAt: d.lastLoginAt || d.last_login_at || now.toISOString(),
      isNewUser: v.baru,
      status: d.status || (active ? 'ACTIVE' : 'INACTIVE'),
      membershipStatus: d.membershipStatus || d.membership_status || (active ? 'PREMIUM_ACTIVE' : 'LOGIN_ONLY'),
      planName: d.planName || d.plan_name || premium?.planName || 'Alight Motion Pro / Member',
      subscriptionType: d.subscriptionType || d.subscription_type || premium?.subscriptionType || 'Yearly VIP License',
      orderId: v.order || d.orderId || d.order_id || null,
      activatedAt: d.activatedAt || d.activated_at || now.toISOString(),
      validUntil: d.validUntil || d.valid_until || until.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
      validUntilTimestamp: d.validUntilTimestamp || d.valid_until_timestamp || until.getTime(),
      tokenType: d.tokenType || d.token_type || 'Bearer',
      idToken: v.id,
      refreshToken: v.ref,
      premiumResponse: active ? (v.premiumResponse || premium || d) : null,
      premiumError: active ? null : (d.premiumError || d.premium_error || null),
      profile: v.user || d.profile || null,
      raw: v.raw
    }
  })
})

module.exports = router
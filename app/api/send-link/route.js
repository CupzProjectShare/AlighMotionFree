const express = require('express')
const auth = require('../../../lib/auth')
const { friendlyApiError } = require('../../../lib/errors')

const router = express.Router()


router.post('/', async (req, res) => {
  const { email } = req.body
  if (!email || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({
      success: false,
      message: 'email gak valid.',
      code: 'INVALID_EMAIL'
    })
  }

  const em = email.trim().toLowerCase()
  let r
  try {
    r = await auth.link(em)
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'aktivasi gagal karena terjadi error server.',
      code: 'SERVER_ERROR'
    })
  }

  if (!r.ok) {
    return res.status(400).json({
      success: false,
      message: friendlyApiError(r.why),
      code: r.why
    })
  }

  return res.json({ success: true, email: em, message: `link dikirim ke ${em}. cek inbox / spam.` })
})

module.exports = router
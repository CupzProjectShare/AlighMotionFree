const express = require('express');
const sendLinkRoute = require('./send-link/route');
const verifyLinkRoute = require('./verify-link/route');

const router = express.Router();

router.use('/send-link', sendLinkRoute);
router.use('/verify-link', verifyLinkRoute);

module.exports = router;

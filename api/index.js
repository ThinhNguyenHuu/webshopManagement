const express = require('express');
const router = express.Router();
const analytics = require('../analytics');

router.get('/getOnlineUser', async (req, res) => {
  const onlineUser = await analytics.getOnlineUser();
  res.json({ onlineUser });
});

module.exports = router;
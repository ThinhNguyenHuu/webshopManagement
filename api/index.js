const express = require('express');
const router = express.Router();
const analytics = require('../analytics');
const cache = require('../lru-cache');

router.get('/analytics/getOnlineUser', async (req, res) => {
  analytics.getOnlineUser()
    .then(onlineUser => res.json({ onlineUser }))
    .catch(e => res.json({}));
});

router.get('/analytics/getUserAccess', async (req, res) => {
  analytics.getUserAccessData()
    .then(userAccess => res.json({ userAccess }))
    .catch(e => res.json({}));
});

router.get('/analytics/getTopSearchQuery', async (req, res) => {
  analytics.getTopSearchQueryData() 
    .then(topSearchQuery => res.json({ topSearchQuery }))
    .catch(e => res.json({}));
});

router.get('/analytics/getUserLocation', async (req, res) => {
  analytics.getUserLocationData()
    .then(userLocation => res.json({ userLocation }))
    .catch(e => res.json({}));
});

router.get('/cache/clear', async (req, res) => {
  cache.clear()
    .then(() => res.json({result: true}))
    .catch(e => res.json({}));
});

module.exports = router;
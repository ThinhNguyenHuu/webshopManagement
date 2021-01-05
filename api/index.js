const express = require('express');
const router = express.Router();
const analytics = require('../analytics');

router.get('/getOnlineUser', async (req, res) => {
  analytics.getOnlineUser()
    .then(onlineUser => res.json({ onlineUser }))
    .catch(e => res.json({}));
});

router.get('/getUserAccess', async (req, res) => {
  analytics.getUserAccessData()
    .then(userAccess => res.json({ userAccess }))
    .catch(e => res.json({}));
});

router.get('/getTopSearchQuery', async (req, res) => {
  analytics.getTopSearchQueryData() 
    .then(topSearchQuery => res.json({ topSearchQuery }))
    .catch(e => res.json({}));
});

router.get('/getUserLocation', async (req, res) => {
  analytics.getUserLocationData()
    .then(userLocation => res.json({ userLocation }))
    .catch(e => res.json({}));
});

module.exports = router;
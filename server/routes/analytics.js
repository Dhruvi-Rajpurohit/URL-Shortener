const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const { auth } = require('../middleware/auth');

// Dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    const totalLinks = await Url.countDocuments({ userId: req.userId });
    const urlsWithClicks = await Url.find({ userId: req.userId }).select('clickCount createdAt');

    const totalClicks = urlsWithClicks.reduce((sum, url) => sum + url.clickCount, 0);

    // Last 7 days clicks
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUrls = await Url.find({
      userId: req.userId,
      'clicks.timestamp': { $gte: sevenDaysAgo },
    }).select('clicks');

    const dailyClicks = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      dailyClicks[date.toISOString().split('T')[0]] = 0;
    }

    recentUrls.forEach(url => {
      url.clicks.forEach(click => {
        const day = click.timestamp.toISOString().split('T')[0];
        if (dailyClicks.hasOwnProperty(day)) {
          dailyClicks[day]++;
        }
      });
    });

    res.json({
      success: true,
      data: {
        totalLinks,
        totalClicks,
        dailyClicks,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

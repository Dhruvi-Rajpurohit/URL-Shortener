const express = require('express');
const router = express.Router();
const { nanoid } = require('nanoid');
const validUrl = require('valid-url');
const QRCode = require('qrcode');
const Url = require('../models/Url');
const { auth, optionalAuth } = require('../middleware/auth');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Shorten URL
router.post('/shorten', optionalAuth, async (req, res) => {
  const { originalUrl, customAlias, title, tags, expiresIn } = req.body;

  if (!originalUrl) return res.status(400).json({ error: 'URL is required' });

  // Validate URL
  if (!validUrl.isUri(originalUrl)) {
    return res.status(400).json({ error: 'Invalid URL format. Make sure to include http:// or https://' });
  }

  try {
    // Check custom alias availability
    let shortCode;
    if (customAlias) {
      const existing = await Url.findOne({ shortCode: customAlias });
      if (existing) return res.status(400).json({ error: 'Custom alias already taken. Try another.' });
      shortCode = customAlias;
    } else {
      shortCode = nanoid(7);
      // Ensure uniqueness
      while (await Url.findOne({ shortCode })) {
        shortCode = nanoid(7);
      }
    }

    // Generate QR code
    const shortUrl = `${BASE_URL}/${shortCode}`;
    const qrCode = await QRCode.toDataURL(shortUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#1a1a2e', light: '#ffffff' },
    });

    // Set expiry
    let expiresAt = null;
    if (expiresIn) {
      const days = parseInt(expiresIn);
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }

    const url = new Url({
      originalUrl,
      shortCode,
      customAlias: customAlias || null,
      title: title || '',
      userId: req.userId || null,
      qrCode,
      expiresAt,
      tags: tags || [],
    });

    await url.save();

    res.status(201).json({
      success: true,
      data: {
        _id: url._id,
        originalUrl: url.originalUrl,
        shortUrl,
        shortCode: url.shortCode,
        qrCode: url.qrCode,
        title: url.title,
        tags: url.tags,
        clickCount: url.clickCount,
        expiresAt: url.expiresAt,
        createdAt: url.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while shortening URL' });
  }
});

// Get all URLs for authenticated user
router.get('/my-urls', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = { userId: req.userId };
    if (search) {
      query.$or = [
        { originalUrl: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { shortCode: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Url.countDocuments(query);
    const urls = await Url.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-clicks');

    const urlsWithShortUrl = urls.map(url => ({
      ...url.toObject(),
      shortUrl: `${BASE_URL}/${url.shortCode}`,
    }));

    res.json({
      success: true,
      data: urlsWithShortUrl,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single URL stats
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const url = await Url.findOne({ _id: req.params.id, userId: req.userId });
    if (!url) return res.status(404).json({ error: 'URL not found' });

    // Aggregate click data
    const browserStats = {};
    const osStats = {};
    const deviceStats = {};
    const clicksByDay = {};

    url.clicks.forEach(click => {
      browserStats[click.browser] = (browserStats[click.browser] || 0) + 1;
      osStats[click.os] = (osStats[click.os] || 0) + 1;
      deviceStats[click.device] = (deviceStats[click.device] || 0) + 1;

      const day = click.timestamp.toISOString().split('T')[0];
      clicksByDay[day] = (clicksByDay[day] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        url: { ...url.toObject(), shortUrl: `${BASE_URL}/${url.shortCode}` },
        stats: { browserStats, osStats, deviceStats, clicksByDay },
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete URL
router.delete('/:id', auth, async (req, res) => {
  try {
    const url = await Url.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!url) return res.status(404).json({ error: 'URL not found' });
    res.json({ success: true, message: 'URL deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update URL
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, tags } = req.body;
    const url = await Url.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, tags },
      { new: true }
    );
    if (!url) return res.status(404).json({ error: 'URL not found' });
    res.json({ success: true, data: { ...url.toObject(), shortUrl: `${BASE_URL}/${url.shortCode}` } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

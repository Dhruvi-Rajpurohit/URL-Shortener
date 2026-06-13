const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  ip: String,
  browser: String,
  os: String,
  device: String,
  referer: String,
});

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    trim: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  customAlias: {
    type: String,
    sparse: true,
    trim: true,
  },
  title: {
    type: String,
    trim: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  qrCode: {
    type: String, // base64 data URL
  },
  clicks: [clickSchema],
  clickCount: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  tags: [String],
}, {
  timestamps: true,
});

urlSchema.index({ shortCode: 1 });
urlSchema.index({ userId: 1 });
urlSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Url', urlSchema);

const mongoose = require('mongoose');

const B2BATokenSchema = new mongoose.Schema({
  serial: {
    type: String,
    required: true,
    unique: true
  },
  tokenCode: {
    type: String,
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true
  },
  agentName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  businessType: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  commission: {
    type: Number,
    required: true
  },
  maxUses: {
    type: Number,
    required: true,
    default: 1
  },
  currentUses: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'redeemed', 'expired'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  redeemedAt: {
    type: Date,
    default: null
  },
  redeemerName: {
    type: String,
    default: null
  },
  redeemerPhone: {
    type: String,
    default: null
  },
  redeemerResidence: {
    type: String,
    default: null
  },
  billAmount: {
    type: Number,
    default: null
  },
  expirationDate: {
    type: Date,
    default: null
  },
  redemptions: [
    {
      date: { type: Date, default: Date.now },
      redeemerName: String,
      redeemerPhone: String,
      redeemerResidence: String,
      billAmount: Number
    }
  ],
  totalBusiness: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('B2BAToken', B2BATokenSchema); 
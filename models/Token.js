const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  serial: {
    type: Number,
    required: true,
    unique: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  ownerName: {
    type: String,
    required: true
  },
  ownerPhone: {
    type: String,
    required: true
  },
  residence: {
    type: String,
    required: true
  },
  ownerBusiness: {
    type: Number,
    default: 0
  },
  redeemerBusiness: [{
    redeemerName: String,
    amount: Number
  }],
  totalBusiness: {
    type: Number,
    default: 0
  },
  uses: {
    type: Number,
    default: 0
  },
  maxUses: {
    type: Number,
    default: 5
  },
  status: {
    type: String,
    enum: ['Active', 'Expired'],
    default: 'Active'
  },
  issueDate: {
    type: String,
    required: true
  },
  expirationDate: {
    type: String,
    required: true
  },
  redemptions: [{
    date: String,
    redeemerName: String,
    redeemerPhone: String,
    note: String
  }],
  remainingDays: String,
  statusColor: String
});

// Add a method to update status and remaining days
tokenSchema.methods.updateStatus = function() {
  const today = new Date();
  const expDate = new Date(this.expirationDate);
  const isExpired = expDate < today || this.uses >= this.maxUses;
  
  // Calculate total business
  const redeemerTotal = this.redeemerBusiness.reduce((sum, b) => sum + (b.amount || 0), 0);
  this.totalBusiness = this.ownerBusiness + redeemerTotal;
  
  this.status = isExpired ? 'Expired' : 'Active';
  this.statusColor = this.status === 'Expired' ? 'red' : 'green';
  
  // Calculate remaining days
  const diffTime = Math.abs(expDate - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  this.remainingDays = expDate < today ? 'Expired' : `${diffDays} days left`;
  
  return this;
};

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token; 
const mongoose = require('mongoose');

const b2bTokenSchema = new mongoose.Schema({
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
  businessName: {
    type: String,
    required: true
  },
  businessOwner: {
    type: String,
    required: true
  },
  businessPhone: {
    type: String,
    required: true
  },
  businessType: {
    type: String,
    required: true
  },
  businessLocation: {
    type: String,
    required: true
  },
  instagramProfile: {
    type: String,
    required: true
  },
  maxUses: {
    type: Number,
    required: true
  },
  currentUses: {
    type: Number,
    default: 0
  },
  totalBusiness: {
    type: Number,
    default: 0
  },
  issueDate: {
    type: Date,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true
  },
  remainingDays: {
    type: String,
    default: '365 days left'
  },
  status: {
    type: String,
    enum: ['Active', 'Expired'],
    default: 'Active'
  },
  redemptions: [{
    redeemerName: String,
    redeemerPhone: String,
    redeemerResidence: String,
    billAmount: Number,
    redemptionDate: {
      type: Date,
      default: Date.now
    }
  }]
});

// Method to update token status and remaining days
b2bTokenSchema.methods.updateStatus = function() {
  const today = new Date();
  const expDate = new Date(this.expirationDate);
  const isExpired = expDate < today || this.currentUses >= this.maxUses;
  
  // Calculate total business
  this.totalBusiness = this.redemptions.reduce((sum, r) => sum + (r.billAmount || 0), 0);
  
  this.status = isExpired ? 'Expired' : 'Active';
  
  // Calculate remaining days
  const diffTime = Math.abs(expDate - today);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  this.remainingDays = expDate < today ? 'Expired' : `${diffDays} days left`;
  
  return this;
};

// Method to extend token expiration
b2bTokenSchema.methods.extendToken = function(days) {
  const currentExpDate = new Date(this.expirationDate);
  currentExpDate.setDate(currentExpDate.getDate() + days);
  this.expirationDate = currentExpDate;
  this.updateStatus();
  return this;
};

// Method to generate WhatsApp message
b2bTokenSchema.methods.generateWhatsAppMessage = function() {
  return `🌟 *KALON SALON & ACADEMY* 🌟
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 *YOUR B2B TOKEN DETAILS*

🔖 *Token Information:*
*Serial:* ${this.serial}
*Code:* ${this.token}
*Status:* ${this.status}
*Expires:* ${this.expirationDate.toLocaleDateString()}
*Days Left:* ${this.remainingDays}

🏢 *Business Details:*
*Name:* ${this.businessName}
*Owner:* ${this.businessOwner}
*Phone:* ${this.businessPhone}
*Type:* ${this.businessType}
*Location:* ${this.businessLocation}
*Instagram:* ${this.instagramProfile}

💰 *Business Summary:*
*Total Business:* ₹${this.totalBusiness}
*Uses:* ${this.currentUses}/${this.maxUses}

📊 *Redemption History:*
${this.redemptions.map((r, i) => `
*Customer ${i + 1}:*
*Name:* ${r.redeemerName}
*Phone:* ${r.redeemerPhone}
*Address:* ${r.redeemerResidence}
*Bill Amount:* ₹${r.billAmount}
*Date:* ${new Date(r.redemptionDate).toLocaleDateString()}`).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📸 *Follow us on Instagram* ⬇️
https://bit.ly/3F7Bv1E

_Thank you for your business!_ 💝`;
};

const B2BToken = mongoose.model('B2BToken', b2bTokenSchema);

module.exports = B2BToken; 
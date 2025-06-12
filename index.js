const express = require("express");
const cors = require("cors");
const connectDB = require('./db');
const Token = require('./models/Token');
const PDFDocument = require("pdfkit");
const B2BToken = require('./models/B2BToken');
const B2BAToken = require('./models/B2BAToken');
require('dotenv').config();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const LOCAL_IP = "localhost";

app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Helper function to generate token code
function generateTokenCode() {
  const prefix = 'K1';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + code;
}

// Helper function to get next serial number
async function getNextSerial() {
  const lastToken = await Token.findOne().sort({ serial: -1 });
  return lastToken ? lastToken.serial + 1 : 1;
}

// Helper function to get next B2B serial number
async function getNextB2BSerial() {
  const lastToken = await B2BToken.findOne().sort({ serial: -1 });
  return lastToken ? lastToken.serial + 1 : 1;
}

// Helper function to get next B2BA serial number
async function getNextB2BASerial() {
  const lastToken = await B2BAToken.findOne().sort({ serial: -1 });
  return lastToken ? parseInt(lastToken.serial) + 1 : 1;
}

// Helper function to generate B2B token code
function generateB2BTokenCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = 'B1';
  for (let i = 0; i < 5; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return code;
}

// Helper function to generate B2BA token code
function generateB2BATokenCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = 'A1';
  for (let i = 0; i < 5; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return code;
}

function calculateRemainingDays(expirationDate) {
  if (!expirationDate) return 'N/A';
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? `${diffDays} days left` : "Expired";
}

function updateTokenStatus(token) {
  const remaining = calculateRemainingDays(token.expirationDate);
  const usesExceeded = token.uses >= token.maxUses;
  const isDateExpired = remaining === "Expired";
  
  // Calculate total business
  const redeemerTotal = token.redeemerBusiness.reduce((sum, b) => sum + b.amount, 0);
  token.totalBusiness = token.ownerBusiness + redeemerTotal;

  // Check if token should be reissued - only if under 40k
  if (usesExceeded && token.totalBusiness < 40000) {
    const previousUses = token.uses;  // Store previous uses
    token.maxUses += 5;  // Increase max uses by 5
    token.uses = previousUses;  // Keep the previous uses count
    token.status = "Active";  // Reactivate the token
  } else {
    // For tokens with business >= 40k, normal expiry rules apply
    token.status = (usesExceeded || isDateExpired) ? "Expired" : "Active";
  }
  
  token.remainingDays = remaining;
  token.statusColor = token.status === "Expired" ? "red" : "green";

  return token;
}

// Root route welcome message
app.get("/", (req, res) => {
  res.send("<h1>🎉 Kalon Salon Token System is Running!</h1><p>Use the API to create, redeem, or manage tokens.</p>");
});

// Create new token
app.post("/create-token", async (req, res) => {
  try {
    const { ownerName, ownerPhone, residence, ownerBusiness = 0 } = req.body;

    const serial = await getNextSerial();
    const tokenCode = generateTokenCode();

    const issueDate = new Date();
    const expirationDate = new Date(issueDate);
    expirationDate.setFullYear(issueDate.getFullYear() + 1);

    const newToken = new Token({
      serial,
      token: tokenCode,
      ownerName,
      ownerPhone,
      residence,
      ownerBusiness,
      redeemerBusiness: [],
      totalBusiness: ownerBusiness,
      uses: 0,
      maxUses: 5,
      status: "Active",
      issueDate: issueDate.toISOString().split("T")[0],
      expirationDate: expirationDate.toISOString().split("T")[0],
      redemptions: [],
    });

    newToken.updateStatus();
    await newToken.save();

    res.json({ message: "Token created", token: newToken });
  } catch (error) {
    console.error('Error creating token:', error);
    res.status(500).json({ message: "Error creating token" });
  }
});

// Redeem token
app.post("/redeem-token/:tokenCode", async (req, res) => {
  try {
    const tokenCode = req.params.tokenCode.toUpperCase();
    const { redeemerName, redeemerPhone, amount = 0 } = req.body;

    const token = await Token.findOne({ token: tokenCode });
    if (!token) return res.status(404).json({ message: "Token not found" });

    // Calculate current totals for reissue check
    const redeemerTotal = token.redeemerBusiness.reduce((sum, b) => sum + b.amount, 0);
    const currentTotal = redeemerTotal + token.ownerBusiness;
    const usesExceeded = token.uses >= token.maxUses;

    // Handle reissuance if needed - only if under 40k
    if (usesExceeded && currentTotal < 40000) {
      console.log(`Reissuing token ${token.token} - Current business: ₹${currentTotal}`);
      const previousUses = token.uses;
      token.maxUses += 5;
      token.uses = previousUses;
      token.redemptions.push({
        date: new Date().toISOString().split("T")[0],
        redeemerName: "SYSTEM",
        redeemerPhone: "-",
        note: `Token reissued - Business (₹${currentTotal}) under ₹40,000 - Previous uses: ${previousUses}, New max uses: ${token.maxUses}`
      });
    }

    token.updateStatus();
    
    if (token.status === "Expired") {
      return res.status(400).json({ message: "Token is expired" });
    }

    token.uses += 1;
    token.redemptions.push({
      date: new Date().toISOString().split("T")[0],
      redeemerName,
      redeemerPhone,
    });

    token.redeemerBusiness.push({ redeemerName, amount });
    token.updateStatus();
    await token.save();

    res.json({ message: "Token redeemed successfully", token });
  } catch (error) {
    console.error('Error redeeming token:', error);
    res.status(500).json({ message: "Error redeeming token" });
  }
});

// Edit token
app.put("/edit-token/:serial", async (req, res) => {
  try {
    const serial = parseInt(req.params.serial);
    const { ownerName, ownerPhone, residence, ownerBusiness } = req.body;

    const token = await Token.findOne({ serial });
    if (!token) return res.status(404).json({ message: "Token not found" });

    token.ownerName = ownerName;
    token.ownerPhone = ownerPhone;
    token.residence = residence;
    token.ownerBusiness = ownerBusiness;
    token.updateStatus();
    await token.save();

    res.json({ message: "Token updated", token });
  } catch (error) {
    console.error('Error updating token:', error);
    res.status(500).json({ message: "Error updating token" });
  }
});

// Delete token
app.delete("/delete-token/:serial", async (req, res) => {
  try {
    const serial = parseInt(req.params.serial);
    const result = await Token.deleteOne({ serial });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Token not found" });
    }

    res.json({ message: "Token deleted" });
  } catch (error) {
    console.error('Error deleting token:', error);
    res.status(500).json({ message: "Error deleting token" });
  }
});

// Get all tokens
app.get("/api/tokens", async (req, res) => {
  try {
    const tokens = await Token.find();
    tokens.forEach(token => token.updateStatus());
    res.json({ tokens });
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ message: "Error fetching tokens" });
  }
});

// Get single token with WhatsApp link (UPDATED)
app.get("/token/:serial", async (req, res) => {
  try {
    const serial = parseInt(req.params.serial);
    const token = await Token.findOne({ serial });

    if (!token) return res.status(404).json({ message: "Token not found" });

    // Update token status and recalculate business totals
    token.updateStatus();
    await token.save();

    // Calculate redeemer total
    const redeemerTotal = token.redeemerBusiness.reduce((sum, b) => sum + b.amount, 0);

    // Find the reissuance point in redemptions
    const reissueIndex = token.redemptions.findIndex(r => r.redeemerName === "SYSTEM");
    const originalRedemptions = reissueIndex !== -1 ? token.redemptions.slice(0, reissueIndex) : token.redemptions;
    const reissuedRedemptions = reissueIndex !== -1 ? token.redemptions.slice(reissueIndex + 1) : [];
    const reissueInfo = reissueIndex !== -1 ? token.redemptions[reissueIndex] : null;

    let message = `*KALON SALON & ACADEMY💇🏻‍♂️*\n\n*🎟Your Referral Token Details :-*\n\n`;
    
    // Basic token info
    message += `Serial: ${token.serial}\n`;
    message += `Token Code: ${token.token}\n`;
    message += `Owner Name: ${token.ownerName}\n`;
    message += `Owner Phone: ${token.ownerPhone}\n`;
    message += `Residence: ${token.residence}\n`;
    message += `Uses: ${token.uses}/${token.maxUses}${token.maxUses > 5 ? ' (Reissued)' : ''}\n`;
    message += `Status: ${token.status}\n`;
    message += `Issue Date: ${token.issueDate}\n`;
    message += `Expiration Date: ${token.expirationDate}\n`;
    message += `Remaining Days: ${token.remainingDays}\n\n`;

    // Business amounts in bold
    message += `*Business Summary:*\n`;
    message += `*Owner Business*: ₹${token.ownerBusiness}\n`;
    message += `*Total Redeemer Contribution*: ₹${redeemerTotal}\n`;
    message += `*Total Business*: ₹${token.totalBusiness}\n\n`;

    // Original redemptions
    if (originalRedemptions.length > 0) {
      message += `*🧾 Original Token Redemptions:*\n`;
      originalRedemptions.forEach((r, i) => {
        const amountEntry = token.redeemerBusiness.find(b => b.redeemerName === r.redeemerName);
        const amountText = amountEntry ? ` - ₹${amountEntry.amount}` : "";
        message += `${i + 1}. ${r.redeemerName} - ${r.redeemerPhone} on ${r.date}${amountText}\n`;
      });
      message += '\n';
    }

    // Reissuance information
    if (reissueInfo) {
      message += `*🔄 Token Reissuance:*\n`;
      message += `${reissueInfo.note}\n\n`;
    }

    // Reissued redemptions
    if (reissuedRedemptions.length > 0) {
      message += `*🧾 Reissued Token Redemptions:*\n`;
      reissuedRedemptions.forEach((r, i) => {
        const amountEntry = token.redeemerBusiness.find(b => b.redeemerName === r.redeemerName);
        const amountText = amountEntry ? ` - ₹${amountEntry.amount}` : "";
        message += `${i + 1}. ${r.redeemerName} - ${r.redeemerPhone} on ${r.date}${amountText}\n`;
      });
      message += '\n';
    }

    // Footer
    message += `*Follow us on Instagram here⬇ :*\n`;
    message += `https://bit.ly/3F7Bv1E\n\n`;
    message += `_Thanks for your Kind visit💌_`;

    const encoded = encodeURIComponent(message);
    const phone = token.ownerPhone || "0000000000";
    const whatsappLink = `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`;

    res.json({ ...token.toObject(), whatsappLink });
  } catch (error) {
    console.error('Error getting token details:', error);
    res.status(500).json({ message: "Error getting token details" });
  }
});

// Filter by owner
app.get("/tokens/owner/:phone", async (req, res) => {
  try {
    const phone = req.params.phone;
    const tokens = await Token.find({ ownerPhone: phone });
    tokens.forEach(token => token.updateStatus());
    res.json(tokens);
  } catch (error) {
    console.error('Error filtering tokens by owner:', error);
    res.status(500).json({ message: "Error filtering tokens" });
  }
});

// Generate PDF report
app.get("/api/reports/:type", async (req, res) => {
  try {
    const { type } = req.params;
    
    // Get all tokens and filter based on type
    let query = {};
    switch (type) {
      case 'active':
        query.status = 'Active';
        break;
      case 'expired':
        query.status = 'Expired';
        break;
      case 'reissued':
        query.maxUses = { $gt: 5 };
        break;
      // 'all' case - no filtering needed
      default:
        break;
    }

    const tokens = await Token.find(query);
    tokens.forEach(token => token.updateStatus());

    // Create PDF document
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${type}-tokens-report.pdf`);

    // Pipe the PDF document to the response
    doc.pipe(res);

    // Add content to PDF
    doc.fontSize(20).text(`Kalon Salon & Academy - ${type.toUpperCase()} Tokens Report`, {
      align: 'center'
    });
    doc.moveDown();
    
    // Add date
    doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, {
      align: 'right'
    });
    doc.moveDown();

    // Add tokens table
    tokens.forEach((token, index) => {
      doc.fontSize(14).text(`Token ${index + 1}:`, { underline: true });
      doc.fontSize(12).text(`
        Token Code: ${token.token}
        Owner: ${token.ownerName}
        Phone: ${token.ownerPhone}
        Residence: ${token.residence}
        Status: ${token.status}
        Uses: ${token.uses}/${token.maxUses}
        Total Business: ₹${token.totalBusiness}
        Issue Date: ${token.issueDate}
        Expiration Date: ${token.expirationDate}
        Remaining Days: ${token.remainingDays}
      `);

      // Add business details
      doc.moveDown();
      doc.fontSize(12).text('Business Details:', { underline: true });
      doc.text(`Owner Business: ₹${token.ownerBusiness}`);
      const redeemerTotal = token.redeemerBusiness.reduce((sum, b) => sum + (b.amount || 0), 0);
      doc.text(`Total Redeemer Contribution: ₹${redeemerTotal}`);
      doc.text(`Total Business: ₹${token.totalBusiness}`);

      // Add redemption history
      if (token.redemptions && token.redemptions.length > 0) {
        doc.moveDown();
        doc.fontSize(12).text('Redemption History:', { underline: true });
        token.redemptions.forEach((redemption, idx) => {
          const amountEntry = token.redeemerBusiness.find(b => b.redeemerName === redemption.redeemerName);
          const amountText = amountEntry ? ` - ₹${amountEntry.amount}` : "";
          doc.text(`${idx + 1}. ${redemption.date}: ${redemption.redeemerName} (${redemption.redeemerPhone})${amountText}`);
          if (redemption.note) {
            doc.text(`   Note: ${redemption.note}`, { indent: 20 });
          }
        });
      }

      doc.moveDown(2);
    });
    
    // Add summary
    doc.moveDown();
    doc.fontSize(14).text('Summary:', { underline: true });
    doc.fontSize(12).text(`
      Total Tokens: ${tokens.length}
      Total Business: ₹${tokens.reduce((sum, token) => sum + token.totalBusiness, 0)}
      Active Tokens: ${tokens.filter(t => t.status === 'Active').length}
      Expired Tokens: ${tokens.filter(t => t.status === 'Expired').length}
      Reissued Tokens: ${tokens.filter(t => t.maxUses > 5).length}
    `);
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
});

// Create new B2B token
app.post("/api/b2b/create-token", async (req, res) => {
  try {
    const {
      businessName,
      businessOwner,
      businessPhone,
      businessType,
      businessLocation,
      instagramProfile,
      maxUses
    } = req.body;

    const serial = await getNextB2BSerial();
    const tokenCode = generateB2BTokenCode();

    const issueDate = new Date();
    const expirationDate = new Date(issueDate);
    expirationDate.setFullYear(issueDate.getFullYear() + 1);

    const newToken = new B2BToken({
      serial,
      token: tokenCode,
      businessName,
      businessOwner,
      businessPhone,
      businessType,
      businessLocation,
      instagramProfile,
      maxUses,
      issueDate,
      expirationDate
    });

    newToken.updateStatus();
    await newToken.save();

    res.json({ message: "B2B Token created", token: newToken });
  } catch (error) {
    console.error('Error creating B2B token:', error);
    res.status(500).json({ message: "Error creating B2B token" });
  }
});

// Redeem B2B token
app.post("/api/b2b/redeem-token/:tokenCode", async (req, res) => {
  try {
    const tokenCode = req.params.tokenCode.toUpperCase();
    const { redeemerName, redeemerPhone, redeemerResidence, billAmount } = req.body;

    const token = await B2BToken.findOne({ token: tokenCode });
    if (!token) return res.status(404).json({ message: "B2B Token not found" });

    if (token.status === "Expired") {
      return res.status(400).json({ message: "B2B Token is expired" });
    }

    if (token.currentUses >= token.maxUses) {
      return res.status(400).json({ message: "B2B Token has reached maximum uses" });
    }

    token.currentUses += 1;
    token.redemptions.push({
      redeemerName,
      redeemerPhone,
      redeemerResidence,
      billAmount: Number(billAmount)
    });

    token.updateStatus();
    await token.save();

    res.json({ message: "B2B Token redeemed successfully", token });
  } catch (error) {
    console.error('Error redeeming B2B token:', error);
    res.status(500).json({ message: "Error redeeming B2B token" });
  }
});

// Get all B2B tokens
app.get("/api/b2b/tokens", async (req, res) => {
  try {
    const tokens = await B2BToken.find();
    for (const token of tokens) {
      token.updateStatus();
      await token.save();
    }
    res.json({ tokens });
  } catch (error) {
    console.error('Error fetching B2B tokens:', error);
    res.status(500).json({ message: "Error fetching B2B tokens" });
  }
});

// Extend B2B token
app.put("/api/b2b/extend-token/:tokenCode", async (req, res) => {
  try {
    const { days } = req.body;
    const tokenCode = req.params.tokenCode.toUpperCase();

    const token = await B2BToken.findOne({ token: tokenCode });
    if (!token) return res.status(404).json({ message: "B2B Token not found" });

    token.extendToken(Number(days));
    await token.save();

    res.json({ message: "B2B Token extended successfully", token });
  } catch (error) {
    console.error('Error extending B2B token:', error);
    res.status(500).json({ message: "Error extending B2B token" });
  }
});

// Get B2B reports
app.get("/api/b2b/reports", async (req, res) => {
  try {
    const tokens = await B2BToken.find();
    tokens.forEach(token => token.updateStatus());

    // Calculate business partner rankings
    const businessPartners = tokens.map(token => ({
      businessName: token.businessName,
      businessOwner: token.businessOwner,
      businessType: token.businessType,
      totalBusiness: token.totalBusiness,
      activeTokens: token.status === 'Active' ? 1 : 0,
      expiredTokens: token.status === 'Expired' ? 1 : 0
    }));

    // Sort by total business
    businessPartners.sort((a, b) => b.totalBusiness - a.totalBusiness);

    // Calculate totals
    const totalBusiness = businessPartners.reduce((sum, bp) => sum + bp.totalBusiness, 0);
    const activeTokens = businessPartners.reduce((sum, bp) => sum + bp.activeTokens, 0);
    const expiredTokens = businessPartners.reduce((sum, bp) => sum + bp.expiredTokens, 0);

    res.json({
      businessPartners,
      summary: {
        totalBusiness,
        activeTokens,
        expiredTokens,
        totalPartners: businessPartners.length
      }
    });
  } catch (error) {
    console.error('Error generating B2B report:', error);
    res.status(500).json({ message: "Error generating B2B report" });
  }
});

// Delete B2B token
app.delete("/api/b2b/tokens/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await B2BToken.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ message: "B2B Token not found" });
    }

    res.json({ message: "B2B Token deleted successfully" });
  } catch (error) {
    console.error('Error deleting B2B token:', error);
    res.status(500).json({ message: "Error deleting B2B token" });
  }
});

// Get single B2B token with WhatsApp link
app.get("/api/b2b/token/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching B2B token with ID:', id);
    
    const token = await B2BToken.findById(id);
    console.log('Token found:', token ? 'Yes' : 'No');

    if (!token) {
      console.log('Token not found for ID:', id);
      return res.status(404).json({ message: "B2B Token not found" });
    }

    // Update token status
    token.updateStatus();
    await token.save();
    console.log('Token status updated');

    // Generate message using the model's method
    const message = token.generateWhatsAppMessage();
    console.log('Message generated');

    const encoded = encodeURIComponent(message);
    const phone = token.businessPhone || "0000000000";
    const whatsappLink = `https://web.whatsapp.com/send?phone=${phone}&text=${encoded}`;
    console.log('WhatsApp link generated');

    res.json({ ...token.toObject(), whatsappLink });
  } catch (error) {
    console.error('Error getting B2B token details:', error);
    res.status(500).json({ 
      message: "Error getting B2B token details",
      error: error.message 
    });
  }
});

// B2BA Token Creation
app.post("/api/b2ba/tokens", async (req, res) => {
  try {
    const {
      businessName,
      agentName,
      phone,
      businessType,
      region,
      commission,
      numberOfTokens
    } = req.body;

    // Validate required fields
    if (!businessName || !agentName || !phone || !businessType || !region || !commission || !numberOfTokens) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate number of uses
    const maxUses = parseInt(numberOfTokens);
    if (isNaN(maxUses) || maxUses <= 0 || maxUses > 500) {
      return res.status(400).json({ error: "Number of uses must be between 1 and 500" });
    }

    // Get next serial number
    const serial = await getNextB2BASerial();
    const tokenCode = generateB2BATokenCode();

    // Set expirationDate to 1 year from now and remainingDays to 365
    const now = new Date();
    const expirationDate = new Date(now);
    expirationDate.setDate(expirationDate.getDate() + 365);

    // Create single token with multiple uses
    const token = new B2BAToken({
      serial: serial.toString(),
      tokenCode,
      businessName,
      agentName,
      phone,
      businessType,
      region,
      commission,
      maxUses,
      currentUses: 0,
      status: "active",
      expirationDate,
      redemptions: [],
      totalBusiness: 0,
      remainingDays: 365
    });

    await token.save();
    const obj = token.toObject();
    obj.remainingDays = 365;
    res.status(201).json({
      message: "Token created successfully",
      token: obj
    });
  } catch (error) {
    console.error("Error creating B2BA token:", error);
    res.status(500).json({ error: "Failed to create token" });
  }
});

// B2BA Token Redemption
app.post("/api/b2ba/tokens/redeem", async (req, res) => {
  try {
    const {
      tokenCode,
      redeemerName,
      redeemerPhone,
      redeemerResidence,
      billAmount
    } = req.body;

    // Validate required fields
    if (!tokenCode || !redeemerName || !redeemerPhone || !redeemerResidence || !billAmount) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Find token
    const token = await B2BAToken.findOne({ tokenCode });
    if (!token) {
      return res.status(404).json({ error: "Token not found" });
    }

    if (token.status === "expired") {
      return res.status(400).json({ error: "Token has expired" });
    }

    // Check if token has reached max uses
    if (token.currentUses >= token.maxUses) {
      token.status = "expired";
      await token.save();
      return res.status(400).json({ error: "Token has reached maximum uses" });
    }

    // Update token
    token.currentUses += 1;
    if (token.currentUses >= token.maxUses) {
      token.status = "expired";
    }
    token.redeemedAt = new Date();
    token.redeemerName = redeemerName;
    token.redeemerPhone = redeemerPhone;
    token.redeemerResidence = redeemerResidence;
    token.billAmount = billAmount;
    // Push redemption to redemptions array
    token.redemptions.push({
      date: new Date(),
      redeemerName,
      redeemerPhone,
      redeemerResidence,
      billAmount
    });
    // Recalculate totalBusiness
    token.totalBusiness = token.redemptions.reduce((sum, r) => sum + (r.billAmount || 0), 0);

    token.remainingDays = calculateRemainingDays(token.expirationDate);
    await token.save();
    const obj = token.toObject();
    obj.remainingDays = token.remainingDays;
    res.json({
      message: "Token redeemed successfully",
      token: obj,
      remainingUses: token.maxUses - token.currentUses
    });
  } catch (error) {
    console.error("Error redeeming B2BA token:", error);
    res.status(500).json({ error: "Failed to redeem token" });
  }
});

// B2BA Token Extension (PUT)
app.put("/api/b2ba/tokens/extend/:tokenCode", async (req, res) => {
  try {
    const { days } = req.body;
    const { tokenCode } = req.params;
    if (!days || isNaN(days) || days <= 0) {
      return res.status(400).json({ error: "Invalid number of days" });
    }
    const token = await B2BAToken.findOne({ tokenCode });
    if (!token) {
      return res.status(404).json({ error: "Token not found" });
    }
    // Always convert expirationDate to Date object before updating
    let expDate = new Date(token.expirationDate);
    expDate.setDate(expDate.getDate() + parseInt(days));
    token.expirationDate = expDate;
    // Always recalculate remainingDays from new expirationDate
    token.remainingDays = calculateRemainingDays(token.expirationDate);
    await token.save();
    const obj = token.toObject();
    obj.remainingDays = token.remainingDays;
    res.json({ message: "Token extended successfully", token: obj });
  } catch (error) {
    console.error("Error extending B2BA token:", error);
    res.status(500).json({ error: "Failed to extend token" });
  }
});

// Get all B2BA tokens
app.get("/api/b2ba/tokens", async (req, res) => {
  try {
    const tokens = await B2BAToken.find({}).sort({ serial: 1 });
    const tokensWithDays = tokens.map(token => {
      const obj = token.toObject();
      obj.remainingDays = calculateRemainingDays(token.expirationDate);
      return obj;
    });
    res.json({ tokens: tokensWithDays });
  } catch (error) {
    console.error("Error fetching B2BA tokens:", error);
    res.status(500).json({ error: "Failed to fetch tokens" });
  }
});

// Get B2BA reports summary
app.get("/api/b2ba/reports", async (req, res) => {
  try {
    const tokens = await B2BAToken.find({}).sort({ serial: 1 });
    
    // Calculate summary statistics
    const activeTokens = tokens.filter(t => t.status === 'active').length;
    const expiredTokens = tokens.filter(t => t.status === 'expired').length;
    const totalBusiness = tokens.reduce((sum, t) => sum + (t.totalBusiness || 0), 0);

    // Process tokens for display
    const processedTokens = tokens.map(token => {
      const obj = token.toObject();
      obj.remainingDays = calculateRemainingDays(token.expirationDate);
      return obj;
    });

    res.json({
      summary: {
        totalTokens: tokens.length,
        activeTokens,
        expiredTokens,
        totalBusiness
      },
      tokens: processedTokens
    });
  } catch (error) {
    console.error("Error generating B2BA report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// Get B2BA token by serial
app.get("/api/b2ba/tokens/:serial", async (req, res) => {
  try {
    const token = await B2BAToken.findOne({ serial: req.params.serial });
    if (!token) {
      return res.status(404).json({ error: "Token not found" });
    }
    res.json({ token });
  } catch (error) {
    console.error("Error fetching B2BA token:", error);
    res.status(500).json({ error: "Failed to fetch token" });
  }
});

// Generate B2BA reports by type
app.get("/api/b2ba/reports/:type", async (req, res) => {
  try {
    const { type } = req.params;
    let query = {};

    switch (type) {
      case "active":
        query = { status: "active" };
        break;
      case "redeemed":
        query = { status: "redeemed" };
        break;
      case "expired":
        query = { status: "expired" };
        break;
      case "all":
      default:
        query = {};
    }

    const tokens = await B2BAToken.find(query).sort({ createdAt: -1 });

    // Generate PDF report
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=b2ba-${type}-report.pdf`);

    doc.pipe(res);

    // Add report content
    doc.fontSize(20).text("B2BA Token Report", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Report Type: ${type.toUpperCase()}`, { align: "center" });
    doc.moveDown();

    tokens.forEach((token, index) => {
      doc.fontSize(10).text(`Token ${index + 1}:`);
      doc.text(`Serial: ${token.serial}`);
      doc.text(`Business Name: ${token.businessName}`);
      doc.text(`Agent Name: ${token.agentName}`);
      doc.text(`Phone: ${token.phone}`);
      doc.text(`Business Type: ${token.businessType}`);
      doc.text(`Region: ${token.region}`);
      doc.text(`Commission: ${token.commission}%`);
      doc.text(`Status: ${token.status}`);
      doc.text(`Created: ${new Date(token.createdAt).toLocaleDateString()}`);
      if (token.status === "redeemed") {
        doc.text(`Redeemed By: ${token.redeemerName}`);
        doc.text(`Redeemed At: ${new Date(token.redeemedAt).toLocaleDateString()}`);
        doc.text(`Bill Amount: ${token.billAmount}`);
      }
      doc.moveDown();
    });

    doc.end();
  } catch (error) {
    console.error("Error generating B2BA report:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

// Temporary endpoint to delete all B2BA tokens
app.delete("/api/b2ba/tokens/delete-all", async (req, res) => {
  try {
    await B2BAToken.deleteMany({});
    res.json({ message: "All B2BA tokens deleted successfully" });
  } catch (error) {
    console.error("Error deleting B2BA tokens:", error);
    res.status(500).json({ error: "Failed to delete tokens" });
  }
});

// Test endpoint to check B2BA tokens
app.get("/api/b2ba/tokens/test", async (req, res) => {
  try {
    const count = await B2BAToken.countDocuments();
    const sample = await B2BAToken.find().limit(5);
    res.json({
      totalTokens: count,
      sampleTokens: sample,
      collectionName: B2BAToken.collection.name
    });
  } catch (error) {
    console.error("Error checking B2BA tokens:", error);
    res.status(500).json({ error: "Failed to check tokens" });
  }
});

// Delete a single B2BA token by tokenCode
app.delete("/api/b2ba/tokens/:tokenCode", async (req, res) => {
  try {
    const { tokenCode } = req.params;
    const result = await B2BAToken.deleteOne({ tokenCode });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Token not found" });
    }
    res.json({ message: "Token deleted successfully" });
  } catch (error) {
    console.error("Error deleting B2BA token:", error);
    res.status(500).json({ error: "Failed to delete token" });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'token-frontend/dist')));

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  console.log('Catch-all route hit:', req.url);
  res.sendFile(path.join(__dirname, 'token-frontend/dist/index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const express = require("express");
const fs = require("fs");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const app = express();
const PORT = 3000;

const LOCAL_IP = "localhost";

app.use(cors());
app.use(express.json());

const DATA_FILE = "./tokens.json";

function loadTokens() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function getNextSerial(tokens) {
  if (tokens.length === 0) return 1;
  // Find the highest serial number and add 1
  const maxSerial = Math.max(...tokens.map(t => t.serial));
  return maxSerial + 1;
}

function saveTokens(tokens) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tokens, null, 2));
}

function generateTokenCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "K1";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function calculateRemainingDays(expirationDate) {
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
app.post("/create-token", (req, res) => {
  const { ownerName, ownerPhone, residence, ownerBusiness = 0 } = req.body;
  const tokens = loadTokens();

  const serial = getNextSerial(tokens);
  const tokenCode = generateTokenCode();

  const issueDate = new Date();
  const expirationDate = new Date(issueDate);
  expirationDate.setFullYear(issueDate.getFullYear() + 1);

  const newToken = {
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
  };

  updateTokenStatus(newToken);
  tokens.push(newToken);
  saveTokens(tokens);

  res.json({ message: "Token created", token: newToken });
});

// Redeem token
app.post("/redeem-token/:tokenCode", (req, res) => {
  const tokenCode = req.params.tokenCode.toUpperCase();
  const { redeemerName, redeemerPhone, amount = 0 } = req.body;
  const tokens = loadTokens();

  const token = tokens.find((t) => t.token === tokenCode);
  if (!token) return res.status(404).json({ message: "Token not found" });

  // Calculate current totals
  const redeemerTotal = token.redeemerBusiness.reduce((sum, b) => sum + b.amount, 0);
  const currentTotal = redeemerTotal + token.ownerBusiness;
  const usesExceeded = token.uses >= token.maxUses;

  // Handle reissuance if needed - only if under 40k
  if (usesExceeded && currentTotal < 40000) {
    console.log(`Reissuing token ${token.token} - Current business: ₹${currentTotal}`);
    const previousUses = token.uses;  // Store previous uses
    token.maxUses += 5;  // Add 5 more uses
    token.uses = previousUses;  // Keep the previous uses count
    token.redemptions.push({
      date: new Date().toISOString().split("T")[0],
      redeemerName: "SYSTEM",
      redeemerPhone: "-",
      note: `Token reissued - Business (₹${currentTotal}) under ₹40,000 - Previous uses: ${previousUses}, New max uses: ${token.maxUses}`
    });
  }

  // Update status after potential reissuance
  updateTokenStatus(token);
  
  // Check if token is expired (either due to date or max uses)
  if (token.status === "Expired") {
    return res.status(400).json({ message: "Token is expired" });
  }

  // Process the redemption
  token.uses += 1;
  token.redemptions.push({
    date: new Date().toISOString().split("T")[0],
    redeemerName,
    redeemerPhone,
  });

  token.redeemerBusiness.push({ redeemerName, amount });
  updateTokenStatus(token);
  saveTokens(tokens);

  res.json({ message: "Token redeemed successfully", token });
});

// Edit token
app.put("/edit-token/:serial", (req, res) => {
  const serial = parseInt(req.params.serial);
  const { ownerName, ownerPhone, residence, ownerBusiness } = req.body;
  const tokens = loadTokens();

  const token = tokens.find((t) => t.serial === serial);
  if (!token) return res.status(404).json({ message: "Token not found" });

  token.ownerName = ownerName;
  token.ownerPhone = ownerPhone;
  token.residence = residence;
  token.ownerBusiness = ownerBusiness;
  updateTokenStatus(token);
  saveTokens(tokens);

  res.json({ message: "Token updated", token });
});

// Delete token
app.delete("/delete-token/:serial", (req, res) => {
  const serial = parseInt(req.params.serial);
  let tokens = loadTokens();

  const index = tokens.findIndex((t) => t.serial === serial);
  if (index === -1) return res.status(404).json({ message: "Token not found" });

  tokens.splice(index, 1);
  saveTokens(tokens);

  res.json({ message: "Token deleted" });
});

// Get all tokens (with optional status filter)
app.get("/tokens", (req, res) => {
  const tokens = loadTokens();
  tokens.forEach(updateTokenStatus);
  res.json({ tokens });
});

// Get single token with WhatsApp link (UPDATED)
app.get("/token/:serial", (req, res) => {
  const serial = parseInt(req.params.serial);
  const tokens = loadTokens().map(updateTokenStatus);
  const token = tokens.find((t) => t.serial === serial);

  if (!token) return res.status(404).json({ message: "Token not found" });

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

  res.json({ ...token, whatsappLink });
});

// Filter by owner
app.get("/tokens/owner/:phone", (req, res) => {
  const phone = req.params.phone;
  const tokens = loadTokens().map(updateTokenStatus);
  const filtered = tokens.filter((t) => t.ownerPhone === phone);
  res.json(filtered);
});

// Generate PDF report
app.get("/api/reports/:type", (req, res) => {
  try {
    const { type } = req.params;
    const tokens = loadTokens();
    
    // Filter tokens based on type
    let filteredTokens = tokens;
  switch (type) {
      case 'active':
        filteredTokens = tokens.filter(token => token.status === 'Active');
      break;
      case 'expired':
        filteredTokens = tokens.filter(token => token.status === 'Expired');
      break;
      case 'reissued':
        filteredTokens = tokens.filter(token => token.maxUses > 5);
      break;
      // 'all' case - no filtering needed
      default:
      break;
  }

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
    filteredTokens.forEach((token, index) => {
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
      Total Tokens: ${filteredTokens.length}
      Total Business: ₹${filteredTokens.reduce((sum, token) => sum + token.totalBusiness, 0)}
      Active Tokens: ${filteredTokens.filter(t => t.status === 'Active').length}
      Expired Tokens: ${filteredTokens.filter(t => t.status === 'Expired').length}
      Reissued Tokens: ${filteredTokens.filter(t => t.maxUses > 5).length}
    `);
    
    // Finalize PDF
  doc.end();
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
});

// Start Server
app.listen(PORT, LOCAL_IP, () => {
  console.log(`✅ Backend Server running on http://${LOCAL_IP}:${PORT}`);
});

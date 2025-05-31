const fs = require('fs');
const path = './tokens.json';

function calculateRemainingDays(expirationDate) {
  const today = new Date();
  const expDate = new Date(expirationDate);
  const diff = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
  return diff < 0 ? 'Expired' : `${diff} days left`;
}

function fixTokens(tokens) {
  const today = new Date();
  let nextSerial = 1;

  return tokens.map(token => {
    // Fix serial numbers
    token.serial = nextSerial++;

    // Fallback values for missing fields
    token.ownerName = token.ownerName || 'Unknown';
    token.ownerPhone = token.ownerPhone || 'N/A';

    // Calculate redemptions-based uses
    token.uses = token.redemptions ? token.redemptions.length : 0;

    // Determine status
    const isExpired = new Date(token.expirationDate) < today || token.uses >= token.maxUses;
    token.status = isExpired ? 'Expired' : 'Active';

    // Days remaining and color
    token.remainingDays = calculateRemainingDays(token.expirationDate);
    token.statusColor = token.status === 'Expired' ? 'red' : 'green';

    // If business tracking exists, recalculate total
    if (token.ownerBusiness !== undefined || token.redeemerBusiness !== undefined) {
      token.ownerBusiness = token.ownerBusiness || 0;
      token.redeemerBusiness = token.redeemerBusiness || [];
      token.totalBusiness =
        token.ownerBusiness +
        token.redeemerBusiness.reduce((sum, r) => sum + (r.amount || 0), 0);
    }

    return token;
  });
}

fs.readFile(path, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading tokens.json:', err);
    return;
  }

  let tokens = [];
  try {
    tokens = JSON.parse(data);
  } catch (parseErr) {
    console.error('Error parsing tokens.json:', parseErr);
    return;
  }

  const fixedTokens = fixTokens(tokens);

  fs.writeFile(path, JSON.stringify(fixedTokens, null, 2), err => {
    if (err) {
      console.error('Error writing tokens.json:', err);
    } else {
      console.log('✅ All tokens fixed and saved successfully.');
    }
  });
});

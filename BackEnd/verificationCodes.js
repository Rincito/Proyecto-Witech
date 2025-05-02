const codes = new Map();

function generateCode() {
  return Math.floor(1000 + Math.random() * 900000).toString(); // 4-6 dígitos
}

function saveCode(email, code) {
  codes.set(email, { code, expires: Date.now() + 5 * 60 * 1000 }); // 5 mins
}

function validateCode(email, code) {
  const entry = codes.get(email);
  if (!entry) return false;
  const valid = entry.code === code && Date.now() < entry.expires;
  if (valid) codes.delete(email); // usar solo una vez
  return valid;
}

module.exports = { generateCode, saveCode, validateCode };

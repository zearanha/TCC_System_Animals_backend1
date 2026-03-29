const crypto = require("crypto");

const HASH_PREFIX = "scrypt";

function hashPassword(password) {
  const normalizedPassword = String(password ?? "");
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(normalizedPassword, salt, 64).toString("hex");
  return `${HASH_PREFIX}$${salt}$${derivedKey}`;
}

function verifyPassword(password, passwordHash) {
  if (!passwordHash || typeof passwordHash !== "string") return false;

  const [prefix, salt, storedHash] = passwordHash.split("$");
  if (prefix !== HASH_PREFIX || !salt || !storedHash) return false;

  const normalizedPassword = String(password ?? "");
  const derivedKey = crypto.scryptSync(normalizedPassword, salt, 64).toString("hex");

  const storedBuffer = Buffer.from(storedHash, "hex");
  const candidateBuffer = Buffer.from(derivedKey, "hex");

  if (storedBuffer.length !== candidateBuffer.length) return false;

  return crypto.timingSafeEqual(storedBuffer, candidateBuffer);
}

function generateSessionToken() {
  return crypto.randomBytes(48).toString("hex");
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateSessionToken,
};

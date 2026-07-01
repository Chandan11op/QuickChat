import crypto from "crypto";

const SECRET = process.env.DB_ENCRYPTION_KEY || process.env.JWT_SECRET || "default_quickchat_secret_key_32_chars_long_!";
// Create a 32-byte key using sha256 hash of our secret
const KEY = crypto.createHash("sha256").update(SECRET).digest();
// Create a static 16-byte IV for deterministic encryption so queries/lookups work
const IV = crypto.createHash("md5").update(SECRET).digest(); // 16 bytes hash

export function encrypt(text) {
  if (text === null || text === undefined) return text;
  const str = String(text);
  const cipher = crypto.createCipheriv("aes-256-cbc", KEY, IV);
  let encrypted = cipher.update(str, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decrypt(encryptedText) {
  if (!encryptedText) return encryptedText;
  try {
    const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, IV);
    let decrypted = decipher.update(String(encryptedText), "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    // Return original if decryption fails (e.g. if field is not encrypted)
    return encryptedText;
  }
}

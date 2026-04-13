import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import crypto from "crypto";

const baseKey = (process.env.ENCRYPTION_KEY || "").trim();

const getKey = () => {
  // derive 32 bytes using sha256
  const hash = crypto.createHash("sha256");
  hash.update(baseKey);
  return hash.digest().subarray(0, 32);
};

export const encryptJSON = (obj) => {
  const json = JSON.stringify(obj || {});
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getKey(), iv);
  const enc1 = cipher.update(json, "utf8", "base64");
  const enc2 = cipher.final("base64");
  const payload = enc1 + enc2;
  const out = iv.toString("base64") + ":" + payload;
  return out;
};

export const decryptJSON = (enc) => {
  if (!enc || typeof enc !== "string") return {};
  const parts = enc.split(":");
  const iv = Buffer.from(parts[0] || "", "base64");
  const data = parts[1] || "";
  const decipher = crypto.createDecipheriv("aes-256-cbc", getKey(), iv);
  const dec1 = decipher.update(data, "base64", "utf8");
  const dec2 = decipher.final("utf8");
  const json = dec1 + dec2;
  try {
    return JSON.parse(json);
  } catch {
    return {};
  }
};
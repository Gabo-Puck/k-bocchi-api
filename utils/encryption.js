const crypto = require("crypto");

const secret = process.env.SECRET_KEY;
const iv = process.env.SECRET_IV;
const method = process.env.ENCRYPTION_METHOD;

if (!secret || !iv || !method) {
  throw new Error("Se requiere: secret key, iv y method");
}

const key = crypto
  .createHash("sha512")
  .update(secret)
  .digest("hex")
  .substring(0, 32);

const encryptionIV = crypto
  .createHash("sha512")
  .update(iv)
  .digest("hex")
  .substring(0, 16);

const encriptar = (dato) => {
  const cipher = crypto.createCipheriv(method, key, encryptionIV);
  return Buffer.from(
    cipher.update(dato, "utf8", "hex") + cipher.final("hex")
  ).toString("base64");
};
const desencriptar = (dato) => {
  const buffer = Buffer.from(dato, "base64");
  const decipher = crypto.createDecipheriv(method, key, encryptionIV);
  return (
    decipher.update(buffer.toString("utf8"), "hex", "utf8") +
    decipher.final("utf8")
  );
};

module.exports = {
  encriptar,
  desencriptar  
};

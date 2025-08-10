import CryptoJS from "crypto-js";


export const encrypt = async (data, key) => {
  try {
    return CryptoJS.AES.encrypt(data, key).toString();
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Encryption failed");
  }
};

export const decrypt = async (encryptedData, key) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Decryption failed");
  }
};
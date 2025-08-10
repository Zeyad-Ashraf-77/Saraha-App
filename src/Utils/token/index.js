
import jwt from "jsonwebtoken";
export const createToken = async ({payload,SecretKey,options}={})=>{ 
 return jwt.sign(payload, SecretKey, options); 
}

export const verifyToken = async (token, SecretKey) => {
  try {
    return jwt.verify(token, SecretKey);
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Error("Invalid token");
  }
};
import userModel from "../../DB/Models/user.model.js";
import { decrypt,encrypt } from "../../Utils/encrypt/index.js";
import { eventEmitter } from "../../Utils/EventEmail/index.js";
import { customAlphabet } from "nanoid";
import bcrypt from "bcrypt";
import revokeTokenModel from "../../DB/Models/revoke-token.model.js";
export const profile = async (req, res, next) => {
  try {
    const phone = await decrypt(req.user.phone, process.env.cryptKey)
    req.user.phone = phone;
    res.status(200).json({ message: "success", user: req.user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(error.cause || 500).json({ message: "Internal server error",error : error.message ,stack:error.stack || "" });
  }
};
export const shareProfile = async (req, res, next) => {
  try {
    const {id} = req.params;
    const user = await userModel.findById(id).select("-password -otp -conFirmed -role -__v -_id -createdAt -updatedAt");
    if (!user) {
      throw new Error("User not found",{cause:404});
    }
    const phone = await decrypt(user.phone, process.env.cryptKey)
    user.phone = phone;
    res.status(200).json({ message: "success", user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(error.cause || 500).json({ message: "Internal server error",error : error.message ,stack:error.stack || "" });
  }
};
export const logout = async (req, res, next) => {
  try {
     const revokeToken = await revokeTokenModel.create({token:req.decoded.jti,expiresAt:Date.now() + 1000 * 60 * 60 * 24});
     res.status(200).json({ message: "success", revokeToken });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(error.cause || 500).json({ message: "Internal server error",error : error.message ,stack:error.stack });
  }
};
export const updateProfile = async (req, res, next) => {
  try {
   const { name, age, gender, phone,email } = req.body;
   const user = await userModel.findById(req.user.id);
   if (!user) {
     throw new Error("User not found",{cause:404});
   }
   if(name){
    user.name = name;
   }
   if(age){
    user.age = age;
   }
   if(gender){
    user.gender = gender;
   }
   if(phone){
     const phoneCrypt = await encrypt(phone,process.env.cryptKey)
    user.phone = phoneCrypt;
   }
   if(email){
     const isExists = await userModel.findOne({ email });
     if (isExists) {
       throw new Error("Email already exists" ,{cause:400});
     }
      const otp = customAlphabet("0123456789", 4)();
         const hashOtp =  await bcrypt.hashSync(otp, Number(process.env.saltOrRounds))
         eventEmitter.emit("sendEmail", {email,otp});
    
     user.email = email; 
     user.otp = hashOtp;
     user.conFirmed = false;
   }
   await user.save();
   res.status(200).json({ message: "success", user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(error.cause || 500).json({ message: "Internal server error",error : error.message ,stack:error.stack || "" });
  }       
};
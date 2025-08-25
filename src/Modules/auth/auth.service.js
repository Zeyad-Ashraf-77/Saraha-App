import userModel, { RoleUser } from "../../DB/Models/user.model.js";
import { createToken, verifyToken } from "../../Utils/token/index.js";
import { compare, hash } from "../../Utils/hash/index.js";
import { encrypt } from "../../Utils/encrypt/index.js";
import { eventEmitter } from "../../Utils/EventEmail/index.js";
import { customAlphabet, nanoid } from "nanoid";
import bcrypt from "bcrypt";


export const signUp = async (req, res, next) => {
  try {
    const { name, email, password, rePassword, age, gender, phone } = req.body;
    const isExists = await userModel.findOne({ email });
    if (isExists) {
      throw new Error("Email already exists" ,{cause:400});
    }
    const phoneIsExists = await userModel.findOne({ phone });
    if (phoneIsExists) {
      throw new Error("Phone number already exists",{cause:400});
    }
    if (password !== rePassword) {
      throw new Error("Passwords do not match",{cause:400});
    }

    const hashedPassword = await hash(password, process.env.saltOrRounds);
    if (!hashedPassword) {
      throw new Error("Error hashing password",{cause:500});
    }
    const phoneCrypt = await encrypt(phone,process.env.cryptKey)
    const otp = customAlphabet("0123456789", 4)();
    const hashOtp =  await bcrypt.hashSync(otp, Number(process.env.saltOrRounds))
    eventEmitter.emit("sendEmail", {email,otp});
     
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      phone: phoneCrypt,
      otp:hashOtp  
    });
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error", error : error.message ,stack:error.stack || "" });
  }
};
// ==================confirm email=====================

 export const confirmEmail = async (req, res, next) => {
  try {
    const { email,otp } = req.body;
    if (!email || !otp) {
      throw new Error("Token not Found",{cause:400});
    }
    const user = await userModel.findOne({ email });
    if (!user) {
      throw new Error("user not exist or already confirmed",{cause:400}) 
    }
    if(user.conFirmed){
      throw new Error("user already confirmed",{cause:400}) 
    }
    const isMatch = await compare(otp, user.otp);
    if (!isMatch) {
      throw new Error("Invalid otp",{cause:400});
    }
    user.conFirmed = true
    user.otp = null
    await user.save();
    return res.status(200).json({message:"confirmed Success"})
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error",   error : error.message ,stack:error.stack || "" });
  }
};
// ==================sign in=====================
export const signIn = async (req, res, next) => { 
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email});
    if (!user || !user.conFirmed) {
      throw new Error("User not found or not confirmed",{cause:400});
    }
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password",{cause:400});
    }

    const accessToken = await createToken({payload:{ id: user._id, email: user.email, role: user.role },SecretKey:user.role === RoleUser.admin ? process.env.ACCESS_TOKEN_ADMIN : process.env.ACCESS_TOKEN_USER,options :{ expiresIn: "1h", jwtid:nanoid() }} );
    const refreshToken = await createToken({payload:{ id: user._id, email: user.email, role: user.role },SecretKey:user.role === RoleUser.admin ? process.env.REFRESH_TOKEN_ADMIN : process.env.REFRESH_TOKEN_USER,options :{ expiresIn: "1y", jwtid:nanoid() }});

    res
      .status(200)
      .json({ message: "Sign-in successful", accessToken, refreshToken });
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ message: "Internal server error",error : error.message ,stack:error.stack || "" });
  }
};
// ==================update password=====================
export const UpdatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, reNewPassword } = req.body;
    if (!oldPassword || !newPassword || !reNewPassword) {
      throw new Error("All fields are required",{cause:400});
    }
    if (newPassword !== reNewPassword) {
      throw new Error("Passwords do not match",{cause:400});
    }
    // req.user تم إضافته من الميدلوير
    const user = req.user;
    const isMatch = await compare(oldPassword, user.password);
    if (!isMatch) {
      throw new Error("Old password is incorrect",{cause:400});
    }
    const hashedPassword = await hash(newPassword, process.env.saltOrRounds || 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully",user });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error",error : error.message ,stack:error.stack || "" });
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const [prefix, token] = authorization.split(" ") || [];
    if (!prefix || !token) {
      throw new Error("Unauthorized",{cause:401});
    }
    let signature = "";
    if (prefix == "Bearer") {
      signature = process.env.REFRESH_TOKEN_USER;
    } else if (prefix == "BearerAdmin") {
      signature = process.env.REFRESH_TOKEN_ADMIN;
    } else {
      throw new Error("Unauthorized",{cause:401});
    }
    const decodedToken = await verifyToken(token, signature);
    const user = await userModel.findById(decodedToken.id);
    if (!user) {
      throw new Error("User not found",{cause:404});
    }
    const accessToken = await createToken({payload:{ id: user._id, email: user.email, role: user.role },SecretKey:user.role === RoleUser.admin ? process.env.ACCESS_TOKEN_ADMIN : process.env.ACCESS_TOKEN_USER,options :{ expiresIn: "1h", jwtid:nanoid() }} );
    const refreshToken = await createToken({payload:{ id: user._id, email: user.email, role: user.role },SecretKey:user.role === RoleUser.admin ? process.env.REFRESH_TOKEN_ADMIN : process.env.REFRESH_TOKEN_USER,options :{ expiresIn: "1y", jwtid:nanoid() }});
    res
      .status(200)
      .json({ message: "Refresh token successful", accessToken, refreshToken });
  } catch (error) {
    console.error("Error during refresh token:", error);
    res.status(500).json({ message: "Internal server error",error : error.message ,stack:error.stack || "" });
  }
};
// ==================forget password=====================  

 export  const forgetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      throw new Error("User not found",{cause:404});
    }
    const otp = customAlphabet("0123456789", 4)();
    const hashOtp =  await bcrypt.hashSync(otp, Number(process.env.saltOrRounds))
    eventEmitter.emit("forgetPassword", {email,otp});
    user.otp = hashOtp
    await user.save();
    return res.status(200).json({message:"otp sent successfully"})
  } catch (error) {
    console.error("Error during forget password:", error);
    res.status(500).json({ message: "Internal server error",error : error.message ,stack:error.stack || ""  });
  }
}
// ==================reset password=====================  
export const resetPassword = async (req, res, next) => {
  try {
    const { email,otp,newPassword,reNewPassword } = req.body;
    const user = await userModel.findOne({ email,otp:{$exists:true} });
    if (!user||user.otp === null || user.otp === undefined || user.otp === "") {
      throw new Error("User not found or invalid otp",{cause:404});
    }
    const isMatch = await compare(otp, user.otp);
    if (!isMatch) {
      throw new Error("Invalid otp",{cause:400});
    }
    if (newPassword !== reNewPassword) {
      throw new Error("Passwords do not match",{cause:400});
    }
    const hashedPassword = await hash(newPassword, process.env.saltOrRounds || 10);
    user.password = hashedPassword;
    user.otp = {$unset:"otp"}
    await user.save();
    return res.status(200).json({message:"Password reset successfully"})
  } catch (error) {
    console.error("Error during forget password:", error);
    res.status(500).json({ message: "Internal server error",error : error.message ,stack:error.stack });
  }
}
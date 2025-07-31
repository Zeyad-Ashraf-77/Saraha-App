import userModel, { RoleUser } from "../../DB/Models/user.model.js";
import bcrypt from "bcrypt";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../services/sendEmail.js";
export const signUp = async (req, res, next) => {
  try {
    const { name, email, password, rePassword, age, gender, phone } = req.body;
    const isExists = await userModel.findOne({ email });
    if (isExists) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const phoneIsExists = await userModel.findOne({ phone });
    if (phoneIsExists) {
      return res.status(400).json({ message: "Phone number already exists" });
    }
    if (password !== rePassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!hashedPassword) {
      return res.status(500).json({ message: "Error hashing password" });
    }
    const phoneCrypt = CryptoJS.AES.encrypt(phone, "Zeyad_123").toString();

    const token = jwt.sign({ email }, "Zeyad_123_confirmed", {
      expiresIn: "5m",
    });

    const link = `http://localhost:3000/users/confirm/${token}`;

    const isSend = await sendEmail({
      to: email,
      html: `<a href='${link}'>Confirm your email</a>`,
    });
    if (!isSend) {
      return res.status(500).json({ message: "Error sending email" });
    }
    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      age,
      gender,
      phone: phoneCrypt,
    });
    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};
// ==================confirm email=====================

 export const confirmEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ message: "Token not Found" });
    }
    const decodedToken = jwt.verify(token, "Zeyad_123_confirmed");
    const user = await userModel.findOne({ email:decodedToken.email });
    if (!user) {
      return req.status(404).json({message:"user not exist or already confirmed"}) 
    }
    user.conFirmed = true
    await user.save();
    return req.status(200).json({message:"confirmed Success"})
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "server error", error });
  }
};

export const signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const accessToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      user.role === RoleUser.admin ? "Zeyad_123_admin" : "Zeyad_123",
      { expiresIn: "1h" }
    );
    const refreshToken = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      user.role === RoleUser.admin
        ? "Zeyad_123_adminRefresh"
        : "Zeyad_123_refresh",
      { expiresIn: "1y" }
    );
    res
      .status(200)
      .json({ message: "Sign-in successful", accessToken, refreshToken });
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const profile = async (req, res, next) => {
  try {
    const phone = CryptoJS.AES.decrypt(req.user.phone, "Zeyad_123").toString(
      CryptoJS.enc.Utf8
    );
    req.user.phone = phone;
    res.status(200).json({ message: "success", user: req.user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

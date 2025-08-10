import userModel, { RoleUser } from "../../DB/Models/user.model.js";
import { sendEmail } from "../../services/sendEmail.js";
import { createToken, verifyToken } from "../../Utils/token/index.js";
import { compare, hash } from "../../Utils/hash/index.js";
import { encrypt } from "../../Utils/encrypt/index.js";
import { eventEmitter } from "../../Utils/EventEmail/index.js";
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

    const hashedPassword = await hash(password, process.env.saltOrRounds);
    if (!hashedPassword) {
      return res.status(500).json({ message: "Error hashing password" });
    }
    // const phoneCrypt = CryptoJS.AES.encrypt(phone,process.env.cryptKey).toString();
    const phoneCrypt = await encrypt(phone,process.env.cryptKey)
    eventEmitter.emit("sendEmail", {email});
    
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
    const decodedToken = await verifyToken(token, process.env.CONFIRM_TOKEN);
    const user = await userModel.findOne({ email:decodedToken.email });
    if (!user) {
      return req.status(404).json({message:"user not exist or already confirmed"}) 
    }
    user.conFirmed = true
    await user.save();
    return res.status(200).json({message:"confirmed Success"})
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
    // const isPasswordValid = await bcrypt.compareSync(password, user.password);
    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const accessToken = await createToken({payload:{ id: user._id, email: user.email, role: user.role },SecretKey:user.role === RoleUser.admin ? process.env.ACCESS_TOKEN_ADMIN : process.env.ACCESS_TOKEN_USER,options :{ expiresIn: "1h" }} );
    const refreshToken = await createToken({payload:{ id: user._id, email: user.email, role: user.role },SecretKey:user.role === RoleUser.admin ? process.env.REFRESH_TOKEN_ADMIN : process.env.REFRESH_TOKEN_USER,options :{ expiresIn: "1y" }});

    res
      .status(200)
      .json({ message: "Sign-in successful", accessToken, refreshToken });
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const UpdatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, reNewPassword } = req.body;
    if (!oldPassword || !newPassword || !reNewPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (newPassword !== reNewPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    // req.user تم إضافته من الميدلوير
    const user = req.user;
    const isMatch = await compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }
    const hashedPassword = await hash(newPassword, process.env.saltOrRounds || 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
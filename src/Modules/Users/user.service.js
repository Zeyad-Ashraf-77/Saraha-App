import { decrypt } from "../../Utils/encrypt/index.js";

export const profile = async (req, res, next) => {
  try {
    const phone = await decrypt(req.user.phone, process.env.cryptKey)
    req.user.phone = phone;
    res.status(200).json({ message: "success", user: req.user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




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

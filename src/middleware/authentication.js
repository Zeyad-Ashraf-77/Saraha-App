import userModel from "../DB/Models/user.model.js";
import jwt from "jsonwebtoken";
export const authentication = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const [prefix, token] = authorization.split(" ") || [];
    if (!prefix || !token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let signature = "";
    if (prefix == "Bearer") {
      signature = "Zeyad_123";
    } else if (prefix == "BearerAdmin") {
      signature = "Zeyad_123_admin";
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decodedToken = jwt.verify(token, signature);
    const user = await userModel.findById(decodedToken.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error", error });
  }
};

import userModel from "../DB/Models/user.model.js";
import { verifyToken } from "../Utils/token/index.js";
export const authentication = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const [prefix, token] = authorization.split(" ") || [];
    if (!prefix || !token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let signature = "";
    if (prefix == "Bearer") {
      signature = process.env.ACCESS_TOKEN_USER;
    } else if (prefix == "BearerAdmin") {
      signature = process.env.ACCESS_TOKEN_ADMIN;
    } else {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decodedToken = await verifyToken(token, signature);
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

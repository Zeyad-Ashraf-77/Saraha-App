import userModel from "../DB/Models/user.model.js";
import { verifyToken } from "../Utils/token/index.js";
import revokeTokenModel from "../DB/Models/revoke-token.model.js";
export const authentication = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const [prefix, token] = authorization.split(" ") || [];
    if (!prefix || !token) {
      throw new Error("Unauthorized",{cause:401});
    }
    let signature = "";
    if (prefix == "Bearer") {
      signature = process.env.ACCESS_TOKEN_USER;
    } else if (prefix == "BearerAdmin") {
      signature = process.env.ACCESS_TOKEN_ADMIN;
    } else {
      throw new Error("Unauthorized",{cause:401});
    }
    const decodedToken = await verifyToken(token, signature);
    const user = await userModel.findById(decodedToken.id);
    if (!user) {
      throw new Error("User not found",{cause:404});
    }
    const revoke = await revokeTokenModel.findOne({ token: decodedToken.jti });
    if (revoke) {
      throw new Error("User already logged out",{cause:400});
    }
    req.user = user;
    req.decoded = decodedToken;
    next();
  } catch (error) {
    console.log(error);
      return res.status(error.cause || 500).json({ message: "Internal server error", error : error.message ,stack:error.stack || "" });
  }
};

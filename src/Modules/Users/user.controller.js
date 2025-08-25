 import { Router } from "express";
 import * as serviceUser from "./user.service.js";
 import { authentication } from "../../middleware/authentication.js";
 
 const router = Router();
 
 router.get("/profile",authentication,serviceUser.profile)
 router.get("/profile/:id",serviceUser.shareProfile)
 router.patch("/profile",authentication,serviceUser.updateProfile)
 router.post("/logout",authentication,serviceUser.logout)
 
 export default router;
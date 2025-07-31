 import { Router } from "express";
 import * as serviceUser from "./user.service.js";
 import { authentication } from "../../middleware/authentication.js";
 
 const router = Router();
 
 router.get("/profile",authentication,serviceUser.profile)
 
 export default router;
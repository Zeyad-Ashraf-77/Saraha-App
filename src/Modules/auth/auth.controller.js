import { Router } from "express";
import * as  serviceUser from "./auth.service.js";
import { authentication } from "../../middleware/authentication.js";

const router = Router();
 
router.post("/signUp",serviceUser.signUp)
router.post("/signin",serviceUser.signIn)
router.patch("/confirmEmail",serviceUser.confirmEmail)
router.post("/updatePassword",authentication,serviceUser.UpdatePassword)




export default router;
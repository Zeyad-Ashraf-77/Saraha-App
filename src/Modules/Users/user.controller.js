import { Router } from "express";
import * as  serviceUser from "./user.service.js";
import { authentication } from "../../middleware/authentication.js";

const router = Router();


router.post("/signUp",serviceUser.signUp)
router.post("/signin",serviceUser.signIn)
router.get("/profile",authentication,serviceUser.profile)
router.get("/confirm/:token",serviceUser.confirmEmail)




export default router;
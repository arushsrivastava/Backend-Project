import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { toggleSubscribe } from "../controllers/subscription.controller.js";

const router = Router();

router.use(verifyJWT) // all routes will now require JWT authentication

router.route("/toggleSubscribe/:channelId").post(toggleSubscribe)

export default router;
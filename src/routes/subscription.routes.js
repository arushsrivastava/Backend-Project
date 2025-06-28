import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getSubscribedChannels, getSubscribers, toggleSubscribe } from "../controllers/subscription.controller.js";

const router = Router();

router.use(verifyJWT) // all routes will now require JWT authentication

router.route("/c/:channelId")
.post(toggleSubscribe)
.get(getSubscribedChannels)

router.route("/u/:userId").get(getSubscribers)


export default router;
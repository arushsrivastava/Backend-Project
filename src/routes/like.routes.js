import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { getLikedVideos, getVideoLikes, toggleCommentLikes, toggleVideoLikes } from "../controllers/like.controller.js";

const router = Router();

router.route('/v/videoLikes/:videoId').get(getVideoLikes)

router.use(verifyJWT)

router.route('/v/toggle-like/:videoId').post(toggleVideoLikes)
router.route('/c/toggle-like/:videoId').post(toggleCommentLikes)
router.route('/v/likedVideos/:userId').get(getLikedVideos)

// secured routes go here

export default router;
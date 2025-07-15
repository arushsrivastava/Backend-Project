import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { deleteComment, getComments, postComment } from "../controllers/comment.controller.js";

const router = Router();

router.route('/v/comments/:videoId').get(getComments)

router.use(verifyJWT)

router.route('/postComment/:videoId').post(postComment)
router.route('/deleteComment/:commentId').post(deleteComment)


// secured routes go here

export default router;
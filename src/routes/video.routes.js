import { Router } from "express";
import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { deleteVideo, getVideoByUser, togglePublishStatus, updateVideo, videoUploader } from "../controllers/video.controller.js";

const router = Router();

router.route('/user-videos/:userId').get(getVideoByUser);

// secured routes

router.use(verifyJWT);

router.route('/upload-video').post(
    upload.fields(
        [
            {
                name: 'videoFile',
                maxCount: 1
            },
            {
                name: 'thumbnail', 
                maxCount: 1
            }
        ]
    ),
    videoUploader
)

router.route('/update/:videoId').post(
    upload.fields(
        [
            {
                name: 'videoFile',
                maxCount: 1
            },
            {
                name: 'thumbnail', 
                maxCount: 1
            }
        ]
    ),
    updateVideo
)

router.route('/delete/:videoId').post(deleteVideo)
router.route('/toggle-publish-status/:videoId').post(togglePublishStatus)

export default router;
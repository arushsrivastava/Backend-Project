import { Router } from "express";
import { loginUser, logoutUser, registerUser } from "../controllers/user.controller.js";

import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route('/register').post(
    // Multer middleware for handling file uploads.
    upload.fields(
        [
            {
                name: 'avatar',
                maxCount: 1
            },
            {
                name: 'coverImage', 
                maxCount: 1
            }
        ]
    ),
    registerUser)

router.route('/login').post(loginUser);
router.route('/logout').post(verifyJWT, logoutUser); // jo pehle hai wo pehle execute hoga

export default router;
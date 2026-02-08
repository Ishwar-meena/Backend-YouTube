import { Router } from "express";
import { generateRefreshToken, getChannelInfo, getUser, getWatchHistory, loggedOut, updateAvatar, updateCoverImage, updatePassword, updateUser, userLogin, userRegister } from "../controllers/user.controller.js";
import {upload} from '../middlewares/multer.middleware.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route('/register').post(upload.fields([
    {name:"avatar",maxCount:1},
    {name:"coverImage",maxCount:1}
]),userRegister);

router.route('/login').post(userLogin);

// protected routes
router.route("/logout").post(verifyJWT,loggedOut)
router.route("/generate-refresh-token").post(generateRefreshToken)
router.route("/update-password").post(verifyJWT,updatePassword);
router.route("/update-user").post(verifyJWT,updateUser);
router.route("/user-info").post(verifyJWT,getUser);
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar);
router.route("/update-coverimage").patch(verifyJWT,upload.single("coverImage"),updateCoverImage);


router.route("/channel/:channel_name").get(verifyJWT,getChannelInfo);
router.route("/user/watch-history").get(verifyJWT,getWatchHistory);

export default router;
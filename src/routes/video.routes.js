import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, togglePublishedVideo, updateVideoThumbnail, uploadVideo, watchVideo } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/get-all-videos").get(getAllVideos)
router.route("/get-video/:videoId").post(getVideoById)

// protect all the routes
router.use(verifyJWT);

router.route("/upload-video").post(upload.fields([
    {name:"thumbnail",maxCount:1},
    {name:"video",maxCount:1}
]),uploadVideo)

router.route("/watch-video/:videoId").patch(watchVideo)
router.route("/delete-video/:videoId").delete(deleteVideo)
router.route("/toggle-published-video/:videoId").patch(togglePublishedVideo)
router.route("/update-video-thumbnail/:videoId").patch(upload.single("thumbnail"),updateVideoThumbnail)

export default router;
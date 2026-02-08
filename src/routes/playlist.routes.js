import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoInPlaylist, createPlaylist, deletePlaylist, deleteVideoFromPlaylist, getPlaylistById, getUserPlaylist, updatePlayList } from "../controllers/playlist.controller.js";
const router = Router();

router.use(verifyJWT)

router.route("/create-playlist").post(createPlaylist);
router.route("/addvideo/:videoId").patch(addVideoInPlaylist);
router.route("/delete-video/:videoId").delete(deleteVideoFromPlaylist);
router.route("/update-playlist/:playlistId").patch(updatePlayList);
router.route("/get-playlist").get(getUserPlaylist);
router.route("/get-playlist-by-id/:playlistId").get(getPlaylistById);
router.route("/delete-playlist/:playlistId").delete(deletePlaylist);

export default router;
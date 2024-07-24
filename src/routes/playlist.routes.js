import { Router } from "express";
import {
  addVideoToPlaylist,
  createPlaylist,
  deletePlaylist,
  getUserPlaylist,
  removeVideoFromPlaylist,
} from "../controllers/playlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, createPlaylist);

router.route("/add-videos/:playlistId").post(addVideoToPlaylist);

router.route("/get/:userId").post(getUserPlaylist);
router.route("/remove-video/:playlistId").post(removeVideoFromPlaylist);
router.route("/delete/:playlistId").delete(deletePlaylist);
export default router;

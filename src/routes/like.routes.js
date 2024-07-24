import { Router } from "express";
import {
  getAllLikedVideo,
  likecomment,
  likeTweet,
  likeVideo,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/video/:videoId").post(verifyJWT, likeVideo);

router.route("/comment/:commentId").post(verifyJWT, likecomment);

router.route("/tweet/:tweetId").post(verifyJWT, likeTweet);

router.route("/get-videos").get(verifyJWT, getAllLikedVideo);
export default router;

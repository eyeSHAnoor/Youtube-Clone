import { Router } from "express";
import {
  getAllLikedVideo,
  getCommentLikesCount,
  getTweetsLikesCount,
  getVideoLikesCount,
  likecomment,
  likeTweet,
  likeVideo,
} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/video/:videoId").post(verifyJWT, likeVideo);
router.route("/video/get/:videoId").get(getVideoLikesCount);

router.route("/comment/:commentId").post(verifyJWT, likecomment);
router.route("/comment/get/:commentId").get(getCommentLikesCount);

router.route("/tweet/:tweetId").post(verifyJWT, likeTweet);
router.route("/tweet/get/:tweetId").get(getTweetsLikesCount);

router.route("/get-videos").get(verifyJWT, getAllLikedVideo);
export default router;

import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  Dislikecomment,
  DislikeTweet,
  DislikeVideo,
  getCommentDisLikesCount,
  getTweetsDisLikesCount,
  getVideoDisLikesCount,
} from "../controllers/dislike.controller.js";

const router = Router();

router.route("/video/:videoId").post(verifyJWT, DislikeVideo);
router.route("/video/get/:videoId").get(getVideoDisLikesCount);

router.route("/comment/:commentId").post(verifyJWT, Dislikecomment);
router.route("/comment/get/:commentId").get(getCommentDisLikesCount);

router.route("/tweet/:tweetId").post(verifyJWT, DislikeTweet);
router.route("/tweet/get/:tweetId").get(getTweetsDisLikesCount);
export default router;

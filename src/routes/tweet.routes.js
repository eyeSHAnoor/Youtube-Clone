import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addTweet,
  deleteTweet,
  getPersonalTweet,
  getUserTweet,
} from "../controllers/tweet.controller.js";

const router = Router();

router.route("/add").post(verifyJWT, addTweet);

router.route("/delete/:tweetId").delete(verifyJWT, deleteTweet);

router.route("/personal").get(verifyJWT, getPersonalTweet);
router.route("/user/:userId").get(getUserTweet);

export default router;

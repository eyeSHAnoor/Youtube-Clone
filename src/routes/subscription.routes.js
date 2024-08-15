import express from "express";
import {
  getSubscribedChannels,
  getSubscribedChannelsOfUser,
  getSubscribers,
  getSubscribersOfUser,
  subscribeStatus,
  subscribeUser,
  unsubscribeUser,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express();

router.route("/subscribe/:userId").post(verifyJWT, subscribeUser);
router.route("/unsubscribe/:userId").post(verifyJWT, unsubscribeUser);
router.route("/status/:userId").post(verifyJWT, subscribeStatus);
router.route("/Subscribed-channel").get(verifyJWT, getSubscribedChannels);
router.route("/Subscriber").get(verifyJWT, getSubscribers);
router.route("/Subscribed-channel/:userId").get(getSubscribedChannelsOfUser);
router.route("/Subscriber/:userId").get(getSubscribersOfUser);

export default router;

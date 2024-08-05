import express from "express";
import {
  subscribeStatus,
  subscribeUser,
  unsubscribeUser,
} from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = express();

router.route("/subscribe/:userId").post(verifyJWT, subscribeUser);
router.route("/unsubscribe/:userId").post(verifyJWT, unsubscribeUser);
router.route("/status/:userId").post(verifyJWT, subscribeStatus);

export default router;

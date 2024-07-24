import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addComment,
  deleteComment,
  getVideoComments,
} from "../controllers/comment.controller.js";

const router = Router();

router.route("/add/:videoId").post(verifyJWT, addComment);

router.route("/get/:videoId").get(getVideoComments);

router.route("/delete/:commentId").delete(verifyJWT, deleteComment);

export default router;

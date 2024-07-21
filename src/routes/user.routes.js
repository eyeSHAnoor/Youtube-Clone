import { Router } from "express";
import {
  loginUser,
  logOutUser,
  refreshAccesssToken,
  registerUser,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//secured route

router.route("/logout").post(verifyJWT, logOutUser);

router.route("/refresh-token").post(refreshAccesssToken);
export default router;

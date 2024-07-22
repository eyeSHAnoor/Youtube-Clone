import { Router } from "express";
import {
  changeCurrPassword,
  getCurrentUser,
  getUserProfile,
  getwatchHistory,
  loginUser,
  logOutUser,
  refreshAccesssToken,
  registerUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
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

router.route("/change-password").post(verifyJWT, changeCurrPassword);

router.route("/get-user").get(verifyJWT, getCurrentUser);

router.route("/account-setting").put(verifyJWT, updateAccountDetails);

router
  .route("/change-avatar")
  .put(verifyJWT, upload.single("avatar"), updateAvatar);

router
  .route("/change-cover-image")
  .put(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/userProfile/:username").get(getUserProfile);

router.route("/get-watch-history").get(verifyJWT, getwatchHistory);

export default router;

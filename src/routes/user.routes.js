import { Router } from "express";
import {
  addToWatchHistory,
  changeCurrPassword,
  getCurrentUser,
  getSubscribedVideos,
  getUserId,
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

router.route("/account-setting").patch(verifyJWT, updateAccountDetails);

router
  .route("/change-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);

router
  .route("/change-cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

router.route("/userProfile/:username").get(getUserProfile);

router.route("/get-watch-history").get(verifyJWT, getwatchHistory);
router.route("/subscribed/videos").get(verifyJWT, getSubscribedVideos);

router.route("/add-watch-history/:videoId").patch(verifyJWT, addToWatchHistory);

router.route("/userId").get(verifyJWT, getUserId);

export default router;

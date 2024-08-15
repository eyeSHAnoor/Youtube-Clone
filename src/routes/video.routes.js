import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getQueryVideos,
  getUserVideos,
  getVideoById,
  personalVideo,
  publishVideo,
  randomVideos,
  togglePublishStatus,
  updateVideoInfo,
  viewsOfVideo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/get-public-videos").get(getAllVideos);
router.route("/recommended").get(randomVideos);
router.route("/personal").get(verifyJWT, personalVideo);

router.route("/upload-video").post(
  verifyJWT,
  upload.fields([
    {
      name: "video",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishVideo
);

router.route("/search-videos").get(getQueryVideos);
router.route("/:id").get(getVideoById);
router.route("/get/:userId").get(getUserVideos);

router
  .route("/update-info/:videoId")
  .patch(upload.single("thumbnail"), updateVideoInfo);

router.route("/delete/:videoId").delete(deleteVideo);
router.route("/toggle/:videoId").patch(togglePublishStatus);

router.route("/views/:videoId").patch(viewsOfVideo);
export default router;

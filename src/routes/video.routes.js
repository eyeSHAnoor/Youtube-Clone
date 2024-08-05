import { Router } from "express";
import {
  deleteVideo,
  getAllVideos,
  getQueryVideos,
  getVideoById,
  publishVideo,
  randomVideos,
  togglePublishStatus,
  updateVideoInfo,
} from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

router.route("/get-public-videos").get(getAllVideos);
router.route("/recommended").get(randomVideos);

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

router
  .route("/update-info/:videoId")
  .patch(upload.single("thumbnail"), updateVideoInfo);

router.route("/delete/:videoId").delete(deleteVideo);
router.route("/toggle/:videoId").patch(togglePublishStatus);
export default router;

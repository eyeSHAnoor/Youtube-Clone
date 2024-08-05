import { asyncHandler } from "../utils/asyncHandler.js";
import Video from "../models/videoSchema.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const videos = await Video.find()
    .populate("owner", "username avatar Subscriber") // Populate owner field with username and avatar
    .exec();
  if (!videos) {
    throw new ApiError(400, "The problem in fetching videos ");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, videos, "All public videos are available"));
});

////////////////////////////////////////////////////////////////////////

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description, views } = req.body;

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "give a title or description to video");
  }

  const videoLocalPath = req.files?.video?.[0].path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0].path;

  if (!thumbnailLocalPath || !videoLocalPath) {
    throw new ApiError(400, "video file or thumbnail is required");
  }

  const videoFile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  const owner = req.user?._id;
  console.log(videoFile);

  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    owner,
    views: views || 0,
    duration: videoFile.duration || 0,
  });

  if (!video) {
    throw new ApiError(400, "Something went wrong while uploading video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video uploaded successfully"));
});

////////////////////////////////////////////////////////////////////

const getQueryVideos = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortOrder, search } = req.query;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const sort = {
    [sortBy]: sortOrder === "desc" ? -1 : 1,
  };

  const videos = await Video.find(query)
    .sort(sort)
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  if (!videos) {
    throw new ApiError(400, "There is no videos regarding ur query");
  }

  res
    .status(200)
    .json(new ApiResponse(200, videos, "videos were fetched according to it"));
});

/////////////////////////////////////////////////////////////////////

const getVideoById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "please! give Id in parameters");
  }
  const video = await Video.findById(id);

  if (!video) {
    throw new ApiError(404, "video is not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, video, "Your paticular video is given"));
});

//////////////////////////////////////////////////////////////////

const updateVideoInfo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  const thumbnailLocalPath = req.file?.path;

  console.log(thumbnailLocalPath);

  if ([title, description, thumbnailLocalPath].some((field) => field === "")) {
    throw new ApiError(
      400,
      "please give us something (title , description ) that u want to update "
    );
  }

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail.url) {
    throw new ApiError(500, "error in uploading on cloudinary");
  }
  const newVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
        thumbnail: thumbnail.url,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .json(new ApiResponse(200, newVideo, "Video info is updated"));
});

///////////////////////////////////////////////////////////////////

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  await Video.findByIdAndDelete(videoId);

  // if (video.owner !== req.user._id) {
  //   throw new ApiError(400, "you are unauthorize todo this action");
  // }

  // await Video.deleteOne(videoId);

  res.status(200).json(new ApiResponse(200, {}, "video is deleted"));
});

//////////////////////////////////////////////////////////////////

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  await Video.updateOne({
    isPublished: video.isPublished === true ? false : true,
  });

  res.status(200).json(new ApiResponse(200, {}, "toggled"));
});

////////////////////////////////////////////////////////////

const randomVideos = asyncHandler(async (req, res) => {
  const count = parseInt(req.query.count) || 10;

  // Perform the aggregation
  const videos = await Video.aggregate([
    { $sample: { size: count } }, // Get random documents
  ]);

  if (!videos) {
    throw new Error("Error fetching random videos");
  }

  // Manually populate the 'owner' field
  const populatedVideos = await Video.populate(videos, {
    path: "owner",
    select: "username avatar Subscriber",
  });

  console.log(populatedVideos);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        populatedVideos,
        "The recommended videos are available"
      )
    );
});

export {
  getAllVideos,
  publishVideo,
  getQueryVideos,
  getVideoById,
  updateVideoInfo,
  deleteVideo,
  togglePublishStatus,
  randomVideos,
};

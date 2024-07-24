import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Like from "../models/like.model.js";

const likeVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  const existingLike = await Like.findOne({ video: videoId, owner: userId });

  if (existingLike) {
    throw new ApiError(400, "You have already liked a video");
  }

  const like = new Like({ video: videoId, owner: userId });
  await like.save();

  res.status(200).json(new ApiResponse(200, like, "You have liked the video"));
});

//////////////////////////////////////////////////////

const likecomment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  const existingLike = await Like.findOne({
    comment: commentId,
    owner: userId,
  });

  if (existingLike) {
    throw new ApiError(400, "You have already liked a video");
  }

  const like = new Like({ comment: commentId, owner: userId });
  await like.save();

  res
    .status(200)
    .json(new ApiResponse(200, like, "You have liked the comment"));
});

///////////////////////////////////////////////////////

const likeTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  const existingLike = await Like.findOne({
    tweet: tweetId,
    owner: userId,
  });

  if (existingLike) {
    throw new ApiError(400, "You have already liked a video");
  }

  const like = new Like({ tweet: tweetId, owner: userId });
  await like.save();

  res.status(200).json(new ApiResponse(200, like, "You have liked the tweet"));
});

//////////////////////////////////////////////////////////////////

const getAllLikedVideo = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!userId) {
    throw new ApiError(400, "You are unauthorized");
  }

  const likedVideos = await Like.find({ owner: userId }).populate("video");

  if (!likedVideos || likedVideos.length === 0) {
    throw new ApiError(400, "There are no liked videos");
  }
  console.log(likedVideos);
  res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "All liked videos are given"));
});

export { likeVideo, likecomment, likeTweet, getAllLikedVideo };

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Like from "../models/like.model.js";
import Dislike from "../models/dislike.model.js";

const likeVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  // Check if the user has already liked the video
  const existingLike = await Like.findOne({ video: videoId, owner: userId });
  if (existingLike) {
    throw new ApiError(400, "You have already liked this video");
  }

  // Check if the user has disliked the video
  const existingDislike = await Dislike.findOne({
    video: videoId,
    owner: userId,
  });
  if (existingDislike) {
    await Dislike.deleteOne({ video: videoId, owner: userId });
  }

  // Add the like
  const like = new Like({ video: videoId, owner: userId });
  await like.save();

  res.status(200).json(new ApiResponse(200, like, "You have liked the video"));
});

///////////////////////////////////////////////////////////
const getVideoLikesCount = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Count the number of likes for the specified video
  const likesCount = await Like.countDocuments({ video: videoId });

  res
    .status(200)
    .json(
      new ApiResponse(200, { likesCount }, "Likes count retrieved successfully")
    );
});
//////////////////////////////////////////////////////

const likecomment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  // Check if the user has already liked the video
  const existingLike = await Like.findOne({
    comment: commentId,
    owner: userId,
  });
  if (existingLike) {
    throw new ApiError(400, "You have already liked this video");
  }

  // Check if the user has disliked the video
  const existingDislike = await Dislike.findOne({
    comment: commentId,
    owner: userId,
  });
  if (existingDislike) {
    await Dislike.deleteOne({ comment: commentId, owner: userId });
  }

  // Add the like
  const like = new Like({ comment: commentId, owner: userId });
  await like.save();

  res.status(200).json(new ApiResponse(200, like, "You have liked the video"));
});
/////////////////////////////////////////////////////////
const getCommentLikesCount = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  // Count the number of likes for the specified video
  const likesCount = await Like.countDocuments({ comment: commentId });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { likesCount },
        "Comment Likes count retrieved successfully"
      )
    );
});
/////////////////////////////////////////////////////////////

const getTweetsLikesCount = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  // Count the number of likes for the specified video
  const likesCount = await Like.countDocuments({ tweet: tweetId });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { likesCount },
        "Comment Likes count retrieved successfully"
      )
    );
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

  // Check if the user has disliked the video
  const existingDislike = await Dislike.findOne({
    tweet: tweetId,
    owner: userId,
  });
  if (existingDislike) {
    await Dislike.deleteOne({ tweet: tweetId, owner: userId });
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

  // Only find likes where the 'video' field is populated
  const likedVideos = await Like.find({ owner: userId, video: { $ne: null } })
    .select("video") // Select only the 'video' field
    .populate({
      path: "video",
      populate: {
        path: "owner",
        select: "username avatar Subscriber", // Only select necessary owner fields
      },
    });

  if (!likedVideos || likedVideos.length === 0) {
    throw new ApiError(400, "There are no liked videos");
  }

  // Extract the 'video' field from each Like document
  const videosOnly = likedVideos.map((like) => like.video);

  console.log(videosOnly);
  res
    .status(200)
    .json(new ApiResponse(200, videosOnly, "All liked videos are given"));
});

export {
  likeVideo,
  getVideoLikesCount,
  likecomment,
  getCommentLikesCount,
  likeTweet,
  getTweetsLikesCount,
  getAllLikedVideo,
};

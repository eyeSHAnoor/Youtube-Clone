import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Dislike from "../models/dislike.model.js";
import Like from "../models/like.model.js";

const DislikeVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  // Check if the user has already disliked the video
  const existingDislike = await Dislike.findOne({
    video: videoId,
    owner: userId,
  });
  if (existingDislike) {
    throw new ApiError(400, "You have already disliked this video");
  }

  // Check if the user has liked the video
  const existingLike = await Like.findOne({ video: videoId, owner: userId });
  if (existingLike) {
    // Remove the like
    await existingLike.deleteOne({ video: videoId, owner: userId });
  }

  // Add the dislike
  const dislike = new Dislike({ video: videoId, owner: userId });
  await dislike.save();

  res
    .status(200)
    .json(new ApiResponse(200, dislike, "You have disliked the video"));
});

///////////////////////////////////////////////////////////

const getVideoDisLikesCount = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // Count the number of likes for the specified video
  const dislikesCount = await Dislike.countDocuments({ video: videoId });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { dislikesCount },
        "disLikes count retrieved successfully"
      )
    );
});

///////////////////////////////////////////////////////////

const Dislikecomment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  const existingDisLike = await Dislike.findOne({
    comment: commentId,
    owner: userId,
  });
  if (existingDisLike) {
    throw new ApiError(400, "You have already disliked this comment");
  }

  const existinglike = await Like.findOne({
    comment: commentId,
    owner: userId,
  });
  if (existinglike) {
    await Like.deleteOne({ comment: commentId, owner: userId });
  }

  const dislike = new Dislike({ comment: commentId, owner: userId });
  await dislike.save();

  res
    .status(200)
    .json(new ApiResponse(200, dislike, "You have disliked the comment"));
});

//////////////////////////////////////////////////////////////////////////////

const getCommentDisLikesCount = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  // Count the number of likes for the specified video
  const dislikesCount = await Dislike.countDocuments({ comment: commentId });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { dislikesCount },
        "Comment disLikes count retrieved successfully"
      )
    );
});

//////////////////////////////////////////////////////////////////////////////

const DislikeTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  const existingDisLike = await Dislike.findOne({
    tweet: tweetId,
    owner: userId,
  });
  if (existingDisLike) {
    throw new ApiError(400, "You have already disliked this tweet");
  }

  const existinglike = await Like.findOne({
    tweet: tweetId,
    owner: userId,
  });
  if (existinglike) {
    await Like.deleteOne({ tweet: tweetId, owner: userId });
  }

  const dislike = new Dislike({ tweet: tweetId, owner: userId });
  await dislike.save();

  res
    .status(200)
    .json(new ApiResponse(200, dislike, "You have disliked the tweet"));
});
////////////////////////////////////////////////////////////////////////////

const getTweetsDisLikesCount = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  // Count the number of likes for the specified video
  const dislikesCount = await Dislike.countDocuments({ tweet: tweetId });

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { dislikesCount },
        "Comment disLikes count retrieved successfully"
      )
    );
});

export {
  DislikeVideo,
  getVideoDisLikesCount,
  Dislikecomment,
  getCommentDisLikesCount,
  DislikeTweet,
  getTweetsDisLikesCount,
};

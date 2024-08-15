import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Tweet from "../models/tweet.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const addTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user._id;

  if (!content) {
    throw new ApiError(404, "content of tweet is not given");
  }

  const tweet = await Tweet.create({
    content,
    owner: userId,
  });

  if (!tweet) {
    throw new ApiError(500, "Error in creating tweet");
  }

  const populatedTweet = await tweet.populate("owner", "avatar username");

  res.status(200).json(new ApiResponse(200, populatedTweet, "tweet is public"));
});

/////////////////////////////////////////////////////////////////////

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(tweetId)) {
    return res.status(400).json(new ApiResponse(400, {}, "Invalid Tweet ID"));
  }

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deletedTweet) {
    return res.status(404).json(new ApiResponse(404, {}, "Tweet not found"));
  }

  res.status(200).json(new ApiResponse(200, {}, "Tweet is deleted"));
});

////////////////////////////////////////////////////////////////////////

const getPersonalTweet = asyncHandler(async (req, res) => {
  const owner = req.user._id;

  const tweets = await Tweet.find({ owner }).populate(
    "owner",
    "avatar username"
  );

  if (!tweets) {
    throw new ApiError(404, "There are no your tweets");
  }

  res.status(200).json(new ApiResponse(200, tweets, "tweet of user"));
});

////////////////////////////////////////////////////////////////////////

const getUserTweet = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const tweets = await Tweet.find({ owner: userId }).populate(
    "owner",
    "avatar username"
  );

  if (!tweets) {
    throw new ApiError(404, "There are no your tweets");
  }

  res.status(200).json(new ApiResponse(200, tweets, "tweet of user"));
});
export { addTweet, deleteTweet, getPersonalTweet, getUserTweet };

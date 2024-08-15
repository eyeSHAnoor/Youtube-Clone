import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import Subscription from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const subscribeUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id; // Assumed current user ID

  console.log("User ID to follow:", userId);
  console.log("Current user ID:", currentUserId);

  if (!currentUserId) {
    return res.status(400).json(new ApiError(400, "You are unauthorized"));
  }

  try {
    // Check if already following
    const existingSubs = await Subscription.findOne({
      subscriber: currentUserId,
      channel: userId,
    });

    if (existingSubs) {
      return res
        .status(400)
        .json(new ApiError(400, "You have already subscribed"));
    }

    // Create new follow record
    const subscribe = new Subscription({
      subscriber: currentUserId,
      channel: userId,
    });

    await subscribe.save();
    console.log("Follow record created:", subscribe);

    // Update the current user's subscribed list
    const updateCurrentUser = await User.findByIdAndUpdate(
      currentUserId,
      {
        $addToSet: { Subscribed: userId },
      },
      { new: true }
    );

    console.log("Updated current user:", updateCurrentUser);

    // Update the target user's subscriber list
    const updateTargetUser = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { Subscriber: currentUserId },
      },
      { new: true }
    );

    console.log("Updated target user:", updateTargetUser);

    res.status(200).json({ message: "Followed", isFollowed: true });
  } catch (err) {
    console.error("Error during follow operation:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

////////////////////////////////////////////////////////////////////////////////

const unsubscribeUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id; // Assumed current user ID

  console.log("User ID to unsubscribe:", userId);
  console.log("Current user ID:", currentUserId);

  if (!currentUserId) {
    return res.status(400).json(new ApiError(400, "You are unauthorized"));
  }

  try {
    // Check if currently following
    const existingSubs = await Subscription.findOne({
      subscriber: currentUserId,
      channel: userId,
    });

    if (!existingSubs) {
      return res
        .status(400)
        .json(new ApiError(400, "You are not subscribed to this user"));
    }

    // Remove follow record
    await Subscription.deleteOne({ _id: existingSubs._id });
    console.log("Unsubscribe record deleted:", existingSubs);

    // Update the current user's subscribed list
    const updateCurrentUser = await User.findByIdAndUpdate(
      currentUserId,
      {
        $pull: { Subscribed: userId },
      },
      { new: true }
    );

    console.log("Updated current user:", updateCurrentUser);

    // Update the target user's subscriber list
    const updateTargetUser = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { Subscriber: currentUserId },
      },
      { new: true }
    );

    console.log("Updated target user:", updateTargetUser);

    res.status(200).json({ message: "Unsubscribed", isUnfollowed: true });
  } catch (err) {
    console.error("Error during unfollow operation:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

////////////////////////////////////////////////////////////////////////////

const subscribeStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id; // Assumed current user ID from JWT middleware

  console.log("User ID to check:", userId);
  console.log("Current user ID:", currentUserId);

  try {
    if (!currentUserId) {
      return new ApiError(401, "Unauthorized: No user ID found");
    }

    // Check if the current user is following the target user
    const followRecord = await Subscription.findOne({
      channel: userId,
      subscriber: currentUserId,
    });

    // Return follow status
    console.log(followRecord);
    if (followRecord) {
      return res
        .status(200)
        .json(new ApiResponse(200, { isFollowed: true }, "Subscribed"));
    } else {
      return res
        .status(200)
        .json(new ApiResponse(200, { isFollowed: false }, "Not Subscribed"));
    }
  } catch (err) {
    console.error("Error fetching follow status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//////////////////////////////////////////////////////////////////////////////

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  // Find all subscriptions where the user is the subscriber
  const subscriptions = await Subscription.find({
    subscriber: new mongoose.Types.ObjectId(userId),
  }).populate("channel", "-password -refreshToken");

  // Extract the channel details from the subscriptions
  const subscribedChannels = subscriptions.map(
    (subscription) => subscription.channel
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscribedChannels, "you have subscribed them all")
    );
});
///////////////////////////////////////////////////////////////////////////////////

const getSubscribers = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  // Find all subscriptions where the user is the subscriber
  const subscriptions = await Subscription.find({
    channel: new mongoose.Types.ObjectId(userId),
  }).populate("subscriber", "-password -refreshToken");

  // Extract the channel details from the subscriptions
  const subscriber = subscriptions.map(
    (subscription) => subscription.subscriber
  );

  return res
    .status(200)
    .json(new ApiResponse(200, subscriber, "your subscriber"));
});
///////////////////////////////////////////////////////////////////////////////////

const getSubscribedChannelsOfUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  // Find all subscriptions where the user is the subscriber
  const subscriptions = await Subscription.find({
    subscriber: new mongoose.Types.ObjectId(userId),
  }).populate("channel", "-password -refreshToken");

  // Extract the channel details from the subscriptions
  const subscribedChannels = subscriptions.map(
    (subscription) => subscription.channel
  );

  return res
    .status(200)
    .json(new ApiResponse(200, subscribedChannels, "User subscribed them all"));
});

////////////////////////////////////////////////////////////////////////////////////

const getSubscribersOfUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  // Find all subscriptions where the user is the subscriber
  const subscriptions = await Subscription.find({
    channel: new mongoose.Types.ObjectId(userId),
  }).populate("subscriber", "-password -refreshToken");

  // Extract the channel details from the subscriptions
  const subscriber = subscriptions.map(
    (subscription) => subscription.subscriber
  );

  return res
    .status(200)
    .json(new ApiResponse(200, subscriber, "User subscribed them all"));
});

export {
  subscribeUser,
  getSubscribers,
  unsubscribeUser,
  subscribeStatus,
  getSubscribedChannels,
  getSubscribedChannelsOfUser,
  getSubscribersOfUser,
};

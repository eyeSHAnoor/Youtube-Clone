import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong while generationg token");
  }
};
///////////////////////////////////////////////
//////////////////////////////////////////////////

const registerUser = asyncHandler(async (req, res) => {
  // Get user details from frontend
  const { username, fullname, email, password } = req.body;

  // Validation - not empty
  if (
    [username, fullname, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Full name is required");
  }

  // Check if user already exists: username, email
  const endUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (endUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Check for images, check for avatar
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload them to Cloudinary, avatar uploaded or not
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Create user object - create entry in DB
  const newUser = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username,
  });

  // Remove password and refresh token field from response
  const createUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  // Check for user creation
  if (!createUser) {
    throw new ApiError(500, "Something wrong happened while creating user");
  }

  // Return response
  return res
    .status(200)
    .json(new ApiResponse(200, createUser, "User registered successfully"));
});

/////////////////////////////////////////////////////////////

const loginUser = asyncHandler(async (req, res) => {
  //req.body=> data
  const { email, username, password } = req.body;

  //username or email
  if (!username && !email) {
    throw new ApiError(400, "username or email is required");
  }

  //find the user
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "user not found");
  }

  //password check

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(404, "Invalid User Credentials");
  }

  // access and refresh token

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  //send cookie
  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  //response
  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

///////////////////////////////////////////////////

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    { new: true }
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", option)
    .clearCookie("refreshCookie", option)
    .json(new ApiResponse(200, {}, "user logged out"));
});

/////////////////////////////////////////////////////

const refreshAccesssToken = asyncHandler(async (req, res) => {
  try {
    const incomingReftoken =
      req.cookies.refreshToken ||
      req.body.refreshToken ||
      req.headers.authorization;

    if (!incomingReftoken) {
      throw new ApiError(401, "Unauthorized Access");
    }

    // Verify the refresh token
    const decodedToken = jwt.verify(
      incomingReftoken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken._id); // Correct usage

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    if (incomingReftoken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    // Set cookies and respond
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Ensure secure flag is set based on environment
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Invalid refresh token or something went wrong");
  }
});

///////////////////////////////////////////////////////

const changeCurrPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  const isPwdCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPwdCorrect) {
    throw new ApiError(400, "incorrect old password");
  }

  user.password = newPassword;

  const savedUser = await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

///////////////////////////////////////////////////////////////

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "current user fetched successfully"));
});

////////////////////////////////////////////////////////

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullname: fullname,
        email: email,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details are updated"));
});

/////////////////////////////////////////////////////////

const updateAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "error while uploading on cloudinary");
  }
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  res.status(200).json(new ApiResponse(200, user, "avatr is updated"));
});

/////////////////////////////////////////////////////////

const updateCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover Image file is missing");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new ApiError(400, "error while uploading on cloudinary");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");

  res.status(200).json(new ApiResponse(200, user, "cover Image is updated"));
});

////////////////////////////////////////////////////
const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username.trim()) {
    throw new ApiError(400, "username is missing");
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        email: 1,
        coverImage: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "Channel doesn't exist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channel[0], "user channel fetched"));
});

////////////////////////////////////////////////////////////

const getwatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: {
                $project: {
                  fullname: 1,
                  username: 1,
                  avatar: 1,
                },
              },
            },
          },
          {
            $add: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .ApiResponse(200, user[0].watchHistory, "watch History fwtched from user");
});

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccesssToken,
  changeCurrPassword,
  getCurrentUser,
  updateAccountDetails,
  updateAvatar,
  updateCoverImage,
  getUserProfile,
  getwatchHistory,
};

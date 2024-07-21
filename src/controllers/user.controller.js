import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //get user detail from frontened
  const { username, fullname, email, password } = req.body;

  //validation - not empty
  if (
    [username, fullname, email, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "fullName is required");
  }
  //check if user already exist: username , email
  const endUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (!endUser) {
    throw new ApiError(409, "User with email or username is already exist");
  }

  //check for images, check for avatar

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  //upload them to cloudinary, avatar uploaded or not

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //create user object - create entry in db

  const newUser = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage.url || "",
    email,
    password,
  });

  //remove password and refresh token field from response

  const createUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  //check for user creation

  if (!createUser) {
    throw new ApiError(500, "Something wrong happened while ");
  }

  //return res
  return res
    .status(200)
    .json(new ApiResponse(200, createUser, "user registered successfully"));
});

export { registerUser };

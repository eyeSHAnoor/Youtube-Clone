import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  //get user detail from frontened
  //validation - not empty
  //check if user already exist: username , email
  //check for images, check for avatar
  //upload them to cloudinary, avatar uploaded or not
  //create user object - create entry in db
  //remove password and refresh token field from response
  //check for user creation
  //return res
});

export { registerUser };

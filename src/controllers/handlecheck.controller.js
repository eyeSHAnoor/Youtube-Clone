import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toddleHandlecheck = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, { message: "OK" }, "All Done"));
});

export { toddleHandlecheck };

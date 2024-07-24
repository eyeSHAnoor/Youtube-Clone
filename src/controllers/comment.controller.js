import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Comment from "../models/comments.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import Video from "../models/videoSchema.js";

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;
  const { userId } = req.user._id;

  if (!content) {
    throw new ApiError(404, "content of comment is not given");
  }

  if (!videoId) {
    throw new ApiError(404, "videoId must be passed in parameters");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: userId,
  });

  if (!comment) {
    throw new ApiError(500, "Error in creating comment");
  }

  res.status(200).json(new ApiResponse(200, comment, "comment is public"));
});

//////////////////////////////////////////////////////////////

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  console.log(videoId, page, limit);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    populate: [
      {
        path: "owner",
        select: "username avatar",
      },
    ],
  };

  // Use aggregation pipeline with aggregatePaginate

  const aggregate = Comment.aggregate({
    $match: {
      video: new mongoose.Types.ObjectId(videoId), // Ensure videoId is an ObjectId
    },
  });

  const comments = await Comment.aggregatePaginate(aggregate, options);

  if (!comments || comments.docs.length === 0) {
    throw new ApiError(404, "No comments were found");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        comments,
        "All comments related to the particular video are here"
      )
    );
});

/////////////////////////////////////////////////////////////////////

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  await Comment.findByIdAndDelete(commentId);

  res.status(200).json(new ApiResponse(200, {}, "Comment is deleted"));
});

export { addComment, getVideoComments, deleteComment };

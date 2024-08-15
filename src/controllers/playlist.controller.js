import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import PlayList from "../models/playList.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description, videoId } = req.body;
  const owner = req.user._id;

  if ([name, description, owner].some((fields) => fields === "")) {
    throw new ApiError(404, "name , description or login is required");
  }

  const playlist = new PlayList({
    name,
    description,
    video: videoId,
    owner,
  });

  await playlist.save();

  const populatedPlaylist = await PlayList.findById(playlist._id)
    .populate({
      path: "video",
      populate: {
        path: "owner", // Assuming the video schema has an owner field
        select: "name avatar", // Select fields to return for the video's owner
      },
    })
    .populate({
      path: "owner",
      select: "name avatar", // Select fields to return for the playlist's owner
    });

  res
    .status(200)
    .json(new ApiResponse(200, populatedPlaylist, "playlist was created"));
});

///////////////////////////////////////////////////////////

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { videoId } = req.body;

  if (!videoId) {
    throw new ApiError(400, "Video ID is required");
  }

  const playlist = await PlayList.findById(playlistId);

  if (!playlist) {
    throw new ApiError(404, "There is no playlist like that");
  }
  if (playlist.video.includes(videoId)) {
    throw new ApiError(400, "Video is already in the playlist");
  }

  await playlist.video.push(videoId);

  await playlist.save();

  res.status(200).json(new ApiResponse(200, playlist, "Video is added"));
});

///////////////////////////////////////////////////////////////

const getVideosStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.body;
  const { playlistId } = req.params;

  const isAdded = await PlayList.findOne({
    _id: playlistId,
    video: videoId,
  });

  if (isAdded) {
    res
      .status(200)
      .json({ status: true, message: "Video is already in the playlist." });
  } else {
    res
      .status(200)
      .json({ status: false, message: "Video is not in the playlist." });
  }
});

///////////////////////////////////////////////////////////////

const getUserPlaylist = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const playlist = await PlayList.find({ owner: userId })
    .populate({
      path: "video",
      populate: {
        path: "owner", // Populates the owner of the video
        select: "username avatar Subscriber", // Select only the fields you need, e.g., avatar, name
      },
    })
    .populate({
      path: "owner",
      select: "avatar", // Select only the avatar field from the owner
    });

  if (!playlist) {
    throw new ApiError(404, "There is no playlist like that");
  }

  res.status(200).json(new ApiResponse(200, playlist, "Video is added"));
});

////////////////////////////////////////////////////////////////////

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { videoId } = req.body;

  const playlist = await PlayList.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        video: videoId,
      },
    },
    {
      new: true,
    }
  )
    .populate({
      path: "video",
      populate: {
        path: "owner", // Populates the owner of the video
        select: "username avatar Subscriber", // Select only the fields you need, e.g., avatar, name
      },
    })
    .populate({
      path: "owner",
      select: "avatar", // Select only the avatar field from the owner
    });
  if (!playlist) {
    throw new ApiError(404, "Problem in finding playlist");
  }

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Video is deleted from playlist"));
});

/////////////////////////////////////////////////////////////////////////////

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  await PlayList.findByIdAndDelete(playlistId);

  res.status(200).json(new ApiResponse(200, {}, "Playlist is deleted "));
});

export {
  createPlaylist,
  addVideoToPlaylist,
  getUserPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  getVideosStatus,
};

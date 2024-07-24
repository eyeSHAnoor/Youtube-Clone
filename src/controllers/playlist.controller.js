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

  res.status(200).json(new ApiResponse(200, playlist, "playlist was created"));
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

const getUserPlaylist = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const playlist = await PlayList.find({ owner: userId }).populate("video");

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
  ).populate("video");
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
};

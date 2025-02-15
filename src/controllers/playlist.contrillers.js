import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.models.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if (!name || !description) {
        throw new APIError(400, "Name and description are required")
    }

    const playlist = Playlist.create({
        name,
        description,
        owner: req.user._id
    });

    return res
        .status(201)
        .json(new APIResponse(201, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new APIError(400, "Invalid user id")
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ]);

    if (!playlist) {
        return res
            .status(200)
            .json(new APIResponse(200, [], "No playlists found"))
    }

    return res
        .status(200)
        .json(new APIResponse(200, playlist, "Playlists found sucessfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new APIError(400, "Invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new APIError(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(new APIResponse(200, playlist, "Playlist found sucessfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new APIError(400, "Invalid playlist id or video id")
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new APIError(404, "Playlist not found")
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res
        .status(200)
        .json(new APIResponse(200, playlist, "Video added to playlist successfully"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new APIError(400, "Invalid playlist id or video id")
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new APIError(404, "Playlist not found")
    }

    playlist.videos.pull(videoId);
    await playlist.save();

    return res
        .status(200)
        .json(new APIResponse(200, playlist, "Video added to playlist successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new APIError(400, "Invalid playlist id")
    }

    const response = await Playlist.findByIdAndDelete(playlistId);
    if (!response) {
        throw new APIError(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(new APIResponse(200, null, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!isValidObjectId(playlistId)) {
        throw new APIError(400, "Invalid playlist id")
    }

    if (!name || !description) {
        throw new APIError(400, "Name and description are required")
    }

    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new APIError(404, "Playlist not found")
    }

    playlist.name = name;
    playlist.description = description;
    await playlist.save();

    return res
        .status(200)
        .json(new APIResponse(200, playlist, "Playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
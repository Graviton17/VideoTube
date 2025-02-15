import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.models.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new APIError(400, "Invalid video id")
    }

    const like = await Like.findOneAndDelete({
        $and: [
            { video: videoId },
            { likedBy: req.user._id }
        ]
    });

    if (!like) {
        const response = await Like.create({
            video: videoId,
            likedBy: req.user._id
        });

        if (!response) {
            throw new APIError(500, "Failed to like video")
        }
    }

    return res
        .status(200)
        .json(new APIResponse(200, "Video like toggled successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new APIError(400, "Invalid video id")
    }

    const like = await Like.findOneAndDelete({
        $and: [
            { comment: commentId },
            { likedBy: req.user._id }
        ]
    });

    if (!like) {
        const response = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        });

        if (!response) {
            throw new APIError(500, "Failed to like comment")
        }
    }

    return res
        .status(200)
        .json(new APIResponse(200, "Comment like toggled successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new APIError(400, "Invalid video id")
    }

    const like = await Like.findOneAndDelete({
        $and: [
            { tweet: tweetId },
            { likedBy: req.user._id }
        ]
    });

    if (!like) {
        const response = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        });

        if (!response) {
            throw new APIError(500, "Failed to like tweet")
        }
    }

    return res
        .status(200)
        .json(new APIResponse(200, "Tweet like toggled successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user._id),
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $unwind: "$video"
        },
        {
            $project: {
                _id: "$video._id",
                title: "$video.title",
                description: "$video.description",
                createdAt: "$video.createdAt",
                updatedAt: "$video.updatedAt"
            }
        }
    ]);

    if (likedVideos.length === 0) {
        return res
            .status(404)
            .json(new APIResponse(404, "No liked videos found"));
    }

    return res
        .status(200)
        .json(new APIResponse(200, likedVideos, "Liked videos fetched successfully"));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
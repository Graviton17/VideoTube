import mongoose from "mongoose"
import { Video } from "../models/video.models.js"
import { Subscription } from "../models/subscription.models.js"
import { Like } from "../models/like.models.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const totalSubscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $count: "totalSubscribers"
        }
    ]);

    const totalVideos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $count: "totalVideos"
        }
    ]);

    const totalLikes = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $facet: {
                videoLikes: [
                    { $match: { type: "video" } },
                    { $count: "count" }
                ],
                commentLikes: [
                    { $match: { type: "comment" } },
                    { $count: "count" }
                ],
                tweetLikes: [
                    { $match: { type: "tweet" } },
                    { $count: "count" }
                ]
            }
        }
    ]);

    const subs = totalSubscribers[0]?.totalSubscribers ?? 0;
    const vids = totalVideos[0]?.totalVideos ?? 0;
    const videoLikes = totalLikes[0]?.videoLikes[0]?.count ?? 0;
    const commentLikes = totalLikes[0]?.commentLikes[0]?.count ?? 0;
    const tweetLikes = totalLikes[0]?.tweetLikes[0]?.count ?? 0;

    return res
        .status(200)
        .json(new APIResponse(200, {
            subscribers: subs,
            videos: vids,
            videoLikes,
            commentLikes,
            tweetLikes
        }, "Channel stats"));
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const videos = await Video.aggregate([
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

    return res
        .status(200)
        .json(new APIResponse(200, videos, "Channel videos"));
});

export {
    getChannelStats,
    getChannelVideos
}
import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

// channelId and subscriber is both user
const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!isValidObjectId(channelId)) {
        throw new APIError(400, "Invalid channel id")
    }

    const subscriberId = req.user._id;
    const channel = await User.findById(channelId);
    if (!channel) {
        throw new APIError(404, "Channel not found")
    }

    const isSubscribed = await Subscription.findOneAndDelete({
        $and: [
            { subscriber: subscriberId },
            { channel: channelId }
        ]
    });

    if (!isSubscribed) {
        const subscription = await Subscription.create({
            subscriber: subscriberId,
            channel: channelId
        });

        if (!subscription) {
            throw new APIError(500, "Subscription failed")
        }

        return res
            .status(201)
            .json(new APIResponse(201, null, "Unsubscription successful"));
    }

    return res
        .status(201)
        .json(new APIResponse(201, isSubscribed, "Subscription successful"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    if (!isValidObjectId(channelId)) {
        throw new APIError(400, "Invalid channel id")
    }

    const channel = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers"
            }
        },
        {
            $project: {
                _id: 1,
                "subscribers.username": 1,
                "subscribers.email": 1
            }
        }
    ]);

    if (channel.length === 0) {
        return res
            .status(200)
            .json(new APIResponse(200, [], "No subscribers found"));
    }

    return res
        .status(200)
        .json(new APIResponse(200, channel, "Subscribers feched successfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new APIError(400, "Invalid subscriber id")
    }

    const subscriber = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channels"
            }
        },
        {
            $project: {
                _id: 1,
                "channels.username": 1,
                "channels.email": 1
            }
        }
    ]);

    if (subscriber.length === 0) {
        return res
            .status(200)
            .json(new APIResponse(200, [], "No channel subscribed"));
    }

    return res
        .status(200)
        .json(new APIResponse(200, subscriber, "Subscribed channel feched successfully"));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}
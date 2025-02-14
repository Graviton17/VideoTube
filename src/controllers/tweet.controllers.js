import { APIResponse } from '../utils/APIResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { APIError } from '../utils/APIError.js';
import { User } from '../models/user.models.js';
import { Tweet } from '../models/tweet.models.js';
import mongoose, { isValidObjectId } from 'mongoose';

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        throw new APIError(400, 'Content is required');
    }

    const user = req.user;
    if (!isValidObjectId(user._id)) {
        throw new APIError(400, "Invalid user ID");
    }

    const newTweet = await Tweet.create({
        content,
        owner: user._id
    });

    if (!newTweet) {
        throw new APIError(500, 'Failed to create tweet');
    }

    // populate the owner field with the user's username, email, and full name
    const tweet = await Tweet.findById(newTweet._id)
        .populate('owner', 'username email fullName')

    if (!tweet) {
        throw new APIError(500, 'Failed to fetch created tweet');
    }

    return res
        .status(201)
        .json(new APIResponse(201, tweet, 'Tweet created successfully'));
});

const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new APIError(400, 'Invalid user ID');
    }

    const tweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
            }
        }
    ]);

    if (!tweets.length) {
        throw new APIError(404, 'User has no tweets');
    }

    return res
        .status(200)
        .json(new APIResponse(200, tweets, "User tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId;

    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        throw new APIError(404, 'Tweet not found');
    }

    const { content } = req.body;
    if (!content) {
        throw new APIError(400, 'Content is required');
    }

    tweet.content = content;
    await tweet.save();

    return res
        .status(200)
        .json(new APIResponse(200, tweet, 'Tweet updated successfully'));
});

const deleteTweet = asyncHandler(async (req, res) => {
    const tweetId = req.params.tweetId;
    if (!tweetId) {
        throw new APIError(400, 'Tweet ID is required');
    }

    const response = await Tweet.deleteOne({ _id: tweetId });
    if (!response.deletedCount) {
        throw new APIError(404, 'Tweet not found');
    }

    return res
        .status(200)
        .json(new APIResponse(200, null, 'Tweet deleted successfully'));
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
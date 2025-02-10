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
    // TODO: get user tweets
});

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
});

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
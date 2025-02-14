import mongoose from "mongoose"
import { Comment } from "../models/comment.models.js"
import { Video } from "../models/video.models.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new APIError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new APIError(404, "Video not found");
    }

    const { content } = req.body;
    if (!content) {
        throw new APIError(400, "Content is required");
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    });

    if (!comment) {
        throw new APIError(500, "Failed to add comment");
    }

    return res
        .status(201)
        .json(new APIResponse(201, { comment }, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if(!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new APIError(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId);
    if(!comment) {
        throw new APIError(404, "Comment not found");
    }

    const { content } = req.body;
    if(!content) {
        throw new APIError(400, "Content is required");
    }

    comment.content = content.trim();
    await comment.save();

    return res
        .status(200)
        .json(new APIResponse(200, { comment }, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};
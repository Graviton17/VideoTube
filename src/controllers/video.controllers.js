import { Video } from "../models/video.models.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType } = req.body;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    if (isNaN(pageNumber) || pageNumber <= 0) {
        throw new APIError(400, "Invalid page value");
    }
    if (isNaN(limitNumber) || limitNumber <= 0) {
        throw new APIError(400, "Invalid limit value");
    }

    const skip = (pageNumber - 1) * limitNumber;

    let searchedVideo = await Video.aggregate([
        {
            $search: {
                index: "VideoTitle",
                text: {
                    query: query,
                    path: {
                        wildcard: "*"
                    }
                }
            }
        },
        {
            $sort: {
                [sortBy || "_id"]: sortType === "desc" ? -1 : 1
            }
        },
        {
            $skip: skip
        },
        {
            $limit: limitNumber
        }
    ]);

    if (searchedVideo.length === 0) {
        return res
            .status(404)
            .json(new APIResponse(404, [], "No videos found"));
    }

    return res
        .status(200)
        .json(new APIResponse(200, searchedVideo, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const videoFile = req.files?.videoFile?.[0];
    if (videoFile && !videoFile.mimetype.startsWith("video/")) {
        return res.status(400).json({ error: "Invalid video file type" });
    }

    const thumbFile = req.files?.thumbnail?.[0];
    if (thumbFile && !thumbFile.mimetype.startsWith("image/")) {
        return res.status(400).json({ error: "Invalid thumbnail file type" });
    }

    const user = req.user;
    const uploadVideo = await uploadOnCloudinary(videoFile.path);
    if (!uploadVideo) {
        return res.status(500).json({ error: "Failed to upload video" });
    }

    const { duration } = uploadVideo;

    const uploadThumb = await uploadOnCloudinary(thumbFile.path);
    if (!uploadThumb) {
        return res.status(500).json({ error: "Failed to upload thumbnail" });
    }

    const video = await Video.create({
        title,
        description,
        videoFile: uploadVideo.url,
        thumbnail: uploadThumb.url,
        owner: user._id,
        duration
    });

    if (!video) {
        await deleteFromCloudinary(uploadVideo);
        await deleteFromCloudinary(uploadThumb);
        return res.status(500).json({ error: "Failed to publish video" });
    }

    return res
        .status(201)
        .json(new APIResponse(201, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new APIError(400, "Video ID is required");
    }

    const video = await Video
        .findById(videoId)
        .populate("owner", "name email")

    if (!video) {
        throw new APIError(404, "Video not found");
    }

    return res
        .status(201)
        .json(new APIResponse(200, video, "Video fecched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body

    const video = await Video.findById(videoId);
    if (!video) {
        throw new APIError(404, "Video not found");
    }

    const user = req.user;
    if (title) user.title = title;
    if (description) user.description = description;

    const thumbFile = req.file;
    if (thumbFile && !thumbFile.mimetype.startsWith("image/")) {
        return res.status(400).json({ error: "Invalid thumbnail file type" });
    }

    const thumbnailUpload = await uploadOnCloudinary(thumbFile.path);
    if (!thumbnailUpload) {
        return new APIError(500, "Failed to upload thumbnail");
    }

    const thumbnailDelete = await deleteFromCloudinary(video.thumbnail);
    if (!thumbnailDelete) {
        return new APIError(500, "Failed to delete thumbnail");
    }

    video.thumbnail = thumbnailUpload.url;
    await video.save();

    return res
        .status(200)
        .json(new APIResponse(200, video, "Video & Deatil updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId);
    if (!video) {
        throw new APIError(404, "Video not found");
    }

    const response = await Video.findByIdAndDelete(videoId);
    if (!response) {
        throw new APIError(500, "Failed to delete video");
    }

    const deleteVideo = await deleteFromCloudinary(video.videoFile);
    if (!deleteVideo) {
        return new APIError(500, "Failed to delete video");
    }

    const deleteThumbnail = await deleteFromCloudinary(video.thumbnail);
    if (!deleteThumbnail) {
        return new APIError(500, "Failed to delete thumbnail");
    }

    return res
        .status(200)
        .json(new APIResponse(200, [], "Video deleted successfully"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findById(videoId);
    if (!video) {
        throw new APIError(404, "Video not found");
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res
        .status(200)
        .json(new APIResponse(200, video, "Video publish status updated successfully"));
});;

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
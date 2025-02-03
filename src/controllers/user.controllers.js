import { APIResponse } from '../utils/APIResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { APIError } from '../utils/APIError.js';
import { User } from '../models/user.models.js';

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, username, email, password } = req.body;

    // user validation
    if ([fullName, username, email, password].some((field) => field?.trim() === "" || field === undefined)) {
        throw new APIError(400, "All fields are required");
    }

    // check if user already exists
    const isUserExist = await User.exists({ $or: [{ username }, { email }] });
    if (isUserExist) {
        throw new APIError(409, "User already exists");
    }

    // find the local path of the uploaded files
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    // avatar is required
    if (!avatarLocalPath) {
        throw new APIError(400, "Error while processing avatar file");
    }
    
    // upload avatar and cover image on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar) {
        throw new APIError(500, "Failed to upload avatar");
    }

    let coverImage;
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
        if (!coverImage) {
            throw new APIError(500, "Failed to upload cover image");
        }
    }

    // create user
    const user = await User.create({
        fullName,
        username,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    // find the user from the database
    const databaseUser = await User.findById(user._id).select("-password -refreshToken");

    if (!databaseUser) {
        throw new APIError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new APIResponse(201, databaseUser, "User registered successfully")
    );
});

export { registerUser }
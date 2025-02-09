import { APIResponse } from '../utils/APIResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { APIError } from '../utils/APIError.js';
import { User } from '../models/user.models.js';
import jwtDecode from 'jsonwebtoken';

const generateAccessTokenAndRefreshToken = async (userID) => {
    try {
        const user = await User.findById(userID);
    
        // generate access token
        const accessToken = user.generateAccessToken();
    
        // generate refresh token
        const refreshToken = user.generateRefreshToken();
    
        // save refresh token in the database
        user.refreshToken = refreshToken;
        // save user without validation (means without checking the required fields)
        await user.save({ validateBeforeSave: false });
    
        return { accessToken, refreshToken };
    } catch (error) {
        throw new APIError(500, "Something went wrong while generating tokens");
    }
}

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

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // find user by email
    const user = await User.findOne({
        $or: [{ email }, { username: email }]
    });

    // check if user exists
    if (!user) {
        throw new APIError(401, "Invalid credentials");
    }

    // check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new APIError(401, "Invalid credentials");
    }

    // generate access token and refresh token
    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    if (!loggedInUser) {
        throw new APIError(500, "Something went wrong while logging in the user");
    }

    // set the cookies options
    const options = {
        httpOnly: true, // to prevent access from client side
        secure: process.env.NODE_ENV === "production", // to only send the cookie over https in production
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new APIResponse(
            200,
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User logged in successfully"
        ));
});

const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        { new: true } // to set the updated document in the database
    )

    if (!user) {
        throw new APIError(500, "Something went wrong while logging out the user");
    }

    const options = {
        httpOnly: true, // to prevent access from client side
        secure: process.env.NODE_ENV === "production", // to only send the cookie over https in production
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new APIResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken; // this body.refreshToken is for mobile app

    if (!refreshToken) {
        throw new APIError(401, "Cannot find refresh token");
    }

    // decode the refresh token
    const decodedToken = await jwtDecode.verify(refreshToken, process.env.Refresh_Token_Secret);
    if (!decodedToken) {
        throw new APIError(401, "Invalid refresh token");
    }

    // find the user by id
    const user = await User.findById(decodedToken?._id);
    if (!user) {
        throw new APIError(404, "User not found");
    }

    try {
        // check if the refresh token is valid
        if (user?.refreshToken !== refreshToken) {
            throw new APIError(401, "Invalid refresh token");
        }

        // generate new access token and refresh token
        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

        // set the cookies options
        const options = {
            httpOnly: true, // to prevent access from client side
            secure: process.env.NODE_ENV === "production", // to only send the cookie over https in production
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new APIResponse(
                200,
                {
                    accessToken,
                    refreshToken
                },
                "Tokens refreshed successfully"
            ));
    } catch (error) {
        throw new APIError(500, "Something went wrong while refreshing tokens");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    // check if current password is correct
    const isPasswordCorrect = await req.user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
        throw new APIError(401, "Invalid current password");
    }

    // get user from the database
    const user = User.findById(req.user?._id);
    if (!user) {
        throw new APIError(404, "User not found");
    }

    // update the password
    user?.password = newPassword;
    const response = await user?.save({ validateBeforeSave: false });

    if (!response) {
        throw new APIError(500, "Something went wrong while changing the password");
    }

    return res
        .status(200)
        .json(new APIResponse(
            200,
            {},
            "Password changed successfully"
        ));
});

const getUserDetails = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new APIResponse(
            200,
            req.user,
            "User details fetched successfully"
        ));
});

const updateUserDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if(!fullName || !email) {
        throw new APIError(400, "All fields are required");
    }

    // check if email is already taken
    const isEmailTaken = await User.exists({ email });
    if (isEmailTaken) {
        throw new APIError(409, "Email is already taken");
    }

    // update user details
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new APIResponse(
            200,
            user,
            "User details updated successfully"
        ));
});

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.files?.path;

    if (!avatarLocalPath) {
        throw new APIError(400, "Error while processing avatar file");
    }

    // Delete old avatar from cloudinary
    if (req.user.avatar) {
        throw new APIError(500, "Failed to update avatar");
        
    }

    const imageId = req.user.avatar.split('/').pop().split('.')[0];
    const response = await cloudinary.uploader.destroy(imageId);

    if (!response) {
        throw new APIError(500, "Failed to update avatar");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar.url) {
        throw new APIError(500, "Failed to update avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar: avatar?.url
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new APIResponse(
            200,
            user,
            "Avatar updated successfully"
        ));
});

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.files?.path;

    if (!coverImageLocalPath) {
        throw new APIError(400, "Error while processing cover image file");
    }

    // Delete old cover image from cloudinary
    if (req.user.coverImage) {
        const imageId = req.user.coverImage.split('/').pop().split('.')[0];
        const response = await cloudinary.uploader.destroy(imageId);

        if (!response) {
            throw new APIError(500, "Failed to update cover image");
        }
    }

    // upload new cover image on cloudinary
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage.url) {
        throw new APIError(500, "Failed to update cover image");
    }

    // update cover image in the database
    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new APIResponse(
            200,
            user,
            "Cover image updated successfully"
        ));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getUserDetails,
    updateUserDetails,
    updateAvatar,
    updateCoverImage
};
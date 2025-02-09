import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getUserDetails,
    updateUserDetails,
    updateAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getUserWatchHistory
} from "../controllers/user.controllers.js";
import { Router } from "express";
import upload from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const userRouter = Router();

// first middleware upload the avatar and coverImage and than give control to the controller(registerUser)
userRouter.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser);

userRouter.route("/login").post(loginUser);
userRouter.route("/refresh").post(refreshAccessToken);

// first middleware to verify the JWT token and than give control to the controller(logoutUser)
userRouter.route("/logout").post(verifyJWT, logoutUser);

userRouter.route("/details").get(verifyJWT, getUserDetails);
userRouter.route("/change-password").post(verifyJWT, changeCurrentPassword);
userRouter.route("/update-details").put(verifyJWT, updateUserDetails);

userRouter.route("/channel/:username").get(verifyJWT, getUserChannelProfile);
userRouter.route("/watch-history").get(verifyJWT, getUserWatchHistory);

userRouter.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar);
userRouter.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage);

export default userRouter;
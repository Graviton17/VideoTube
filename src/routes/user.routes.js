import { registerUser, loginUser, logoutUser, refreshAccessToken } from "../controllers/user.controllers.js";
import { Router } from "express";
import upload from "../middlewares/multer.middlewares.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const userRouter = Router();

// first middleware upload the avatar and coverImage and than give control to the controller(registerUser)
userRouter.post("/register",
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

// first middleware to verify the JWT token and than give control to the controller(logoutUser)
userRouter.post("/logout", verifyJWT, logoutUser); 

export default userRouter;
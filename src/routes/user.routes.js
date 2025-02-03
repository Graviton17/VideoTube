import { registerUser } from "../controllers/user.controllers.js";
import { Router } from "express";
import upload from "../middlewares/multer.middlewares.js";

const userRouter = Router();

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

export default userRouter;
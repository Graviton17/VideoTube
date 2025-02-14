import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const commentRouter = Router();

commentRouter.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

commentRouter.route("/:videoId").get(getVideoComments).post(addComment);
commentRouter.route("/c/:commentId").delete(deleteComment).patch(updateComment);

export default commentRouter;
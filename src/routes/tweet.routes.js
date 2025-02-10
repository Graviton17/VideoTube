import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet,
} from "../controllers/tweet.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const tweetRouter = Router();
tweetRouter.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

tweetRouter.route("/").post(createTweet);
tweetRouter.route("/user/:userId").get(getUserTweets);
tweetRouter.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

export default tweetRouter;
import { Router } from 'express';
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/subscription.controllers.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js"

const subscriptionRouter = Router();
subscriptionRouter.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

subscriptionRouter
    .route("/c/:channelId")
    .get(getUserChannelSubscribers)
    .post(toggleSubscription);

subscriptionRouter.route("/u/:subscriberId").get(getSubscribedChannels);

export default subscriptionRouter;
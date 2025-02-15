import express from 'express';
import cors from 'cors';
import healthCheckerRouter from './routes/healthchecker.routes.js';
import userRouter from './routes/user.routes.js';
import tweetRouter from './routes/tweet.routes.js';
import likeRouter from './routes/like.routes.js';
import videoRouter from './routes/video.routes.js';
import commentRouter from './routes/comment.rotues.js';
import playlistRouter from './routes/playlist.routes.js';
import subscriptionRouter from './routes/subscription.routes.js';
import cookieParser from 'cookie-parser';
import {errorHandler} from './middlewares/error.middlewares.js';

const app = express(); // initialize express

// enable request from the frontend of sepicific origin
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

// parse incoming requests with JSON payloads with a limit of 16kb
app.use(express.json({ limit: "16kb" }));

// parse incoming requests with urlencoded payloads with a limit of 16kb
app.use(express.urlencoded({
    extended: true,
    limit: "16kb",
}));

// serve static files from the public directory use for the frontend
app.use(express.static("public"));

app.use("/api/v1/healthcheck", healthCheckerRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/tweet", tweetRouter);
app.use("/api/v1/like", likeRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/comment", commentRouter);
app.use("/api/v1/playlist", playlistRouter);
app.use("/api/v1/subscription", subscriptionRouter);

app.use(cookieParser());

// set error handler
// app.use(errorHandler);

export { app };
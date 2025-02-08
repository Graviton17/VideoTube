import express from 'express';
import cors from 'cors';
import healthCheckerRouter from './routes/healthchecker.routes.js';
import userRouter from './routes/user.routes.js';
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

// set api for healthcheck
app.use("/api/v1/healthcheck", healthCheckerRouter);

// set api for user
app.use("/api/v1/user", userRouter);

// set cookie parser
app.use(cookieParser());

// set error handler
// app.use(errorHandler);

export { app };
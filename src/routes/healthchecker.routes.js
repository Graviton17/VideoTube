import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controllers.js";

const healthCheckerRouter = Router();
healthCheckerRouter.get("/", healthCheck);

export default healthCheckerRouter;
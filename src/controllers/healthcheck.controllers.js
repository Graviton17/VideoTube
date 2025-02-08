import { APIResponse } from '../utils/APIResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const healthCheck = asyncHandler((req, res) => {
    const response = new APIResponse(200, "OK", "Healthcheck successful");
    res.status(200).json(response);
});

export { healthCheck };
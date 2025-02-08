import { asyncHandler } from '../utils/asyncHandler.js';
import { APIError } from '../utils/APIError.js';
import { User } from '../models/user.models.js';
import jwtDecode from 'jsonwebtoken';

const verifyJWT = asyncHandler(async (req, _, next) => {
    const token = req.cookies.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        throw new APIError(401, "Unauthorized");
    }

    try {
        const decoded = await jwtDecode.verify(token, process.env.Access_Token_Secret);
        if(!decoded) {
            throw new APIError(401, "Unauthorized");
        }
    
        const user = await User.findById(decoded?._id).select("-password -refreshToken");
        if(!user) {
            throw new APIError(401, "Unauthorized");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new APIError(401, "Invalid Access Token");
    }
});

export { verifyJWT };
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {

        try {
            const token = req.cookies?.accessToken||req.header("Authorization") ?.replace("Bearer ","");
            if(!token){
                throw new Error("Not authorized to access this resource");
            }
    
            const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // token ko shi se kar dega
    
            const user = await User.findById(decodedToken?._id).select("-password -refreshTokens");
            
            if(!user){
                throw new Error("Not authorized to access this resource");
            }
    
            req.user=user // req ke sath user object ko attach kr dega
            next();
        } catch (error) {
            throw new ApiError(401, error?.message||"Invalid token");
        }

})

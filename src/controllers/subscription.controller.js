import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";

const toggleSubscribe = asyncHandler(async (req, res) => {
    const {channelId} = req.params;

    if(!channelId) {
        throw new ApiError(400, "Channel ID is required");
    }

    const channel = await User.findById(channelId);

    if(!channel){
        throw new ApiError(404, "Channel not found");
    }

    const user= req.user;

    if(!user){
        throw new ApiError(401, "User not authenticated");
    }

    if (user._id.equals(channel._id)) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    // check if user already subscribed to the channel and if yes then delete the subscription

    const existingSubscription = await Subscription.findOneAndDelete({ 
        subscriber: user._id ,
        channel : channelId  
    });
    
    if(existingSubscription){
        return res
        .status(200)
        .json(
            new ApiResponse(200, existingSubscription, "Successfully unsubscribed from channel")
        )
    }
    // else subscribe user to the channel

    const subscribed = await Subscription.create(
        {
            subscriber: user._id,
            channel: channelId
        }
    )

    if(!subscribed){
        throw new ApiError(500, "Failed to subscribe to channel");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribed, "Successfully subscribed to channel")
    )
})

export { toggleSubscribe };
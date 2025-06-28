import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import mongoose from 'mongoose'
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

const getSubscribedChannels = asyncHandler(async (req, res) => {

    const {channelId} = req.params;

    if(!channelId){
        throw new ApiError(400, "Channel not found");
    }

    const channel = await User.findById(channelId);

    if(!channel ){
        throw new ApiError(404, "Channel not found");
    }

    // const subscribedChannels = await Subscription.find({subscriber :channelId}) .populate('channel', 'username fullName avatar').select('-subscriber -channel -_id -__v');

    const subscribedChannels = await Subscription.aggregate([
        {
          $match: { subscriber: new mongoose.Types.ObjectId(channelId) } // so that sirf wo number aaye
        },
        {
          $lookup: {
            from: "users",
            localField: "channel",
            foreignField: "_id",
            as: "channelDetails"
          }
        },
        {
          $unwind: "$channelDetails"
        },
        {
          $project: {
            _id: 0,
            username: "$channelDetails.username",
            avatar: "$channelDetails.avatar",
            fullName: "$channelDetails.fullName"
          }
        }
      ]);
      

    if(!subscribedChannels){
        throw new ApiError(500, "Failed to fetch subscribed channels");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribedChannels, "Successfully fetched subscribed channels")
    )
})

const getSubscribers = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    if(!userId){
        throw new ApiError(400, "User not found");
    }
    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(404, "User not found");
    }
    
    const subscribers = await Subscription.aggregate([
        {
            $match : { channel: new mongoose.Types.ObjectId(userId) }
        }
        ,
        {
            $lookup: {
                from: "users",
                localField : "subscriber",
                foreignField: "_id",
                as: "subscriberDetails"
            }
        },
        {
            $unwind: "$subscriberDetails"
        },
        {

            $project: {
                _id : 0,              
                username : "$subscriberDetails.username",
                fullName : "$subscriberDetails.fullName",
                avatar : "$subscriberDetails.avatar",
                time : "$subscriberDetails.updatedAt"
            }
        }
    ])

    if(!subscribers){
        throw new ApiError(500, "Failed to fetch subscribers");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, subscribers, "Successfully fetched subscribers")
    )
})


export { toggleSubscribe, getSubscribedChannels , getSubscribers };
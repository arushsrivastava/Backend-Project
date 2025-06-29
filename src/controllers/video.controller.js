import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";


const getAllVideos = asyncHandler(async (req, res) => {
    // Retrieve all videos logic goes here
})

const videoUploader = asyncHandler(async (req, res) => {
    const {title, description} = req.body;

    if(!title ||!description) {
        throw new ApiError(400, "Title and description are required")
    }

    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if(!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video and thumbnail files are required")
    }

    const video = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!video ||!thumbnail) {
        throw new ApiError(500, "Failed to upload files to Cloudinary")
    }

    const duration = video?.duration ? Math.floor(video.duration) : 0

    const newUpload = await Video.create({
        title,
        description,
        videoFile : video.url,
        duration,
        thumbnail : thumbnail.url,
        owner : req.user._id,
    })

    if(!newUpload){
        throw new ApiError(500, "Failed to create new video")
    }

    return res
    .status(201)
    .json(
        new ApiResponse( 201,  newUpload ,"Video uploaded successfully")
    )

})

const getVideoByUser = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    if(!userId){
        throw new ApiError(400, "User not found")
    }

    const user = await User.findById(userId);

    if(!user){
        throw new ApiError(404, "User not found")
    }

    const videos = await Video.find({ owner : userId}).sort({ createdAt : -1 }).select('-owner -_id -createdAt') 
    //sorts in order of olderst to newest

    if(!videos){
        throw new ApiError(500, "Failed to retrieve videos")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, "Videos retrieved successfully")
    )
    
})

const updateVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    if(!video.owner.equals(req.user._id)){
        throw new ApiError(403, "You are not authorized to update this video")
    }

    const {title, description} = req.body;
    
    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    
    let thumbnail;
    let videoFile;
    if (thumbnailLocalPath){
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
        if(!thumbnail){
            throw new ApiError(500, "Failed to upload thumbnail to Cloudinary")
        }
    }
    if (videoLocalPath){
        videoFile = await uploadOnCloudinary(videoLocalPath);
        if(!videoFile){
            throw new ApiError(500, "Failed to upload video to Cloudinary")
        }
    }

    if(title) video.title = title;
    if(description) video.description = description;
    if(thumbnail) {
        const oldThumbnail = video.thumbnail;
        video.thumbnail = thumbnail.url;
        await deleteFromCloudinary(oldThumbnail)
    }
    if(videoFile){
        const oldVideo = video.videoFile;
        video.videoFile = videoFile.url;
        await deleteFromCloudinary(oldVideo)
    } 
    await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video updated successfully")
    )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(400, "Video not found")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    if(!video.owner.equals(req.user._id)){
        throw new ApiError(403, "You are not authorized to delete this video")
    }

    await deleteFromCloudinary(video.videoFile);
    await deleteFromCloudinary(video.thumbnail);
    
    await Video.findByIdAndDelete(videoId);

    return res
    .status(200)
    .json(
        new ApiResponse(200, null, "Video deleted successfully")
    )
    
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(400, "Video not found")
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not found")
    }

    if(!video.owner.equals(req.user._id)){
        throw new ApiError(403, "You are not authorized to toggle publish status for this video")
    }

    video.isPublished =!video.isPublished;
    await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video publish status toggled successfully")
    )
})

export { getAllVideos, videoUploader, getVideoByUser, updateVideo, deleteVideo, togglePublishStatus };
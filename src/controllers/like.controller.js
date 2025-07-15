import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { Like } from "../models/like.model.js"

const getVideoLikes = asyncHandler(async (req, res) => {})

const toggleVideoLikes = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(400, "Video ID is required")
    }
    const user = req.user;
    if(!user ){
        throw new ApiError(401, "Unauthorized")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found")
    }

    const liked = await Like.findOne({
        user : user._id,
        video : videoId
    })

    if(!liked){
        const like = await Like.create({
            video : videoId,
            likedBy : user._id,
            isLike : true
        })
        if(!like){
            throw new ApiError(500, "Failed to create like")
        }
    } else {
        liked.isLiked = !liked.isLike
        liked.save()
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, liked, "Like toggled successfully"  )
    )

})

const toggleCommentLikes = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if(!commentId){
        throw new ApiError(400, "Video ID is required")
    }
    const user = req.user;
    if(!user ){
        throw new ApiError(401, "Unauthorized")
    }
    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404, "Comment not found")
    }

    const liked = await Like.findOne({
        user : user._id,
        comment : commentId
    })

    if(!liked){
        const like = await Like.create({
            comment : commentId,
            likedBy : user._id,
            isLike : true
        })
        if(!like){
            throw new ApiError(500, "Failed to create like")
        }
    } else {
        liked.isLiked = !liked.isLike
        liked.save()
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200, liked, "Like toggled successfully"  )
    )
})

const getLikedVideos = asyncHandler(async (req, res) => {})

export { getVideoLikes, toggleVideoLikes, toggleCommentLikes, getLikedVideos }
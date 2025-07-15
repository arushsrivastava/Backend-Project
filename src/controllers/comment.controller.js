import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js"

const getComments = asyncHandler(async (req, res) => {})

const postComment = asyncHandler(async (req, res) => {
    const user = req.user
    if(!user){
        throw new ApiError(401 , 'Unauthorized')
    }
    const { content} = req.body
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(400, "Can't add comment")
    }
    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found")
    }
    if(!content){
        throw new ApiError(400, "Comment can't be empty")
    }
    if(content.trim().length > 200){
        throw new ApiError(400, "Comment exceeds max length")
    }
    const comment = await Comment.create({
        content : content.trim(),
        video : videoId,
        user : user._id
    })

    if(!comment){
        throw new ApiError(500, "Failed to create comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "Comment created successfully"  )
    )
    
})

const deleteComment = asyncHandler(async (req, res) => {
    const user = req.user
    if(!user){
        throw new ApiError(401 , 'Unauthorized')
    }
    const {commentId} = req.params

    if(!commentId){
        throw new ApiError(400, "Can't delete comment")
    }

    const deleteComment = await Comment.findByIdAndDelete(commentId)

    if(!deleteComment){
        throw new ApiError(404, "Comment not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, null, "Comment deleted successfully"  )
    )

    
})

export { getComments, postComment, deleteComment }
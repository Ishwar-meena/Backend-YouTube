import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Video from "../models/video.model.js";
import Comment from "../models/comment.model.js";
import { ApiResponse } from "../utils/apiResponse.js";

const addComment = asyncHandler(async (req, res) => {
    // only authenticated user comment 
    // get video id and comment
    // check video exist or not
    const userId = req.user?._id;
    const { videoId, comment } = req.body;
    if (!videoId?.trim() || !comment?.trim()) {
        throw new ApiError(404, "Video id and comment are required")
    }

    // check video exist or not
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "Video is not exist");
    }

    const commentData = await Comment.create(
        {
            content: comment,
            video: videoId,
            owner: userId
        }
    )

    if (!commentData) {
        throw new ApiError(500, "comment is not saved in db");
    }
    return res.status(201).json(
        new ApiResponse(commentData, 201, "comment added")
    )
})

const deleteComment = asyncHandler(async (req,res) => {
    // only comment owner and video owner can delete comment
    // get video id and comment id
    // check comment is related to video
    const userId = req.user?._id;
    const {videoId,commentId} = req.body;

    if(!videoId?.trim() || !commentId?.trim()){
        throw new ApiError(404,"comment and video id required");
    }

    // check video exist or not
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404,"Video is not exist");
    }

    // get comment 
    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404,"invalid comment id");
    }

   
    // comment user and video owner can delete comment
    if(!comment.owner.equals(userId) || !video.owner.equals(userId)){
        throw new ApiError(403,"only video owner and comment owner can delete comment");
    }
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if(!deletedComment){
        throw new ApiError(500,"comment is not deleted");
    }

    return res.status(200).json(
        new ApiResponse(deletedComment,200,"comment deleted")
    )
})

export{
    addComment,
    deleteComment
}
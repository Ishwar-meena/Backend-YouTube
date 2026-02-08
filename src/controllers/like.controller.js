import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Video from "../models/video.model.js";
import Comment from "../models/comment.model.js";
import Like from "../models/like.model.js"
import Tweet from "../models/tweet.model.js"
import { ApiResponse } from "../utils/apiResponse.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    // get videoid from params
    // only authenticated user can like
    // check video exist or not
    const { videoId } = req.params
    const userId = req?.user._id;
    if (!videoId?.trim()) {
        throw new ApiError(404, "videoId must not null")
    }
    // check video exist or not 
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Invalid videoid");
    }
    // check video is already liked by user or not
    const isVideoLiked = await Like.findOne({
        video: videoId,
        likedBy: userId
    })
    // if video already liked by user unlike it(delete that doc. from db)
    if (isVideoLiked) {
        const unlikedVideo = await Like.findByIdAndDelete(isVideoLiked._id);
        return res.status(200).json(
            new ApiResponse(unlikedVideo, 200, "video unliked")
        )
    }

    // if video not liked by user 
    const newLikedVideo = await Like.create({
        video: videoId,
        likedBy: userId
    });
    if (!newLikedVideo) {
        throw new ApiError(500, "video is not liked ")
    }
    return res.status(200).json(
        new ApiResponse(newLikedVideo, 200, "video liked")
    )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    // get commentid from params
    // only authenticated user can like
    // check comment exist or not
    const { commentId } = req?.params
    const userId = req?.user._id;

    if (!commentId?.trim()) {
        throw new ApiError(404, "commentId must not null")
    }
    // check comment exist or not 
    const comment= await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Invalid commentId");
    }
    // check comment is already liked by user or not
    const isCommentLiked = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })
    // if comment already liked by user unlike it(delete that doc. from db)
    if (isCommentLiked) {
        const unlikedComment = await Like.findByIdAndDelete(isCommentLiked._id);
        return res.status(200).json(
            new ApiResponse(unlikedComment, 200, "comment unliked")
        )
    }

    // if comment not liked by user 
    const newLikedComment = await Like.create({
        comment: commentId,
        likedBy: userId
    });
    if (!newLikedComment) {
        throw new ApiError(500, "comment is not liked ")
    }
    return res.status(200).json(
        new ApiResponse(newLikedComment, 200, "comment liked")
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    // get tweetid from params
    // only authenticated user can like
    // check tweet exist or not
    const { tweetId } = req?.params
    const userId = req?.user._id;
    
    if (!tweetId?.trim()) {
        throw new ApiError(404, "tweetId must not null")
    }
    // check tweet exist or not 
    const tweet= await Tweet.findById(tweetId);
    if (!tweet) {
        throw new ApiError(404, "Invalid tweetId");
    }
    // check tweet is already liked by user or not
    const isTweetLiked = await Like.find({
        tweet: tweetId,
        likedBy: userId
    })
    // if tweet already liked by user unlike it(delete that doc. from db)
    if (isTweetLiked) {
        const unlikedTweet = await Like.findByIdAndDelete(isTweetLiked._id);
        return res.status(200).json(
            new ApiResponse(unlikedTweet, 200, "tweet unliked")
        )
    }

    // if tweet not liked by user 
    const newLikedTweet = await Like.create({
        tweet: tweetId,
        likedBy: userId
    });
    if (!newLikedTweet) {
        throw new ApiError(500, "tweet is not liked ")
    }
    return res.status(200).json(
        new ApiResponse(newLikedTweet, 200, "tweet liked")
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //get all liked videos of authenticated user
    const userId = req?.user._id;

    const likedVideos = await Like.find({
        likedBy:userId,
        video:{$ne:null} // video field must not be null
    })

    if(!likedVideos.length){
        throw new ApiError(404,"user doesn't like a video ");
    }
    return res.status(200).json(
        new ApiResponse(likedVideos,200,"fetched liked videos")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
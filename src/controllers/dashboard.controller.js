import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import User from "../models/user.model.js"
import Video from "../models/video.model.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    // we give details of logged in user
    const userId = req?.user._id;
    const channelStats = await User.aggregate([
        {
            $match:{
                _id : userId
            }
        },
        {
            $lookup:{
                // this give all the videos of current user 
                from:"videos",
                localField:"_id",
                foreignField:"owner",
                as:"videos",
                pipeline:[
                    {
                        $lookup:{
                            // this give all the likes of a video
                            from:"likes",
                            localField:"_id",
                            foreignField:"video",
                            as:"liked_videos"
                        }
                    },
                    {
                        $addFields:{
                            likes:{$size:"$liked_videos"} // it calculate likes of each video 
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                // this calculate subscribers 
                from:"subscriptions",
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
        },
        {
            $addFields:{
                total_videos:{$size:"$videos"},
                total_views:{$sum:"$videos.views"},
                subscribers:{$size:"$subscribers"},
                total_likes:{$sum:"$videos.likes"}
            }
        },
        {
            $project:{
                _id:1,
                username:1,
                email:1,
                subscribers:1,
                total_videos:1,
                total_views:1,
                total_likes:1
            }
        }
    ])

    if(!channelStats.length){
        throw new ApiError(404,"stats not exist of this user")
    }

    return res.status(200).json(
        new ApiResponse(channelStats,200,"stats successfully fetched")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    // we give videos of logged in user
    const userId = req?.user._id;
    const videos = await Video.find({owner:userId});
    if(!videos.length){
        throw new ApiError(404,"Videos not availabe for this user")
    }
    return res.status(200).json(
        new ApiResponse(videos,200,"Videos successfully fetched")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }
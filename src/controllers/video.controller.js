import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFileOnCloudinary, uploadFileOnCloudinary } from "../utils/cloudinaryFileUpload.js";
import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { extractPublicId } from 'cloudinary-build-url'


// this function give all the videos 
const getAllVideos = asyncHandler(async (req, res) => {
    // get page limit sortby sorttype and query from req.query
    // validate these 
    // check video exist according to query
    // if throw error
    // give videos response according to our query 
    const { page = 1, limit = 10, query, sortBy, sortType } = req.query;

    if (!query?.trim() || !sortBy?.trim() || !sortType?.trim()) {
        throw new ApiError(404, "query sortBy and sortType parameter is necessary");
    }

    const videosData = await Video.aggregate([
        {
            $match: {
                $text: { $search: query } // converted title as an index to search using text
            }
        },
        {
            $sort: {
                score: { $meta: "textScore" } // descending order (high match)
            }
        },
        {
            $sort: {
                [sortBy]: Number(sortType) // 1 = asc -1 = desc
            }
        },
        {
            $skip: (page - 1) * Number(limit)
        },
        {
            $limit: Number(limit)
        }
    ])
    if (!videosData.length) {
        throw new ApiError(404, "videos not exist according to this query")
    }

    return res.status(200).json(
        new ApiResponse(videosData, 200, "videos fetched successfully")
    )
})

// upload a video
const uploadVideo = asyncHandler(async (req, res) => {
    //only authenticated user can upload
    // get video metadata from body
    // validate metadata
    // upload thumbnail to cloudinary and get url
    // check thumbnail upload or not
    // upload video to cloudinary and get metadata from cloudinary
    // check status video upload or not
    // save all data in db
    // check data is saved or not
    // return response

    const userId = req.user?._id;
    const { title, description, isPublished } = req.body;
    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "Title and description are necessary");
    }

    // get thumbnail path
    const thumbnailPath = req.files?.thumbnail[0].path

    const thumbnail = await uploadFileOnCloudinary(thumbnailPath);
    if (!thumbnail || !thumbnail?.secure_url) {
        throw new ApiError(500, "thumbnail not uploaded on cloudinary");
    }

    // get video file path 
    const videoPath = req.files?.video[0].path;
    const video = await uploadFileOnCloudinary(videoPath);
    if (!video || !video?.secure_url) {
        throw new ApiError(500, "Video file not uploaded on cloudinary");
    }
    // save video metadata in db
    const videoData = await Video.create({
        videoFile: video.secure_url,
        thumbnail: thumbnail.secure_url,
        owner: userId,
        title,
        description,
        duration: video.duration, // store durationn in seconds
        isPublished: isPublished ?? true
    })

    if (!videoData) {
        throw new ApiError(500, "Video metadata is not saved in db");
    }

    return res.status(200).json(
        new ApiResponse(videoData, 200, "video upload successfully")
    )
})

// get info a video using id 
const getVideoById = asyncHandler(async (req, res) => {
    // get video id from params
    // check id is not null
    // check video id exist or not
    // if exist send video info

    const { videoId } = req?.params;

    if (!videoId?.trim()) {
        throw new ApiError(404, "null video id");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Invalid video id");
    }

    return res.status(200).json(
        new ApiResponse(video, 200, "Successfully get video data")
    )
})

// increase views of video and add video in watch history
const watchVideo = asyncHandler(async (req, res) => {
    //only authenticated users can watch video
    // get video id
    // check video exist or not
    // increase views of video
    // check user already viewed or not
    // add video in users history if not viewed

    const userId = req.user?._id;
    const { videoId } = req?.params;

    // check video exist or not
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "Video is not exist");
    }
    // update views
    const updatedViews = await Video.findByIdAndUpdate(video._id, { views: video.views + 1 }, { new: true });
    if (!updatedViews) {
        throw new ApiError(500, "views not updated");
    }
    // update video history of user
    const updatedHistory = await User.updateOne(
        { _id: userId },
        { $addToSet: { watchHistory: video._id } }
    );
    if (!updatedHistory) {
        throw new ApiError(500, "watch history not updated")
    }

    return res.status(200).json(
        new ApiResponse(updatedViews, 200, "views updated successfully")
    )
})

// toggle published video
const togglePublishedVideo = asyncHandler(async (req, res) => {
    // only video owner can toggle video
    // get videoid and check video exist or not
    const userId = req.user?._id;
    const { videoId } = req?.params;
    if (!videoId) {
        throw new ApiError(404, "video id must be necessary");
    }

    // check video exist or not
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "Video is not exist");
    }
    // check user is video owner
    if (!video.owner.equals(userId)) {
        throw new ApiError(403, "only video owner toggle video");
    }

    video.isPublished = !video.isPublished;
    const updatedVideo = await video.save();
    if (!updatedVideo) {
        throw new ApiError(500, "video is not toggle");
    }

    return res.status(200).json(
        new ApiResponse(updatedVideo, 200, "video successfully toggled")
    )

})

// update video thumbnail
const updateVideoThumbnail = asyncHandler(async (req, res) => {
    // get video id and validate it and check video exist or not
    // upload thumbnail to clodinary and save it in db
    // delete previous thumbnail from cloudinary

    const userId = req.user?._id;
    const { videoId } = req?.params;
    if (!videoId) {
        throw new ApiError(404, "video id must be necessary");
    }

    // check video exist or not
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "Video is not exist");
    }

    // check user is video owner
    if (!video.owner.equals(userId)) {
        throw new ApiError(403, "only video owner update thumbnail");
    }

    // get thumbnail path
    const thumbnailPath = req.file?.path

    const thumbnail = await uploadFileOnCloudinary(thumbnailPath);
    if (!thumbnail || !thumbnail?.secure_url) {
        throw new ApiError(500, "thumbnail not uploaded on cloudinary");
    }

    // update thumbnail url in db 
    const previousThumbnailUrl = video.thumbnail;
    video.thumbnail = thumbnail.secure_url;
    const updatedVideo = await video.save();
    if (!updatedVideo) {
        throw new ApiError(500, "thumbnail url not updated in db");
    }

    // delete previous file from cloudinary 
    const previousThumbnailPublicId = extractPublicId(previousThumbnailUrl);
    await deleteFileOnCloudinary(previousThumbnailPublicId);

    return res.status(200).json(
        new ApiResponse(updatedVideo, 200, "thumbnail updated successfully")
    )

})

// delete video
const deleteVideo = asyncHandler(async (req, res) => {
    // get video id from params and validate it
    // check user and video owner is same
    // delete thumbnail and video from cloudianry
    // delete from database that info

    const { videoId } = req?.params;
    const userId = req?.user._id;
    if (!videoId) {
        throw new ApiError(404, "video id must be necessary");
    }

    // check video exist or not
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "Video is not exist");
    }
    
    // check user is video owner
    if (!video.owner.equals(userId)) {
        throw new ApiError(403, "only video owner delete video");
    }
    // delete thumbnail and video from cloudinary
    await deleteFileOnCloudinary(video.thumbnail);
    await deleteFileOnCloudinary(video.videoFile, "video");

    // delete from db
    const deletedVideo = await Video.findByIdAndDelete(videoId)
    return res.status(200).json(
        new ApiResponse(deletedVideo, 200, "successfully deleted")
    )
})

export {
    getAllVideos,
    uploadVideo,
    getVideoById,
    watchVideo,
    togglePublishedVideo,
    updateVideoThumbnail,
    deleteVideo
}
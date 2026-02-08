import Playlist from "../models/playlist.model.js";
import Video from "../models/video.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// this function create a playlist
const createPlaylist = asyncHandler(async (req, res) => {
    // only authenticated user create playlist
    // get name and description from body
    // validate name 
    // check user is already created a playlist using this name
    const userId = req?.user._id;
    const { name, description } = req.body;
    if (!name?.trim()) {
        throw new ApiError(404, "playlist name is required")
    }

    // check playlist name that created by this user 
    const playlist = await Playlist.findOne(
        {
            owner: userId,
            name : name.toLowerCase()
        }
    )
    if(playlist){
        throw new ApiError(400,"this name playlist already exist");
    }
    const newPlaylist = await Playlist.create(
        {
            name:name.toLowerCase(),
            owner:userId,
            description
        }
    )
    if(!newPlaylist){
        throw new ApiError(500,"playlist is not created");
    }

    return res.status(201).json(
        new ApiResponse(newPlaylist,201,"playlist successfully created")
    )
})

// this function add video in playlist
const addVideoInPlaylist = asyncHandler(async(req,res)=>{
    //only authenticated and playlist owner can add video
    // get video id and playlistid
    // validate video id exist or not 
    const userId = req.user?._id;
    const {videoId} = req?.params;
    const {playlistId} = req.body;
    
    if(!playlistId?.trim() || !videoId?.trim()){
        throw new ApiError(404,"playlistid and videoid are required");
    }
    // check video exist or not
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"Video is not exist");
    }
    // check user is owner of playlist
    const playlist = await Playlist.findOne(
        {
            owner: userId,
            _id:playlistId
        }
    )
    if(!playlist){
        throw new ApiError(404,"this playlist not created by user");
    }
    playlist.videos.push(videoId);
    const updatedPlaylist = await playlist.save();
    if(!updatedPlaylist){
        throw new ApiError(500,"video is not saved in playlist")
    }
    return res.status(200).json(
        new ApiResponse(updatedPlaylist,"video is successfully added in playlist")
    )
})

// this function delete a video from playlist 
const deleteVideoFromPlaylist = asyncHandler(async (req,res) => {
    // get video id from params
    // get playlist id from body
    // only playlist owner can delete video
    
    const{videoId} = req?.params;
    const {playlistId} = req.body;
    const userId = req?.user._id;

    const playList = await Playlist.findById(playlistId);
    if(!playList){
        throw new ApiError(404,"Invalid playlist id");
    }
    // check user is playlist owner
    if(!playList.owner.equals(userId)){
        throw new ApiError(403,"Only playlist owner can delete a video from playlist")
    }

    // delete video from playlist
    playList.videos = playList.videos.filter((video_id)=>{
        return video_id.toString() !== videoId
    });
    const updatedPlaylist = await playList.save();
    
    return res.status(200).json(
        new ApiResponse(updatedPlaylist,200,"video deleted successfully from playlist")
    );
})

// this function update a playlist 
const updatePlayList = asyncHandler(async (req,res) => {
    // only authenticated user can update his playlist
    const {playlistId} = req?.params;
    const userId = req?.user._id;
    const {name,description} = req.body;

    if(!name?.trim() || !description?.trim()){
        throw new ApiError(404,"name and description required")
    }

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"Invalid playlist id");
    }
    // check playlist owner is current user
    if(!playlist.owner.equals(userId)){
        throw new ApiError(403,"Only playlist owner can update his playlist")
    }
    playlist.name = name;
    playlist.description = description;
    const updated_playlist = await playlist.save();
    if(!updated_playlist){
        throw new ApiError(500,"playlist is not updated")
    }
    return res.status(200).json(
        new ApiResponse(updated_playlist,200,"playlist updated successfully")
    )
})
// this function give  authenticated user playlist
const getUserPlaylist = asyncHandler(async (req,res) => {
    // only autheticated user access there playlists
    const userId = req?.user._id;
    const playLists = await Playlist.find({owner:userId});
    if(!playLists.length){
        throw new ApiError(404,"playlist is not exist")
    }
    return res.status(200).json(
        new ApiResponse(playLists,200,"successfully fetched playlists")
    )
})

const getPlaylistById = asyncHandler(async(req,res)=>{
    const {playlistId} = req?.params;
    
    const playList = await Playlist.findById(playlistId);
    if(!playList){
        throw new ApiError(404,"playlist is not exist")
    }
    return res.status(200).json(
        new ApiResponse(playList,200,"successfully fetched playlist")
    )
})

const deletePlaylist = asyncHandler(async(req,res)=>{
    // only authenticated user can delete his playlists
    const {playlistId} = req?.params;
    const userId = req?.user._id;

    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404,"playlist is not exist")
    }
    // check user is playlist owner 
    if(!playlist.owner.equals(userId)){
        throw new ApiError(403,"Only playlist owner can delete a playlist");
    }
    // delete playlist
    await Playlist.findByIdAndDelete(playlistId);
    return res.status(200).json(
        new ApiResponse({},200,"playlist successfully deleted")
    )
})

export {
    createPlaylist,
    addVideoInPlaylist,
    deleteVideoFromPlaylist,
    updatePlayList, 
    getUserPlaylist,
    getPlaylistById,
    deletePlaylist
}
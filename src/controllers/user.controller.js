import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from "../utils/apiError.js";
import User from "../models/user.model.js";
import { deleteFileOnCloudinary, uploadFileOnCloudinary } from "../utils/cloudinaryFileUpload.js";
import { ApiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken'
import mongoose, { Schema } from 'mongoose';
import { extractPublicId } from 'cloudinary-build-url';

const options = {
    httpOnly: true,
    secure: true
}
const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({});
        return {
            accessToken, refreshToken
        }
    } catch (error) {
        throw new ApiError(500, error?.message || "generateAccessToken or refresh token error");
    }
}

const userRegister = asyncHandler(async (req, res) => {
    const { username, email, password, fullName } = req.body;
    // validate data is not empty
    if (
        [username, email, password, fullName].some(data => data === undefined || data?.trim() === "")
    ) {
        throw new ApiError(400, "All fields required");
    }

    // validate password must be greater than or equal to 8 chars
    if (password.length < 8) {
        throw new ApiError(400, "Password must be 8 or more chars");
    }

    // check username or email  exist 
    const userExist = await User.findOne({
        $or: [{ username }, { email }]
    });
    if (userExist) {
        throw new ApiError(400, "Email or Username already exist");
    }

    // check avatar
    const avatarLocalPath = req.files?.avatar[0].path;
    const coverImageLocalPath = req.files?.coverImage?.[0].path;

    if (!avatarLocalPath) {
        throw new ApiError(500, "Avatar file not uploaded on server");
    }

    // upload avatar and coveriamge to cloudinary
    const avatarCloudinary = await uploadFileOnCloudinary(avatarLocalPath);
    const coverImageCloudinary = await uploadFileOnCloudinary(coverImageLocalPath);

    if (!avatarCloudinary) {
        throw new ApiError(500, "Avatar doesn't upload on cloudinary");
    }
    // save data on database
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        fullName,
        avatar: avatarCloudinary.secure_url,
        coverImage: coverImageCloudinary?.secure_url ?? ""
    });

    if (!user) {
        throw new ApiError(500, "Data doesn't save on db");
    }

    user.password = undefined;
    user.refreshToken = undefined;

    res.status(201).json(
        new ApiResponse(user, 200, "User successfully created")
    )

});


const userLogin = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!(username || email)) {
        throw new ApiError(400, "username or email required");
    }

    // check username or email exist 
    const user = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!user) {
        throw new ApiError(404, "user not exist");
    }

    // check password is correct or not 
    const isValidPassword = user.isPasswordCorrect(password);
    if (!isValidPassword) {
        throw new ApiError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");



    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse({
                loggedInUser, accessToken, refreshToken
            }, 200, "user successfully loggedin")
        );

})

const loggedOut = asyncHandler(async (req, res) => {
    try {
        const userid = req.user._id;
        const user = await User.findByIdAndUpdate(
            userid,
            {
                $set: { refreshToken: undefined }
            }
        );

        res
            .status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(
                new ApiResponse({}, 200, "user successfully logged out")
            )
    } catch (error) {
        throw new ApiError(500, error?.message || "internal server error during logged out");
    }
})

const generateRefreshToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.body?.refreshToken || req?.cookies?.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh token must be required");
    }
    try {

        // verify refreshtoken
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET, options);

        const user = await User.findById(decodedRefreshToken?.id);
        if (!user) {
            throw new ApiError(401, "unauthorized accessed either refresh token expire or invalid");
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "unauthorized accessed refreshToken mismatch");
        }
        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

        // save refreshtoken in db 
        const afterRefreshTokenUser = await User.findByIdAndUpdate(user.id, {
            $set: { refreshToken }
        }).select("-password -refreshToken");

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse({
                    accessToken, refreshToken
                }, "Successfully changed refresh and access token")
            )


    } catch (error) {
        throw new ApiError(500, error?.message || "internal server error during generating new refresh token ")
    }

})

const updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword?.trim() || !newPassword?.trim()) {
        throw new ApiError(400, "oldpassword and newpassword are required");
    }
    if (newPassword?.length < 8) {
        throw new ApiError(400, "new password must be 8 or more chars");
    }

    // check password is valid
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError(401, "access denied user doesn't exist");
    }

    const isValidPassword = await user.isPasswordCorrect(oldPassword);
    if (!isValidPassword) {
        throw new ApiError(400, "old password mismatch");
    }
    user.password = newPassword;
    await user.save();
    return res
        .status(200)
        .json(
            new ApiResponse({}, 200, "Password successfully updated")
        )
})

const updateUser = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!fullName?.trim() || !email?.trim()) {
        throw new ApiError(400, "fullname and email required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { fullName, email },
        { new: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(400, "data not updated");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(user, 200, "updated successfully")
        );
})

const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path;
    const userId = req.user?._id;

    if (!avatarLocalPath) {
        throw new ApiError(400, "avatar file not uploaded on server");
    }
    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(403,"user id required");
    }
    // upload new avatar on cloudinary
    const avatar = await uploadFileOnCloudinary(avatarLocalPath);

    if (!avatar?.secure_url) {
        throw new ApiError(500, "cloudinary don't provide secure_url")
    }
    // old avatar url for delete it from cloudinary
    const oldAvatarUrl = user.avatar;

    const updated_user = await User.findByIdAndUpdate(
        req.user?._id,
        { avatar: avatar.secure_url },
        { new: true }
    ).select("-password -refreshToken");

    
    if (!updated_user) {
        throw new ApiError(500, "avatar not updated on db")
    };
    // delete old avatar from cloudinary
    await deleteFileOnCloudinary(extractPublicId(oldAvatarUrl));

    return res
        .status(200)
        .json(
            new ApiResponse(updated_user, 200, "avatar updated successfully")
        )
})

const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    const userId = req.user?._id;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "coverImage file not uploaded on server");
    }
    const user = await User.findById(userId);
    if(!user){
        throw new ApiError(403,"user id required");
    }
    // upload new coverimage on cloudinary
    const coverImage = await uploadFileOnCloudinary(coverImageLocalPath);

    if (!coverImage?.secure_url) {
        throw new ApiError(500, "cloudinary don't provide coverImage secure_url")
    }
    // old avatar url for delete it from cloudinary
    const oldCoverImageUrl = user.coverImage;

    const updated_user = await User.findByIdAndUpdate(
        req.user?._id,
        { coverImage: coverImage.secure_url },
        { new: true }
    ).select("-password -refreshToken");

    if (!user) {
        throw new ApiError(500, "coverImage not updated on db")
    };
     // delete old cover image from cloudinary
    await deleteFileOnCloudinary(extractPublicId(oldCoverImageUrl));

    return res
        .status(200)
        .json(
            new ApiResponse(updated_user, 200, "coverImage updated successfully")
        )
})

const getUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(req.user, "successfully fetched user info")
        )
})

const getChannelInfo = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const {channel_name} = req.params;
    if (!channel_name?.trim()) {
        throw new ApiError(400, "channel_name required");
    }

    try {
        const channelData = await User.aggregate([
            {
                $match: {
                    username: channel_name?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localfield: "_id",
                    foreignfield: "channel",
                    as: "subscribers"
                }
            },

            {
                $lookup: {
                    from: "subscriptions",
                    localfield: "_id",
                    foreignfield: "subscriber",
                    as: "subscribed"
                }
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    },
                    subscribedCount: {
                        $size: "$subscribed"
                    },
                    isSubscribed: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            },
            {
                $project: {
                    fullName: 1,
                    username: 1,
                    subscribersCount: 1,
                    subscribedCount: 1,
                    avatar: 1,
                    coverImage: 1,
                    email: 1
                }
            }
        ])

        if (!channelData?.length) {
            throw new ApiError(400, "channel data is not available please check your query");
        }
        return res.status(200).json(
            new ApiResponse(channelData[0], 200, "successfully fetched data")
        );
    } catch (error) {
        console.error(error);
        throw new ApiError(500, "Internal server error");
    }
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    // console.log(userId);
    try {
        const watchHistory = await User.aggregate([
            {
                $match: {
                    _id: new Schema.Types.ObjectId(userId)
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner"
                            }
                        },
                        {
                            $populate: {
                                username: 1,
                                avatar: 1
                            }
                        },
                        {
                            $addFields:{
                                $first:"$owner"
                            }
                        }

                    ]
                }
            }
        ])
        console.log("this is watch history ",watchHistory)
        if (!watchHistory?.length) {
            throw new ApiError(400, "watch history is not exist");
        }
        return res.status(200).json(
            new ApiResponse(watchHistory[0].watchHistory, 200, "successfully fetched watch history")
        )
    } catch (error) {
        console.error(error);
        throw new ApiError(500, error?.message || "internal server error when fetching watch history")
    }
})
export {
    userRegister,
    loggedOut,
    userLogin,
    generateRefreshToken,
    updatePassword,
    updateUser,
    updateAvatar,
    updateCoverImage,
    getUser,
    getChannelInfo,
    getWatchHistory
}
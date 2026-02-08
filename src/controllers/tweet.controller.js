import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import Tweet from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
    const  userId  = req?.user._id;
    const { tweet } = req.body;

    if (!tweet?.trim()) {
        throw new ApiError(400, "Tweet content is necessary")
    }
    // create a new tweet
    const newTweet = await Tweet.create(
        {
            owner: userId,
            content: tweet
        }
    )
    if (!newTweet) {
        throw new ApiError(500, "Tweet is not created")
    }
    return res.status(201).json(
        new ApiResponse(newTweet, 201, "tweet successfully created")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const userId  = req?.user._id;

    const userTweets = await Tweet.find({ owner: userId });
    if (!userTweets.length) {
        throw new ApiError(404, "tweets not exist");
    }
    return res.status(200).json(
        new ApiResponse(userTweets, 200, "successfully fetched user tweets")
    )
})

// this function update tweet
const updateTweet = asyncHandler(async (req, res) => {
    // get tweet id from params
    // get update tweet from body
    // validate tweetId is not null
    // check user and tweet owner is same
    // if same update tweet content  
    const userId  = req?.user?._id;
    const { tweetId } = req?.params;
    const { update_tweet_content } = req.body;

    if (!update_tweet_content?.trim() || !tweetId?.trim()) {
        throw new ApiError(404, "tweet content and tweetid required")
    }

    const tweetData = await Tweet.findById(tweetId);
    if (!tweetData) {
        throw new ApiError(404, "Invalid tweet id");
    }
    // check user and tweet owner is same
    if (!tweetData.owner.equals(userId)) {
        throw new ApiError(403, "Only tweet owner can update tweet")
    }
    tweetData.content = update_tweet_content;
    const updatedTweetData = await tweetData.save();

    return res.status(200).json(
        new ApiResponse(updatedTweetData, 200, "tweet updated successfully")
    )
})

// delete tweet
const deleteTweet = asyncHandler(async (req, res) => {
    // validate tweet exist or not
    // check tweet owner and user is same
    const userId  = req?.user._id;
    const { tweetId } = req?.params;

    const tweetData = await Tweet.findById(tweetId);
    if (!tweetData) {
        throw new ApiError(404, "Invalid tweet id")
    }
    // check tweet owner and user same
    if (!tweetData.owner.equals(userId)) {
        throw new ApiError(403, "Only tweet owner can delete tweets")
    }

    // delete tweet
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    if (!deletedTweet) {
        throw new ApiError(500, "tweet not deleted")
    }
    return res.status(200).json(
        new ApiResponse(deletedTweet, 200, "tweet deleted successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
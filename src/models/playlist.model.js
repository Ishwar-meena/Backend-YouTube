import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            lowercase:true
        },
        description: String,
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required:true
        },
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ]
    },
    { timestamps: true }
);

const Playlist = mongoose.model("Playlist",playlistSchema);
export default Playlist;
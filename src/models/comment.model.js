import mongoose,{Schema} from "mongoose";

const commentSchema = new Schema(
    {
        content:{
            type:String,
            required:true
        },
        video:{
            type: Schema.Types.ObjectId,
            ref:"Video",
            required:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true
        }
    },
    {timestamp:true}
);

const Comment = mongoose.model("Comment",commentSchema);
export default Comment;
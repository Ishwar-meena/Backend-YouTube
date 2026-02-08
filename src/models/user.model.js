import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const userSchema = new mongoose.Schema(
    {
        username:{
            type:String,
            lowercase:true,
            required:true,
            unique:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            lowercase:true,
            required:true,
            unique:true,
            trim:true
        },
        fullName:{
            type:String,
            lowercase:true,
            required:true,
            trim:true
        },
        avatar:{
            type:String,
            required:true
        },
        
        coverImage:{
            type:String
        },
        password:{
            type:String,
            required:true
        },
        refreshToken:{
            type:String
        },
        watchHistory:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Video"
            }
        ]
        
    },
    {
        timestamps: true
    }
);


userSchema.pre("save",async function(){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password,10);
    }
})


userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        id:this._id,
        username:this.username,
        fullName:this.fullName,
        email:this.email
    }, process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRE
    }
)
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        id:this._id
    }, process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRE
    }
)
}

const  User = mongoose.model("User", userSchema);
export default User;
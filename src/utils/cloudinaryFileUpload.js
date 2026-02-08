import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
import { ApiError } from "./apiError.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFileOnCloudinary = async (localFilePath) => {
    if (!localFilePath) return null;
    try {
        const cloudinaryData = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });
        console.log("File uploaded successfully on cloudinary");
        // delete file that on our server
        fs.unlinkSync(localFilePath);
        return cloudinaryData;
    } catch (error) {
        // delete file that on our server
        fs.unlinkSync(localFilePath);
        console.error("cloudinary file uploading error : ", error);
    }
}

const deleteFileOnCloudinary = async(publicId,type="image")=>{
    if(!publicId)return null;
    try {
        const result = await cloudinary.uploader.destroy(publicId,{
            resource_type:type,
            invalidate:true
        })
        // console.log(result);
    } catch (error) {
        console.error(error);
        throw new ApiError(500,error);
    }
}
export {
    uploadFileOnCloudinary,
    deleteFileOnCloudinary
}
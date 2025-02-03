import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (filepath) => {
    try {
        if (!filepath) {
            return null;
        }

        const response = await cloudinary.uploader.upload(filepath, {
            resource_type: 'auto',
        });

        // Delete local file after successful upload
        try {
            fs.unlinkSync(filepath);
        } catch (deleteError) {
            console.warn("Could not delete local file:", deleteError.message);
        }

        console.log("File uploaded successfully on Cloudinary");
        return response;
    } catch (error) {
        // Try to delete local file in case of upload error
        try {
            fs.unlinkSync(filepath);
        } catch (deleteError) {
            console.warn("Could not delete local file:", deleteError.message);
        }
        
        console.error("Upload failed:", error);
        return null;
    }
}

export { uploadOnCloudinary };
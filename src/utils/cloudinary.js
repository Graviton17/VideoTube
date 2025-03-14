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
        if (!filepath) { // file not found
            return null;
        }

        const response = await cloudinary.uploader.upload(filepath, { // upload the file on Cloudinary
            resource_type: 'auto',
        });

        // Delete local file after successful upload
        fs.unlink(filepath, (deleteError) => {
            if (deleteError) {
                console.warn("Could not delete local file:", deleteError.message);
            }
        });

        console.log("File uploaded successfully on Cloudinary");
        return response;
    } catch (error) {
        // Try to delete local file in case of upload error
        fs.unlink(filepath, (deleteError) => {
            if (deleteError) {
                console.warn("Could not delete local file:", deleteError.message);
            }
        });
        
        console.error("Upload failed:", error);
        return null;
    }
}

const deleteFromCloudinary = async(imageId) => {
    try {
        const response = await cloudinary.uploader.destroy(imageId, {
            invalidate: true,
        });

        console.log("File deleted successfully from Cloudinary");
        return response;
    } catch (error) {
        console.error("Delete failed:", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
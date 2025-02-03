import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

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

        fs.unlinkSync(filepath); // delete the file from the server
        console.log("File uploaded successfully on Cloudinary");
        return response;
    } catch (error) {
        fs.unlinkSync(filepath);
        console.error(error);
        return null;
    }
}

export { uploadOnCloudinary };
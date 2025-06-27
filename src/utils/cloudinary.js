import {v2 as cloudinary} from 'cloudinary';
import { log } from 'console';
import fs from 'fs';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) throw new Error('Local file path is invalid');
        const result = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        });

        console.log("Full result for just info ",result);
        console.log("File uploaded successfully to cloudinary", result.url);

        return result;
    } catch (error) {
        fs.unlinkSync(localFilePath);
        return null;
    }
}

export {uploadOnCloudinary};
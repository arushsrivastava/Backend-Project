import { v2 as cloudinary } from 'cloudinary';
import { log } from 'console';
import fs from 'fs';

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) throw new Error('Local file path is invalid');
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: 'auto',
    });

    fs.unlinkSync(localFilePath);
    return result;
  } catch (error) {
    if (localFilePath && fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Cloudinary upload error:", error);
    return null;
  }
};

function extractPublicId(url) {
  try {
    const withoutExtension = url.substring(0, url.lastIndexOf('.'));
    const x = withoutExtension.split('/upload/')[1];
    const publicId = x.split('/')[1];
    return publicId;
  } catch (err) {
    console.error("Failed to extract public_id from URL:", err);
    return null;
  }
}

const deleteFromCloudinary = async (imageUrl) => {
  const public_id = extractPublicId(imageUrl);
  const isVideo = imageUrl.match(/\.(mp4|mov|avi|webm)$/i);
  console.log(public_id);
  if (!public_id) return;

  try {
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: isVideo ? 'video' : 'image',
    });
    console.log("Deleted:", result);
  } catch (err) {
    console.error("Failed to delete from Cloudinary:", err);
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };

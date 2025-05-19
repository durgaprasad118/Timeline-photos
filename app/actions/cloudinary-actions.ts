'use server';

import { v2 as cloudinary } from 'cloudinary';

// Initialize Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageAction(base64Image: string): Promise<string> {
  try {
    const result = await new Promise<{secure_url: string}>((resolve, reject) => {
      cloudinary.uploader.upload(
        base64Image,
        {
          folder: 'memories-app',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result as {secure_url: string});
          }
        }
      );
    });
    
    return result.secure_url;
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error('Failed to upload image');
  }
}

export async function deleteImageAction(publicId: string): Promise<void> {
  try {
    await new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(
        publicId,
        (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw new Error('Failed to delete image');
  }
}

export async function getPublicIdFromUrl(url: string): Promise<string> {
  const regex = /\/v\d+\/([^/]+)\.\w+$/;
  const match = url.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return '';
} 
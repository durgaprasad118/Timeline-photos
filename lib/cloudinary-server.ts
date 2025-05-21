'use server';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const base64 = buffer.toString('base64');
  const dataURI = `data:${file.type};base64,${base64}`;
  
  const result = await new Promise<{secure_url: string}>((resolve, reject) => {
    cloudinary.uploader.upload(
      dataURI,
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
}

export async function deleteImage(publicId: string): Promise<void> {
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
} 
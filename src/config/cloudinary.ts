import { v2 as cloudinary } from 'cloudinary';

import env from './env';

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
});

export const uploadImageToCloudinary = async (
  file: Express.Multer.File,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: env.cloudinary.folder,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result?.secure_url) {
          resolve(result.secure_url);
        } else {
          reject(new Error('Failed to upload image'));
        }
      },
    );

    uploadStream.end(file.buffer);
  });
};

export default cloudinary;


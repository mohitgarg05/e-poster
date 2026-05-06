import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(fileData: string, folder: string) {
  const uploaded = await cloudinary.uploader.upload(fileData, {
    folder,
    resource_type: "image",
  });

  return uploaded.secure_url;
}

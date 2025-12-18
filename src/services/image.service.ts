import cloudinary from "../config/cloudinary";

export const uploadImage = (fileBuffer: Buffer, folder = "posts") => {
  return new Promise<{ url: string; public_id: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("No result from Cloudinary"));
        resolve({ url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(fileBuffer);
  });
};

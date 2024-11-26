import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs";
// Configuration
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.API_KEY,
//   api_secret: process.env.API_SECRET,
// });
cloudinary.config({
  cloud_name: "dk1htsljm",
  api_key: "137838484427123",
  api_secret: "_ZK0IpBZVp9CsqfC2R98aINaDpk", // Click 'View API Keys' above to copy your API secret
});

export const cloudinaryUpload = async (path) => {
  try {
    if (!path) return null;

    const uploadResult = await cloudinary.uploader.upload(path, {
      resource_type: "auto",
    });
    fs.unlinkSync(path);

    return uploadResult;
  } catch (error) {
    console.log("error occur  cloundinary Utils File = ", error.message);
    fs.unlinkSync(path);
    return null;
  }
};

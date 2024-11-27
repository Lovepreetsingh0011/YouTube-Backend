import { Video } from "../Model/Video.Model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { cloudinaryUpload } from "../Utils/Cloudinary.js";

const UploadVideo = async (req, res) => {
  try {
    const { Title, Description } = req.body;

    if ([Title, Description].some((val) => !val || val.trim() == "")) {
      return res
        .status(404)
        .json(new ApiError(404, "Title or Description is Required"));
    }
    // Image Validtion

    const VideoFilePath = req?.files?.VideoFile;
    const ThumbNailPath = req?.files?.ThumbNail;

    if (!VideoFilePath) {
      return res.status(404).json(new ApiError(404, "VideoFile is Required "));
    }
    if (!ThumbNailPath) {
      return res.status(404).json(new ApiError(404, "ThumbNail is Required "));
    }

    // Cloudinary Upload

    const VideoFileUrl = await cloudinaryUpload(VideoFilePath[0]?.path);
    const ThumbNailUrl = await cloudinaryUpload(ThumbNailPath[0]?.path);
    console.log(VideoFileUrl);

    if (!VideoFileUrl) {
      return res
        .status(404)
        .json(
          new ApiError(404, " Error Occur Will Upload Videos on Cloudinary ")
        );
    }
    if (!ThumbNailUrl) {
      return res
        .status(404)
        .json(
          new ApiError(
            404,
            "  Error Occur Will Upload ThumbNail on Cloudinary "
          )
        );
    }

    // Save in DB

    const result = await Video.create({
      Title,
      Description,
      VideoFile: VideoFileUrl?.url,
      ThumbNail: ThumbNailUrl?.url,
      Duration: VideoFileUrl?.duration,
      CreatedBy: req?.user?._id,
    });

    if (!result) {
      return res
        .status(500)
        .json(new ApiError(404, "Server Error Occur Will Save Document "));
    }

    // Return Statement
    return res
      .status(200)
      .json(new ApiResponse(200, { result }, "Video Uploaded Successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(404, error.message, "Error Occur in UploadVideo Controler")
      );
  }
};

const UpdateDetails = async (req, res) => {
  try {
    const { Title, Description } = req.body;
    const { id } = req.params;
    if (!id) {
      return res.status(404).json(new ApiError(404, "Video id Required"));
    }
    if ([Title, Description].some((val) => !val || val.trim() == "")) {
      return res
        .status(404)
        .json(new ApiError(404, "Title or Description is Required"));
    }

    // Update details
    const result = await Video.findByIdAndUpdate(
      id,
      {
        $set: { Title, Description },
      },
      { new: true }
    );

    if (!result) {
      return res
        .status(404)
        .json(
          new ApiError(404, "Error Occur Will Update Details , Please check id")
        );
    }

    // Return Statement
    return res
      .status(200)
      .json(new ApiResponse(200, { result }, "Details Updated Successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in Update Details Controler"
        )
      );
  }
};

const DeleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json(new ApiError(404, "Video id Required"));
    }

    const vid = await Video.findById(id);
    if (!vid) {
      return res.status(404).json(new ApiError(404, "Video Not Exits"));
    }
    if (!vid.CreatedBy.equals(req.user._id)) {
      return res.status(404).json(new ApiError(404, "UnAuthorized Access"));
    }

    const result = await Video.findByIdAndDelete(id);
    if (!result) {
      return res
        .status(404)
        .json(
          new ApiError(404, "Error Occur Will Delet Video , Please check id")
        );
    }

    // Return Statement
    return res
      .status(200)
      .json(new ApiResponse(200, { result }, "Video Deleted Successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(404, error.message, "Error Occur in DeleteVideo Controler")
      );
  }
};
export { UploadVideo, UpdateDetails, DeleteVideo };

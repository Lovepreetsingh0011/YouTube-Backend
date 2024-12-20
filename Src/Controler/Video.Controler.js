import mongoose from "mongoose";
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
const GetAllVideos = async (req, res) => {
  try {
    const videos = await Video.find().populate("CreatedBy");

    if (!videos?.length) {
      return res.status(404).json(new ApiError(404, "Error will find videos"));
    }

    // Return Statement
    return res
      .status(200)
      .json(new ApiResponse(200, { videos }, "Videos Gets Successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in GetAllVideos Controler"
        )
      );
  }
};
const GetUserVideos = async (req, res) => {
  try {
    const videos = await Video.find({ CreatedBy: req?.user?._id });

    // Return Statement
    return res
      .status(200)
      .json(new ApiResponse(200, { videos }, "Videos Gets Successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in GetUserAllVideos Controler"
        )
      );
  }
};
const GetVideosById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json(new ApiError(404, "id is Requred"));
    }

    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json(new ApiError(404, "Error will find video"));
    }

    // Return Statement
    return res
      .status(200)
      .json(new ApiResponse(200, { video }, "Video Get Successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in Get Video by Id Controler"
        )
      );
  }
};

const GetVideoWithDetails = async (req, res) => {
  try {
    const { Videoid } = req.params;
    if (!Videoid) {
      return res.status(404).json(new ApiError(404, "Videoid is Requred"));
    }

    const result = await Video.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(Videoid),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "Video",
          as: "Likes",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "CreatedBy",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
              $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "Chanel",
                as: "subscribers",
              },
            },
            {
              $addFields: {
                Subsribers: {
                  $size: "$subscribers",
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "Video",
          as: "Comments",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "CommentBy",
                foreignField: "_id",
                as: "User_D",
                pipeline: [
                  {
                    $project: {
                      UserName: 1,
                      FullName: 1,
                      Email: 1,
                      Avatar: 1,
                    },
                  },
                ],
              },
            },
            {
              $lookup: {
                from: "likes",
                foreignField: "Comment",
                localField: "_id",
                as: "LikesComment",
                pipeline: [
                  {
                    $lookup: {
                      from: "users",
                      localField: "LikeBy",
                      foreignField: "_id",
                      as: "User_d",
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            UserName: 1,
                            FullName: 1,
                            Avatar: 1,
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                UserDetails: {
                  $first: "$User_D",
                },
                CommentDetails: {
                  $first: "$User_D",
                },
              },
            },
            {
              $project: {
                UserDetails: 1,
                Content: 1,
                CommentBy: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          TotalLikes: {
            $size: "$Likes",
          },
          TotalComments: {
            $size: "$Comments",
          },
          TotalViews: {
            $size: "$Views",
          },
          UserDetails: {
            $first: "$user",
          },
          Comments: {
            $first: "$Comments",
          },
        },
      },
      {
        $project: {
          Comments: 1,
          UserDetails: 1,
          TotalViews: 1,
          TotalLikes: 1,
          TotalComments: 1,
          Comments: 1,
          VideoFile: 1,
          ThumbNail: 1,
          CreatedBy: 1,
          Title: 1,
          Description: 1,
          Duration: 1,
          IsPublished: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    // Return Statement
    return res
      .status(200)
      .json(
        new ApiResponse(200, { result }, "Successfully find Video details")
      );
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in GetVideoWithDetails Controler"
        )
      );
  }
};
const AddViewsOfVideo = async (req, res) => {
  try {
    const { Videoid } = req.params;
    if (!Videoid) {
      return res.status(404).json(new ApiError(404, "Video id is Required"));
    }
    const data = await Video.findByIdAndUpdate(
      Videoid,
      { $push: { Views: req?.user?._id } },
      { new: true }
    );

    if (!data) {
      return res.status(404).json(new ApiError(404, "!! Cannot add View"));
    }
    return res.status(200).json(new ApiResponse(200, {}, "view Added"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(404, error.message, "Error Occur in  View Add Controler")
      );
  }
};
export {
  UploadVideo,
  UpdateDetails,
  DeleteVideo,
  GetAllVideos,
  GetVideosById,
  GetVideoWithDetails,
  AddViewsOfVideo,
  GetUserVideos,
};

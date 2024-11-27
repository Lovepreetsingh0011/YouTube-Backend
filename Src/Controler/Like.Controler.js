import { Like } from "../Model/Like.Model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { User } from "../Model/User.Model.js";
import mongoose from "mongoose";
const AddLike = async (req, res) => {
  try {
    const { Videoid, Commentid } = req.body;

    if (!Videoid && !Commentid) {
      return res
        .status(404)
        .json(
          new ApiError(404, "Videoid or Commentid Atleast One is required ")
        );
    }
    if (Videoid?.trim() == "" && Commentid?.trim() == "") {
      return res
        .status(404)
        .json(
          new ApiError(404, "Videoid or Commentid Atleast One is required ")
        );
    }

    // Declare globaly
    let result;

    //  in Video Like
    if (Videoid?.trim() != "") {
      result = await Like.create({
        LikeBy: req.user?._id,
        Video: Videoid,
      });
    }

    //  in Comment Like
    if (Commentid?.trim() != "") {
      result = await Like.create({
        LikeBy: req.user?._id,
        Comment: Commentid,
      });
    }

    if (!result) {
      return res
        .status(404)
        .json(new ApiError(404, "Error occur will create document "));
    }

    // Return statement
    return res
      .status(200)
      .json(new ApiResponse(200, { result }, "Liked successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(404, error.message, "Error Occur in AddLike  Controler")
      );
  }
};
const DisLike = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id?.trim() == "") {
      return res.status(404).json(new ApiError(404, "document id is required"));
    }

    // Find the document
    const docu = await Like.findById(id);
    if (!docu) {
      return res.status(404).json(new ApiError(404, "cannot find document "));
    }

    // Check the userid
    if (!docu.LikeBy.equals(req.user?._id)) {
      return res.status(404).json(new ApiError(404, "UnAuthorized Access "));
    }

    // delete the document

    const result = await Like.findByIdAndDelete(id);

    if (!result) {
      return res
        .status(404)
        .json(new ApiError(404, "Error occur will Delete document "));
    }

    // Return statement
    return res
      .status(200)
      .json(new ApiResponse(200, { result }, "Dislike successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(404, error.message, "Error Occur in DisLike  Controler")
      );
  }
};

// for user
const GetLikedVideos = async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "LikeBy",
          as: "LikedVideos",
          pipeline: [
            {
              $lookup: {
                from: "videos",
                localField: "Video",
                foreignField: "_id",
                as: "VideosD",
              },
            },
            {
              $addFields: {
                VideoDetails: {
                  $first: "$VideosD",
                },
              },
            },
            {
              $project: {
                VideoDetails: 1,
              },
            },
          ],
        },
      },

      {
        $project: {
          LikedVideos: 1,
        },
      },
    ]);

    const data = result[0]?.LikedVideos?.filter((val) => {
      return val.VideoDetails;
    });

    // Return statement
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { data, TotalLiked: data.length },
          " successfully Finded Liked Videos"
        )
      );
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in GetLikedVideos  Controler"
        )
      );
  }
};
// const GetLikedVideos = async (req, res) => {
//   try {
//     const result = await User.aggregate([
//       {
//         $match: {
//           _id: new mongoose.Types.ObjectId(req.user._id),
//         },
//       },
//       {
//         $lookup: {
//           from: "likes",
//           localField: "_id",
//           foreignField: "LikeBy",
//           as: "LikedVideos",
//           pipeline: [
//             {
//               $lookup: {
//                 from: "videos",
//                 localField: "Video",
//                 foreignField: "_id",
//                 as: "VideosD",
//               },
//             },
//             {
//               $addFields: {
//                 VideoDetails: {
//                   $first: "$VideosD",
//                 },
//               },
//             },
//             {
//               $project: {
//                 VideoDetails: 1,
//               },
//             },
//           ],
//         },
//       },
//       {
//         $addFields: {
//           TotalLiked: {
//             $size: "$LikedVideos",
//           },
//         },
//       },
//       {
//         $project: {
//           TotalLiked: 1,
//           LikedVideos: 1,
//         },
//       },
//     ]);

//     // Return statement
//     return res
//       .status(200)
//       .json(
//         new ApiResponse(200, { result }, " successfully Finded Liked Videos")
//       );
//   } catch (error) {
//     return res
//       .status(404)
//       .json(
//         new ApiError(
//           404,
//           error.message,
//           "Error Occur in GetLikedVideos  Controler"
//         )
//       );
//   }
// };

export { GetLikedVideos, DisLike, AddLike };

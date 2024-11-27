import { Comment } from "../Model/Comment.Model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";

const AddComment = async (req, res) => {
  try {
    const { Content, Video } = req.body;

    if ([Content, Video].some((val) => !val || val?.trim() == "")) {
      return res
        .status(404)
        .json(new ApiError(404, "All Fields are required "));
    }

    const result = await Comment.create({
      Content,
      Video,
      CommentBy: req.user?._id,
    });
    if (!result) {
      return res
        .status(404)
        .json(new ApiError(404, "Error occur will create comment document"));
    }

    // Return stament
    return res
      .status(200)
      .json(new ApiResponse(200, { result }, "Comment added successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(404, error.message, "Error Occur in AddComment Controler")
      );
  }
};
const DeleteComment = async (req, res) => {
  try {
    const { Commentid } = req.params;

    if (!Commentid || Commentid?.trim() == "") {
      return res.status(404).json(new ApiError(404, "comment id is required "));
    }

    const docu = await Comment.findById(Commentid);
    if (!docu) {
      return res.status(404).json(new ApiError(404, "cannot find document"));
    }
    if (!docu?.CommentBy.equals(req.user?._id)) {
      return res.status(404).json(new ApiError(404, "UnAuthorized Access"));
    }

    const result = await Comment.findByIdAndDelete(Commentid);
    if (!result) {
      return res
        .status(404)
        .json(new ApiError(404, "Error occur will delete comment document"));
    }

    // Return stament
    return res
      .status(200)
      .json(new ApiResponse(200, { result }, "Comment Deleted successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in Comment Delted Controler"
        )
      );
  }
};

const GetAllComments = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json(new ApiError(404, "id is Required"));
    }

    const result = await Comment.find({ Video: id }).populate("CommentBy");
    if (!result?.length) {
      return res.status(404).json(new ApiError(404, "Cannot Find Comments"));
    }

    // Return stament
    return res
      .status(200)
      .json(new ApiResponse(200, { result }, "Comments Founds successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in GetAll Comments Controler"
        )
      );
  }
};

export { AddComment, GetAllComments, DeleteComment };

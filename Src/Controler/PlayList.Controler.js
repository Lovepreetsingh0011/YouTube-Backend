import { PlayList } from "../Model/PlayList.Model.js";
import { Video } from "../Model/Video.Model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";

const CreatePlayList = async (req, res) => {
  try {
    const { Title, Description } = req.body;
    if ([Title, Description].some((val) => !val || val?.trim() == "")) {
      return res
        .status(404)
        .json(new ApiError(404, "Title, Description is Requred"));
    }

    // create
    const result = await PlayList.create({
      Title,
      Description,
      CreatedBy: req.user._id,
    });

    if (!result) {
      return res
        .status(404)
        .json(new ApiError(404, " Error Occur  in creat Playlist"));
    }

    // Return Statement
    return res
      .status(200)
      .json(new ApiResponse(200, { result }, "Platlist Created Successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in CreatePlayList  Controler"
        )
      );
  }
};

const AddVideosInPlayList = async (req, res) => {
  try {
    const { Videos } = req.body;
    const { PlayListId } = req.params;
    if (!Videos || Videos.length == 0) {
      return res.status(404).json(new ApiError(404, "Videos id is required"));
    }
    if (!PlayListId) {
      return res
        .status(404)
        .json(new ApiError(404, "PlayListId id is required"));
    }

    const result = await PlayList.findByIdAndUpdate(
      PlayListId,
      {
        $push: { Videos: { $each: Videos } },
      },
      { new: true }
    );
    if (!result) {
      return res
        .status(404)
        .json(new ApiError(404, " error occur will videos on PlayListId "));
    }
    // Return Statement
    return res
      .status(200)
      .json(new ApiResponse(200, { result }, "Videos Added in Successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in CreatePlayList  Controler"
        )
      );
  }
};
const RemoveVideoFromPlaylist = async (req, res) => {
  try {
    const { Videos } = req.body;
    const { PlayListId } = req.params;
    if (!Videos || Videos.length == 0) {
      return res.status(404).json(new ApiError(404, "Videos id is required"));
    }
    if (!PlayListId) {
      return res
        .status(404)
        .json(new ApiError(404, "PlayListId id is required"));
    }

    const result = await PlayList.findByIdAndUpdate(
      PlayListId,
      {
        $pull: { Videos: { $in: Videos } },
      },
      { new: true }
    );
    if (!result) {
      return res
        .status(404)
        .json(
          new ApiError(404, " error occur will  remove videos on PlayListId ")
        );
    }
    // Return Statement
    return res
      .status(200)
      .json(new ApiResponse(200, { result }, "Videos Removed in Successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in RemoveVideoFromPlaylist  Controler"
        )
      );
  }
};

const DeletePlayList = async (req, res) => {
  try {
    const { PlayListid } = req.params;
    if (!PlayListid || PlayListid?.trim() == "") {
      return res.status(404).json(new ApiError(404, "PlayListid is Requred"));
    }

    // Delete
    const result = await PlayList.findByIdAndDelete(PlayListid);

    if (!result) {
      return res
        .status(404)
        .json(new ApiError(404, " Error Occur  in Delete Playlist"));
    }

    // Return Statement
    return res
      .status(200)
      .json(new ApiResponse(200, { result }, "Platlist Deletd Successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in DeletePlayList  Controler"
        )
      );
  }
};

const GetUserPlayListById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json(new ApiError(404, "PlayListid is Requred"));
    }
    const platlist = await PlayList.findById(id).populate("Videos");

    // Return Statement
    return res
      .status(200)
      .json(new ApiResponse(200, { platlist }, "PlayList Gets Successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in GetUserPlayListById Controler"
        )
      );
  }
};
const GetUserPlayLists = async (req, res) => {
  try {
    const platlist = await PlayList.find({
      CreatedBy: req?.user?._id,
    }).populate("Videos");

    // Return Statement
    return res
      .status(200)
      .json(new ApiResponse(200, { platlist }, "PlayList Gets Successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in GetUserAllPlayList Controler"
        )
      );
  }
};
export {
  CreatePlayList,
  AddVideosInPlayList,
  RemoveVideoFromPlaylist,
  DeletePlayList,
  GetUserPlayLists,
  GetUserPlayListById,
};

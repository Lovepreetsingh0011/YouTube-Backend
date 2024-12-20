import mongoose from "mongoose";
import { Subscription } from "../Model/Subscription.Model.js";
import { User } from "../Model/User.Model.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";

const Subcribe = async (req, res) => {
  try {
    const { Chanel } = req.body;

    if (!Chanel || Chanel?.trim() == "") {
      return res.status(404).json(new ApiError(404, "Channel id is Required"));
    }
    // if (!Userid || Userid?.trim() == "") {
    //   return res.status(404).json(new ApiError(404, "Userid id is Required"));
    // }

    const result = await Subscription.create({
      Chanel,
      Subcriber: req?.user?._id,
    });
    if (!result) {
      return res
        .status(404)
        .json(new ApiError(404, "error Occur will Subcribe "));
    }
    // Return Statement
    return res
      .status(200)
      .json(new ApiResponse(200, { result }, "Subcribed  Successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in Create Subcribe Document Controler"
        )
      );
  }
};

const UnSubscribe = async (req, res) => {
  try {
    const { Chanel } = req.body;

    if (!Chanel || Chanel?.trim() == "") {
      return res.status(404).json(new ApiError(404, "Channel id is Required"));
    }

    const doc = await Subscription.findOne({
      $and: [{ Subcriber: req?.user?._id }, { Chanel: Chanel }],
    });
    if (!doc) {
      return res.status(404).json(new ApiError(404, "Cannot find Document"));
    }

    const result = await Subscription.findByIdAndDelete(doc?._id);
    if (!result) {
      return res
        .status(404)
        .json(new ApiError(404, "error occur will delete Document"));
    }
    // Return Statement
    return res
      .status(200)
      .json(new ApiResponse(200, { result }, "UnSubcribed  Successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in UnSubscribe  Controler"
        )
      );
  }
};

const SubscribersOrSubscribeTo = async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req?.user?._id),
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "Chanel",
          as: "Subscribers",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "Subcriber",
                foreignField: "_id",
                as: "UserDet",
                pipeline: [
                  {
                    $project: {
                      Avatar: 1,
                      CoverImage: 1,
                      UserName: 1,
                      Email: 1,
                      FullName: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                UserDetails: {
                  $first: "$UserDet",
                },
              },
            },
            {
              $project: {
                UserDetails: 1,
              },
            },
          ],
        },
      },

      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "Subcriber",
          as: "SubscribeTo",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "Chanel",
                foreignField: "_id",
                as: "ChanelDet",
                pipeline: [
                  {
                    $project: {
                      UserName: 1,
                      Email: 1,
                      FullName: 1,
                      Avatar: 1,
                      CoverImage: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                ChanelDetails: {
                  $first: "$ChanelDet",
                },
              },
            },
            {
              $project: {
                ChanelDetails: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          SubscribedToCount: {
            $size: "$SubscribeTo",
          },

          SubscribersCount: {
            $size: "$Subscribers",
          },
        },
      },
      {
        $project: {
          Subscribers: 1,
          SubscribersCount: 1,
          SubscribedToCount: 1,
          SubscribeTo: 1,
        },
      },
    ]);

    if (!result?.length) {
      return res
        .status(404)
        .json(new ApiError(404, "error occur Find The Data"));
    }
    // Return Statement
    return res
      .status(200)
      .json(
        new ApiResponse(200, { data: result[0] }, "Data Get  Successfully")
      );
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in GetAllSubscriber  Controler"
        )
      );
  }
};
const CheckIsSubcribe = async (req, res) => {
  try {
    const { Chanel } = req.body;

    if (!Chanel || Chanel?.trim() == "") {
      return res.status(404).json(new ApiError(404, "Channel id is Required"));
    }

    const result = await Subscription.findOne({
      $and: [{ Subcriber: req?.user?._id }, { Chanel: Chanel }],
    });
    if (!result) {
      return res.status(200).json({ Success: false, Msg: "NotSubscribe" });
    } else {
      return res.status(200).json({ Success: true, Msg: "Subscribed" });
    }
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in Create Subcribe Document Controler"
        )
      );
  }
};
export { SubscribersOrSubscribeTo, Subcribe, UnSubscribe, CheckIsSubcribe };

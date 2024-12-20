import { ApiError } from "../Utils/ApiError.js";
import { User } from "../Model/User.Model.js";
import { cloudinaryUpload } from "../Utils/Cloudinary.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

import nodemailer from "nodemailer";
// const transporter = nodemailer.createTransport({
//   host: "smtp.ethereal.email",
//   port: 587,
//   auth: {
//     user: "roscoe.waters@ethereal.email",
//     pass: "Xqup6cQXnXkDW9MDsw",
//   },
// });
const transporter = await nodemailer.createTransport({
  service: "gmail",
  secure: true,
  port: 465,
  auth: {
    user: "lovepreetsin9292@gmail.com",
    pass: "gwel hbha gjpr omub ",
  },
});

// Register  User

const Register = async (req, res) => {
  try {
    const { UserName, Email, FullName, Password } = req.body;

    if ([UserName, Email, FullName, Password].some((val) => val.trim() == "")) {
      return res.status(404).json(new ApiError(404, "All Fields Are Required"));
    }

    // If User or Email Exits in DB

    const Exit = await User.findOne({
      $or: [{ UserName }, { Email }],
    });

    if (Exit) {
      return res
        .status(404)
        .json(new ApiError(404, "UserName or Email is Already in Used "));
    }

    //  Image Validations
    let CoverImageUrl = "";
    const AvatarPath = req.files?.Avatar;
    let CoverImagePath = req.files?.CoverImage;
    if (!AvatarPath) {
      return res
        .status(404)
        .json(new ApiError(404, "Avatar Field Are Requireds"));
    }

    // Cloundinary Upload

    const AvatarUrl = await cloudinaryUpload(AvatarPath[0]?.path);
    if (CoverImagePath) {
      CoverImageUrl = await cloudinaryUpload(CoverImagePath[0]?.path);
    }

    let hashpass = await bcrypt.hash(Password, 10);

    // Create
    const user = await User.create({
      UserName,
      Email,
      FullName,
      Password: hashpass,
      Avatar: AvatarUrl?.url,
      CoverImage: CoverImageUrl?.url,
    });

    if (!user) {
      return res
        .status(404)
        .json(
          new ApiError(500, " Error Occur Will Register The User in Database")
        );
    }

    // Return

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "User Register Successfully"));
  } catch (error) {
    res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in User Register Controler"
        )
      );
  }
};

// Gen Tokens

const GenTokens = async (id) => {
  const user = await User.findById(id);
  let AccesToken = user.GenAccessToken();
  let RefreshToken = user.GenRefreshToken();
  user.ReffreshToken = RefreshToken;
  await user.save({ validateBeforeSave: false });
  return { AccesToken, RefreshToken };
};

// Login User

const Login = async (req, res) => {
  try {
    const { UserName, Email, Password } = req.body;

    if (!Password || Password?.trim() == "") {
      return res.status(404).json(new ApiError(404, "  Password is Required"));
    }
    if (!UserName && !Email) {
      return res
        .status(404)
        .json(new ApiError(404, "UserName or Email  Atleast One is Required"));
    }
    if (UserName?.trim() == "" && Email?.trim() == "") {
      return res
        .status(404)
        .json(new ApiError(404, "UserName or Email is Empty"));
    }
    if (UserName?.trim() == "") {
      return res.status(404).json(new ApiError(404, "UserName is Required"));
    }
    if (Email?.trim() == "") {
      return res.status(404).json(new ApiError(404, "Email is Required"));
    }

    // Check in Database
    let UName = !UserName ? "" : UserName?.trim().toLowerCase();
    let Em = !Email ? "" : Email.trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ UserName: UName }, { Email: Em }],
    });

    if (!user) {
      return res
        .status(404)
        .json(new ApiError(404, "Does not exits Email or UserName in DB"));
    }

    // Match The Password

    const isMatch = await user.isPasswordCorrect(Password.trim());
    if (!isMatch) {
      return res.status(404).json(new ApiError(404, "Invalid Credantials"));
    }

    // Get Tokens
    const { AccesToken, RefreshToken } = await GenTokens(user?._id);

    //    Select Fields
    const data = await User.findById(user?._id).select("-Password");

    // cookie Options
    const Options = {
      httpOnly: true,
      secure: true,
    };

    // Return Statement
    return res
      .status(200)
      .cookie("AccessToken", AccesToken, Options)
      .cookie("RefershToken", RefreshToken, Options)
      .json(
        new ApiResponse(
          200,
          { User: data, AccesToken, RefreshToken },
          "User Login Successfully"
        )
      );
  } catch (error) {
    return res
      .status(404)
      .json(new ApiError(400, error.message, "error Occur in Login Controler"));
  }
};

const LogOut = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: { ReffreshToken: "" },
      },
      { new: true }
    );

    // cookie Options
    const Options = {
      httpOnly: true,
      secure: true,
    };

    // Return Statement
    return res
      .status(200)
      .clearCookie("AccessToken", Options)
      .clearCookie("RefershToken", Options)
      .json(new ApiResponse(200, {}, "User LogOut Successfully"));
  } catch (error) {
    return res.status(
      404,
      new ApiError(404, error.message, "Error occur in Logout Controler")
    );
  }
};

const LoginEndPoint = async (req, res) => {
  try {
    // Validations
    const token = req.cookies.RefershToken;
    console.log(token);

    if (!token) {
      return res.status(404).json(new ApiError(404, "UnAuthorized Access"));
    }
    const valid = jwt.verify(token, process.env.SECRET_KEY_JWT);

    if (!valid) {
      return res.status(404).json(new ApiError(404, "InValid Token"));
    }

    const user = await User.findById(valid._id).select("-Password");

    if (!user) {
      return res
        .status(404)
        .json(new ApiError(404, "InValid Token || Not Exist in DB"));
    }

    // GenTokens

    const { RefreshToken, AccesToken } = await GenTokens(user._id);

    // Update Document
    user.ReffreshToken = RefreshToken;
    await user.save({ validateBeforeSave: false });

    // cookie Options
    const Options = {
      httpOnly: true,
      secure: true,
    };

    //   Return Statement

    return res
      .status(200)
      .cookie("AccessToken", AccesToken, Options)
      .cookie("RefershToken", RefreshToken, Options)
      .json(
        new ApiResponse(
          200,
          { user, AccesToken, RefreshToken },
          "ReGenrate Tokens Successfully"
        )
      );
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "error Occur in HandelRefershToken Controler"
        )
      );
  }
};

const UpdateDetails = async (req, res) => {
  try {
    const { UserName, Email, FullName } = req.body;

    if ([UserName, Email, FullName].some((val) => !val || val?.trim() == "")) {
      return res.status(404).json(new ApiError(404, "All Fields Are Required"));
    }

    // Find if Alredy Exits

    const Exits = await User.findOne({
      UserName: UserName.trim().toLowerCase(),
    });
    if (Exits) {
      return res
        .status(404)
        .json(new ApiError(404, "This  UserName is Already Exits"));
    }

    // Update Details
    const NewUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: { UserName, Email, FullName },
      },
      { new: true }
    ).select("-Password");

    if (!NewUser) {
      return res
        .status(500)
        .json(new ApiError(500, "Error Occur Will Update The User"));
    }
    // Return Statement
    return res
      .status(200)
      .json(new ApiResponse(200, { NewUser }, "User Updated Successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error occur in Update Details Controler"
        )
      );
  }
};
const SendOTP = async (req, res) => {
  try {
    const { Email } = req.body;

    if (!Email) {
      return res.status(404).json(new ApiError(404, " Email Are Required"));
    }

    if (Email && Email?.trim() == "") {
      return res.status(404).json(new ApiError(404, " Email Cant be Emplty"));
    }

    // Find The  Model

    let exits = await User.findOne({ Email });

    if (!exits) {
      return res.status(404).json(new ApiError(404, "Invalid Email "));
    }

    const otp = Math.floor((Math.random() + 1) * 1000);

    const info = await transporter.sendMail({
      from: "lovepreetsin9264@gmail.com", // sender address
      to: exits?.Email, // list of receivers
      subject: "Pasword Update OTP", // Subject line
      text: `OTP ${otp}`, // plain text body
      // html: "<b>Hello world?</b>", // html body
    });

    if (!info) {
      return res
        .status(500)
        .json(new ApiError(500, "Error Occur Will Send The Email"));
    } else {
      await User.findByIdAndUpdate(exits?._id, {
        $set: { OTP: otp },
      });
    }
    // Return Statement
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { Email: exits?.Email, Success: true },
          "OTP Send Successfully"
        )
      );
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(404, error.message, "Error occur in SendOTP Controler")
      );
  }
};
const CheckOTP = async (req, res) => {
  try {
    const { Email, OTP } = req.body;

    if (!Email && !OTP) {
      return res.status(404).json(new ApiError(404, " Fields Are Required"));
    }

    if (Email && Email?.trim() == "") {
      return res.status(404).json(new ApiError(404, " Email Cant be Emplty"));
    }
    if (OTP && OTP?.trim() == "") {
      return res.status(404).json(new ApiError(404, " OTP Cant be Emplty"));
    }

    // Find The  Model

    let exits = await User.findOne({ Email });
    if (!exits) {
      return res.status(404).json(new ApiError(404, "Invalid Email "));
    }
    if (exits?.OTP !== OTP) {
      return res.status(404).json(new ApiError(404, "Invalid Credentials "));
    }
    exits.OTP = "";
    await exits.save();
    // Return Statement
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { Email: exits?.Email, Success: true },
          "OTP Send Successfully"
        )
      );
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(404, error.message, "Error occur in CheckOTP Controler")
      );
  }
};
const PasswordUpdate = async (req, res) => {
  try {
    const { Email, NewPassword } = req.body;

    if (!Email && !NewPassword) {
      return res.status(404).json(new ApiError(404, " Fields Are Required"));
    }

    if (Email && Email?.trim() == "") {
      return res.status(404).json(new ApiError(404, " Email Cant be Emplty"));
    }
    if (NewPassword && NewPassword?.trim() == "") {
      return res
        .status(404)
        .json(new ApiError(404, " NewPassword Cant be Emplty"));
    }

    // Find The  Model

    let exits = await User.findOne({ Email });
    if (!exits) {
      return res.status(404).json(new ApiError(404, "Invalid Email "));
    }

    let hashpass = await bcrypt.hash(NewPassword, 10);

    const result = await User.findByIdAndUpdate(
      exits?._id,
      {
        $set: { Password: hashpass },
      },
      {
        new: true,
      }
    );

    // Return Statement
    return res
      .status(200)
      .json(new ApiResponse(200, { result }, "OTP Send Successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(404, error.message, "Error occur in CheckOTP Controler")
      );
  }
};
const UpdateAvatar = async (req, res) => {
  try {
    const Avatar = req?.file;
    if (!Avatar) {
      return res.status(404).json(new ApiError(404, "Avatar is Required"));
    }
    // Upload on Cloundinary
    const AvatarUrl = await cloudinaryUpload(Avatar?.path);
    if (!AvatarUrl) {
      return res
        .status(404)
        .json(new ApiError(404, "Error Occur Will Upload Image On DB"));
    }

    // Update Doucment
    const UpdateUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: { Avatar: AvatarUrl?.url },
      },
      { new: true }
    ).select("-Password");

    if (!UpdateUser) {
      return res
        .status(500)
        .json(new ApiError(500, "Error Occur Will Update The User Document"));
    }

    // Return Statement
    return res
      .status(200)
      .json(
        new ApiResponse(200, { UpdateUser }, "Avatar Updated Successfully")
      );
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in  Update Avatar Controler"
        )
      );
  }
};
const UpdateCoverImage = async (req, res) => {
  try {
    const CoverImage = req?.file;
    if (!CoverImage) {
      return res.status(404).json(new ApiError(404, "CoverImage is Required"));
    }
    // Upload on Cloundinary
    const CoverImageUrl = await cloudinaryUpload(CoverImage?.path);
    if (!CoverImageUrl) {
      return res
        .status(404)
        .json(new ApiError(404, "Error Occur Will Upload Image On DB"));
    }

    // Update Doucment
    const UpdateUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: { CoverImage: CoverImageUrl?.url },
      },
      { new: true }
    ).select("-Password");

    if (!UpdateUser) {
      return res
        .status(500)
        .json(new ApiError(500, "Error Occur Will Update The User Document"));
    }

    // Return Statement
    return res
      .status(200)
      .json(
        new ApiResponse(200, { UpdateUser }, "CoverImage Updated Successfully")
      );
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in  Update Avatar Controler"
        )
      );
  }
};

const GetChanelProfile = async (req, res) => {
  try {
    const { UserName } = req.params;
    if (!UserName) {
      return res.status(404).json(new ApiError(404, "UserName is Required"));
    }

    const result = await User.aggregate([
      {
        $match: {
          UserName: UserName?.toLowerCase(),
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "Chanel",
          as: "Subscribers",
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "Subcriber",
          as: "SubscriberTo",
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "CreatedBy",
          as: "Videos",
        },
      },

      {
        $addFields: {
          Subscribers: {
            $size: "$Subscribers",
          },
          SubscriberTo: {
            $size: "$SubscriberTo",
          },
          IsSubscribed: {
            $cond: {
              if: { $in: [req?.user?._id, "$Subscribers.Subcriber"] },
              then: true,
              else: false,
            },
          },
        },
      },

      {
        $project: {
          UserName: 1,
          Email: 1,
          FullName: 1,
          Avatar: 1,
          CoverImage: 1,
          Subscribers: 1,
          SubscriberTo: 1,
          IsSubscribed: 1,
          Videos: 1,
        },
      },
    ]);
    if (!result?.length) {
      return res.status(404).json(new ApiError(404, "Incoorect UserName "));
    }

    // Return Statement
    return res
      .status(200)
      .json(
        new ApiResponse(200, { result }, "Channel Profile get Successfully")
      );
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in  GetChanelProfile   Controler"
        )
      );
  }
};

const GetHistory = async (req, res) => {
  try {
    const result = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "WatchHistory",
          foreignField: "_id",
          as: "History",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "CreatedBy",
                foreignField: "_id",
                as: "UserDetails",
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
                Owner: {
                  $first: "$UserDetails",
                },
                TotalViews: {
                  $size: "$Views",
                },
              },
            },
            {
              $project: {
                Owner: 1,
                VideoFile: 1,
                ThumbNail: 1,
                CreatedBy: 1,
                Title: 1,
                Description: 1,
                Duration: 1,
                TotalViews: 1,
                IsPublished: 1,
                createdAt: 1,
                updatedAt: 1,
              },
            },
          ],
        },
      },
      // {
      //   $addFields: {
      //     history: {
      //       $first: "$History",
      //     },
      //   },
      // },
      {
        $project: {
          History: 1,
        },
      },
    ]);

    return res.json(result[0]);
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(404, error.message, "Error Occur in  GetHistory Controler")
      );
  }
};

const AddWatchHistory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(404).json(new ApiError(404, "id is Required"));
    }
    const data = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { WatchHistory: id } },
      { new: true }
    );

    if (!data) {
      return res.status(404).json(new ApiError(404, "!! Cannot add history"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, { data }, "History Added"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in  History Add Controler"
        )
      );
  }
};

const RemoveIdsFromHistory = async (req, res) => {
  try {
    const { Values } = req.body;
    if (Values?.length < 0) {
      return res.status(404).json(new ApiError(404, "id is Required"));
    }

    const result = await User.findByIdAndUpdate(
      req?.user?._id,

      {
        $pull: {
          WatchHistory: { $in: Values },
        },
      }
    );

    if (!result) {
      return res
        .status(404)
        .json(new ApiError(404, "Eror ocuur will remove history "));
    }

    // Return Statement
    return res
      .status(200)
      .json(new ApiResponse(200, { result }, "History Removed  Successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in  RemoveIdFromHistory   Controler"
        )
      );
  }
};
const RemoveAllHistory = async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(req?.user?._id, {
      WatchHistory: [],
    });

    if (!result) {
      return res
        .status(404)
        .json(new ApiError(404, "Eror ocuur will remove history "));
    }

    // Return Statement
    return res
      .status(200)
      .json(new ApiResponse(200, { result }, "History Removed  Successfully"));
  } catch (error) {
    return res
      .status(404)
      .json(
        new ApiError(
          404,
          error.message,
          "Error Occur in  RemoveIdFromHistory   Controler"
        )
      );
  }
};
export {
  Register,
  Login,
  LogOut,
  LoginEndPoint,
  UpdateDetails,
  UpdateAvatar,
  UpdateCoverImage,
  GetChanelProfile,
  GetHistory,
  AddWatchHistory,
  RemoveIdsFromHistory,
  RemoveAllHistory,
  SendOTP,
  CheckOTP,
  PasswordUpdate,
};

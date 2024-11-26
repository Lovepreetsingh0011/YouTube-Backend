import { ApiError } from "../Utils/ApiError.js";
import { User } from "../Model/User.Model.js";
import { cloudinaryUpload } from "../Utils/Cloudinary.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import jwt from "jsonwebtoken";
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

    // Create
    const user = await User.create({
      UserName,
      Email,
      FullName,
      Password,
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

export { Register, Login, LogOut, LoginEndPoint };

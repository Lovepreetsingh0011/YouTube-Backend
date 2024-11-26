import jwt from "jsonwebtoken";
import { ApiError } from "../Utils/ApiError.js";
import { User } from "../Model/User.Model.js";

export const AuthMiddelware = async (req, res, next) => {
  try {
    const token = req.cookies.AccessToken;

    if (!token) {
      return res.status(404).json(new ApiError(404, "UnAuthorized Access"));
    }

    const valid = jwt.verify(token, process.env.SECRET_KEY_JWT);

    if (!valid) {
      return res.status(404).json(new ApiError(404, "InValid Token"));
    }

    const user = await User.findById(valid._id);

    if (!user) {
      return res
        .status(404)
        .json(new ApiError(404, "InValid Token || Not Exist in DB"));
    }

    req.user = user;
    next();
  } catch (error) {
    return res
      .status(404)
      .json(new ApiError(404, error.message, "Error Occur in AuthMiddelware"));
  }
};

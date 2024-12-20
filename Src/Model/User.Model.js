import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";
const userschema = new mongoose.Schema(
  {
    UserName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    Email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    FullName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    Avatar: {
      type: String,
      required: true,
    },
    CoverImage: {
      type: String,
    },

    Password: {
      type: String,
      required: true,
    },
    ReffreshToken: {
      type: String,
    },
    OTP: {
      type: String,
    },
    WatchHistory: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

// userschema.pre("save", async function (next) {
//   if (!this.isModified("Password")) return next();
//   this.Password = await bcrypt.hash(this.Password, 10);
//   next();
// });

userschema.methods.GenAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.SECRET_KEY_JWT,
    {
      expiresIn: process.env.ACCESS_T_EX,
    }
  );
};
userschema.methods.GenRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.SECRET_KEY_JWT,
    {
      expiresIn: process.env.REFRESH_T_EX,
    }
  );
};

userschema.methods.isPasswordCorrect = async function (Password) {
  return await bcrypt.compare(Password, this.Password);
};

userschema.plugin(aggregatePaginate);
export const User = mongoose.model("User", userschema);

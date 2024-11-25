import mongoose from "mongoose";

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
    WatchHistory: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Video",
      },
    ],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userschema);

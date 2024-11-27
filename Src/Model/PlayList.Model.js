import mongoose from "mongoose";
const PlaylistSchema = new mongoose.Schema(
  {
    Title: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
      required: true,
    },

    Videos: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Video",
      },
    ],
    CreatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const PlayList = mongoose.model("PlayList", PlaylistSchema);

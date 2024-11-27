import mongoose from "mongoose";
const LikesSchema = new mongoose.Schema(
  {
    LikeBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    Video: {
      type: mongoose.Types.ObjectId,
      ref: "Video",
    },
    Comment: {
      type: mongoose.Types.ObjectId,
      ref: "Comment",
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model("Like", LikesSchema);

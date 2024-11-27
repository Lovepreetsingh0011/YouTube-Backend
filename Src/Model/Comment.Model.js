import mongoose from "mongoose";
const CommentSchema = new mongoose.Schema(
  {
    Content: {
      type: String,
      required: true,
    },
    Video: {
      type: mongoose.Types.ObjectId,
      ref: "Video",
    },
    CommentBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Comment = mongoose.model("Comment", CommentSchema);

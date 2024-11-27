import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const videoschema = new mongoose.Schema(
  {
    VideoFile: {
      type: String,
      required: true,
    },
    ThumbNail: {
      type: String,
      required: true,
    },
    CreatedBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    Title: {
      type: String,
      required: true,
    },
    Description: {
      type: String,
      required: true,
    },
    Duration: {
      type: Number,
      required: true,
    },
    Views: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
    IsPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

videoschema.plugin(mongooseAggregatePaginate);
export const Video = mongoose.model("Video", videoschema);

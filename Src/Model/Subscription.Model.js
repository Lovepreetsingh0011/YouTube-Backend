import mongoose from "mongoose";
const subscriptionschema = new mongoose.Schema(
  {
    Chanel: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    Subcriber: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionschema);

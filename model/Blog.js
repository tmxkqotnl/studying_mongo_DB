import { Schema, model, Types } from "mongoose";

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    user: {
      type: Types.ObjectId,
      required: true,
      ref: "user",
    },
  },
  { timestamps: true, versionKey: false }
);

export const Blog = new model("blog", blogSchema);

import { Schema, model, Types } from "mongoose";

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    user: {
      type: Types.ObjectId,
      required: true,
      ref: "user",
    },
    blog: {
      type: Types.ObjectId,
      required: true,
      ref: "blog",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Comment = new model("comment", commentSchema);

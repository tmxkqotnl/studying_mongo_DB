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
      index: true,
    },
    userFullName: {
      type: String,
      required: true,
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

commentSchema.index({ blog: 1, createdAt: -1 });

const Comment = new model("comment", commentSchema);

export { Comment, commentSchema };

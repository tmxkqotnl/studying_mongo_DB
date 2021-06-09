import { Schema, model, Types } from "mongoose";
import { commentSchema } from "./Comment";

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
      //Nesting
      _id: {
        type: Types.ObjectId,
        required: true,
        ref: "user",
      },
      username: { type: String, required: true },
      name: {
        firstName: {
          type: String,
          required: true,
        },
        lastName: {
          type: String,
          required: true,
        },
      },
    },
    comments: [commentSchema],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* // 가상 키
blogSchema.virtual("comments", {
  ref: "comment",
  localField: "_id", // comment와 어떤 속성이 연관이 있는가?
  foreignField: "blog", // comment 의 blog 필드와 연관
});
blogSchema.set("toObject", { virtuals: true });
blogSchema.set("toJSON", { virtuals: true }); */

export const Blog = new model("blog", blogSchema);

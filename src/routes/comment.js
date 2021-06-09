import { Router } from "express";
const router = Router({ mergeParams: true });
import { Blog, User, Comment } from "../models";
import { isValidObjectId } from "mongoose";

router.get("/", async (req, res) => {
  const { blogId } = req.params;
  if (!isValidObjectId(blogId))
    return res.status(400).json({
      message: "blog id is invalid",
    });

  const comments = await Comment.find({ blog: blogId });
  return res.send({ comments });
});

router.post("/", async (req, res) => {
  try {
    const { blogId } = req.params;
    const { content, userId } = req.body;

    if (!isValidObjectId(blogId))
      return res.status(400).json({
        message: "blog id is invalid",
        tag: "validation error",
      });
    if (!isValidObjectId(userId))
      return res.status(400).json({
        message: "user id is invalid",
        tag: "validation error",
      });
    if (typeof content !== "string") {
      return res.status(400).json({
        message: "content is required",
        tag: "validation error",
      });
    }

    const [user, blog] = await Promise.all([
      User.findById(userId),
      Blog.findById(blogId),
    ]);

    if (!user)
      return res.status(400).json({
        message: "no user is found",
      });

    if (!blog)
      return res.status(400).json({
        message: "no blog is found",
      });
    if (!blog.isLive) {
      return res.status(400).json({
        message: "this blog is not available",
      });
    }

    const newComment = new Comment({
      user,
      blog,
      userFullName: `${user.name.firstName} ${user.name.lastName}`,
      content,
    });
    await Promise.all([
      newComment.save(),
      Blog.updateOne({ _id: blogId }, { $push: { comments: newComment } }),
    ]);
    return res.status(200).send(newComment);
  } catch (error) {
    return res.json({
      message: error.message,
    });
  }
});

router.patch("/:commentId", async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;

  if (typeof content !== "string")
    return res.status(400).json({
      message: "content is required",
    });

  // comment 모델 수정과 blog의 해당하는 특정 comment 수정
  const [comment] = await Promise.all([
    Comment.findOneAndUpdate({ _id: commentId }, { content }, { new: true }),
    Blog.updateOne(
      { "comments._id": commentId },
      { "comments.$.content": content }
    ),
  ]);

  return res.send({ comment });
});
router.delete("/:commentId", async (req, res) => {
  const { commentId } = req.params;
  const comment = await Comment.findOneAndDelete({ _id: commentId });
  await Blog.updateOne(
    { "comments._id": commentId },
    { $pull: { comments: { _id: commentId } } }
  );
  return res.send({ comment });
});

export default router;

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

    const newComment = new Comment({ user, blog, content });
    await newComment.save();

    return res.status(200).send(newComment);
  } catch (error) {
    return res.json({
      message: error.message,
    });
  }
});

export default router;

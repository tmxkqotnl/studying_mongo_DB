import { Router } from "express";
const router = Router();
import { Blog, User, Comment } from "../models";
import { isValidObjectId } from "mongoose";
import commentRouter from "./comment";

router.use("/:blogId/comment", commentRouter);

// using populate
router.get("/", async (req, res) => {
  try {
    const { page = 0 } = req.query;
    const curPage = parseInt(page) * 3;
    const blogs = await Blog.find({})
      .sort({ updatedAt: -1 })
      .skip(curPage)
      .limit(3);
    /* .populate([
        { path: "user" },
        { path: "comments", populate: { path: "user" } },
      ]); */
    return res.send({ blogs });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      err: err.message,
    });
  }
});
router.post("/", async (req, res) => {
  try {
    const { title, content, isLive, userId } = req.body;
    if (typeof title !== "string")
      return res.status(400).json({ message: "title is required" });
    if (typeof content !== "string")
      return res.status(400).json({ message: "content is required" });
    if (isLive && typeof isLive !== "boolean")
      return res.status(400).json({ message: "isLive must be boolean" });
    if (!isValidObjectId(userId))
      return res.status(400).json({ message: "invalid user" });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        message: "no user info",
      });
    }
    const article = new Blog({ ...req.body, user });
    await article.save();

    return res.send(article);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      err: error.message,
    });
  }
});
router.get("/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!isValidObjectId(blogId)) return res.json({ message: "invalide blog" });

    const blog = await Blog.findById(blogId);
    //const commentCount = await Comment.find({ blog: blogId }).countDocuments();
    if (!blog) {
      return res.json({
        message: "no matched blog",
      });
    }

    return res.send({ blog, commentCount });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      err: err.message,
    });
  }
});

router.put("/:blogId", async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!isValidObjectId(blogId)) return res.json({ message: "invalide blog" });

    const { title, content } = req.body;
    if (typeof title !== "string")
      return res.status(400).json({ message: "title is required" });
    if (typeof content !== "string")
      return res.status(400).json({ message: "content is required" });

    const blogModified = await Blog.findOneAndUpdate(
      { _id: blogId },
      { $set: { title, content } },
      { new: true }
    );
    return res.send(blogModified);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      err: error.message,
    });
  }
});
router.patch("/:blogId/live", async (req, res) => {
  try {
    const { blogId } = req.params;
    if (!isValidObjectId(blogId)) return res.json({ message: "invalide blog" });
    const { isLive } = req.body;
    if (typeof isLive !== "boolean")
      return res.status(400).json({ message: "isLive must be boolean" });
    const blogModified = await Blog.findOneAndUpdate(
      { _id: blogId },
      { $set: { isLive } },
      { new: true }
    );
    return res.send(blogModified);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      err: err.message,
    });
  }
});

export default router;

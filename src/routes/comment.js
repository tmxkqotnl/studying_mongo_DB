import { Router } from "express";
const router = Router({ mergeParams: true });
import { Blog, User, Comment } from "../models";
import { isValidObjectId, startSession } from "mongoose";

router.get("/", async (req, res) => {
  const { blogId } = req.params;
  let { page = 0 } = req.query; // prevent NaN
  if (!isValidObjectId(blogId))
    return res.status(400).json({
      message: "blog id is invalid",
    });

  const comments = await Comment.find({ blog: blogId })
    .sort({ createAt: -1 })
    .skip(parseInt(page) * 3)
    .limit(3);
  return res.send({ comments });
});

router.post("/", async (req, res) => {
  // const session = await startSession();
  let comment;
  try {
    // 동시성 처리
    // await session.withTransaction(async () => {
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
      blog: blog._id,
      userFullName: `${user.fullName}`,
      content,
    });

    // await session.abortTransaction();

    // await Promise.all([
    //   newComment.save(),
    //   Blog.updateOne({ _id: blogId }, { $push: { comments: newComment } }),
    // ]);
    // blog.commentsCount++;
    // blog.comments.push(newComment);
    // while (blog.commentsCount > 3) {
    //   blog.comments.shift();
    // }

    // await Promise.all([newComment.save(), blog.save()]);
    // comment = newComment;
    // });

    // 더 간단한 방법
    // 가장 최근의 3개만 남긴다.
    // 동시성 문제도 해결된다.
    // 단, 원자성 문제는 여전히 존재한다. - 통신이 실패하는 경우. 일어날 확률은 적다. 아니라면 transaction처리
    // bulk한 데이터는 피하자
    await Promise.all([
      newComment.save(),
      Blog.updateOne(
        { _id: blogId },
        {
          $inc: { commentsCount: 1 },
          $push: {
            comments: { $each: [newComment], $slice: -3 },
          },
        }
      ),
    ]);
    return res.status(200).send(comment);
  } catch (error) {
    return res.json({
      message: error.message,
    });
  } finally {
    // await session.endSession();
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

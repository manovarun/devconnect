const expressAsyncHandler = require('express-async-handler');
const User = require('../models/User');
const Post = require('../models/Post');
const AppError = require('../utils/AppError');

// @route    POST api/posts
// @desc     Create a post
// @access   Private
exports.createPost = expressAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('-password');

  const newPost = new Post({
    text: req.body.text,
    name: user.name,
    avatar: user.avatar,
    user: req.user.id,
  });

  const post = await newPost.save();

  res.status(200).json({ status: 'Success', data: post });
});

// @route    GET api/posts
// @desc     Get all posts
// @access   Private
exports.getAllPosts = expressAsyncHandler(async (req, res, next) => {
  const posts = await Post.find().sort({ date: -1 });

  if (!posts || posts.length <= 0) {
    return next(new AppError('No posts found', 404));
  }

  res.status(200).json({ status: 'Success', data: posts });
});

// @route    GET api/posts/:id
// @desc     Get post by ID
// @access   Private
exports.getPost = expressAsyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post found', 404));
  }

  res.status(200).json({ status: 'Success', data: post });
});

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
exports.deletePost = expressAsyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post found', 404));
  }

  if (post.user.toString() !== req.user.id) {
    return next(new AppError('User not Authorized', 401));
  }

  await post.remove();

  res.status(202).json({ status: 'Success', data: post });
});

// @route    PUT api/posts/like/:id
// @desc     Like a post
// @access   Private
exports.addLikePost = expressAsyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (post.likes.some((like) => like.user.toString() === req.user.id)) {
    return next(new AppError('Post already liked.'));
  }

  post.likes.unshift({ user: req.user.id });

  await post.save();

  res.status(200).json({ status: 'Success', data: post });
});

// @route    PUT api/posts/unlike/:id
// @desc     Unlike a post
// @access   Private
exports.addUnlikePost = expressAsyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
    return next(new AppError('Post has not yet been liked.'));
  }

  post.likes = post.likes.filter(({ user }) => user.toString() !== req.user.id);

  await post.save();

  res.status(200).json({ status: 'Success', data: post });
});

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
exports.createComment = expressAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const post = await Post.findById(req.params.id);

  const newComment = {
    text: req.body.text,
    name: user.name,
    avatar: user.avatar,
    user: req.user.id,
  };

  post.comments.unshift(newComment);

  await post.save();

  res.status(200).json({ status: 'Success', data: post.comments });
});

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment
// @access   Private
exports.deleteComment = expressAsyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError('No post found', 404));
  }

  const comment = post.comments.find((com) => com.id === req.params.comment_id);

  if (!comment) {
    return next(new AppError('Comment does not exist', 404));
  }

  if (comment.user.toString() !== req.user.id) {
    return next(new AppError('User not authorized', 401));
  }

  post.comments = post.comments.filter(
    ({ id }) => id !== req.params.comment_id
  );

  await post.save();

  res.status(200).json({ status: 'Comment deleted', data: post.comments });
});

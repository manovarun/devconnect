const express = require('express');
const {
  createPost,
  getAllPosts,
  getPost,
  deletePost,
  addLikePost,
  addUnlikePost,
  createComment,
  deleteComment,
} = require('../controllers/postController');
const CheckObjectId = require('../middlewares/CheckObjectId');
const Protect = require('../middlewares/Protect');

const router = express.Router();

router.route('/').get(Protect, getAllPosts).post(Protect, createPost);

router
  .route('/:id')
  .get(Protect, CheckObjectId('id'), getPost)
  .delete(Protect, CheckObjectId('id'), deletePost);

router.route('/like/:id').put(Protect, CheckObjectId('id'), addLikePost);

router.route('/unlike/:id').put(Protect, CheckObjectId('id'), addUnlikePost);

router.route('/comment/:id').post(Protect, CheckObjectId('id'), createComment);

router
  .route('/comment/:id/:comment_id')
  .delete(Protect, CheckObjectId('id'), deleteComment);

module.exports = router;

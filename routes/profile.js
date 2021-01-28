const express = require('express');
const {
  getMeProfile,
  createProfile,
  getAllProfiles,
  getUserProfile,
  deleteUserProfile,
  createProfileExperience,
  deleteProfileExperience,
  createProfileEducation,
  deleteProfileEducation,
  getGithubUsername,
} = require('../controllers/profileController');

const Protect = require('../middlewares/Protect');

const router = express.Router();

router.get('/me', Protect, getMeProfile);

router.route('/').get(getAllProfiles).post(Protect, createProfile);

router
  .route('/user/:user_id')
  .get(getUserProfile)
  .delete(Protect, deleteUserProfile);

router.put('/experience', Protect, createProfileExperience);

router.delete('/experience/:exp_id', Protect, deleteProfileExperience);

router.post('/education', Protect, createProfileEducation);

router.delete('/education/:edu_id', Protect, deleteProfileEducation);

router.get('/github/:username', Protect, getGithubUsername);

router.delete('/', Protect, deleteUserProfile);

module.exports = router;

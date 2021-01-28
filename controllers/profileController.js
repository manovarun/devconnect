const axios = require('axios');
const expressAsyncHandler = require('express-async-handler');
const normalize = require('normalize-url');
const Profile = require('../models/Profile');
const User = require('../models/User');
const AppError = require('../utils/AppError');

// @route    GET api/profile/me
// @desc     Get current users profile
// @access   Private
exports.getMeProfile = expressAsyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Please Login..', 400));
  }

  const profile = await Profile.findOne({ user: req.user.id }).populate(
    'user',
    ['name', 'avatar']
  );

  if (!profile) {
    return next(new AppError('There is no profile for this user.', 404));
  }

  res.status(200).json({ status: 'Success', data: profile });
});

// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private
exports.createProfile = expressAsyncHandler(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Please Login..', 400));
  }

  const {
    website,
    skills,
    youtube,
    twitter,
    facebook,
    instagram,
    linkedin,
    ...rest
  } = req.body;

  const profileFields = {
    user: req.user.id,
    website:
      website && website !== '' ? normalize(website, { forceHttps: true }) : '',
    skills: Array.isArray(skills)
      ? skills
      : skills.split(',').map((skill) => skill.trim()),
    ...rest,
  };

  const socialFields = { youtube, twitter, instagram, linkedin, facebook };

  for (const [key, value] of Object.entries(socialFields)) {
    if (value && value.length > 0)
      socialFields[key] = normalize(value, { forceHttps: true });
  }

  profileFields.social = socialFields;

  let profile = await Profile.findOneAndUpdate(
    { user: req.user.id },
    { $set: profileFields },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({ status: 'Profile created', data: profile });
});

// @route    GET api/profile
// @desc     Get all profiles
// @access   Public
exports.getAllProfiles = expressAsyncHandler(async (req, res, next) => {
  const profiles = await Profile.find().populate('user', ['name', 'avatar']);

  if (!profiles || profiles.length <= 0) {
    return next(new AppError('No profiles found, please try again', 404));
  }

  res.status(200).json({ status: 'Success', data: profiles });
});

// @route    GET api/profile/user/:user_id
// @desc     Get profile by user ID
// @access   Public
exports.getUserProfile = expressAsyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({
    user: req.params.user_id,
  }).populate('user', ['name', 'avatar']);

  if (!profile) {
    return next(new AppError('Profile not found'));
  }

  res.status(200).json({ status: 'Success', data: profile });
});

// @route    DELETE api/profile
// @desc     Delete profile, user & posts
// @access   Private
exports.deleteUserProfile = expressAsyncHandler(async (req, res, next) => {
  const user = await User.findOne({ _id: req.user._id });

  if (!user) {
    return next(new AppError('User not found'));
  }

  const profile = await Profile.findOne({
    user: req.user._id,
  });

  if (!profile) {
    return next(new AppError('Profile not found'));
  }

  await Profile.findOneAndRemove({ user: req.user._id });

  await User.findOneAndRemove({ _id: req.user._id });

  res
    .status(200)
    .json({ status: `User: ${user.name} and profile deleted`, data: profile });
});

// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private
exports.createProfileExperience = expressAsyncHandler(
  async (req, res, next) => {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return next(new AppError('Profile not found'));
    }

    profile.experience.unshift({ ...req.body });

    await profile.save();

    res.status(200).json({ status: 200, data: profile });
  }
);

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private
exports.deleteProfileExperience = expressAsyncHandler(
  async (req, res, next) => {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return next(new AppError('Profile not found'));
    }

    profile.experience = profile.experience.filter(
      (exp) => exp._id.toString() !== req.params.exp_id
    );

    await profile.save();

    res.status(200).json({ status: 200, data: profile });
  }
);

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
exports.createProfileEducation = expressAsyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({
    user: req.user.id,
  }).populate('user', ['name', 'avatar']);

  if (!profile) {
    return next(new AppError('Profile not found'));
  }

  profile.education.unshift({ ...req.body });

  await profile.save();
  res.status(200).json({ status: 200, data: profile });
});

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from profile
// @access   Private
exports.deleteProfileEducation = expressAsyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({ user: req.user.id }).populate(
    'user',
    ['name', 'avatar']
  );

  if (!profile) {
    return next(new AppError('Profile not found'));
  }

  const education = profile.education.find(
    (edu) => edu.id.toString() === req.params.edu_id
  );

  if (!education) {
    return next(new AppError('Education not found', 400));
  }

  profile.education = profile.education.filter(
    (edu) => edu._id.toString() !== req.params.edu_id
  );

  await profile.save();

  res.status(200).json({ status: 200, data: profile });
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
exports.getGithubUsername = expressAsyncHandler(async (req, res, next) => {
  const profile = await Profile.findOne({ user: req.user.id }).populate(
    'user',
    ['name', 'avatar']
  );

  if (!profile) {
    return next(new AppError('Profile not found'));
  }

  const uri = encodeURI(
    `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${process.env.GITHUB_CLIENT}&client_secret=${process.env.GITHUB_SCERET}`
  );

  const headers = {
    'user-agent': 'node.js',
  };

  const gitHubResponse = await axios.get(uri, { headers });

  if (!gitHubResponse) {
    return next(new AppError('No response from GitHub'));
  }

  res.status(200).json({ status: 'Success', data: gitHubResponse.data });
});

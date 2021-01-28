const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  company: {
    type: String,
  },
  website: {
    type: String,
  },
  location: {
    type: String,
  },
  status: {
    type: String,
    required: [true, 'Please enter status'],
  },
  skills: {
    type: [String],
    required: [true, 'Please enter skills'],
  },
  bio: {
    type: String,
  },
  githubusername: {
    type: String,
  },
  experience: [
    {
      title: {
        type: String,
        required: [true, 'Please enter title'],
      },
      company: {
        type: String,
        required: [true, 'Please enter company'],
      },
      location: {
        type: String,
      },
      from: {
        type: Date,
        required: [true, 'Please enter from date'],
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
      },
    },
  ],
  education: [
    {
      school: {
        type: String,
        required: [true, 'Please enter school name'],
      },
      degree: {
        type: String,
        required: [true, 'Please enter degree'],
      },
      fieldofstudy: {
        type: String,
        required: [true, 'Please enter field of study'],
      },
      from: {
        type: Date,
        required: [true, 'Please enter from date'],
      },
      to: {
        type: Date,
      },
      current: {
        type: Boolean,
        default: false,
      },
      description: {
        type: String,
      },
    },
  ],
  social: {
    youtube: {
      type: String,
    },
    twitter: {
      type: String,
    },
    facebook: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    instagram: {
      type: String,
    },
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Profile = mongoose.model('Profile', ProfileSchema);

module.exports = Profile;

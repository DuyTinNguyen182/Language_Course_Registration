const mongoose = require('mongoose');

const RegistrationCourseSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  enrollment_date: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  userid: { type: String, required: true},
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Admin'] },
  fullname: { type: String },
  gender: { type: String , default: null},
  genderEdited: { type: Boolean, default: false },
  address: { type: String },
  email: { type: String },
  // avatar: { type: String },

  avatar: { type: String, default: "" },
  avatarPublicId: {
    type: String,
    default: null,
  },
  
  registrationCourses: [RegistrationCourseSchema]
});

const User = mongoose.model('User', userSchema);
module.exports = User;


const RegistrationCourse = require("../models/RegistrationCourse");

// Đăng ký khóa học
const registerCourse = async (userId, courseId) => {
  // kiểm tra đã tồn tại chưa
  const existing = await RegistrationCourse.findOne({ user_id: userId, course_id: courseId });
  if (existing) return { status: "already_registered" };

  const registration = new RegistrationCourse({
    user_id: userId,
    course_id: courseId,
  });
  await registration.save();
  return { status: "success", registration };
};

// Lấy danh sách khóa học theo user
const getCoursesByUser = async (userId) => {
  return await RegistrationCourse.find({ user_id: userId })
    .populate({
      path: "course_id",
      populate: [
        { path: "language_id" },
        { path: "languagelevel_id" },
        { path: "teacher_id" },
      ],
    })
    .populate("user_id");
};

// Lấy danh sách học viên theo course
const getUsersByCourse = async (courseId) => {
  return await RegistrationCourse.find({ course_id: courseId })
    .populate("course_id")
    .populate("user_id");
};

// Hủy đăng ký
const cancelRegistration = async (id) => {
  const deleted = await RegistrationCourse.findByIdAndDelete(id);
  return !!deleted;
};

// Cập nhật (status hoặc score)
const updateRegistration = async (id, data) => {
  const updated = await RegistrationCourse.findByIdAndUpdate(id, data, { new: true });
  return updated;
};

// Lấy tất cả các đăng ký (dùng cho admin)
const getAllRegistrations = async () => {
  return await RegistrationCourse.find()
    .populate("user_id")
    .populate({
      path: "course_id",
      populate: [
        { path: "language_id" },
        { path: "languagelevel_id" },
        { path: "teacher_id" },
      ],
    });
};

module.exports = {
  registerCourse,
  getCoursesByUser,
  getUsersByCourse,
  cancelRegistration,
  updateRegistration,
  getAllRegistrations,
};

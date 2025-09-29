const RegistrationCourse = require("../models/RegistrationCourse");

// Đăng ký khóa học
const registerCourse = async (req, res) => {
  try {
    const { user_id, course_id } = req.body;
    if (!user_id || !course_id) {
      return res.status(400).json({ message: "Thiếu user_id hoặc course_id" });
    }

    // kiểm tra đã đăng ký chưa
    const existing = await RegistrationCourse.findOne({ user_id, course_id });
    if (existing) {
      return res.status(400).json({ message: "Đã đăng ký khóa học này rồi" });
    }

    const registration = new RegistrationCourse({ user_id, course_id });
    await registration.save();

    res.status(201).json({
      message: "Đăng ký khóa học thành công",
      registration,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy danh sách khóa học theo user
const getCoursesByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const registrations = await RegistrationCourse.find({ user_id: userId })
      .populate({
        path: "course_id",
        populate: [
          { path: "language_id", model: "Language" },
          { path: "languagelevel_id", model: "Language_Level" },
          { path: "teacher_id", model: "Teacher" }
        ]
      })
      .populate("user_id"); // populate thông tin user
    res.json(registrations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy danh sách học viên theo course
const getUsersByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const registrations = await RegistrationCourse.find({ course_id: courseId })
      .populate("user_id") // lấy thông tin user
      .populate({
        path: "course_id",
        populate: [
          { path: "language_id", model: "Language" },
          { path: "languagelevel_id", model: "Language_Level" },
          { path: "teacher_id", model: "Teacher" }
        ]
      });
    res.json(registrations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy tất cả đăng ký
const getAllRegistrations = async (req, res) => {
  try {
    const registrations = await RegistrationCourse.find()
      .populate("user_id", "userid fullname") // lấy đúng trường bạn cần từ User
      .populate({
        path: "course_id",
        populate: [
          { path: "language_id", model: "Language", select: "language" },
          { path: "languagelevel_id", model: "Language_Level", select: "language_level" },
          { path: "teacher_id", model: "Teacher", select: "full_name" }
        ]
      });

    res.json(registrations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách đăng ký" });
  }
};

// Hủy đăng ký
const cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await RegistrationCourse.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Không tìm thấy đăng ký" });
    }
    res.json({ message: "Hủy đăng ký thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// Lấy đăng ký theo id
const getRegistrationById = async (req, res) => {
  try {
    const reg = await RegistrationCourse.findById(req.params.id)
      .populate("user_id")
      .populate({
        path: "course_id",
        populate: [
          { path: "language_id", model: "Language" },
          { path: "languagelevel_id", model: "Language_Level" },
          { path: "teacher_id", model: "Teacher" }
        ]
      });

    if (!reg) {
      return res.status(404).json({ message: "Không tìm thấy" });
    }
    res.json(reg);
  } catch (err) {
    console.error("getRegistrationById error:", err);
    res.status(500).json({ message: err.message });
  }
};


// Cập nhật trạng thái hoặc điểm
const updateRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await RegistrationCourse.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy đăng ký" });
    }
    res.json({ message: "Cập nhật thành công", updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  registerCourse,
  getCoursesByUser,
  getUsersByCourse,
  cancelRegistration,
  updateRegistration,
  getAllRegistrations,
  getRegistrationById,
};

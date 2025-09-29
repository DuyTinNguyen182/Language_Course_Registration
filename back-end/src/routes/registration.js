const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/registrationController");

// Lấy tất cả đăng ký
router.get("/", registrationController.getAllRegistrations);

// Đăng ký khóa học
router.post("/", registrationController.registerCourse);

// Lấy danh sách khóa học của một user
router.get("/user/:userId", registrationController.getCoursesByUser);

// Lấy danh sách học viên của một course
router.get("/course/:courseId", registrationController.getUsersByCourse);

router.get("/:id", registrationController.getRegistrationById);

// Hủy đăng ký theo id đăng ký
router.delete("/:id", registrationController.cancelRegistration);

// Cập nhật đăng ký (theo id đăng ký)
router.put("/:id", registrationController.updateRegistration);

module.exports = router;


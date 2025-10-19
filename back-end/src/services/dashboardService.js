const Course = require("../models/Course");
const Language = require("../models/Language");
const LanguageLevel = require("../models/Language_level");
const Teacher = require("../models/Teacher");
const User = require("../models/user");
const RegistrationCourse = require("../models/RegistrationCourse");

const getDashboardStats = async () => {
  const totalCourses = await Course.countDocuments();
  const totalLanguages = await Language.countDocuments();
  const totalLevels = await LanguageLevel.countDocuments();
  const totalStudents = await User.countDocuments({ role: "Student" });
  const totalTeachers = await Teacher.countDocuments();
  const totalRegistrations = await RegistrationCourse.countDocuments();

  return {
    courses: totalCourses,
    languages: totalLanguages,
    levels: totalLevels,
    students: totalStudents,
    teachers: totalTeachers,
    registrations: totalRegistrations,
  };
};

module.exports = {
  getDashboardStats,
};

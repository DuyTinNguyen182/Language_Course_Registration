import { useEffect, useState } from "react";
import axios from "axios";
import { Spin, message } from "antd";
import CourseDetailModal from "../CourseDetailModal/CourseDetailModal";

function Courses() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [userId, setUserId] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();

  const successMessage = () => {
    messageApi.open({
      type: "success",
      content: "Đăng ký thành công!",
    });
  };

  const errorMessage = (msg = "Đăng ký thất bại. Vui lòng thử lại.") => {
    messageApi.open({
      type: "error",
      content: msg,
    });
  };

  // Lấy thông tin user hiện tại
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await axios.get("http://localhost:3005/api/user/info", {
          withCredentials: true,
        });
        setUserId(res.data._id);
      } catch (err) {
        console.error("Không thể lấy thông tin người dùng:", err);
      }
    };

    fetchUserInfo();
  }, []);

  const handleRegister = async (courseId) => {
  if (!userId) {
    errorMessage("Hãy đăng nhập để tiếp tục!");
    return;
  }
  console.log("Sending:", { user_id: userId, course_id: courseId });
  try {
    const response = await axios.post(
      "http://localhost:3005/api/registration",
      { user_id: userId, course_id: courseId },
      { withCredentials: true }
    );

    if (response.status === 201) {
      successMessage();
    } else {
      errorMessage();
    }
  } catch (error) {
    console.error("Lỗi khi đăng ký khóa học:", error);
    errorMessage(error.response?.data?.message);
  }
};


  // Lấy dữ liệu khóa học + language + level + teacher
  const fetchData = async () => {
    setSpinning(true);
    try {
      const [courseRes, langRes, levelRes, teacherRes] = await Promise.all([
        axios.get("http://localhost:3005/api/course", {
          withCredentials: true,
        }),
        axios.get("http://localhost:3005/api/language", {
          withCredentials: true,
        }),
        axios.get("http://localhost:3005/api/languagelevel", {
          withCredentials: true,
        }),
        axios.get("http://localhost:3005/api/teacher", {
          withCredentials: true,
        }),
      ]);

      const courses = courseRes.data;
      console.log("hahaha", courses);
      const languages = langRes.data;
      const levels = levelRes.data;
      const teachers = teacherRes.data;

      const enrichedCourses = courses.map((course) => ({
        ...course,
        language: languages.find((l) => l._id === course.language_id),
        level: levels.find((lv) => lv._id === course.languagelevel_id),
        teacher: teachers.find((t) => t._id === course.teacher_id),
      }));

      setFeaturedCourses(enrichedCourses);
      setLanguages(languages);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu khóa học:", error);
    } finally {
      setSpinning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="allcourses-page">
      {contextHolder} <Spin spinning={spinning} fullscreen />
      {languages.map((lang) => {
        const coursesInLang = featuredCourses.filter(
          (course) => course.language?._id === lang._id
        );
        if (coursesInLang.length === 0) return null;

        return (
          <div className="language-group" key={lang._id}>
            <h2>KHÓA HỌC {lang.language.toUpperCase()}</h2>
            <div className="course-list">
              {coursesInLang.map((course) => (
                <div className="course-card" key={course._id}>
                  <div className="top-half">
                    <div className="language">
                      KHÓA HỌC{" "}
                      {course.language?.language?.toUpperCase() || "CHƯA RÕ"}
                    </div>
                    <div className="level">
                      {course.level?.language_level?.toUpperCase() || "CHƯA RÕ"}
                    </div>
                  </div>

                  <div className="bottom-half">
                    <div className="course-description">
                      <div>
                        <ion-icon name="caret-forward-outline"></ion-icon> Ngày
                        bắt đầu:{" "}
                        {new Date(course.Start_Date).toLocaleDateString(
                          "vi-VN"
                        )}
                      </div>
                      <div>
                        <ion-icon name="pie-chart"></ion-icon> Số tiết:{" "}
                        {course.Number_of_periods}
                      </div>
                      <div>
                        <ion-icon name="cash"></ion-icon> Học phí:{" "}
                        {course.Tuition?.toLocaleString()} đ
                      </div>
                      <div>
                        <ion-icon name="person"></ion-icon> Giảng viên:{" "}
                        {course.teacher?.full_name || "Đang cập nhật"}
                      </div>
                    </div>
                    <div className="action-buttons">
                      <button
                        className="properties-course"
                        onClick={() => setSelectedCourse(course)}
                      >
                        Chi tiết
                      </button>
                      <button
                        className="sign-up-course"
                        onClick={() => handleRegister(course.id)}
                      >
                        Đăng ký
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      {/* Modal */}
      <CourseDetailModal
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    </div>
  );
}

export default Courses;

import { Link } from "react-router-dom";
import banner from "../../../imgs/banner.png";
import banner2 from "../../../imgs/banner2.png";
import banner3 from "../../../imgs/banner3.png";
import "./Home.css";
import { Spin, Carousel, message } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import CourseDetailModal from "../CourseDetailModal/CourseDetailModal";

import { useAuth } from "../../../context/AuthContext";

function Home() {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [spinning, setSpinning] = useState(false);
  // const [userId, setUserId] = useState(null);

  const { state } = useAuth();
  const { currentUser } = state;
  const userId = currentUser?._id;

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

  // Hàm lấy phần tên sau từ "Tiếng" để sắp xếp
  const getSortKey = (langName) => {
    if (!langName) return "";
    const parts = langName.trim().split(" ");
    return parts.length > 1 ? parts[1] : parts[0];
  };

  // Lấy thông tin user hiện tại
  // useEffect(() => {
  //   const fetchUserInfo = async () => {
  //     try {
  //       const res = await axios.get("http://localhost:3005/api/user/info", {
  //         withCredentials: true,
  //       });
  //       setUserId(res.data._id);
  //     } catch (err) {
  //       console.error("Không thể lấy thông tin người dùng:", err);
  //     }
  //   };

  //   fetchUserInfo();
  // }, []);
  // useEffect(() => {
  //   const fetchUserInfo = async () => {
  //     try {
  //       const res = await axios.get("http://localhost:3005/api/user/info", {
  //         withCredentials: true,
  //       });
  //       setUserId(res.data._id);
  //     } catch (err) {
  //       if (err.response && err.response.status === 401) {
  //         console.log("Người dùng chưa đăng nhập.");
  //       } else {
  //         console.error("Không thể lấy thông tin người dùng:", err);
  //       }
  //     }
  //   };

  //   fetchUserInfo();
  // }, []);
  const handleRegister = async (courseId) => {
    if (!userId) {
      errorMessage("Hãy đăng nhập để tiếp tục!");
      return;
    }
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
  const fetchData = async () => {
    setSpinning(true);
    try {
      const courseRes = await axios.get("http://localhost:3005/api/course", {
        withCredentials: true,
      });
      setFeaturedCourses(courseRes.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu khóa học:", error);
      messageApi.error("Không thể tải dữ liệu khóa học!");
    } finally {
      setSpinning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="homepage">
      {contextHolder}
      <Spin spinning={spinning} fullscreen />

      {/* Banner */}
      <Carousel autoplay autoplaySpeed={3000}>
        {[banner, banner2, banner3].map((img, i) => (
          <div className="homepage-banner" key={i}>
            <img src={img} alt={`Banner ${i + 1}`} />
          </div>
        ))}
      </Carousel>

      {/* Khóa học nổi bật */}
      <section className="homepage-section">
        <div className="section-header">
          <span>Khóa học nổi bật</span>
          <Link to="/courses">
            <span>Xem tất cả</span>
            <ion-icon name="arrow-forward"></ion-icon>
          </Link>
        </div>

        <div className="course-list">
          {featuredCourses.slice(0, 4).map((course) => (
            <div className="course-card" key={course.id}>
              <div className="top-half">
                <div className="language">
                  KHÓA HỌC {course.language?.toUpperCase() || "CHƯA RÕ"}
                </div>
                <div className="level">
                  {course.languagelevel?.toUpperCase() || "CHƯA RÕ"}
                </div>
              </div>

              <div className="bottom-half">
                <div className="course-description">
                  <div>
                    <ion-icon name="caret-forward-outline"></ion-icon> Ngày bắt
                    đầu:{" "}
                    {new Date(course.Start_Date).toLocaleDateString("vi-VN")}
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
                    {course.teacher_name || "Đang cập nhật"}
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

        {/* Modal chi tiết */}
        <CourseDetailModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      </section>
    </div>
  );
}

export default Home;

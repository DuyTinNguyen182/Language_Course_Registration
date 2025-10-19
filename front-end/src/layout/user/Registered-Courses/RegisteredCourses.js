import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Spin, message, Tag } from "antd";
import "./RegisteredCourses.css";

function RegisteredCourses() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [spinning, setSpinning] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const fetchUserInfo = async () => {
    try {
      const res = await axios.get("http://localhost:3005/api/user/info", {
        withCredentials: true,
      });
      setUserId(res.data._id);
    } catch (err) {
      messageApi.open({
        type: "error",
        content: "Không thể lấy thông tin người dùng",
      });
    }
  };

  const fetchCourses = async (uid) => {
    if (!uid) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3005/api/registration/user/${uid}`,
        { withCredentials: true }
      );
      setRegistrations(res.data);
    } catch (err) {
      messageApi.open({
        type: "error",
        content: "Không thể tải danh sách khóa học",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async (registrationId) => {
    try {
      const res = await axios.delete(
        `http://localhost:3005/api/registration/${registrationId}`,
        { withCredentials: true }
      );

      console.log("Delete response:", res.data);

      // Lấy message từ backend trả về
      messageApi.open({ type: "success", content: "Hủy đăng ký thành công" });
      fetchCourses(userId);
    } catch (err) {
      console.error("Error unregister:", err.response?.data || err.message);
      messageApi.open({ type: "error", content: "Hủy thất bại" });
    }
  };

  // --- HÀM XỬ LÝ THANH TOÁN ---
  // const handlePayment = async (registrationId) => {
  //   setSpinning(true);
  //   try {
  //     const res = await axios.patch(
  //       `http://localhost:3005/api/registration/${registrationId}/pay`,
  //       {}, // body rỗng
  //       { withCredentials: true }
  //     );

  //     messageApi.success(res.data.message || "Thanh toán thành công!");
  //     fetchCourses(userId); // Tải lại để cập nhật giao diện

  //   } catch (err) {
  //     messageApi.error(err.response?.data?.message || "Thanh toán thất bại.");
  //   } finally {
  //     setSpinning(false);
  //   }
  // };
  const handlePayment = async (registrationId, tuition) => {
    setSpinning(true);
    try {
      // 1. Gọi API của bạn để lấy URL thanh toán
      const res = await axios.post(
        `http://localhost:3005/api/payment/create_payment_url`,
        {
          registrationId: registrationId,
          // Không cần gửi amount vì backend sẽ tự lấy
        },
        { withCredentials: true }
      );

      const paymentUrl = res.data.url;

      // 2. Nếu có URL, chuyển hướng người dùng
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        messageApi.error("Không thể tạo yêu cầu thanh toán.");
      }
    } catch (err) {
      messageApi.error(
        err.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại."
      );
    } finally {
      setSpinning(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchUserInfo();
    };
    init();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchCourses(userId);
    }
  }, [userId]);

  // if (loading) return <Spin fullscreen />;

  return (
    <div className="registered-courses">
      {contextHolder} <Spin spinning={spinning} fullscreen />
      {registrations.map((rc, idx) => {
        const course = rc.course_id;
        if (!course || !course.language_id || !course.languagelevel_id) {
          return (
            <Card key={idx} title="Dữ liệu không đầy đủ">
              Không thể hiển thị
            </Card>
          );
        }

        return (
          <Card
            key={idx}
            className="course-card"
            title={
              <div className="card-title">
                {course.language_id.language} -{" "}
                {course.languagelevel_id.language_level}
                <Tag
                  color={rc.isPaid ? "green" : "orange"}
                  style={{ marginLeft: 10 }}
                >
                  {rc.isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                </Tag>
              </div>
            }
          >
            <p>
              <b>Ngày bắt đầu:</b>{" "}
              {new Date(course.Start_Date).toLocaleDateString("vi-VN")}
            </p>
            <p>
              <b>Số buổi:</b> {course.Number_of_periods}
            </p>
            <p>
              <b>Học phí:</b> {course.Tuition.toLocaleString()} VND
            </p>
            <p>
              <b>Giảng viên:</b> {course.teacher_id?.full_name ?? "Không rõ"}
            </p>
            <p>
              <b>Mô tả:</b> {course.Description ?? "Không có mô tả"}
            </p>
            <p>
              <b>Ngày đăng ký:</b>{" "}
              {new Date(rc.enrollment_date).toLocaleDateString("vi-VN")}
            </p>

            {/* Nút hành động */}
            {/* <div className="card-actions">
              <Button danger onClick={() => handleUnregister(rc._id)}>
                Hủy
              </Button>
              <Button type="primary" disabled={rc.isPaid}>
                Thanh toán
              </Button>
            </div> */}
            <div className="card-actions">
              <Button
                danger
                onClick={() => handleUnregister(rc._id)}
                disabled={rc.isPaid} // Vô hiệu hóa nút Hủy nếu đã trả tiền
              >
                Hủy
              </Button>
              {/* <Button 
                type="primary" 
                disabled={rc.isPaid} // Vô hiệu hóa nút nếu đã trả tiền
                onClick={() => handlePayment(rc._id)}
              >
                {rc.isPaid ? 'Đã thanh toán' : 'Thanh toán'}
              </Button> */}
              <Button
                type="primary"
                disabled={rc.isPaid}
                onClick={() => handlePayment(rc._id, rc.course_id.Tuition)} // Truyền rc._id và học phí
              >
                {rc.isPaid ? "Đã thanh toán" : "Thanh toán"}
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export default RegisteredCourses;

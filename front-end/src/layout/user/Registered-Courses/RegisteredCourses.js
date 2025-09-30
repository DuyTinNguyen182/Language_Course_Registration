import { useEffect, useState } from "react";
import axios from "axios";
import { Button, Card, Spin, message } from "antd";
import { useParams } from "react-router-dom";

function RegisteredCourses() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id: userId } = useParams();

  const fetchCourses = async () => {
    if (!userId) {
      message.error("Không xác định được người dùng");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:3005/api/registration/user/${userId}`,
        { withCredentials: true }
      );
      setRegistrations(res.data);
      console.log(res.data);
    } catch (err) {
      message.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async (registrationId) => {
    try {
      await axios.delete(
        `http://localhost:3005/api/registration/${registrationId}`,
        { withCredentials: true }
      );
      message.success("Hủy đăng ký thành công");
      fetchCourses();
    } catch (err) {
      message.error("Hủy thất bại");
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading) return <Spin />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {registrations.map((rc, idx) => {
        const course = rc.course_id;
        console.log("hihi", course);
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
            title={`${course.language_id.language} - ${course.languagelevel_id.language_level}`}
            extra={
              <Button danger onClick={() => handleUnregister(rc._id)}>
                Hủy
              </Button>
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
          </Card>
        );
      })}
    </div>
  );
}

export default RegisteredCourses;

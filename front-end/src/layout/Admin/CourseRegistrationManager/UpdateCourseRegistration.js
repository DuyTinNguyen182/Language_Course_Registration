import {
  Form,
  Select,
  Button,
  Breadcrumb,
  Flex,
  Spin,
  message,
  Input,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function UpdateCourseRegistration() {
  const { registrationId } = useParams(); // lấy id đăng ký từ URL
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [spinning, setSpinning] = useState(false);
  const [courses, setCourses] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  const successMessage = () =>
    messageApi.success("Cập nhật đăng ký thành công");

  useEffect(() => {
    if (!registrationId) return;

    const fetchData = async () => {
      setSpinning(true);
      try {
        // lấy danh sách khóa học và thông tin đăng ký
        const [courseRes, regRes] = await Promise.all([
          axios.get("http://localhost:3005/api/course", {
            withCredentials: true,
          }),
          axios.get(
            `http://localhost:3005/api/registration/${registrationId}`,
            {
              withCredentials: true,
            }
          ),
        ]);
        // console.log("Course data from API:", courseRes.data);

        setCourses(courseRes.data);

        const reg = regRes.data;
        if (reg?.user_id && reg?.course_id) {
          form.setFieldsValue({
            userid: reg.user_id.userid,
            name: reg.user_id.fullname,
            course_id: reg.course_id._id,
          });
        } else {
          messageApi.error("Dữ liệu đăng ký không hợp lệ");
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
        messageApi.error("Không thể tải dữ liệu");
      } finally {
        setSpinning(false);
      }
    };

    fetchData();
  }, [registrationId, form, messageApi]);

  const onFinish = async (values) => {
    setSpinning(true);
    try {
      await axios.put(
        `http://localhost:3005/api/registration/${registrationId}`,
        { course_id: values.course_id },
        { withCredentials: true }
      );
      successMessage();
      setTimeout(() => navigate("/admin/registercourses"), 1000);
    } catch (error) {
      messageApi.error(error.response?.data?.message || error.message);
    } finally {
      setSpinning(false);
    }
  };

  return (
    <Flex className="UpdateCourseRegistration" vertical gap={20}>
      {contextHolder}
      <Spin spinning={spinning} fullscreen />
      <Breadcrumb
        items={[
          { title: "Admin Dashboard" },
          {
            title: <Link to="/admin/registercourses">Quản lý đăng ký học</Link>,
          },
          { title: "Cập nhật đăng ký học" },
        ]}
      />
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        style={{ maxWidth: 1200, margin: "0 auto" }}
      >
        <Form.Item label="Mã học viên" name="userid">
          <Input disabled />
        </Form.Item>
        <Form.Item label="Tên học viên" name="name">
          <Input disabled />
        </Form.Item>
        <Form.Item
          label="Cập nhật khóa học"
          name="course_id"
          rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
        >
          <Select placeholder="Chọn khóa học">
            {courses.map((course) => (
              <Select.Option key={course.id} value={course.id}>
                {course.courseid} - {course.language} - {course.languagelevel}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block disabled={spinning}>
            Cập nhật đăng ký
          </Button>
        </Form.Item>
      </Form>
    </Flex>
  );
}

export default UpdateCourseRegistration;

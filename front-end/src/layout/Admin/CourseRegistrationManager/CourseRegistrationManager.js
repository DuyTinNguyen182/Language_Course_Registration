import { useEffect, useState } from "react";
import {  Button,  Table,  Flex,  Breadcrumb,  Modal,  Form,  Input,  message,  Spin,  Select,  Tag,  Result } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

function CourseRegistrationManager() {
  const [open, setOpen] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [modal, contextHolderModal] = Modal.useModal();

  const [users, setUsers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const { state } = useAuth();
  const { currentUser } = state;

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open]);

  // --- HÀM ĐỂ XÁC NHẬN THANH TOÁN ---
  const handleConfirmPayment = async (registrationId) => {
    setSpinning(true);
    try {
      await axios.patch(
        `http://localhost:3005/api/registration/${registrationId}/confirm-payment`,
        {},
        { withCredentials: true }
      );
      messageApi.success("Xác nhận thanh toán thành công!");
      fetchData(); // Tải lại dữ liệu để cập nhật bảng
    } catch (error) {
      console.error("Lỗi khi xác nhận thanh toán:", error);
      messageApi.error(error.response?.data?.message || "Xác nhận thất bại.");
    } finally {
      setSpinning(false);
    }
  };

  const columns = [
    {
      title: "Mã khóa học",
      dataIndex: ["course_id", "courseid"],
    },
    {
      title: "Ngôn ngữ",
      dataIndex: ["course_id", "language_id", "language"],
    },
    {
      title: "Trình độ",
      dataIndex: ["course_id", "languagelevel_id", "language_level"],
    },
    {
      title: "Mã học viên",
      dataIndex: ["user_id", "userid"],
    },
    {
      title: "Tên học viên",
      dataIndex: ["user_id", "fullname"],
    },
    {
      title: "Ngày đăng ký",
      dataIndex: "enrollment_date",
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    // --- CỘT TRẠNG THÁI THANH TOÁN ---
    {
      title: "Trạng thái",
      dataIndex: "isPaid",
      render: (isPaid, record) => (
        <Tag
          color={isPaid ? "green" : "volcano"}
          style={{
            cursor: isPaid ? "default" : "pointer",
            userSelect: "none",
          }}
          onClick={() => {
            if (isPaid) return;
            modal.confirm({
              title: "Xác nhận thanh toán",
              content: `Xác nhận học viên "${record.user_id?.fullname}" đã thanh toán?`,
              okText: "Xác nhận",
              cancelText: "Hủy",
              onOk: () => handleConfirmPayment(record._id),
            });
          }}
        >
          {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
        </Tag>
      ),
    },

    // {
    //   title: "Sửa",
    //   dataIndex: "update",
    //   render: (_, record) => (
    //     <Link to={`/admin/registercourses/update-registration/${record._id}`}>
    //       Sửa
    //     </Link>
    //   ),
    //   width: 60,
    //   align: "center",
    // },
    {
      title: "Sửa",
      dataIndex: "actions",
      render: (_, record) => (
        <Flex gap={8} justify="center">
          <Link to={`/admin/registercourses/update-registration/${record._id}`}>
            Sửa
          </Link>
          {/* <Button
            type="link"
            disabled={record.isPaid} // Vô hiệu hóa nếu đã thanh toán
            onClick={() => handleConfirmPayment(record._id)}
            style={{ padding: 0 }}
          >
            Xác nhận
          </Button> */}
        </Flex>
      ),
      width: 60,
      align: "center",
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  };

  const fetchData = async () => {
    setSpinning(true);
    try {
      const [regRes, courseRes, userRes] = await Promise.all([
        axios.get("http://localhost:3005/api/registration", {
          withCredentials: true,
        }),
        axios.get("http://localhost:3005/api/course", {
          withCredentials: true,
        }),
        axios.get("http://localhost:3005/api/user", {
          withCredentials: true,
        }),
      ]);
      setRegistrations(regRes.data);
      setFilteredRegistrations(regRes.data);
      setCourses(courseRes.data);
      setUsers(userRes.data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      messageApi.error("Không thể tải dữ liệu");
    } finally {
      setSpinning(false);
    }
  };

  const handleDelete = async () => {
    try {
      for (const id of selectedRowKeys) {
        await axios.delete(`http://localhost:3005/api/registration/${id}`, {
          withCredentials: true,
        });
      }
      messageApi.success("Xoá thành công!");
      setSelectedRowKeys([]);
      setOpenDeleteConfirm(false);
      fetchData();
    } catch (err) {
      console.error(err);
      messageApi.error("Lỗi khi xoá các đăng ký!");
    }
  };

  const onFinish = async (values) => {
    const { user_id, course_id } = values;
    try {
      await axios.post(
        `http://localhost:3005/api/registration`,
        { user_id, course_id },
        { withCredentials: true }
      );

      messageApi.success("Đăng ký thành công!");
      form.resetFields();
      setOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      messageApi.error("Đăng ký thất bại!");
    }
  };

  const handleSearch = (value) => {
    const keyword = value?.toString().trim();
    if (!keyword) {
      setFilteredRegistrations(registrations);
      return;
    }

    const filtered = registrations.filter((reg) =>
      String(reg.user_id?.userid || "").includes(keyword)
    );

    setFilteredRegistrations(filtered);
  };

  const searchByName = (value) => {
    const keyword = value.trim().toLowerCase();
    const filtered = registrations.filter((reg) =>
      String(reg.user_id?.fullname || "")
        .toLowerCase()
        .includes(keyword)
    );
    console.log("Sample registration:", registrations[0]);

    setFilteredRegistrations(filtered);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!currentUser || currentUser.role !== "Admin") {
    return (
      <Result
        status="403"
        title="403 - Forbidden"
        subTitle="Xin lỗi, bạn không có quyền truy cập vào trang này."
        extra={
          <Link to="/">
            <Button type="primary">Quay về Trang chủ</Button>
          </Link>
        }
      />
    );
  }

  return (
    <Flex
      className="CourseRegistrationManager"
      vertical
      gap={20}
      style={{ position: "relative" }}
    >
      {contextHolder}
      {contextHolderModal}
      <Spin spinning={spinning} fullscreen />
      <Breadcrumb
        items={[
          { title: "Admin Dashboard" },
          { title: "Quản lý đăng ký khóa học" },
        ]}
      />

      <Flex gap={20}>
        <Button type="primary" onClick={() => setOpen(true)}>
          Thêm đăng ký mới
        </Button>
        <Input.Search
          placeholder="Tìm theo mã học viên"
          allowClear
          onChange={(e) => handleSearch(e.target.value.toString())}
          style={{ width: 250 }}
        />
        <Input.Search
          placeholder="Tìm theo tên học viên"
          allowClear
          onChange={(e) => searchByName(e.target.value.toString())}
          style={{ width: 250 }}
        />
      </Flex>

      {selectedRowKeys.length > 0 && (
        <Flex
          align="center"
          justify="space-between"
          style={{
            padding: "10px 15px",
            borderRadius: "5px",
            backgroundColor: "white",
            boxShadow: "0 0 15px rgba(0, 0, 0, 0.15)",
            position: "sticky",
            top: "10px",
            zIndex: "10",
          }}
        >
          <span>Đã chọn {selectedRowKeys.length} bản ghi</span>
          <Button
            type="primary"
            danger
            onClick={() => setOpenDeleteConfirm(true)}
          >
            Xoá
          </Button>
        </Flex>
      )}

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredRegistrations}
        rowKey={(record) => record._id}
        bordered
      />

      <Modal
        open={open}
        title="Thêm đăng ký mới"
        onCancel={() => setOpen(false)}
        footer={null}
        width={400}
        centered
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="user_id"
            label="Học viên"
            rules={[{ required: true, message: "Vui lòng chọn học viên!" }]}
          >
            <Select placeholder="Chọn học viên">
              {users.map((u) => (
                <Select.Option key={u._id} value={u._id}>
                  {u.userid} - {u.fullname}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="course_id"
            label="Khóa học"
            rules={[{ required: true, message: "Vui lòng chọn khóa học!" }]}
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
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Xác nhận đăng ký
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={openDeleteConfirm}
        title="Xác nhận xoá"
        onOk={() => setOpenDeleteConfirm(false)}
        onCancel={() => setOpenDeleteConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setOpenDeleteConfirm(false)}>
            Quay lại
          </Button>,
          <Button key="submit" type="primary" danger onClick={handleDelete}>
            Xoá
          </Button>,
        ]}
        centered
      >
        <p>{selectedRowKeys.length} đăng ký sẽ bị xoá. Bạn chắc chắn?</p>
      </Modal>
    </Flex>
  );
}

export default CourseRegistrationManager;

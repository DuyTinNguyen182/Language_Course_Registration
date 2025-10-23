import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Flex,
  Breadcrumb,
  Badge,
  Modal,
  Form,
  Input,
  Spin,
  Select,
  message,
  Result,
} from "antd";
import axios from "axios";
import { Link } from "react-router-dom";
import { SmileOutlined, MailOutlined } from "@ant-design/icons";

import { useAuth } from "../../../context/AuthContext";

function TeacherManager() {
  const [open, setOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const { state } = useAuth();
  const { currentUser } = state;

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open]);

  const columns = [
    {
      title: "Mã giảng viên",
      dataIndex: "teacherid",
    },
    {
      title: "Họ và tên",
      dataIndex: "full_name",
      render: (text) => <h4 style={{ fontWeight: 600 }}>{text}</h4>,
    },
    {
      title: "Email",
      dataIndex: "email",
      width: 350,
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      render: (gender) => (
        <Badge
          color={gender === "Nam" ? "#1890ff" : "#f759ab"}
          count={gender}
        />
      ),
      filters: [
        { text: "Nam", value: "Nam" },
        { text: "Nữ", value: "Nữ" },
      ],
      onFilter: (value, record) => record.gender === value,
      width: 150,
    },
    {
      title: "Ngôn ngữ",
      dataIndex: "language_id",
      render: (langId) => {
        const lang = languages.find((l) => l._id === langId);
        return lang ? lang.language : langId;
      },
      filters: languages.map((lang) => ({
        text: lang.language,
        value: lang._id,
      })),
      onFilter: (value, record) => record.language_id === value,
    },
    {
      title: "Sửa",
      dataIndex: "update",
      render: (_id) => <Link to={`update/${_id}`}>Sửa</Link>,
      width: 60,
      align: "center",
    },
  ];

  const onSelectChange = (newSelectedRowKeys) =>
    setSelectedRowKeys(newSelectedRowKeys);

  const showModal = () => setOpen(true);

  const showDeleteConfirm = () => setOpenDeleteConfirm(true);

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const onFinish = async (values) => {
    setSpinning(true);
    const newTeacher = {
      full_name: values.full_name,
      gender: values.gender,
      email: values.email,
      language_id: values.language,
    };

    try {
      await axios.post(`http://localhost:3005/api/teacher`, newTeacher, {
        withCredentials: true,
      });

      messageApi.success("Tạo giảng viên thành công");
      form.resetFields();
      setOpen(false);
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      messageApi.error(errorMsg);
    } finally {
      setSpinning(false);
    }
  };

  const handleDelete = () => {
    setSpinning(true);
    setOpenDeleteConfirm(false);

    axios
      .delete(`http://localhost:3005/api/teacher/multiple`, {
        data: { teacherIds: selectedRowKeys },
        withCredentials: true,
      })
      .then(() => {
        fetchData();
        messageApi.success("Xóa giảng viên thành công");
        setSelectedRowKeys([]);
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          const msg =
            "Không thể xóa. Giảng viên này đang dạy khóa học trong hệ thống.";
          messageApi.error(msg);
        } else {
          messageApi.error("Có lỗi xảy ra khi xoá giảng viên!");
        }
      })
      .finally(() => setSpinning(false));
  };

  const fetchLanguages = () => {
    axios
      .get(`http://localhost:3005/api/language`, {
        withCredentials: true,
      })
      .then((res) => {
        setLanguages(res.data);
      })
      .catch((err) => console.log("Error fetching languages:", err));
  };

  const fetchData = () => {
    axios
      .get(`http://localhost:3005/api/teacher`, {
        withCredentials: true,
      })
      .then((response) => {
        const dataFormatted = response.data.map((t) => ({
          key: t._id,
          teacherid: t.teacherid,
          full_name: t.full_name,
          gender: t.gender,
          email: t.email,
          language_id: t.language_id?._id,
          language_name: t.language_id?.language || "",
          update: t._id,
        }));
        setTeachers(dataFormatted);
        setFilteredTeachers(dataFormatted);
      })
      .catch((error) => console.log(error));
  };

  const handleSearch = (value) => {
    const keyword = value?.toString().toLowerCase().trim();

    if (!keyword) {
      setFilteredTeachers(teachers);
      return;
    }

    const filtered = teachers.filter((teachers) =>
      String(teachers.teacherid || "")
        .toLowerCase()
        .includes(keyword)
    );

    setFilteredTeachers(filtered);
  };

  const searchByName = (value) => {
    const keyword = value?.toString().toLowerCase().trim();
    const result = teachers.filter((t) =>
      String(t.full_name || "")
        .toLowerCase()
        .includes(keyword)
    );
    setFilteredTeachers(result);
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (languages.length > 0) {
      fetchData();
    }
  }, [languages]);

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
    <>
      {contextHolder}
      <Flex
        className="TeacherManager"
        vertical
        gap={20}
        style={{ position: "relative" }}
      >
        <Spin spinning={spinning} fullscreen />
        <Breadcrumb
          items={[
            { title: "Admin Dashboard" },
            { title: "Quản lý giảng viên" },
          ]}
        />
        <Flex gap={20}>
          <Button type="primary" onClick={showModal}>
            Thêm giảng viên
          </Button>
          <Input.Search
            placeholder="Tìm theo mã giảng viên"
            allowClear
            onChange={(e) => handleSearch(e.target.value.toString())}
            style={{ width: 250 }}
          />
          <Input.Search
            placeholder="Tìm theo tên giảng viên"
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
              zIndex: 10,
            }}
          >
            <span>Đã chọn {selectedRowKeys.length} giảng viên</span>
            <Button type="primary" danger onClick={showDeleteConfirm}>
              Xoá
            </Button>
          </Flex>
        )}
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredTeachers}
          bordered
        />
        <Modal
          open={openDeleteConfirm}
          title="Xác nhận xoá"
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
          <p>
            {selectedRowKeys.length} giảng viên sẽ bị xoá vĩnh viễn. Bạn có chắc
            không?
          </p>
        </Modal>
        <Modal
          open={open}
          title="Thêm giảng viên mới"
          onCancel={() => setOpen(false)}
          footer={[]}
          width={400}
          centered
        >
          <Form
            form={form}
            name="teacher_form"
            onFinish={onFinish}
            initialValues={{ gender: "Nam" }}
          >
            <Form.Item
              name="full_name"
              rules={[
                { required: true, message: "Vui lòng nhập họ tên!" },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();

                    if (/\d/.test(value)) {
                      return Promise.reject(
                        "Họ và tên không được chứa ký tự số!"
                      );
                    }

                    if (/[^a-zA-ZÀ-Ỹà-ỹ\s]/.test(value)) {
                      return Promise.reject(
                        "Họ và tên không được chứa ký tự đặc biệt!"
                      );
                    }

                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                prefix={<SmileOutlined />}
                placeholder="Họ và tên"
                allowClear
              />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="Email" allowClear />
            </Form.Item>
            <Form.Item
              name="gender"
              rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
            >
              <Select placeholder="Giới tính">
                <Select.Option value="Nam">Nam</Select.Option>
                <Select.Option value="Nữ">Nữ</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="language"
              rules={[{ required: true, message: "Vui lòng chọn ngôn ngữ!" }]}
            >
              <Select placeholder="Ngôn ngữ giảng dạy">
                {languages.map((lang) => (
                  <Select.Option key={lang._id} value={lang._id}>
                    {lang.language}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                style={{ width: "100%" }}
              >
                Tạo giảng viên
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Flex>
    </>
  );
}

export default TeacherManager;

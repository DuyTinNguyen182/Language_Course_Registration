import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Flex,
  Breadcrumb,
  Modal,
  Form,
  Input,
  Spin,
  message,
  Result,
} from "antd";
import axios from "axios";
import { Link } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

function LanguageManager() {
  const [languages, setLanguages] = useState([]);
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [filteredLanguages, setFilteredLanguages] = useState([]);
  const [form] = Form.useForm();

  const { state } = useAuth();
  const { currentUser } = state;

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open]);

  const successMessage = () => {
    messageApi.open({
      key: "login",
      type: "success",
      content: "Thêm thành công",
    });
  };

  const errorMessage = (msg) => {
    messageApi.open({
      key: "login",
      type: "error",
      content: `Thêm thất bại, ${msg}`,
    });
  };

  const columns = [
    {
      title: "Mã ngôn ngữ",
      dataIndex: "languageid",
      width: 200,
    },
    {
      title: "Ngôn ngữ",
      dataIndex: "language",
    },
    {
      title: "Sửa",
      dataIndex: "_id",
      render: (_id) => (
        <Link to={`update/${_id}`}>
          {/* <i className="fa-solid fa-pen-to-square" style={{ color: "#00CC77", fontSize: "18px" }}></i> */}
          Sửa
        </Link>
      ),
      width: 60,
      align: "center",
    },
  ];

  const fetchData = () => {
    axios
      .get(`http://localhost:3005/api/language`, { withCredentials: true })
      .then((response) => {
        const data = response.data.map((l) => ({
          key: l._id,
          _id: l._id,
          language: l.language,
          languageid: l.languageid,
        }));

        setLanguages(data);
        setFilteredLanguages(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  };

  const onFinish = async (values) => {
    const alreadyExists = languages.some(
      (lang) =>
        lang.languageid.trim().toLowerCase() ===
        values.languageid.trim().toLowerCase()
    );

    if (alreadyExists) {
      messageApi.open({
        key: "language_exist",
        type: "error",
        content: "Ngôn ngữ này đã tồn tại!",
      });
      return;
    }

    setSpinning(true);

    try {
      await axios.post(`http://localhost:3005/api/language/add`, values, {
        withCredentials: true,
      });
      successMessage();
      form.resetFields();
      setOpen(false);
      fetchData();
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      errorMessage(errorMsg);
    } finally {
      setSpinning(false);
    }
  };

  const handleDelete = () => {
    setSpinning(true);
    setOpenDeleteConfirm(false);

    axios
      .delete(`http://localhost:3005/api/language/multiple`, {
        data: { languageIds: selectedRowKeys },
        withCredentials: true,
      })
      .then(() => {
        fetchData();
        setSelectedRowKeys([]);
        messageApi.success("Xóa ngôn ngữ thành công!");
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          const msg = "Không thể xóa. Có giảng viên đang sử dụng ngôn ngữ này.";
          messageApi.error(msg);
        } else {
          messageApi.error("Có lỗi xảy ra khi xoá ngôn ngữ!");
        }
      })
      .finally(() => setSpinning(false));
  };

  const handleSearch = (value) => {
    const keyword = value?.toString().toLowerCase().trim();

    if (!keyword) {
      setFilteredLanguages(languages);
      return;
    }

    const filtered = languages.filter((language) =>
      String(language.languageid || "")
        .toLowerCase()
        .includes(keyword)
    );

    setFilteredLanguages(filtered);
  };

  const searchByName = (value) => {
    const keyword = value?.toString().toLowerCase().trim();
    const result = languages.filter((t) =>
      String(t.language || "")
        .toLowerCase()
        .includes(keyword)
    );
    setFilteredLanguages(result);
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
      className="LanguageManager"
      vertical
      gap={20}
      style={{ position: "relative" }}
    >
      {contextHolder}
      <Spin spinning={spinning} fullscreen />
      <Breadcrumb
        items={[{ title: "Admin Dashboard" }, { title: "Quản lý ngôn ngữ" }]}
      />
      <Flex gap={20}>
        <Button type="primary" onClick={() => setOpen(true)}>
          Thêm ngôn ngữ
        </Button>
        <Input.Search
          placeholder="Tìm theo mã ngôn ngữ"
          allowClear
          onChange={(e) => handleSearch(e.target.value.toString())}
          style={{ width: 250 }}
        />
        <Input.Search
          placeholder="Tìm theo tên ngôn ngữ"
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
          <span>Đã chọn {selectedRowKeys.length} ngôn ngữ</span>
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
        rowSelection={{
          selectedRowKeys,
          onChange: (newKeys) => setSelectedRowKeys(newKeys),
        }}
        columns={columns}
        dataSource={filteredLanguages}
        bordered
      />

      {/* Modal xác nhận xóa */}
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
          {selectedRowKeys.length} ngôn ngữ sẽ bị xoá vĩnh viễn. Bạn có chắc
          không?
        </p>
      </Modal>

      {/* Modal thêm ngôn ngữ */}
      <Modal
        open={open}
        title="Thêm ngôn ngữ mới"
        onCancel={() => setOpen(false)}
        footer={[]}
        width={400}
        centered
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Mã ngôn ngữ"
            name="languageid"
            rules={[
              { required: true, message: "Vui lòng nhập mã ngôn ngữ!" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (/\d/.test(value)) {
                    return Promise.reject(
                      "Mã ngôn ngữ không được chứa ký tự số!"
                    );
                  }

                  if (/[^a-zA-ZÀ-Ỹà-ỹ\s]/.test(value)) {
                    return Promise.reject(
                      "Mã ngôn ngữ không được chứa ký tự đặc biệt!"
                    );
                  }

                  if (!/^[A-Z]{3}$/.test(value)) {
                    return Promise.reject(
                      "Mã ngôn ngữ chỉ gồm 3 chữ cái in hoa!"
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập mã ngôn ngữ" allowClear />
          </Form.Item>
          <Form.Item
            label="Ngôn ngữ"
            name="language"
            rules={[
              { required: true, message: "Vui lòng nhập tên ngôn ngữ!" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (/\d/.test(value)) {
                    return Promise.reject(
                      "Tên ngôn ngữ không được chứa ký tự số!"
                    );
                  }
                  if (/[^a-zA-ZÀ-Ỹà-ỹ\s]/.test(value)) {
                    return Promise.reject(
                      "Tên ngôn ngữ không được chứa ký tự đặc biệt!"
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập tên ngôn ngữ" allowClear />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Tạo ngôn ngữ
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
}

export default LanguageManager;

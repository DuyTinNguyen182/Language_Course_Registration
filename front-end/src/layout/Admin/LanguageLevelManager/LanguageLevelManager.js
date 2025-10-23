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
  Result
} from "antd";

import axios from "axios";
import { Link } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

function LanguageManager() {
  const [languagelvs, setLanguagelvs] = useState([]);
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [filteredLanguages, setFilteredLanguageslevel] = useState([]);
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
      title: "Mã trình độ",
      dataIndex: "language_levelid",
      width: 200,
    },
    {
      title: "Trình độ",
      dataIndex: "language_level",
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
      .get(`http://localhost:3005/api/languagelevel`, { withCredentials: true })
      .then((response) => {
        const data = response.data.map((l) => ({
          key: l._id,
          _id: l._id,
          language_level: l.language_level,
          language_levelid: l.language_levelid,
        }));

        setLanguagelvs(data);
        setFilteredLanguageslevel(data);
      })
      .catch((err) => console.error("Fetch error:", err));
  };

  const onFinish = async (values) => {
    const alreadyExists = languagelvs.some(
      (lang) =>
        lang.language_levelid.trim().toLowerCase() ===
        values.language_levelid.trim().toLowerCase()
    );

    if (alreadyExists) {
      messageApi.open({
        key: "language_exist",
        type: "error",
        content: "Trình độ đã tồn tại!",
      });
      return;
    }

    setSpinning(true);
    try {
      await axios.post(`http://localhost:3005/api/languagelevel/add`, values, {
        withCredentials: true,
      });
      messageApi.success("Thêm trình độ mới thành công");
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
      .delete(`http://localhost:3005/api/languagelevel/multiple`, {
        data: { languagelevelIds: selectedRowKeys },
        withCredentials: true,
      })
      .then(() => {
        messageApi.success("Xóa trình độ thành công");
        setSelectedRowKeys([]);
        fetchData();
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          const msg = "Không thể xóa. Có khóa học đang sử dụng trình độ này.";
          messageApi.error(msg);
        } else {
          messageApi.error("Có lỗi xảy ra khi xoá trình độ!");
        }
      })
      .finally(() => setSpinning(false));
  };

  const searchByName = (value) => {
    const keyword = value?.toString().toLowerCase().trim();
    const result = languagelvs.filter((t) =>
      String(t.language_level || "")
        .toLowerCase()
        .includes(keyword)
    );
    setFilteredLanguageslevel(result);
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
        items={[{ title: "Admin Dashboard" }, { title: "Quản lý trình độ" }]}
      />
      <Flex gap={20}>
        <Button type="primary" onClick={() => setOpen(true)}>
          Thêm trình độ
        </Button>
        <Input.Search
          placeholder="Tìm theo tên trình độ"
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
          <span>Đã chọn {selectedRowKeys.length} trình độ</span>
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
          {selectedRowKeys.length} trình độ sẽ bị xoá vĩnh viễn. Bạn có chắc
          không?
        </p>
      </Modal>

      <Modal
        open={open}
        title="Thêm trình độ mới"
        onCancel={() => setOpen(false)}
        footer={[]}
        width={400}
        centered
      >
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            label="Mã trình độ"
            name="language_levelid"
            rules={[
              { required: true, message: "Vui lòng nhập mã trình độ!" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();

                  if (/[^a-zA-ZÀ-Ỹà-ỹ0-9\s]/.test(value)) {
                    return Promise.reject(
                      "Mã trình độ không được chứa ký tự đặc biệt!"
                    );
                  }

                  if (!/^[A-Z0-9]+$/.test(value)) {
                    return Promise.reject(
                      "Mã trình độ chỉ bao gồm chữ in hoa và số!"
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập mã trình độ" allowClear />
          </Form.Item>
          <Form.Item
            label="Trình độ"
            name="language_level"
            rules={[
              { required: true, message: "Vui lòng nhập tên trình độ!" },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();

                  if (/[^a-zA-ZÀ-Ỹà-ỹ0-9\s]/.test(value)) {
                    return Promise.reject(
                      "Mã trình độ không được chứa ký tự đặc biệt!"
                    );
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input placeholder="Nhập tên trình độ" allowClear />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Tạo trình độ
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
}

export default LanguageManager;

import {
  HomeOutlined,
  LockOutlined,
  MailOutlined,
  SmileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Flex, Form, Input, Spin, message, Select, Upload } from "antd";
import { useEffect, useState } from "react";
import imageCompression from "browser-image-compression";
import axios from "axios";
// import { useParams } from "react-router-dom";
import { Typography } from "antd";
import ImgCrop from "antd-img-crop";

const { Title } = Typography;

function UserAcc() {
  // const { id } = useParams();

  const [messageApi, contextHolder] = message.useMessage();
  const [fileList, setFileList] = useState([]);
  const [spinning, setSpinning] = useState(true);
  const [userData, setUserData] = useState();
  const [checkChangeAvatar, setCheckChangeAvatar] = useState(false);
  const [genderEdited, setGenderEdited] = useState(false);
  const [userId, setUserId] = useState(null);

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

  const successMessage = () => {
    messageApi.open({
      key: "update",
      type: "success",
      content: "Cập nhật thành công",
    });
  };

  const errorMessage = (message = "Cập nhật thất bại") => {
    messageApi.open({
      key: "update",
      type: "error",
      content: message,
    });
  };

  const onPreview = async (file) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const onChange = ({ fileList: newFileList }) => {
    console.log("Updated fileList:", newFileList);
    setFileList(newFileList);
    setCheckChangeAvatar(true);
  };

  const handleUpdateById = (newData) => {
    axios
      .put(`http://localhost:3005/api/user/${userId}`, newData, {
        withCredentials: true,
      })
      .then(() => {
        successMessage();
        setSpinning(false);
        fetchUserData(userId);
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        const errorMsg = error.response?.data?.message || "Cập nhật thất bại";
        errorMessage(errorMsg);
        setSpinning(false);
      });
  };

  const onFinish = async (values) => {
    setSpinning(true);

    // Xác định có nên gửi trường gender không
    let shouldSendGender = !genderEdited;

    // Nếu có chọn ảnh avatar mới thì upload lên Cloudinary
    if (fileList[0] && checkChangeAvatar) {
      const file = fileList[0].originFileObj;
      const maxImageSize = 1024;

      try {
        let compressedFile = file;
        if (file.size > maxImageSize) {
          compressedFile = await imageCompression(file, {
            maxSizeMB: 0.8,
            maxWidthOrHeight: maxImageSize,
            useWebWorker: true,
          });
        }

        const formData = new FormData();
        formData.append("avatar", compressedFile);

        // Gửi ảnh lên backend để upload Cloudinary
        const uploadRes = await axios.post(
          "http://localhost:3005/api/upload/avatar",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true,
          }
        );

        const avatarUrl = uploadRes.data.url;

        const newUserData = {
          username: values.username,
          password: values.password,
          email: values.email,
          fullname: values.name,
          address: values.address,
          avatar: avatarUrl, // gán URL từ Cloudinary
          ...(shouldSendGender ? { gender: values.gender } : {}),
        };
        handleUpdateById(newUserData);
      } catch (error) {
        console.error("Image upload error:", error);
        errorMessage("Lỗi upload ảnh");
        setSpinning(false);
      }
    } else {
      const newUserData = {
        username: values.username,
        password: values.password,
        email: values.email,
        fullname: values.name,
        ...(shouldSendGender ? { gender: values.gender } : {}),
        address: values.address,
      };
      handleUpdateById(newUserData);
    }
  };

  const fetchUserData = async (uid) => {
    setSpinning(true);
    axios
      .get(`http://localhost:3005/api/user/${uid}`, {
        withCredentials: true,
      })
      .then((response) => {
        const user = response.data;
        setUserData(user);
        setGenderEdited(!!user.genderEdited);
        if (user.avatar) {
          setFileList([
            {
              uid: "-1",
              name: "avatar.png",
              status: "done",
              url: user.avatar,
            },
          ]);
        }
        setSpinning(false);
      })
      .catch((error) => {
        console.log(error);
        setSpinning(false);
      });
  };

  useEffect(() => {
    const init = async () => {
      await fetchUserInfo();
    };
    init();
  }, []);

  // useEffect(() => {
  //   fetchUserData();
  // }, []);
  useEffect(() => {
    if (userId) {
      fetchUserData(userId); // Khi có userId thì mới gọi dữ liệu chi tiết
    }
  }, [userId]);

  return (
    <Flex className="UpdateUser" vertical gap={20}>
      {contextHolder}
      <Spin spinning={spinning} fullscreen />

      {userData && (
        <Form
          name="update_user"
          layout="vertical"
          style={{ minWidth: "400px", margin: "0 auto" }}
          initialValues={{
            name: userData.fullname,
            email: userData.email,
            username: userData.username,
            gender: userData.gender,
            address: userData.address,
          }}
          onFinish={onFinish}
        >
          <Title
            level={3}
            style={{ textAlign: "center", marginBottom: "20px" }}
          >
            Thông tin tài khoản
          </Title>

          {/* Upload ảnh avatar */}
          <Form.Item label="Ảnh đại diện">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <ImgCrop aspect={1} showGrid rotationSlider quality={0.9}>
                <Upload
                  listType="picture-circle"
                  fileList={fileList}
                  onPreview={onPreview}
                  onChange={onChange}
                  // beforeUpload={() => false} // Ngăn Upload auto
                  maxCount={1}
                >
                  {fileList.length < 1 && "+ Tải lên"}
                </Upload>
              </ImgCrop>
            </div>
          </Form.Item>

          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <Input
              prefix={<SmileOutlined />}
              placeholder="Nhập họ và tên"
              allowClear
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
          >
            {genderEdited ? (
              <Input value={userData.gender} disabled readOnly size="large" />
            ) : (
              <Select placeholder="Chọn giới tính" size="large">
                <Select.Option value="Nam">Nam</Select.Option>
                <Select.Option value="Nữ">Nữ</Select.Option>
              </Select>
            )}
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Vui lòng nhập Email!" }]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              allowClear
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
          >
            <Input
              prefix={<HomeOutlined />}
              placeholder="Địa chỉ"
              allowClear
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{ width: "100%" }}
            >
              Cập nhật thông tin
            </Button>
          </Form.Item>
        </Form>
      )}
    </Flex>
  );
}

export default UserAcc;

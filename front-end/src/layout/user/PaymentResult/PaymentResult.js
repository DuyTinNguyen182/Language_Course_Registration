import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Spin, Result, Button } from 'antd';
import axios from 'axios'; // <-- 1. Import axios

function PaymentResult() {
  const location = useLocation();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');
  const [currentUser, setCurrentUser] = useState(null); // <-- 2. Thêm state để lưu user

  // 3. Hàm để lấy thông tin user, giống hệt trong Header
  const fetchUserInfo = async () => {
    try {
      const res = await axios.get("http://localhost:3005/api/user/info", {
        withCredentials: true,
      });
      setCurrentUser(res.data);
    } catch (err) {
      console.error("Không thể lấy thông tin người dùng trong PaymentResult:", err);
      // Có thể không cần hiển thị lỗi cho người dùng ở trang này
    }
  };

  useEffect(() => {
    // Gọi hàm fetch user khi component được render
    fetchUserInfo(); 
    
    const params = new URLSearchParams(location.search);
    const responseCode = params.get('vnp_ResponseCode');

    if (responseCode === '00') {
      setStatus('success');
      setMessage('Giao dịch của bạn đã được thực hiện thành công. Trạng thái khóa học sẽ được cập nhật sau ít phút.');
    } else {
      setStatus('error');
      setMessage('Giao dịch thất bại hoặc đã bị hủy. Vui lòng thử lại.');
    }
  }, [location]);

  // Vẫn hiển thị loading nếu chưa có thông tin user
  if (status === 'processing' || !currentUser) {
    return <Spin fullscreen tip="Đang xử lý kết quả..." />;
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Result
            status={status}
            title={status === 'success' ? "Thanh toán thành công" : "Thanh toán thất bại"}
            subTitle={message}
            extra={[
                // 4. Sử dụng ID từ state currentUser
                <Link to={`/my-courses/${currentUser?._id}`} key="console">
                    <Button type="primary">Xem các khóa học đã đăng ký</Button>
                </Link>,
            ]}
        />
    </div>
  );
}

export default PaymentResult;
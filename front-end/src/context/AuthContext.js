// front-end/src/context/AuthContext.js

import React, { createContext, useReducer, useEffect, useContext } from 'react';
import axios from 'axios';
import { Spin } from 'antd';

// Trạng thái ban đầu
const initialState = {
  currentUser: null,
  loading: true, // Bắt đầu loading để kiểm tra trạng thái đăng nhập
};

// Reducer để xử lý các hành động
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_SUCCESS': // Dùng chung cho cả login và check ban đầu
      return { currentUser: action.payload, loading: false };
    case 'AUTH_FAILURE': // Dùng chung cho cả logout và check ban đầu thất bại
      return { currentUser: null, loading: false };
    default:
      return state;
  }
};

// Tạo Context
const AuthContext = createContext();

// Tạo Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Chỉ chạy 1 lần khi ứng dụng khởi động
    const checkUserStatus = async () => {
      try {
        const res = await axios.get('http://localhost:3005/api/user/info', {
          withCredentials: true,
        });
        dispatch({ type: 'AUTH_SUCCESS', payload: res.data });
      } catch (err) {
        dispatch({ type: 'AUTH_FAILURE' });
      }
    };
    checkUserStatus();
  }, []);

  // Hiển thị loading trong khi kiểm tra
  if (state.loading) {
    return <Spin spinning={true} fullscreen tip="Đang tải..." />;
  }

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng context
export const useAuth = () => {
  return useContext(AuthContext);
};
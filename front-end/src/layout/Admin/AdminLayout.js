// AdminLayout.js
import { useEffect, useState } from "react";
import {
  PieChartOutlined,
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  ExportOutlined,
  GlobalOutlined,
  BarChartOutlined,
  ReadOutlined,
} from "@ant-design/icons";
import { Flex, Layout, Menu } from "antd";
import { Link, Route, Routes, useLocation, useNavigate, Navigate } from "react-router-dom";
import axios from "axios";

import UserManager from "./UserManager/UserManager";
import UpdateUser from "./UserManager/UpdateUser";
import TeacherManager from "./TeacherManager/TeacherManager";
import UpdateTeacher from "./TeacherManager/UpdateTeacher";
import LanguageManager from "./LanguageManager/LanguageManager";
import UpdateLanguage from "./LanguageManager/UpdateLanguage";
import LanguageLevelManager from "./LanguageLevelManager/LanguageLevelManager";
import UpdateLanguageLevel from "./LanguageLevelManager/UpdateLanguageLevel";
import CourseManager from "./CourseManager/CourseManager";
import UpdateCourse from "./CourseManager/UpdateCourse";
import CourseRegistrationManager from "./CourseRegistrationManager/CourseRegistrationManager";
import UpdateCourseRegistration from "./CourseRegistrationManager/UpdateCourseRegistration";
import Dashboard from "./Dashboard/Dashboard";

const { Sider } = Layout;

function getItem(label, key, icon, children) {
  return { key, icon, children, label };
}

const items = [
  getItem(<Link to="/admin/dashboard">Tổng quan</Link>, "dashboard", <PieChartOutlined />),
  getItem(<Link to="/admin/users">Quản lý người dùng</Link>, "users", <UserOutlined />),
  getItem(<Link to="/admin/languages">Quản lý ngôn ngữ</Link>, "languages", <GlobalOutlined />),
  getItem(<Link to="/admin/languageslevel">Quản lý trình độ</Link>, "languageslevel", <BarChartOutlined />),
  getItem(<Link to="/admin/teachers">Quản lý giảng viên</Link>, "teachers", <TeamOutlined />),
  getItem(<Link to="/admin/courses">Quản lý khóa học</Link>, "courses", <ReadOutlined />),
  getItem(<Link to="/admin/registercourses">Quản lý đăng ký học</Link>, "registercourses", <BookOutlined />),
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [currentUser, setCurrentUser] = useState();

  // Xác định tab active theo URL
  const activeTab =
    location.pathname.startsWith("/admin/users") ? "users" :
    location.pathname.startsWith("/admin/courses") ? "courses" :
    location.pathname.startsWith("/admin/teachers") ? "teachers" :
    location.pathname.startsWith("/admin/registercourses") ? "registercourses" :
    location.pathname.startsWith("/admin/languageslevel") ? "languageslevel" :
    location.pathname.startsWith("/admin/languages") ? "languages" :
    "dashboard";

  const fetchUserData = () => {
    axios
      .get(`http://localhost:3005/api/user/info`, { withCredentials: true })
      .then((response) => {
        if (response.data.role !== "Admin") {
          navigate("/");
        }
        setCurrentUser(response.data);
      })
      .catch(() => navigate("/"));
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div>
      {currentUser && (
        <Layout style={{ minHeight: "100vh" }}>
          <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed} width={260}>
            <Flex
              className="demo-logo-vertical"
              style={{ color: "white", padding: "20px" }}
              justify={!collapsed ? "space-between" : "center"}
            >
              {!collapsed && <h2>DREAM ADMIN</h2>}
              <Link to="/" target="_blank">
                <ExportOutlined style={{ color: "white" }} />
              </Link>
            </Flex>
            <Menu theme="dark" selectedKeys={[activeTab]} mode="inline" items={items} />
          </Sider>
          <Layout style={{ padding: "20px 30px", height: "100vh", overflowY: "auto" }}>
            <Routes>
              {/* redirect gọn bằng Navigate */}
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UserManager />} />
              <Route path="users/update/:id" element={<UpdateUser />} />
              <Route path="teachers" element={<TeacherManager />} />
              <Route path="teachers/update/:id" element={<UpdateTeacher />} />
              <Route path="languages" element={<LanguageManager />} />
              <Route path="languages/update/:id" element={<UpdateLanguage />} />
              <Route path="languageslevel" element={<LanguageLevelManager />} />
              <Route path="languageslevel/update/:id" element={<UpdateLanguageLevel />} />
              <Route path="courses" element={<CourseManager />} />
              <Route path="courses/update/:id" element={<UpdateCourse />} />
              <Route path="registercourses" element={<CourseRegistrationManager />} />
              <Route
                path="registercourses/update-registration/:registrationId"
                element={<UpdateCourseRegistration />}
              />
            </Routes>
          </Layout>
        </Layout>
      )}
    </div>
  );
};

export default AdminLayout;

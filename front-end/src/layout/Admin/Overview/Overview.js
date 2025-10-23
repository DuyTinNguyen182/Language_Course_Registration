import React, { useEffect, useState } from "react";
import axios from "axios";
import { Row, Col, Card, Statistic } from "antd";
import {
  ReadOutlined,
  GlobalOutlined,
  BarChartOutlined,
  UserOutlined,
  TeamOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

const Overview = () => {
  const [stats, setStats] = useState({
    courses: 0,
    languages: 0,
    levels: 0,
    students: 0,
    teachers: 0,
    registrations: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/overview/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy thống kê overview", error);
      }
    };
    fetchStats();
  }, []);

  // Dữ liệu cho biểu đồ
  const pieData = [
    { name: "Khóa học", value: stats.courses },
    { name: "Ngôn ngữ", value: stats.languages },
    { name: "Trình độ", value: stats.levels },
  ];

  const barData = [
    { name: "Học viên", value: stats.students },
    // { name: "Giảng viên", value: stats.teachers },
    { name: "Đăng ký học", value: stats.registrations },
  ];

  const COLORS = ["#1890ff", "#52c41a", "#faad14", "#eb2f96", "#722ed1"];

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>Thống kê hệ thống</h2>

      {/* Grid Card thống kê */}
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Khóa học"
              value={stats.courses}
              prefix={<ReadOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Ngôn ngữ"
              value={stats.languages}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Trình độ"
              value={stats.levels}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Học viên"
              value={stats.students}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Giảng viên"
              value={stats.teachers}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Đăng ký học"
              value={stats.registrations}
              prefix={<ProfileOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ */}
      <Row gutter={[16, 16]} style={{ marginTop: "30px" }}>
        <Col span={12}>
          <Card title="Tỷ lệ khóa học / ngôn ngữ / trình độ">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  dataKey="value"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Thống kê học viên & đăng ký học">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#1890ff" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Overview;

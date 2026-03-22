import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Empty,
  Spin,
} from "antd";
import { Line, Column } from "@ant-design/charts";
import {
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  DollarOutlined,
  TrophyOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import { getDashboardStats } from "../../../services/DashboardService";

// ─── Color tokens ───────────────────────────────────────
const COLORS = {
  blue:   { bg: "#eef2ff", icon: "#6366f1", text: "#6366f1" },
  green:  { bg: "#ecfdf5", icon: "#10b981", text: "#10b981" },
  amber:  { bg: "#fffbeb", icon: "#f59e0b", text: "#f59e0b" },
  rose:   { bg: "#fff1f2", icon: "#f43f5e", text: "#f43f5e" },
};

// ─── StatCard (reusable) ────────────────────────────────
const StatCard = ({ title, value, icon: Icon, color, suffix, formatter, trend }) => {
  const c = COLORS[color] || COLORS.blue;
  const formattedValue = formatter ? formatter(value) : value;

  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 16,
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        background: "#fff",
        height: "100%",
      }}
      bodyStyle={{ padding: "22px 24px" }}
    >
      {/* Icon row */}
      <div className="flex items-center justify-between mb-4">
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: c.bg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon style={{ fontSize: 20, color: c.icon }} />
        </div>

        {trend !== undefined && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: trend >= 0 ? "#10b981" : "#f43f5e",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            {trend >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      {/* Value */}
      <div style={{ fontSize: 28, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
        {formattedValue}
        {suffix && <span style={{ fontSize: 14, fontWeight: 500, color: "#6b7280", marginLeft: 4 }}>{suffix}</span>}
      </div>

      {/* Label */}
      <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6, fontWeight: 500 }}>
        {title}
      </div>
    </Card>
  );
};

// ─── Section Title ──────────────────────────────────────
const SectionTitle = ({ icon: Icon, children, iconColor = "#6366f1" }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon style={{ fontSize: 18, color: iconColor }} />
    <span style={{ fontSize: 15, fontWeight: 600, color: "#1f2937" }}>{children}</span>
  </div>
);

// ─── Main Dashboard ─────────────────────────────────────
const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboardStats();
        setData(res.data.data);
      } catch (err) {
        console.error("Load dashboard failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // ── Loading state ─────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  const { quickStats, charts, rankings } = data;

  // ── Chart data mapping ────────────────────────────────
  const appointmentsData = charts.appointmentsLast7Days.map((item) => ({
    date: item._id,
    value: item.count,
  }));

  const revenueData = charts.revenueLast12Months.map((item) => ({
    month: item._id,
    value: item.total,
  }));

  // ── Chart configs ─────────────────────────────────────
  const lineConfig = {
    data: appointmentsData.length > 0 ? appointmentsData : [{ date: "No data", value: 0 }],
    xField: "date",
    yField: "value",
    height: 220,
    smooth: true,
    point: { size: 4, style: { fill: "#6366f1", stroke: "#fff", strokeWidth: 2 } },
    line: { style: { stroke: "#6366f1", strokeWidth: 2.5 } },
    area: { style: { fill: "url(#areaGradientBlue)", fillOpacity: 0.15 } },
    xAxis: { grid: { line: { style: { stroke: "#f3f4f6" } } }, label: { style: { fill: "#9ca3af", fontSize: 12 } } },
    yAxis: { grid: { line: { style: { stroke: "#f3f4f6", lineDash: [4, 4] } } }, label: { style: { fill: "#9ca3af", fontSize: 12 } } },
    tooltip: { shared: true, crosshairs: true },
  };

  const columnConfig = {
    data: revenueData.length > 0 ? revenueData : [{ month: "No data", value: 0 }],
    xField: "month",
    yField: "value",
    height: 220,
    color: "#10b981",
    columnWidthRatio: 0.5,
    label: {
      position: "top",
      style: { fill: "#6b7280", fontSize: 11, fontWeight: 600 },
      formatter: (v) => `${Number(v.value).toLocaleString()}đ`,
    },
    xAxis: { label: { style: { fill: "#9ca3af", fontSize: 12 } } },
    yAxis: { grid: { line: { style: { stroke: "#f3f4f6", lineDash: [4, 4] } } }, label: { style: { fill: "#9ca3af", fontSize: 12 } } },
    columnStyle: { radius: [6, 6, 0, 0] },
  };

  // ── Table columns ─────────────────────────────────────
  const doctorColumns = [
    {
      title: "Bác sĩ",
      dataIndex: "fullName",
      key: "fullName",
      render: (name) => (
        <span style={{ fontWeight: 600, color: "#1f2937", fontSize: 14 }}>{name}</span>
      ),
    },
    {
      title: "Số lịch hẹn",
      dataIndex: "count",
      key: "count",
      sorter: (a, b) => a.count - b.count,
      align: "right",
      render: (v) => (
        <span
          style={{
            display: "inline-block",
            background: "#eef2ff",
            color: "#6366f1",
            fontWeight: 700,
            fontSize: 13,
            padding: "2px 10px",
            borderRadius: 20,
          }}
        >
          {v}
        </span>
      ),
    },
  ];

  const clinicColumns = [
    {
      title: "Phòng khám",
      dataIndex: "name",
      key: "name",
      render: (name) => (
        <span style={{ fontWeight: 600, color: "#1f2937", fontSize: 14 }}>{name}</span>
      ),
    },
    {
      title: "Số lịch hẹn",
      dataIndex: "count",
      key: "count",
      sorter: (a, b) => a.count - b.count,
      align: "right",
      render: (v) => (
        <span
          style={{
            display: "inline-block",
            background: "#ecfdf5",
            color: "#10b981",
            fontWeight: 700,
            fontSize: 13,
            padding: "2px 10px",
            borderRadius: 20,
          }}
        >
          {v}
        </span>
      ),
    },
  ];

  // ── Shared card style ─────────────────────────────────
  const cardStyle = {
    borderRadius: 16,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    background: "#fff",
    border: "none",
  };

  const tableStyle = {
    ".ant-table-thead > tr > th": {
      background: "#f9fafb",
      fontWeight: 600,
      fontSize: 12,
      color: "#6b7280",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderBottom: "2px solid #f3f4f6",
    },
    ".ant-table-tbody > tr > td": {
      borderBottom: "1px solid #f3f4f6",
      padding: "12px 16px",
    },
    ".ant-table-tbody > tr:hover > td": {
      background: "#fafafa",
    },
  };

  // ── Render ────────────────────────────────────────────
  return (
    <div style={{ padding: "28px 32px", minHeight: "100%" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>
            Tổng quan hệ thống quản trị
          </p>
        </div>
      </div>

      {/* ─── Quick Stats ──────────────────────────────── */}
      <Row gutter={[20, 20]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng người dùng"
            value={quickStats.totalUsers}
            icon={UserOutlined}
            color="blue"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Tổng bác sĩ"
            value={quickStats.totalDoctors}
            icon={MedicineBoxOutlined}
            color="green"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Lịch hẹn hôm nay"
            value={quickStats.todayAppointments}
            icon={CalendarOutlined}
            color="amber"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Doanh thu hôm nay"
            value={quickStats.todayRevenue}
            icon={DollarOutlined}
            color="rose"
            suffix="đ"
            formatter={(v) => Number(v).toLocaleString()}
          />
        </Col>
      </Row>

      {/* ─── Charts ───────────────────────────────────── */}
      <Row gutter={[20, 20]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card style={cardStyle} bordered={false} bodyStyle={{ padding: 24 }}>
            <SectionTitle icon={CalendarOutlined}>Lịch hẹn 7 ngày gần nhất</SectionTitle>
            {appointmentsData.length ? <Line {...lineConfig} /> : <Empty />}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card style={cardStyle} bordered={false} bodyStyle={{ padding: 24 }}>
            <SectionTitle icon={DollarOutlined} iconColor="#10b981">Doanh thu 12 tháng gần nhất</SectionTitle>
            {revenueData.length ? <Column {...columnConfig} /> : <Empty />}
          </Card>
        </Col>
      </Row>

      {/* ─── Rankings ─────────────────────────────────── */}
      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <Card style={cardStyle} bordered={false} bodyStyle={{ padding: 24 }}>
            <SectionTitle icon={TrophyOutlined} iconColor="#f59e0b">Top Bác sĩ</SectionTitle>
            {rankings.topDoctors.length ? (
              <Table
                columns={doctorColumns}
                dataSource={rankings.topDoctors}
                rowKey="_id"
                pagination={false}
                style={tableStyle}
                bordered={false}
              />
            ) : (
              <Empty description="Chưa có dữ liệu" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card style={cardStyle} bordered={false} bodyStyle={{ padding: 24 }}>
            <SectionTitle icon={TrophyOutlined} iconColor="#f59e0b">Top Phòng khám</SectionTitle>
            {rankings.topClinics.length ? (
              <Table
                columns={clinicColumns}
                dataSource={rankings.topClinics}
                rowKey="_id"
                pagination={false}
                style={tableStyle}
                bordered={false}
              />
            ) : (
              <Empty description="Chưa có phòng khám nổi bật" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
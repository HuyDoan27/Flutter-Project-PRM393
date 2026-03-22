import React, { useEffect, useState, useCallback } from "react";
import {
  Table, Card, Button, Tag, Modal, Form, Input,
  Select, DatePicker, Empty, Spin, Rate, Space, message,
} from "antd";
import {
  Calendar, Eye, CheckCircle, XCircle, Clock,
  AlertCircle, Star, User, Phone, Mail, MapPin, FileText,
} from "lucide-react";
import dayjs from "dayjs";
import {
  getAppointmentsByDoctor,
  updateAppointmentStatus,
  rateAppointment,
} from "../../../services/AppointmentService.js";

const { TextArea } = Input;

// ─── Status config ───────────────────────────────────────────
const STATUS_CFG = {
  pending:   { label: "Chờ duyệt",   color: "orange", icon: <Clock size={12} /> },
  upcoming:  { label: "Sắp tới",     color: "blue",   icon: <AlertCircle size={12} /> },
  completed: { label: "Hoàn thành",  color: "green",  icon: <CheckCircle size={12} /> },
  cancelled: { label: "Đã hủy",      color: "red",    icon: <XCircle size={12} /> },
};

// Transition hợp lệ — khớp backend
const VALID_TRANSITIONS = {
  pending:   ["upcoming", "cancelled"],
  upcoming:  ["completed"],
  completed: [],
  cancelled: [],
};

const STATUS_OPTIONS = Object.entries(STATUS_CFG).map(([value, { label }]) => ({ value, label }));

const fmtDate = (iso) => iso ? dayjs(iso).format("DD/MM/YYYY") : "—";

// ─── Component ───────────────────────────────────────────────
const DoctorAppointments = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user._id;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);

  // Filters
  const [statusFilter, setStatusFilter]         = useState(null);
  const [dateFilter, setDateFilter]             = useState(null);
  const [patientNameFilter, setPatientNameFilter] = useState("");

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected]     = useState(null);

  // Status update modal
  const [statusOpen, setStatusOpen]   = useState(false);
  const [nextStatus, setNextStatus]   = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusForm] = Form.useForm();

  // Rate modal
  const [rateOpen, setRateOpen]       = useState(false);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateForm] = Form.useForm();

  // ── Fetch ─────────────────────────────────────────────────
  const loadAppointments = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (dateFilter)   params.date   = dateFilter.format("YYYY-MM-DD");
      if (patientNameFilter.trim()) params.patientName = patientNameFilter.trim();

      const res = await getAppointmentsByDoctor(userId, params);
      setAppointments(res.data.data || []);
    } catch (err) {
      message.error("Không thể tải danh sách lịch khám");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId, statusFilter, dateFilter, patientNameFilter]);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  // ── Open status modal ────────────────────────────────────
  const handleOpenStatus = (record, status) => {
    setSelected(record);
    setNextStatus(status);
    statusForm.resetFields();
    setStatusOpen(true);
  };

  // ── Confirm status update ────────────────────────────────
  const handleUpdateStatus = async () => {
    try {
      const values = await statusForm.validateFields();
      setStatusLoading(true);
      await updateAppointmentStatus(selected._id, {
        status: nextStatus,
        reason: values.reason,
        updatedBy: "doctor",
      });
      message.success(`Cập nhật trạng thái thành công`);
      setStatusOpen(false);
      loadAppointments();
    } catch (err) {
      if (err?.response) message.error(err.response.data?.message || "Cập nhật thất bại");
    } finally {
      setStatusLoading(false);
    }
  };

  // ── Open rate modal ──────────────────────────────────────
  const handleOpenRate = (record) => {
    setSelected(record);
    rateForm.setFieldsValue({ rating: record.rating || 0, review: record.review || "" });
    setRateOpen(true);
  };

  // ── Confirm rate ─────────────────────────────────────────
  const handleRate = async () => {
    try {
      const values = await rateForm.validateFields();
      setRateLoading(true);
      await rateAppointment(selected._id, values);
      message.success("Đã lưu tình trạng bệnh");
      setRateOpen(false);
      loadAppointments();
    } catch (err) {
      if (err?.response) message.error(err.response.data?.message || "Thao tác thất bại");
    } finally {
      setRateLoading(false);
    }
  };

  // ── Action buttons per row ───────────────────────────────
  const ActionButtons = ({ record }) => {
    const transitions = VALID_TRANSITIONS[record.status] || [];
    return (
      <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
        {/* View */}
        <Button type="text" size="small"
          icon={<Eye size={14} color="#6366f1" />}
          onClick={() => { setSelected(record); setDetailOpen(true); }}
          style={{ width: 32, height: 32, borderRadius: 8, background: "#eef2ff", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        />

        {/* Duyệt → upcoming */}
        {transitions.includes("upcoming") && (
          <Button type="text" size="small"
            icon={<CheckCircle size={14} color="#10b981" />}
            onClick={() => handleOpenStatus(record, "upcoming")}
            style={{ width: 32, height: 32, borderRadius: 8, background: "#ecfdf5", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            title="Duyệt lịch"
          />
        )}

        {/* Hoàn thành */}
        {transitions.includes("completed") && (
          <Button type="text" size="small"
            icon={<CheckCircle size={14} color="#6366f1" />}
            onClick={() => handleOpenStatus(record, "completed")}
            style={{ width: 32, height: 32, borderRadius: 8, background: "#eef2ff", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            title="Hoàn thành"
          />
        )}

        {/* Hủy */}
        {transitions.includes("cancelled") && (
          <Button type="text" size="small"
            icon={<XCircle size={14} color="#ef4444" />}
            onClick={() => handleOpenStatus(record, "cancelled")}
            style={{ width: 32, height: 32, borderRadius: 8, background: "#fef2f2", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            title="Hủy lịch"
          />
        )}

        {/* Trả tình trạng bệnh */}
        {record.status === "completed" && (
          <Button type="text" size="small"
            icon={<Star size={14} color="#f59e0b" />}
            onClick={() => handleOpenRate(record)}
            style={{ width: 32, height: 32, borderRadius: 8, background: "#fffbeb", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            title="Tình trạng bệnh"
          />
        )}
      </div>
    );
  };

  // ── Columns ──────────────────────────────────────────────
  const columns = [
    {
      title: "#", key: "index", width: 48,
      render: (_, __, idx) => <span style={{ color: "#9ca3af", fontWeight: 600, fontSize: 13 }}>{idx + 1}</span>,
    },
    {
      title: "Bệnh nhân", key: "patient",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: "#1f2937", fontSize: 14 }}>{r.userId?.fullName || "—"}</div>
          <div style={{ fontSize: 12, color: "#9ca3af" }}>{r.userId?.phoneNumber || "—"}</div>
        </div>
      ),
    },
    {
      title: "Phòng khám", key: "clinic",
      render: (_, r) => (
        <div style={{ fontSize: 13, color: "#4b5563" }}>{r.clinicId?.name || r.clinicName || "—"}</div>
      ),
    },
    {
      title: "Ngày khám", dataIndex: "appointmentDate", key: "date",
      render: (v) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={13} color="#6b7280" />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{fmtDate(v)}</span>
        </div>
      ),
    },
    {
      title: "Trạng thái", dataIndex: "status", key: "status",
      render: (status) => {
        const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
        return (
          <Tag color={cfg.color}
            style={{ fontSize: 12, fontWeight: 600, borderRadius: 20, padding: "2px 10px", display: "inline-flex", alignItems: "center", gap: 4 }}>
            {cfg.icon} {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "Đánh giá", key: "rating",
      render: (_, r) => r.rating
        ? <Rate disabled value={r.rating} style={{ fontSize: 13 }} />
        : <span style={{ fontSize: 12, color: "#d1d5db" }}>Chưa có</span>,
    },
    {
      title: "Thao tác", key: "actions", width: 160, align: "center",
      render: (_, record) => <ActionButtons record={record} />,
    },
  ];

  // ════════════════════════════════════════════════════════════
  return (
    <div style={{ padding: "28px 32px", background: "#f3f4f6", minHeight: "100%" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>Lịch khám của tôi</h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>Quản lý, duyệt và cập nhật tình trạng lịch khám</p>
      </div>

      {/* Filters */}
      <Card bordered={false} style={{ marginBottom: 20, borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <Space wrap size={12}>
          <Input
            placeholder="Tìm tên bệnh nhân..."
            value={patientNameFilter}
            onChange={(e) => setPatientNameFilter(e.target.value)}
            onPressEnter={loadAppointments}
            style={{ width: 200, borderRadius: 10 }}
            prefix={<User size={14} color="#9ca3af" />}
          />
          <DatePicker
            placeholder="Chọn ngày"
            value={dateFilter}
            onChange={setDateFilter}
            format="DD/MM/YYYY"
            style={{ width: 160, borderRadius: 10 }}
          />
          <Select
            placeholder="Trạng thái"
            allowClear
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 160 }}
            options={STATUS_OPTIONS}
          />
          <Button onClick={() => { setStatusFilter(null); setDateFilter(null); setPatientNameFilter(""); }}
            style={{ borderRadius: 10 }}>
            Xóa bộ lọc
          </Button>
        </Space>
      </Card>

      {/* Table */}
      <Card bordered={false} style={{ borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={appointments}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} lịch khám`, style: { padding: "16px 24px 8px" } }}
          locale={{ emptyText: <Empty description="Không có lịch khám nào" /> }}
        />
      </Card>

      {/* ══ MODAL: Detail ══════════════════════════════════════ */}
      <Modal
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        width={560}
        footer={null}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Chi tiết lịch khám</div>
              {selected && (
                <Tag color={STATUS_CFG[selected.status]?.color}
                  style={{ fontSize: 11, borderRadius: 20, marginTop: 3, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {STATUS_CFG[selected.status]?.icon} {STATUS_CFG[selected.status]?.label}
                </Tag>
              )}
            </div>
          </div>
        }
      >
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
            <InfoCard icon={<User size={13} />} label="Bệnh nhân" color="#f9fafb">
              <b>{selected.userId?.fullName}</b>
              <Row icon={<Phone size={11} />} text={selected.userId?.phoneNumber} />
              <Row icon={<Mail size={11} />} text={selected.userId?.email} />
            </InfoCard>

            <InfoCard icon={<MapPin size={13} />} label="Phòng khám" color="#ecfdf5">
              <b>{selected.clinicId?.name || selected.clinicName || "—"}</b>
              {selected.clinicId?.address && <Row icon={<MapPin size={11} />} text={selected.clinicId.address} />}
              {selected.location && <Row icon={<MapPin size={11} />} text={selected.location} />}
            </InfoCard>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <InfoCard icon={<Calendar size={13} />} label="Ngày khám" color="#fffbeb">
                <span style={{ fontWeight: 700, color: "#f59e0b", fontSize: 16 }}>{fmtDate(selected.appointmentDate)}</span>
              </InfoCard>
              {selected.rating && (
                <InfoCard icon={<Star size={13} />} label="Đánh giá" color="#fdf4ff">
                  <Rate disabled value={selected.rating} style={{ fontSize: 14 }} />
                </InfoCard>
              )}
            </div>

            {selected.reason && (
              <InfoCard icon={<FileText size={13} />} label="Lý do khám" color="#f9fafb">
                <span style={{ fontSize: 13, color: "#4b5563" }}>{selected.reason}</span>
              </InfoCard>
            )}
            {selected.notes && (
              <InfoCard icon={<FileText size={13} />} label="Ghi chú" color="#f9fafb">
                <span style={{ fontSize: 13, color: "#4b5563", fontStyle: "italic" }}>{selected.notes}</span>
              </InfoCard>
            )}
            {selected.review && (
              <InfoCard icon={<FileText size={13} />} label="Tình trạng bệnh" color="#eef2ff">
                <span style={{ fontSize: 13, color: "#4b5563" }}>{selected.review}</span>
              </InfoCard>
            )}
            {selected.cancellationReason && (
              <InfoCard icon={<XCircle size={13} />} label="Lý do hủy" color="#fef2f2" labelColor="#ef4444">
                <span style={{ fontSize: 13, color: "#dc2626" }}>{selected.cancellationReason}</span>
              </InfoCard>
            )}
          </div>
        )}
      </Modal>

      {/* ══ MODAL: Update Status ════════════════════════════════ */}
      <Modal
        open={statusOpen}
        onCancel={() => setStatusOpen(false)}
        width={440}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              background: nextStatus === "cancelled" ? "#fef2f2" : nextStatus === "upcoming" ? "#ecfdf5" : "#eef2ff",
            }}>
              {nextStatus === "cancelled" ? <XCircle size={18} color="#ef4444" />
                : nextStatus === "completed" ? <CheckCircle size={18} color="#6366f1" />
                : <CheckCircle size={18} color="#10b981" />}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
                {nextStatus === "upcoming" ? "Duyệt lịch khám"
                  : nextStatus === "completed" ? "Hoàn thành lịch khám"
                  : "Hủy lịch khám"}
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>{selected?.userId?.fullName}</div>
            </div>
          </div>
        }
        footer={[
          <Button key="cancel" onClick={() => setStatusOpen(false)} style={{ borderRadius: 10, height: 38 }}>Hủy</Button>,
          <Button key="ok" type="primary" loading={statusLoading} onClick={handleUpdateStatus}
            danger={nextStatus === "cancelled"}
            style={{ borderRadius: 10, height: 38, background: nextStatus === "cancelled" ? undefined : nextStatus === "completed" ? "#6366f1" : "#10b981", borderColor: nextStatus === "cancelled" ? undefined : nextStatus === "completed" ? "#6366f1" : "#10b981" }}>
            Xác nhận
          </Button>,
        ]}
      >
        <Form form={statusForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item
            name="reason"
            label={nextStatus === "cancelled" ? "Lý do hủy" : "Ghi chú (tuỳ chọn)"}
            rules={nextStatus === "cancelled" ? [{ required: true, message: "Vui lòng nhập lý do hủy" }] : []}
          >
            <TextArea rows={3} placeholder={nextStatus === "cancelled" ? "Nhập lý do hủy..." : "Nhập ghi chú..."} style={{ borderRadius: 10 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ══ MODAL: Rate / Tình trạng bệnh ══════════════════════ */}
      <Modal
        open={rateOpen}
        onCancel={() => setRateOpen(false)}
        width={440}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Star size={18} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Tình trạng bệnh sau khám</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>{selected?.userId?.fullName}</div>
            </div>
          </div>
        }
        footer={[
          <Button key="cancel" onClick={() => setRateOpen(false)} style={{ borderRadius: 10, height: 38 }}>Hủy</Button>,
          <Button key="ok" type="primary" loading={rateLoading} onClick={handleRate}
            style={{ borderRadius: 10, height: 38, background: "#f59e0b", borderColor: "#f59e0b" }}>
            Lưu
          </Button>,
        ]}
      >
        <Form form={rateForm} layout="vertical" style={{ marginTop: 12 }}>
          <Form.Item name="rating" label="Mức độ hồi phục (1–5 sao)"
            rules={[{ required: true, message: "Vui lòng chọn đánh giá" }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="review" label="Mô tả tình trạng bệnh"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}>
            <TextArea rows={4} placeholder="Nhập tình trạng bệnh, hướng điều trị..." style={{ borderRadius: 10 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

// ── Small helpers ──────────────────────────────────────────────
const InfoCard = ({ icon, label, color, labelColor = "#9ca3af", children }) => (
  <div style={{ background: color, borderRadius: 10, padding: "12px 14px" }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: labelColor, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
      {icon} {label}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>{children}</div>
  </div>
);

const Row = ({ icon, text }) => (
  <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
    {icon} {text || "—"}
  </div>
);

export default DoctorAppointments;
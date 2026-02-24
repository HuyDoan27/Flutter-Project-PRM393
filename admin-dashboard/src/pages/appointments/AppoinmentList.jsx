import React, { useEffect, useState, useCallback } from "react";
import {
  Table, Card, Button, Tag, Modal, Select,
  DatePicker, Space, Empty, Timeline, Avatar,
} from "antd";
import {
  Calendar, Eye, Clock, CheckCircle,
  XCircle, AlertCircle, User, Stethoscope,
  MapPin, Phone, Mail,
} from "lucide-react";
import dayjs from "dayjs";
import {
  getAllAppointments,
  getDoctors,
  getClinics,
} from "../../services/AppointmentService.js";

const { RangePicker } = DatePicker;

// ─── Status config ───────────────────────────────────────
const STATUS_CFG = {
  pending:   { label: "Chờ xác nhận", color: "orange",  icon: <Clock size={13} /> },
  confirmed: { label: "Đã xác nhận",  color: "blue",    icon: <AlertCircle size={13} /> },
  completed: { label: "Hoàn thành",   color: "green",   icon: <CheckCircle size={13} /> },
  cancelled: { label: "Đã hủy",       color: "red",     icon: <XCircle size={13} /> },
};

const STATUS_OPTIONS = Object.keys(STATUS_CFG).map((key) => ({
  value: key,
  label: STATUS_CFG[key].label,
}));

const PAGE_SIZE = 10;

const fmtDate = (iso) => {
  if (!iso) return "—";
  return dayjs(iso).format("DD/MM/YYYY");
};

const fmtDateTime = (iso) => {
  if (!iso) return "—";
  return dayjs(iso).format("DD/MM/YYYY HH:mm");
};

// ─── AppointmentList ─────────────────────────────────────
const AppointmentList = () => {
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal]               = useState(0);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);

  // filters
  const [statusFilter, setStatusFilter]     = useState(null);
  const [dateRange, setDateRange]           = useState(null);
  const [doctorFilter, setDoctorFilter]     = useState(null);
  const [clinicFilter, setClinicFilter]     = useState(null);

  // dropdown options
  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);

  // detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected]     = useState(null);

  // ── Fetch appointments ────────────────────────────────
  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: PAGE_SIZE };
      if (statusFilter) params.status = statusFilter;
      if (doctorFilter) params.doctorId = doctorFilter;
      if (clinicFilter) params.clinicId = clinicFilter;
      if (dateRange && dateRange[0] && dateRange[1]) {
        params.fromDate = dateRange[0].format("YYYY-MM-DD");
        params.toDate   = dateRange[1].format("YYYY-MM-DD");
      }
      const res = await getAllAppointments(params);
      setAppointments(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error("Load appointments failed", err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, dateRange, doctorFilter, clinicFilter]);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);

  // ── Fetch filter options ──────────────────────────────
  useEffect(() => {
    Promise.all([getDoctors(), getClinics()])
      .then(([dRes, cRes]) => {
        setDoctors(dRes.data.data || []);
        setClinics(cRes.data.data || []);
      })
      .catch(() => {});
  }, []);

  // ── Reset filters ─────────────────────────────────────
  const handleResetFilters = () => {
    setStatusFilter(null);
    setDateRange(null);
    setDoctorFilter(null);
    setClinicFilter(null);
    setPage(1);
  };

  // ── Open detail ───────────────────────────────────────
  const handleViewDetail = (record) => {
    setSelected(record);
    setDetailOpen(true);
  };

  // ── Table columns ─────────────────────────────────────
  const columns = [
    {
      title: "#", key: "index", width: 52,
      render: (_, __, idx) => (
        <span style={{ color: "#9ca3af", fontWeight: 600, fontSize: 13 }}>
          {(page - 1) * PAGE_SIZE + idx + 1}
        </span>
      ),
    },
    {
      title: "Bệnh nhân", key: "patient",
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Avatar size={36} style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
            {r.userId?.fullName?.[0] || "U"}
          </Avatar>
          <div>
            <div style={{ fontWeight: 600, color: "#1f2937", fontSize: 14 }}>{r.userId?.fullName || "—"}</div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>{r.userId?.phoneNumber || "—"}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Bác sĩ", key: "doctor",
      render: (_, r) => (
        <div>
          <div style={{ fontWeight: 600, color: "#1f2937", fontSize: 13 }}>{r.doctorId?.fullName || "—"}</div>
          {r.doctorId?.specialty?.name && (
            <Tag color="purple" style={{ fontSize: 11, marginTop: 3, borderRadius: 20 }}>
              {r.doctorId.specialty.name}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Phòng khám", dataIndex: ["clinicId", "name"], key: "clinic",
      render: (v) => <span style={{ fontSize: 13, color: "#4b5563" }}>{v || "—"}</span>,
    },
    {
      title: "Ngày khám", dataIndex: "appointmentDate", key: "date",
      render: (v) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Calendar size={14} color="#6b7280" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>{fmtDate(v)}</span>
        </div>
      ),
    },
    {
      title: "Trạng thái", dataIndex: "status", key: "status",
      render: (status) => {
        const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
        return (
          <Tag color={cfg.color}
            style={{ fontSize: 12, fontWeight: 600, borderRadius: 20, padding: "3px 12px", display: "inline-flex", alignItems: "center", gap: 5 }}>
            {cfg.icon} {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác", key: "actions", width: 80, align: "center",
      render: (_, record) => (
        <Button type="text" icon={<Eye size={15} color="#6366f1" />}
          onClick={() => handleViewDetail(record)}
          style={{ width: 34, height: 34, borderRadius: 8, background: "#eef2ff", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
        />
      ),
    },
  ];

  // ════════════════════════════════════════════════════════
  return (
    <div style={{ padding: "28px 32px", background: "#f3f4f6", minHeight: "100%" }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>Lịch khám</h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>Quản lý tất cả lịch khám trong hệ thống</p>
      </div>

      {/* Filters */}
      <Card bordered={false} style={{ marginBottom: 20, borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
        <Space wrap size={12}>
          <Select
            placeholder="Trạng thái"
            allowClear
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            style={{ width: 160 }}
            options={STATUS_OPTIONS}
          />

          <RangePicker
            placeholder={["Từ ngày", "Đến ngày"]}
            value={dateRange}
            onChange={(dates) => { setDateRange(dates); setPage(1); }}
            format="DD/MM/YYYY"
            style={{ width: 260 }}
          />

          <Select
            placeholder="Bác sĩ"
            allowClear
            showSearch
            value={doctorFilter}
            onChange={(v) => { setDoctorFilter(v); setPage(1); }}
            style={{ width: 200 }}
            optionFilterProp="label"
            options={doctors.map((d) => ({ value: d._id, label: d.fullName }))}
          />

          <Select
            placeholder="Phòng khám"
            allowClear
            showSearch
            value={clinicFilter}
            onChange={(v) => { setClinicFilter(v); setPage(1); }}
            style={{ width: 200 }}
            optionFilterProp="label"
            options={clinics.map((c) => ({ value: c._id, label: c.name }))}
          />

          <Button onClick={handleResetFilters} style={{ borderRadius: 10 }}>
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
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total,
            onChange: setPage,
            showTotal: (t) => `Tổng ${t} lịch khám`,
            style: { padding: "16px 24px 8px" },
          }}
          locale={{ emptyText: <Empty description="Không có lịch khám nào" /> }}
        />
      </Card>

      {/* ══ MODAL: Detail ═════════════════════════════════ */}
      <Modal
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setSelected(null); }}
        width={600}
        footer={null}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Calendar size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Chi tiết lịch khám</div>
              {selected && (
                <Tag color={STATUS_CFG[selected.status]?.color}
                  style={{ fontSize: 11, fontWeight: 600, borderRadius: 20, marginTop: 3, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {STATUS_CFG[selected.status]?.icon} {STATUS_CFG[selected.status]?.label}
                </Tag>
              )}
            </div>
          </div>
        }
      >
        {selected && (
          <>
            {/* Info grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
              {/* Bệnh nhân */}
              <div style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <User size={11} /> Bệnh nhân
                </div>
                <div style={{ fontWeight: 600, color: "#1f2937", fontSize: 14, marginBottom: 2 }}>{selected.userId?.fullName || "—"}</div>
                <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                  <Phone size={11} /> {selected.userId?.phoneNumber || "—"}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <Mail size={11} /> {selected.userId?.email || "—"}
                </div>
              </div>

              {/* Bác sĩ */}
              <div style={{ background: "#eef2ff", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <Stethoscope size={11} /> Bác sĩ
                </div>
                <div style={{ fontWeight: 600, color: "#1f2937", fontSize: 14, marginBottom: 2 }}>{selected.doctorId?.fullName || "—"}</div>
                <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                  <Phone size={11} /> {selected.doctorId?.phoneNumber || "—"}
                </div>
                {selected.doctorId?.specialty?.name && (
                  <Tag color="purple" style={{ fontSize: 11, marginTop: 6, borderRadius: 20 }}>
                    {selected.doctorId.specialty.name}
                  </Tag>
                )}
              </div>

              {/* Phòng khám */}
              <div style={{ background: "#ecfdf5", borderRadius: 10, padding: "12px 14px", gridColumn: "span 2" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <MapPin size={11} /> Phòng khám
                </div>
                <div style={{ fontWeight: 600, color: "#1f2937", fontSize: 14, marginBottom: 2 }}>{selected.clinicId?.name || "—"}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{selected.clinicId?.address || "—"}</div>
                {selected.clinicId?.phone && (
                  <div style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4, marginTop: 3 }}>
                    <Phone size={11} /> {selected.clinicId.phone}
                  </div>
                )}
              </div>

              {/* Ngày khám */}
              <div style={{ background: "#fffbeb", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "flex", alignItems: "center", gap: 4 }}>
                  <Calendar size={11} /> Ngày khám
                </div>
                <div style={{ fontWeight: 700, color: "#f59e0b", fontSize: 16 }}>{fmtDate(selected.appointmentDate)}</div>
              </div>

              {/* Lý do */}
              <div style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                  Lý do khám
                </div>
                <div style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.5 }}>{selected.reason || "—"}</div>
              </div>
            </div>

            {/* Status History */}
            {selected.statusHistory && selected.statusHistory.length > 0 && (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={14} /> Lịch sử trạng thái
                </div>
                <div style={{ background: "#f9fafb", borderRadius: 10, padding: "16px 18px" }}>
                  <Timeline
                    items={selected.statusHistory.map((hist) => {
                      const cfg = STATUS_CFG[hist.status] || STATUS_CFG.pending;
                      return {
                        color: cfg.color === "orange" ? "orange" : cfg.color === "blue" ? "blue" : cfg.color === "green" ? "green" : "red",
                        children: (
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "#1f2937", display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                              {cfg.icon} {cfg.label}
                            </div>
                            <div style={{ fontSize: 12, color: "#6b7280" }}>{fmtDateTime(hist.changedAt)}</div>
                            {hist.note && (
                              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4, fontStyle: "italic" }}>"{hist.note}"</div>
                            )}
                          </div>
                        ),
                      };
                    })}
                  />
                </div>
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentList;
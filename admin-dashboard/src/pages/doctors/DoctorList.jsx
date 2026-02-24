import React, { useEffect, useState, useCallback } from "react";
import {
  Table,
  Card,
  Input,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  Empty,
} from "antd";
import {
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Mail,
  Phone,
  MapPin,
  Stethoscope,
  AlertTriangle,
  UserPlus,
} from "lucide-react";

import {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctorStatus,
} from "../../services/DoctorService.js";

// ─── Status config ──────────────────────────────────────────
const STATUS_CFG = {
  1: { label: "Đã duyệt",  tagColor: "green",  icon: <CheckCircle size={13} /> },
  2: { label: "Chờ duyệt", tagColor: "orange", icon: <Clock size={13} /> },
  3: { label: "Từ chối",   tagColor: "red",    icon: <XCircle size={13} /> },
};

// ─── DoctorList ─────────────────────────────────────────────
const DoctorList = () => {
  const [doctors, setDoctors]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [activeTab, setActiveTab]       = useState("all");

  // modal states
  const [createOpen, setCreateOpen]     = useState(false);
  const [detailOpen, setDetailOpen]     = useState(false);
  const [rejectOpen, setRejectOpen]     = useState(false);
  const [selected, setSelected]         = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // loading flags
  const [createLoading, setCreateLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const [createForm] = Form.useForm();

  // ── Fetch ───────────────────────────────────────────────
  const loadDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const params = activeTab !== "all" ? { status: Number(activeTab) } : {};
      const res = await getDoctors(params);
      setDoctors(res.data.data);
    } catch (err) {
      console.error("Load doctors failed", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { loadDoctors(); }, [loadDoctors]);

  // ── Search (client-side) ──────────────────────────────
  const filtered = doctors.filter((d) =>
    d.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Create ────────────────────────────────────────────
  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      setCreateLoading(true);
      await createDoctor(values);
      createForm.resetFields();
      setCreateOpen(false);
      loadDoctors();
    } catch (err) {
      if (err?.response) console.error("Create failed", err);
    } finally {
      setCreateLoading(false);
    }
  };

  // ── View detail ─────────────────────────────────────
  const handleViewDetail = async (record) => {
    try {
      const res = await getDoctorById(record._id);
      setSelected(res.data.data);
      setDetailOpen(true);
    } catch (err) {
      console.error("Fetch detail failed", err);
    }
  };

  // ── Approve ─────────────────────────────────────────
  const handleApprove = async (id) => {
    try {
      await updateDoctorStatus(id, { status: 1 });
      // optimistic update
      setDoctors((prev) => prev.map((d) => (d._id === id ? { ...d, status: 1 } : d)));
      if (selected?._id === id) setSelected((prev) => ({ ...prev, status: 1 }));
    } catch (err) {
      console.error("Approve failed", err);
    }
  };

  // ── Reject ──────────────────────────────────────────
  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    try {
      setRejectLoading(true);
      await updateDoctorStatus(selected._id, { status: 3, rejectReason: rejectReason.trim() });
      const updated = { ...selected, status: 3, rejectReason: rejectReason.trim() };
      setDoctors((prev) => prev.map((d) => (d._id === selected._id ? updated : d)));
      setSelected(updated);
      setRejectOpen(false);
    } catch (err) {
      console.error("Reject failed", err);
    } finally {
      setRejectLoading(false);
    }
  };

  // ── Pending count ─────────────────────────────────
  const pendingCount = doctors.filter((d) => d.status === 2).length;

  // ── Table columns ──────────────────────────────────
  const columns = [
    {
      title: "#",
      key: "index",
      width: 52,
      render: (_, __, idx) => <span style={{ color: "#9ca3af", fontWeight: 600, fontSize: 13 }}>{idx + 1}</span>,
    },
    {
      title: "Tên bác sĩ",
      dataIndex: "fullName",
      key: "fullName",
      render: (name, record) => (
        <>
          <div style={{ fontWeight: 600, color: "#1f2937", fontSize: 14 }}>{name}</div>
          <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{record.clinicName || "—"}</div>
        </>
      ),
    },
    {
      title: "Chuyên khoa",
      dataIndex: "specialty",
      key: "specialty",
      render: (s) => <span style={{ fontSize: 13, color: "#4b5563" }}>{s?.name || "—"}</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => <span style={{ fontSize: 13, color: "#6b7280" }}>{email || "—"}</span>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const cfg = STATUS_CFG[status] || STATUS_CFG[2];
        return (
          <Tag
            color={cfg.tagColor}
            style={{ fontSize: 12, fontWeight: 600, borderRadius: 20, padding: "2px 10px", display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            {cfg.icon} {cfg.label}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 140,
      align: "center",
      render: (_, record) => (
        <Space size={6}>
          <Button type="text" icon={<Eye size={15} color="#6366f1" />}
            onClick={() => handleViewDetail(record)}
            style={{ width: 34, height: 34, borderRadius: 8, background: "#eef2ff", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          />
          {record.status === 2 && (
            <Button type="text" icon={<CheckCircle size={15} color="#10b981" />}
              onClick={() => handleApprove(record._id)}
              style={{ width: 34, height: 34, borderRadius: 8, background: "#ecfdf5", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            />
          )}
          {record.status === 2 && (
            <Button type="text" icon={<XCircle size={15} color="#ef4444" />}
              onClick={() => { setSelected(record); setRejectReason(""); setRejectOpen(true); }}
              style={{ width: 34, height: 34, borderRadius: 8, background: "#fef2f2", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
            />
          )}
        </Space>
      ),
    },
  ];

  // ── Tab items ─────────────────────────────────────
  const TABS = [
    { key: "all", label: "Tất cả" },
    { key: "2",   label: "Chờ duyệt" },
    { key: "1",   label: "Đã duyệt" },
    { key: "3",   label: "Từ chối" },
  ];

  // ════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════
  return (
    <div style={{ padding: "28px 32px", background: "#f3f4f6", minHeight: "100%" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>Bác sĩ</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>Quản lý danh sách bác sĩ trong hệ thống</p>
        </div>
        <Button
          type="primary"
          icon={<Plus size={16} />}
          onClick={() => setCreateOpen(true)}
          style={{ height: 40, borderRadius: 10, fontSize: 14, fontWeight: 600, background: "#6366f1", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}
        >
          Thêm bác sĩ
        </Button>
      </div>

      {/* Tabs + Search */}
      <div className="flex items-center justify-between mb-5" style={{ gap: 16 }}>
        <div className="flex items-center gap-1" style={{
          background: "#fff", borderRadius: 12, padding: 4,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb",
        }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Button
                key={tab.key}
                type="text"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  background: active ? "#6366f1" : "transparent",
                  color: active ? "#fff" : "#6b7280",
                  borderRadius: 8, height: 34, fontSize: 13, fontWeight: 600,
                  border: "none", padding: "0 16px",
                }}
              >
                {tab.label}
                {tab.key === "all" && pendingCount > 0 && (
                  <Tag style={{
                    marginLeft: 6, fontSize: 11, fontWeight: 700, borderRadius: 10,
                    background: active ? "rgba(255,255,255,0.25)" : "#fef3c7",
                    color: active ? "#fff" : "#d97706",
                    border: "none", padding: "0 7px",
                  }}>
                    {pendingCount}
                  </Tag>
                )}
              </Button>
            );
          })}
        </div>

        <Input
          prefix={<Search size={16} color="#9ca3af" />}
          placeholder="Tìm bác sĩ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 240, borderRadius: 10, height: 38 }}
        />
      </div>

      {/* Table */}
      <Card
        bordered={false}
        style={{ borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
        bodyStyle={{ padding: 0 }}
      >
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} bác sĩ`, style: { padding: "16px 24px 8px" } }}
          locale={{ emptyText: <Empty description="Không có bác sĩ nào phù hợp" /> }}
        />
      </Card>

      {/* ════════════════════════════════════════════════
          MODAL: Create
          ════════════════════════════════════════════════ */}
      <Modal
        open={createOpen}
        onCancel={() => { setCreateOpen(false); createForm.resetFields(); }}
        width={460}
        style={{ borderRadius: 20 }}
        title={
          <div className="flex items-center gap-3" style={{ marginTop: 4 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <UserPlus size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Thêm bác sĩ mới</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>Trạng thái sẽ là "Chờ duyệt"</div>
            </div>
          </div>
        }
        footer={[
          <Button key="cancel" onClick={() => { setCreateOpen(false); createForm.resetFields(); }}
            style={{ borderRadius: 10, height: 38, fontSize: 14, fontWeight: 600 }}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" loading={createLoading} onClick={handleCreate}
            icon={<UserPlus size={15} />}
            style={{ borderRadius: 10, height: 38, fontSize: 14, fontWeight: 600, background: "#6366f1" }}>
            Tạo bác sĩ
          </Button>,
        ]}
      >
        <Form form={createForm} layout="vertical" style={{ marginTop: 8 }}>
          <Form.Item name="fullName" label="Tên bác sĩ" rules={[{ required: true, message: "Bắt buộc" }]} style={{ marginBottom: 16 }}>
            <Input placeholder="Nguyễn Văn A" style={{ borderRadius: 10, height: 38 }} />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: "Bắt buộc" }, { type: "email", message: "Email không hợp lệ" }]} style={{ marginBottom: 16 }}>
            <Input placeholder="bac.si@mail.com" style={{ borderRadius: 10, height: 38 }} />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Số điện thoại" style={{ marginBottom: 16 }}>
            <Input placeholder="0912345678" style={{ borderRadius: 10, height: 38 }} />
          </Form.Item>
          <Form.Item name="clinicName" label="Tên phòng khám" style={{ marginBottom: 16 }}>
            <Input placeholder="Phòng khám ABC" style={{ borderRadius: 10, height: 38 }} />
          </Form.Item>
          <Form.Item name="clinicAddress" label="Địa chỉ phòng khám" style={{ marginBottom: 0 }}>
            <Input placeholder="123 Hàng Bông, HN" style={{ borderRadius: 10, height: 38 }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ════════════════════════════════════════════════
          MODAL: Detail
          ════════════════════════════════════════════════ */}
      <Modal
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        width={460}
        style={{ borderRadius: 20 }}
        title={
          selected && (
            <div className="flex items-center gap-3" style={{ marginTop: 4 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 18, fontWeight: 700,
              }}>
                {selected.fullName?.[0] || "D"}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{selected.fullName}</div>
                <Tag color={STATUS_CFG[selected.status]?.tagColor} style={{ fontSize: 11, fontWeight: 600, borderRadius: 20, marginTop: 2 }}>
                  {STATUS_CFG[selected.status]?.label}
                </Tag>
              </div>
            </div>
          )
        }
        footer={
          selected?.status === 2 ? [
            <Button key="reject" danger onClick={() => { setDetailOpen(false); setRejectReason(""); setRejectOpen(true); }}
              icon={<XCircle size={15} />}
              style={{ borderRadius: 10, height: 38, fontSize: 14, fontWeight: 600 }}>
              Từ chối
            </Button>,
            <Button key="approve" type="primary" onClick={() => handleApprove(selected._id)}
              icon={<CheckCircle size={15} />}
              style={{ borderRadius: 10, height: 38, fontSize: 14, fontWeight: 600, background: "#10b981" }}>
              Duyệt bác sĩ
            </Button>,
          ] : null
        }
      >
        {selected && (
          <div style={{ marginTop: 4 }}>
            {[
              { icon: <Stethoscope size={16} />, label: "Chuyên khoa",  value: selected.specialty?.name || "—" },
              { icon: <Mail size={16} />,        label: "Email",        value: selected.email || "—" },
              { icon: <Phone size={16} />,       label: "Điện thoại",   value: selected.phoneNumber || "—" },
              { icon: <MapPin size={16} />,      label: "Phòng khám",   value: selected.clinicName || "—" },
              { icon: <MapPin size={16} />,      label: "Địa chỉ",      value: selected.clinicAddress || "—" },
            ].map(({ icon, label, value }, i) => (
              <div key={i} className="flex items-start gap-3" style={{ marginBottom: 14 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, color: "#6b7280",
                }}>
                  {icon}
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                  <div style={{ fontSize: 14, color: "#1f2937", fontWeight: 500, marginTop: 1 }}>{value}</div>
                </div>
              </div>
            ))}

            {selected.status === 3 && selected.rejectReason && (
              <div style={{ marginTop: 10, padding: "12px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Lý do từ chối</div>
                <div style={{ fontSize: 13, color: "#991b1b" }}>{selected.rejectReason}</div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* ════════════════════════════════════════════════
          MODAL: Reject
          ════════════════════════════════════════════════ */}
      <Modal
        open={rejectOpen}
        onCancel={() => setRejectOpen(false)}
        width={420}
        style={{ borderRadius: 20 }}
        title={
          <div className="flex items-center gap-3" style={{ marginTop: 4 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <AlertTriangle size={18} color="#ef4444" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Từ chối bác sĩ</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>{selected?.fullName}</div>
            </div>
          </div>
        }
        footer={[
          <Button key="cancel" onClick={() => setRejectOpen(false)}
            style={{ borderRadius: 10, height: 38, fontSize: 14, fontWeight: 600 }}>
            Hủy
          </Button>,
          <Button key="confirm" danger loading={rejectLoading} onClick={handleReject}
            disabled={!rejectReason.trim()}
            style={{ borderRadius: 10, height: 38, fontSize: 14, fontWeight: 600 }}>
            Xác nhận từ chối
          </Button>,
        ]}
      >
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4b5563", marginBottom: 8 }}>
          Lý do từ chối <span style={{ color: "#ef4444" }}>*</span>
        </label>
        <Input.TextArea
          rows={3}
          placeholder="Nhập lý do từ chối..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          style={{ borderRadius: 10, fontSize: 14 }}
        />
      </Modal>
    </div>
  );
};

export default DoctorList;
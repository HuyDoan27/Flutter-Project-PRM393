import React, { useEffect, useState, useCallback } from "react";
import {
  Table, Card, Input, Button, Tag, Modal,
  Form, Select, Avatar, Empty, Divider, Spin,
} from "antd";
import {
  Plus, Search, Eye, Edit2,
  MapPin, Phone, Stethoscope, Users, Building2,
} from "lucide-react";
import {
  getClinics,
  createClinic,
  updateClinic,
  getSpecialtiesByClinic,
  getAllSpecialties,
} from "../../../services/ClinicService.js";

// ─── ClinicList ──────────────────────────────────────────────
const ClinicList = () => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [editSpecialties, setEditSpecialties] = useState([]);
  const [editSpecLoading, setEditSpecLoading] = useState(false);

  // all specialties cho create form
  const [allSpecialties, setAllSpecialties] = useState([]);

  // modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // detail data (specialties fetched fresh)
  const [detailSpecialties, setDetailSpecialties] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // form loading
  const [formLoading, setFormLoading] = useState(false);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // ── Fetch clinics ─────────────────────────────────────
  const loadClinics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getClinics();
      setClinics(res.data.data);
    } catch (err) {
      console.error("Load clinics failed", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadClinics(); }, [loadClinics]);

  // ── Fetch all specialties (for create form) ───────────
  useEffect(() => {
    getAllSpecialties()
      .then((res) => setAllSpecialties(res.data.data || []))
      .catch(() => { });
  }, []);

  // ── Client-side search ────────────────────────────────
  const filtered = clinics.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.address?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Create ────────────────────────────────────────────
  const handleCreate = async () => {
    try {
      const values = await createForm.validateFields();
      setFormLoading(true);
      await createClinic(values);
      createForm.resetFields();
      setCreateOpen(false);
      loadClinics();
    } catch (err) {
      if (err?.response) console.error("Create clinic failed", err);
    } finally {
      setFormLoading(false);
    }
  };

  // ── Open edit ─────────────────────────────────────────
  const handleOpenEdit = async (clinic) => {
    setSelected(clinic);
    setEditOpen(true);
    setEditSpecialties([]);

    // Set các field text trước để modal không bị trống
    editForm.setFieldsValue({
      name: clinic.name,
      address: clinic.address,
      phone: clinic.phone,
      description: clinic.description,
      specialties: [],
    });

    try {
      setEditSpecLoading(true);
      const res = await getSpecialtiesByClinic(clinic._id);
      const specs = res.data.specialties || [];
      setEditSpecialties(specs);
      // Set specialties đã chọn sau khi fetch xong
      editForm.setFieldValue("specialties", specs.map((s) => s._id));
    } catch (err) {
      console.error("Fetch specialties for edit failed", err);
    } finally {
      setEditSpecLoading(false);
    }
  };

  // ── Update ────────────────────────────────────────────
  const handleUpdate = async () => {
    try {
      const values = await editForm.validateFields();
      setFormLoading(true);
      await updateClinic(selected._id, values);
      editForm.resetFields();
      setEditOpen(false);
      setSelected(null);
      loadClinics();
    } catch (err) {
      if (err?.response) console.error("Update clinic failed", err);
    } finally {
      setFormLoading(false);
    }
  };

  // ── Open detail ───────────────────────────────────────
  const handleOpenDetail = async (clinic) => {
    setSelected(clinic);
    setDetailOpen(true);
    setDetailSpecialties([]);
    try {
      setDetailLoading(true);
      const res = await getSpecialtiesByClinic(clinic._id);
      setDetailSpecialties(res.data.specialties || []);
    } catch (err) {
      console.error("Fetch specialties failed", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // ── Table columns ─────────────────────────────────────
  const columns = [
    {
      title: "#", key: "index", width: 52,
      render: (_, __, idx) => (
        <span style={{ color: "#9ca3af", fontWeight: 600, fontSize: 13 }}>{idx + 1}</span>
      ),
    },
    {
      title: "Phòng khám", key: "clinic",
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, flexShrink: 0,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Building2 size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#1f2937", fontSize: 14 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 1, display: "flex", alignItems: "center", gap: 4 }}>
              <MapPin size={11} /> {r.address || "—"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Số điện thoại", dataIndex: "phone", key: "phone",
      render: (v) => <span style={{ fontSize: 13, color: "#4b5563" }}>{v || "—"}</span>,
    },
    {
      title: "Chuyên khoa", key: "specialties",
      render: (_, r) => (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Tag color="purple" style={{ borderRadius: 20, fontWeight: 700, fontSize: 12 }}>
            <Stethoscope size={12} style={{ marginRight: 4, verticalAlign: "middle" }} />
            {r.specialties?.length || 0}
          </Tag>
        </div>
      ),
    },
    {
      title: "Thao tác", key: "actions", width: 100, align: "center",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Button type="text" icon={<Eye size={15} color="#6366f1" />}
            onClick={() => handleOpenDetail(record)}
            style={{ width: 34, height: 34, borderRadius: 8, background: "#eef2ff", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          />
          <Button type="text" icon={<Edit2 size={15} color="#f59e0b" />}
            onClick={() => handleOpenEdit(record)}
            style={{ width: 34, height: 34, borderRadius: 8, background: "#fffbeb", border: "none", display: "inline-flex", alignItems: "center", justifyContent: "center" }}
          />
        </div>
      ),
    },
  ];

  // ── Shared form fields ────────────────────────────────
  const ClinicFormFields = ({ specialtyOptions }) => (
    <>
      <Form.Item name="name" label="Tên phòng khám"
        rules={[{ required: true, message: "Bắt buộc" }]} style={{ marginBottom: 16 }}>
        <Input placeholder="Phòng khám ABC" style={{ borderRadius: 10, height: 38 }} />
      </Form.Item>
      <Form.Item name="address" label="Địa chỉ"
        rules={[{ required: true, message: "Bắt buộc" }]} style={{ marginBottom: 16 }}>
        <Input placeholder="123 Lý Thường Kiệt, HN" style={{ borderRadius: 10, height: 38 }} />
      </Form.Item>
      <Form.Item name="phone" label="Số điện thoại" style={{ marginBottom: 16 }}>
        <Input placeholder="024 1234 5678" style={{ borderRadius: 10, height: 38 }} />
      </Form.Item>
      <Form.Item name="description" label="Mô tả" style={{ marginBottom: 16 }}>
        <Input.TextArea rows={2} placeholder="Mô tả ngắn về phòng khám..." style={{ borderRadius: 10 }} />
      </Form.Item>
      <Form.Item name="specialties" label="Chuyên khoa" style={{ marginBottom: 0 }}>
        <Select
          mode="multiple"
          placeholder="Chọn chuyên khoa..."
          style={{ width: "100%" }}
          optionFilterProp="label"
          options={specialtyOptions}
        />
      </Form.Item>
    </>
  );

  // ════════════════════════════════════════════════════════
  return (
    <div style={{ padding: "28px 32px", background: "#f3f4f6", minHeight: "100%" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>Phòng khám</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>Quản lý phòng khám và chuyên khoa</p>
        </div>
        <Button type="primary" icon={<Plus size={16} />}
          onClick={() => setCreateOpen(true)}
          style={{ height: 40, borderRadius: 10, fontSize: 14, fontWeight: 600, background: "#6366f1", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}>
          Thêm phòng khám
        </Button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <Input
          prefix={<Search size={16} color="#9ca3af" />}
          placeholder="Tìm tên, địa chỉ phòng khám..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300, borderRadius: 10, height: 38 }}
        />
      </div>

      {/* Table */}
      <Card bordered={false} style={{ borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }} bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10, showTotal: (t) => `Tổng ${t} phòng khám`, style: { padding: "16px 24px 8px" } }}
          locale={{ emptyText: <Empty description="Chưa có phòng khám nào" /> }}
        />
      </Card>

      {/* ══ MODAL: Create ══════════════════════════════════ */}
      <Modal
        open={createOpen}
        onCancel={() => { setCreateOpen(false); createForm.resetFields(); }}
        width={500}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Thêm phòng khám</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>Điền thông tin phòng khám mới</div>
            </div>
          </div>
        }
        footer={[
          <Button key="cancel" onClick={() => { setCreateOpen(false); createForm.resetFields(); }}
            style={{ borderRadius: 10, height: 38, fontSize: 14, fontWeight: 600 }}>Hủy</Button>,
          <Button key="submit" type="primary" loading={formLoading} onClick={handleCreate}
            icon={<Plus size={15} />}
            style={{ borderRadius: 10, height: 38, fontSize: 14, fontWeight: 600, background: "#6366f1" }}>
            Tạo phòng khám
          </Button>,
        ]}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 8 }}>
          <Spin spinning={editSpecLoading}>
            <ClinicFormFields
              specialtyOptions={allSpecialties.map((s) => ({ value: s._id, label: s.name }))}
            />
          </Spin>
        </Form>
      </Modal>

      {/* ══ MODAL: Edit ════════════════════════════════════ */}
      {/* ══ MODAL: Edit ════════════════════════════════════ */}
      <Modal
        open={editOpen}
        onCancel={() => { setEditOpen(false); editForm.resetFields(); setSelected(null); setEditSpecialties([]); }}
        width={500}
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Edit2 size={18} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>Chỉnh sửa phòng khám</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>{selected?.name}</div>
            </div>
          </div>
        }
        footer={[
          <Button key="cancel" onClick={() => { setEditOpen(false); editForm.resetFields(); setSelected(null); setEditSpecialties([]); }}
            style={{ borderRadius: 10, height: 38, fontSize: 14, fontWeight: 600 }}>Hủy</Button>,
          <Button key="submit" type="primary" loading={formLoading} onClick={handleUpdate}
            icon={<Edit2 size={15} />}
            style={{ borderRadius: 10, height: 38, fontSize: 14, fontWeight: 600, background: "#f59e0b", borderColor: "#f59e0b" }}>
            Lưu thay đổi
          </Button>,
        ]}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 8 }}>
          <Spin spinning={editSpecLoading}>
            <ClinicFormFields
              specialtyOptions={allSpecialties.map((s) => ({ value: s._id, label: s.name }))}
            />
          </Spin>
        </Form>
      </Modal>

      {/* ══ MODAL: Detail ══════════════════════════════════ */}
      <Modal
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setSelected(null); setDetailSpecialties([]); }}
        width={620}
        footer={null}
        title={
          selected && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Building2 size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: "#9ca3af", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                  <MapPin size={11} /> {selected.address}
                </div>
              </div>
            </div>
          )
        }
      >
        {selected && (
          <>
            {/* Info row */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, marginTop: 4 }}>
              <div style={{ flex: 1, background: "#f9fafb", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Điện thoại</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#1f2937", display: "flex", alignItems: "center", gap: 6 }}>
                  <Phone size={14} color="#6b7280" /> {selected.phone || "—"}
                </div>
              </div>
              <div style={{ flex: 1, background: "#eef2ff", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Chuyên khoa</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#6366f1" }}>{selected.specialties?.length || 0}</div>
              </div>
              <div style={{ flex: 1, background: "#ecfdf5", borderRadius: 12, padding: "14px 16px" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Bác sĩ</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#10b981" }}>{selected.doctors?.length || 0}</div>
              </div>
            </div>

            {/* Description */}
            {selected.description && (
              <div style={{ background: "#f9fafb", borderRadius: 10, padding: "12px 14px", marginBottom: 20, fontSize: 13, color: "#4b5563", lineHeight: 1.6 }}>
                {selected.description}
              </div>
            )}

            {/* Specialties */}
            <Divider orientation="left" style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", margin: "0 0 14px" }}>
              <Stethoscope size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Chuyên khoa
            </Divider>

            {detailLoading ? (
              <div style={{ textAlign: "center", padding: "16px 0" }}><Spin /></div>
            ) : detailSpecialties.length ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {detailSpecialties.map((s) => (
                  <Tag key={s._id} color="purple"
                    style={{ borderRadius: 20, fontSize: 13, fontWeight: 600, padding: "4px 14px" }}>
                    {s.name}
                  </Tag>
                ))}
              </div>
            ) : (
              <div style={{ marginBottom: 20 }}>
                <Empty description="Chưa có chuyên khoa" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </div>
            )}

            {/* Doctors */}
            <Divider orientation="left" style={{ fontSize: 13, fontWeight: 700, color: "#1f2937", margin: "0 0 14px" }}>
              <Users size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Bác sĩ đang hoạt động
            </Divider>

            {selected.doctors?.length ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {selected.doctors.map((doc) => (
                  <div key={doc._id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "#f9fafb", borderRadius: 12, padding: "12px 14px",
                  }}>
                    <Avatar size={38} style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                      {doc.fullName?.[0] || "D"}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: "#1f2937", fontSize: 14 }}>{doc.fullName}</div>
                      <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>{doc.email}</div>
                    </div>
                    {doc.specialty?.name && (
                      <Tag color="blue" style={{ borderRadius: 20, fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                        {doc.specialty.name}
                      </Tag>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Empty description="Chưa có bác sĩ" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default ClinicList;
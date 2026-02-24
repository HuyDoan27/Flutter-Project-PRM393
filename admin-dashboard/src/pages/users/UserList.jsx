import {
    Avatar,
    Button,
    Card,
    Divider,
    Empty,
    Input,
    Modal,
    Table,
    Tag
} from "antd";
import {
    Calendar, ClipboardList,
    Eye, Mail, Phone, Shield,
    Stethoscope,
    User
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getUsers, getUsersWithAppointments } from "../../services/UserService.js";

// ─── Config ─────────────────────────────────────────────────
const ROLE_CFG = {
    user: { label: "User", tagColor: "blue", icon: <User size={13} /> },
    doctor: { label: "Bác sĩ", tagColor: "purple", icon: <Stethoscope size={13} /> },
    admin: { label: "Admin", tagColor: "gold", icon: <Shield size={13} /> },
};

const APPT_STATUS_CFG = {
    pending: { label: "Chờ xác nhận", color: "orange" },
    confirmed: { label: "Đã xác nhận", color: "blue" },
    completed: { label: "Hoàn thành", color: "green" },
    cancelled: { label: "Đã hủy", color: "red" },
};

const TABS = [
    { key: "all", label: "Tất cả" },
    { key: "user", label: "User" },
    { key: "doctor", label: "Bác sĩ" },
    { key: "admin", label: "Admin" },
];

const PAGE_SIZE = 10;

const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("vi-VN", {
        day: "2-digit", month: "2-digit", year: "numeric",
    });
};

// ─── Component ───────────────────────────────────────────────
const UserList = () => {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState(""); // input buffer
    const [page, setPage] = useState(1);

    // detail modal
    const [detailOpen, setDetailOpen] = useState(false);
    const [selected, setSelected] = useState(null);       // từ table row
    const [apptData, setApptData] = useState(null);       // từ getUsersWithAppointments
    const [apptLoading, setApptLoading] = useState(false);

    // ── Fetch users ──────────────────────────────────────────
    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const params = { page, limit: PAGE_SIZE };
            if (activeTab !== "all") params.role = activeTab;
            if (search) params.search = search;
            const res = await getUsers(params);
            setUsers(res.data.data);
            setTotal(res.data.total);
        } catch (err) {
            console.error("Load users failed", err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, search, page]);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    // ── Tab change ───────────────────────────────────────────
    const handleTabChange = (key) => {
        setActiveTab(key);
        setSearch("");
        setSearchInput("");
        setPage(1);
    };

    // ── Search: trigger khi nhấn Enter hoặc clear ────────────
    const handleSearch = (value) => {
        setSearch(value);
        setPage(1);
    };

    // ── Open detail ──────────────────────────────────────────
    const handleViewDetail = async (record) => {
        setSelected(record);
        setDetailOpen(true);
        setApptData(null);

        // Nếu là role=user thì fetch appointments
        if (record.role === "user") {
            try {
                setApptLoading(true);
                const res = await getUsersWithAppointments();
                // tìm user này trong danh sách
                const found = res.data.data.find((u) => u._id === record._id);
                setApptData(found || null);
            } catch (err) {
                console.error("Fetch appointments failed", err);
            } finally {
                setApptLoading(false);
            }
        }
    };

    // ── Table columns ────────────────────────────────────────
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
            title: "Người dùng", key: "person",
            render: (_, r) => (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <Avatar size={38} src={r.avatar}
                        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>
                        {!r.avatar && (r.fullName?.[0] || "U")}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 600, color: "#1f2937", fontSize: 14 }}>{r.fullName || "—"}</div>
                        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>{r.email || "—"}</div>
                    </div>
                </div>
            ),
        },
        {
            title: "Số điện thoại", dataIndex: "phoneNumber", key: "phoneNumber",
            render: (v) => <span style={{ fontSize: 13, color: "#4b5563" }}>{v || "—"}</span>,
        },
        {
            title: "Role", dataIndex: "role", key: "role",
            render: (role) => {
                const cfg = ROLE_CFG[role] || ROLE_CFG.user;
                return (
                    <Tag color={cfg.tagColor}
                        style={{ fontSize: 12, fontWeight: 600, borderRadius: 20, padding: "2px 10px", display: "inline-flex", alignItems: "center", gap: 5 }}>
                        {cfg.icon} {cfg.label}
                    </Tag>
                );
            },
        },
        {
            title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt",
            render: (v) => <span style={{ fontSize: 13, color: "#6b7280" }}>{fmtDate(v)}</span>,
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

    // ── Appointment table columns (bên trong detail modal) ───
    const apptColumns = [
        {
            title: "Bác sĩ", dataIndex: "doctor", key: "doctor",
            render: (v) => <span style={{ fontWeight: 600, fontSize: 13 }}>{v || "—"}</span>,
        },
        {
            title: "Phòng khám", dataIndex: "clinic", key: "clinic",
            render: (v) => <span style={{ fontSize: 13 }}>{v || "—"}</span>,
        },
        {
            title: "Ngày khám", dataIndex: "appointmentDate", key: "date",
            render: (v) => <span style={{ fontSize: 13 }}>{fmtDate(v)}</span>,
        },
        {
            title: "Trạng thái", dataIndex: "status", key: "status",
            render: (status) => {
                const cfg = APPT_STATUS_CFG[status] || { label: status, color: "default" };
                return <Tag color={cfg.color} style={{ borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{cfg.label}</Tag>;
            },
        },
    ];

    // ════════════════════════════════════════════════════════
    return (
        <div style={{ padding: "28px 32px", background: "#f3f4f6", minHeight: "100%" }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", margin: 0 }}>Người dùng</h1>
                    <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>Quản lý tài khoản trong hệ thống</p>
                </div>
                <div style={{
                    background: "#fff", borderRadius: 12, padding: "10px 20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)", border: "1px solid #e5e7eb",
                    display: "flex", alignItems: "center", gap: 8,
                }}>
                    <User size={16} color="#6366f1" />
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>{total}</span>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>tổng tài khoản</span>
                </div>
            </div>

            {/* Tabs + Search */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                {/* Tabs */}
                <div style={{
                    display: "flex", alignItems: "center", gap: 4,
                    background: "#fff", borderRadius: 12, padding: 4,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb",
                }}>
                    {TABS.map((tab) => {
                        const active = activeTab === tab.key;
                        return (
                            <Button key={tab.key} type="text" onClick={() => handleTabChange(tab.key)}
                                style={{
                                    background: active ? "#6366f1" : "transparent",
                                    color: active ? "#fff" : "#6b7280",
                                    borderRadius: 8, height: 34, fontSize: 13, fontWeight: 600,
                                    border: "none", padding: "0 16px",
                                }}>
                                {tab.label}
                            </Button>
                        );
                    })}
                </div>

                {/* Search — gửi lên BE khi Enter */}
                <Input.Search
                    placeholder="Tìm tên, email, số điện thoại..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onSearch={handleSearch}
                    allowClear
                    onClear={() => handleSearch("")}
                    style={{ width: 280, borderRadius: 10 }}
                />
            </div>

            {/* Table */}
            <Card bordered={false} style={{ borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }} bodyStyle={{ padding: 0 }}>
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="_id"
                    loading={loading}
                    pagination={{
                        current: page,
                        pageSize: PAGE_SIZE,
                        total,
                        onChange: (p) => setPage(p),
                        showTotal: (t) => `Tổng ${t} người dùng`,
                        style: { padding: "16px 24px 8px" },
                    }}
                    locale={{ emptyText: <Empty description="Không có người dùng nào" /> }}
                />
            </Card>

            {/* ── Detail Modal ─────────────────────────────────── */}
            <Modal
                open={detailOpen}
                onCancel={() => setDetailOpen(false)}
                width={600}
                footer={null}
                style={{ borderRadius: 20 }}
                title={
                    selected && (
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
                            <Avatar size={46} src={selected.avatar}
                                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", fontSize: 18, fontWeight: 700, flexShrink: 0 }}>
                                {!selected.avatar && (selected.fullName?.[0] || "U")}
                            </Avatar>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{selected.fullName}</div>
                                <Tag color={ROLE_CFG[selected.role]?.tagColor}
                                    style={{ fontSize: 11, fontWeight: 600, borderRadius: 20, marginTop: 3, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                    {ROLE_CFG[selected.role]?.icon} {ROLE_CFG[selected.role]?.label}
                                </Tag>
                            </div>
                        </div>
                    )
                }
            >
                {selected && (
                    <>
                        {/* Thông tin cơ bản */}
                        {[
                            { icon: <Mail size={16} />, label: "Email", value: selected.email || "—" },
                            { icon: <Phone size={16} />, label: "Điện thoại", value: selected.phoneNumber || "—" },
                            { icon: <Calendar size={16} />, label: "Ngày tạo", value: fmtDate(selected.createdAt) },
                        ].map(({ icon, label, value }, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                                <div style={{
                                    width: 34, height: 34, borderRadius: 8, background: "#f3f4f6",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    flexShrink: 0, color: "#6b7280",
                                }}>{icon}</div>
                                <div>
                                    <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
                                    <div style={{ fontSize: 14, color: "#1f2937", fontWeight: 500, marginTop: 1 }}>{value}</div>
                                </div>
                            </div>
                        ))}

                        {/* Lịch khám — chỉ hiện với role=user */}
                        {selected.role === "user" && (
                            <>
                                <Divider style={{ margin: "16px 0 14px" }} />
                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                                    <ClipboardList size={16} color="#6366f1" />
                                    <span style={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>
                                        Lịch khám
                                    </span>
                                    {apptData && (
                                        <Tag color="blue" style={{ borderRadius: 20, fontWeight: 700, fontSize: 12 }}>
                                            {apptData.totalAppointments} lịch
                                        </Tag>
                                    )}
                                </div>

                                {apptLoading ? (
                                    <div style={{ textAlign: "center", padding: "24px 0", color: "#9ca3af" }}>Đang tải...</div>
                                ) : apptData?.appointments?.length ? (
                                    <Table
                                        columns={apptColumns}
                                        dataSource={apptData.appointments}
                                        rowKey="appointmentId"
                                        size="small"
                                        pagination={apptData.appointments.length > 5
                                            ? { pageSize: 5, size: "small" }
                                            : false
                                        }
                                        style={{ borderRadius: 10, overflow: "hidden" }}
                                    />
                                ) : (
                                    <Empty description="Chưa có lịch khám nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                )}
                            </>
                        )}
                    </>
                )}
            </Modal>
        </div>
    );
};

export default UserList;
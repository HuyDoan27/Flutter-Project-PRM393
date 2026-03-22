import React, { useState } from "react";
import { X, UserPlus } from "lucide-react";
import { Spin } from "antd";

const FIELDS = [
  { key: "fullName",      label: "Tên bác sĩ",       placeholder: "Nguyễn Văn A",     required: true },
  { key: "email",         label: "Email",             placeholder: "bac.si@mail.com",   required: true },
  { key: "phoneNumber",   label: "Số điện thoại",     placeholder: "0912345678" },
  { key: "clinicName",    label: "Tên phòng khám",    placeholder: "Phòng khám ABC" },
  { key: "clinicAddress", label: "Địa chỉ phòng khám",placeholder: "123 Hàng Bông, HN" },
];

const DoctorCreateModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({ fullName: "", email: "", phoneNumber: "", clinicName: "", clinicAddress: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleChange = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    if (error) setError("");
  };

  const handleSubmit = async () => {
    // basic validation
    if (!form.fullName.trim()) return setError("Tên bác sĩ là bắt buộc.");
    if (!form.email.trim())    return setError("Email là bắt buộc.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      return setError("Email không hợp lệ.");

    setSubmitting(true);
    setError("");
    try {
      await onSubmit(form);
      // reset
      setForm({ fullName: "", email: "", phoneNumber: "", clinicName: "", clinicAddress: "" });
    } catch (err) {
      // backend trả message
      setError(err?.response?.data?.message || "Tạo bác sĩ thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* Overlay */
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
        zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, width: 460, maxWidth: "90vw",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "22px 24px 0",
        }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <UserPlus size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#111827" }}>Thêm bác sĩ mới</h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#9ca3af" }}>Trạng thái sẽ là "Chờ duyệt"</p>
            </div>
          </div>

          <button onClick={onClose} style={{
            background: "#f3f4f6", border: "none", borderRadius: 8,
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#6b7280",
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: "18px 24px 0" }}>
          {FIELDS.map(({ key, label, placeholder, required }) => (
            <div key={key} style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4b5563", marginBottom: 5 }}>
                {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
              </label>
              <input
                type={key === "email" ? "email" : "text"}
                placeholder={placeholder}
                value={form[key]}
                onChange={(e) => handleChange(key, e.target.value)}
                style={{
                  width: "100%", padding: "9px 12px", boxSizing: "border-box",
                  border: "1px solid #e5e7eb", borderRadius: 10,
                  fontSize: 14, color: "#111827", background: "#fafafa",
                  outline: "none", transition: "border 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>
          ))}

          {/* Error */}
          {error && (
            <div style={{
              padding: "10px 12px", borderRadius: 8,
              background: "#fef2f2", border: "1px solid #fecaca",
              fontSize: 13, color: "#dc2626", marginBottom: 4,
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, padding: "18px 24px 22px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "10px 0", border: "1px solid #e5e7eb", borderRadius: 10,
              background: "#fff", color: "#6b7280",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}
          >
            Hủy
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              flex: 2, padding: "10px 0", border: "none", borderRadius: 10,
              background: submitting ? "#a5b4fc" : "#6366f1", color: "#fff",
              fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
            }}
          >
            {submitting ? <Spin size="small" style={{ color: "#fff" }} /> : <><UserPlus size={16} /> Tạo bác sĩ</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorCreateModal;
import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Spin } from "antd";

const RejectModal = ({ open, doctorName, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleConfirm = async () => {
    if (!reason.trim()) return setError("Bắt buộc nhập lý do từ chối.");
    setSubmitting(true);
    setError("");
    try {
      await onConfirm(reason.trim());
      setReason("");
    } catch (err) {
      setError(err?.response?.data?.message || "Từ chối thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
        zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 18, width: 420, maxWidth: "90vw",
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)", overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "22px 22px 0", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <AlertTriangle size={20} color="#ef4444" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111827" }}>Từ chối bác sĩ</h2>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: "#9ca3af" }}>{doctorName}</p>
            </div>
          </div>

          <button onClick={onClose} style={{
            background: "#f3f4f6", border: "none", borderRadius: 8,
            width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#6b7280",
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 22px 0" }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#4b5563", marginBottom: 6 }}>
            Lý do từ chối <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <textarea
            rows={3}
            placeholder="Nhập lý do từ chối..."
            value={reason}
            onChange={(e) => { setReason(e.target.value); if (error) setError(""); }}
            style={{
              width: "100%", padding: "10px 12px", boxSizing: "border-box",
              border: "1px solid #e5e7eb", borderRadius: 10,
              fontSize: 14, color: "#111827", background: "#fafafa",
              resize: "vertical", outline: "none", fontFamily: "inherit",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#ef4444")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />

          {error && (
            <div style={{
              marginTop: 8, padding: "8px 12px", borderRadius: 8,
              background: "#fef2f2", border: "1px solid #fecaca",
              fontSize: 13, color: "#dc2626",
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, padding: "18px 22px 20px" }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "9px 0", border: "1px solid #e5e7eb", borderRadius: 10,
              background: "#fff", color: "#6b7280",
              fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}
          >
            Hủy
          </button>

          <button
            onClick={handleConfirm}
            disabled={submitting}
            style={{
              flex: 1.5, padding: "9px 0", border: "none", borderRadius: 10,
              background: submitting ? "#fca5a5" : "#ef4444", color: "#fff",
              fontSize: 14, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              boxShadow: "0 2px 6px rgba(239,68,68,0.3)",
            }}
          >
            {submitting ? <Spin size="small" style={{ color: "#fff" }} /> : "Xác nhận từ chối"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
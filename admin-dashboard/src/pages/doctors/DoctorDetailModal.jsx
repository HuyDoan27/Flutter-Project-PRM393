import React from "react";
import { X, CheckCircle, XCircle, Mail, Phone, MapPin, Stethoscope } from "lucide-react";

const STATUS_MAP = {
  1: { label: "Đã duyệt",  color: "#10b981", bg: "#ecfdf5" },
  2: { label: "Chờ duyệt", color: "#f59e0b", bg: "#fffbeb" },
  3: { label: "Từ chối",   color: "#ef4444", bg: "#fef2f2" },
};

const DoctorDetailModal = ({ open, doctor, onClose, onApprove, onReject }) => {
  if (!open || !doctor) return null;

  const status = STATUS_MAP[doctor.status] || STATUS_MAP[2];

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
          background: "#fff", borderRadius: 20, width: 480, maxWidth: "90vw",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          padding: "24px 24px 0",
        }}>
          <div className="flex items-center gap-4">
            {/* Avatar placeholder */}
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 20, fontWeight: 700,
            }}>
              {doctor.fullName?.[0] || "D"}
            </div>

            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>
                {doctor.fullName}
              </h2>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 12, fontWeight: 600,
                color: status.color, background: status.bg,
                padding: "3px 10px", borderRadius: 20, marginTop: 4,
              }}>
                {status.label}
              </span>
            </div>
          </div>

          {/* Close btn */}
          <button onClick={onClose} style={{
            background: "#f3f4f6", border: "none", borderRadius: 8,
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", color: "#6b7280",
          }}>
            <X size={18} />
          </button>
        </div>

        {/* ── Info rows ── */}
        <div style={{ padding: "20px 24px" }}>
          {[
            { icon: Stethoscope, label: "Chuyên khoa",   value: doctor.specialty?.name || "—" },
            { icon: Mail,        label: "Email",          value: doctor.email || "—" },
            { icon: Phone,       label: "Điện thoại",     value: doctor.phoneNumber || "—" },
            { icon: MapPin,      label: "Phòng khám",     value: doctor.clinicName || "—" },
            { icon: MapPin,      label: "Địa chỉ",        value: doctor.clinicAddress || "—" },
          ].map(({ icon: Icon, label, value }, i) => (
            <div key={i} className="flex items-start gap-3" style={{ marginBottom: 14 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Icon size={16} style={{ color: "#6b7280" }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {label}
                </div>
                <div style={{ fontSize: 14, color: "#1f2937", fontWeight: 500, marginTop: 1 }}>
                  {value}
                </div>
              </div>
            </div>
          ))}

          {/* Lý do từ chối — chỉ hiển khi status = 3 */}
          {doctor.status === 3 && doctor.rejectReason && (
            <div style={{
              marginTop: 8, padding: "12px 14px", borderRadius: 10,
              background: "#fef2f2", border: "1px solid #fecaca",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                Lý do từ chối
              </div>
              <div style={{ fontSize: 13, color: "#991b1b" }}>{doctor.rejectReason}</div>
            </div>
          )}
        </div>

        {/* ── Footer actions (chỉ hiển khi pending) ── */}
        {doctor.status === 2 && (
          <div style={{
            display: "flex", gap: 10, padding: "0 24px 22px",
          }}>
            <button
              onClick={onApprove}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "10px 0", border: "none", borderRadius: 10,
                background: "#10b981", color: "#fff",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                boxShadow: "0 2px 6px rgba(16,185,129,0.3)",
              }}
            >
              <CheckCircle size={17} /> Duyệt
            </button>

            <button
              onClick={onReject}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "10px 0", border: "none", borderRadius: 10,
                background: "#ef4444", color: "#fff",
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                boxShadow: "0 2px 6px rgba(239,68,68,0.3)",
              }}
            >
              <XCircle size={17} /> Từ chối
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorDetailModal;
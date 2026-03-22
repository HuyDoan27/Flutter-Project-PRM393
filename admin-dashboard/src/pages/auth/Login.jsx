import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../../services/AuthService.js";
import { useState } from "react";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    const { email, password } = values;
    setLoading(true);
    try {
      const res = await loginApi(email, password);
      const { user, token } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      localStorage.setItem("user", JSON.stringify(user));

      message.success("Đăng nhập thành công!");

      if (user.role === "admin") navigate("/admin");
      else if (user.role === "doctor") navigate("/doctor");
      else navigate("/");
    } catch (err) {
      const msg = err.response?.data?.message || "Đăng nhập thất bại";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          display: flex;
          transform: translateX(55%);
=          font-family: 'DM Sans', sans-serif;
        }

        /* ── Left panel ── */
        .login-left {
          flex: 1.1;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 52px 56px;
          overflow: hidden;
          background: #060b14;
        }

        .login-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 10%, rgba(14,165,233,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(99,102,241,0.12) 0%, transparent 55%);
          pointer-events: none;
        }

        /* Grid lines */
        .login-left::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(14,165,233,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(14,165,233,0.06) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .left-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 2;
          animation: fadeSlideDown 0.7s ease both;
        }

        .logo-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0ea5e9, #6366f1);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 24px rgba(14,165,233,0.4);
        }

        .logo-text {
          font-family: 'Instrument Serif', serif;
          font-size: 22px;
          color: #f1f5f9;
          letter-spacing: 0.01em;
        }

        .left-hero {
          position: relative;
          z-index: 2;
          animation: fadeSlideUp 0.9s ease 0.1s both;
        }

        .left-hero h1 {
          font-family: 'Instrument Serif', serif;
          font-size: clamp(36px, 4vw, 52px);
          line-height: 1.15;
          color: #f1f5f9;
          margin-bottom: 18px;
          font-weight: 400;
        }

        .left-hero h1 em {
          font-style: italic;
          color: #38bdf8;
        }

        .left-hero p {
          font-size: 15px;
          color: #64748b;
          line-height: 1.7;
          max-width: 340px;
          font-weight: 300;
        }

        .stat-row {
          display: flex;
          gap: 28px;
          margin-top: 44px;
          position: relative;
          z-index: 2;
          animation: fadeSlideUp 0.9s ease 0.2s both;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 16px 20px;
          border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(10px);
          min-width: 100px;
        }

        .stat-num {
          font-family: 'Instrument Serif', serif;
          font-size: 26px;
          color: #38bdf8;
          line-height: 1;
        }

        .stat-label {
          font-size: 11px;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 500;
        }

        /* Floating orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          z-index: 1;
        }
        .orb-1 {
          width: 280px; height: 280px;
          background: rgba(14,165,233,0.12);
          top: 30%; left: 40%;
          animation: float 8s ease-in-out infinite;
        }
        .orb-2 {
          width: 200px; height: 200px;
          background: rgba(99,102,241,0.1);
          top: 60%; left: 20%;
          animation: float 11s ease-in-out infinite reverse;
        }

        /* ── Right panel ── */
        .login-right {
          width: 440px;
          flex-shrink: 0;
          background: #0d1520;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 52px 48px;
          position: relative;
          border-left: 1px solid rgba(255,255,255,0.06);
          animation: fadeIn 0.6s ease both;
        }

        .login-right::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #0ea5e9, #6366f1, #0ea5e9);
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }

        .form-box {
          width: 100%;
        }

        .form-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(14,165,233,0.12);
          border: 1px solid rgba(14,165,233,0.25);
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 11px;
          color: #38bdf8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 24px;
        }

        .form-tag span.dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #38bdf8;
          animation: pulse 2s ease infinite;
        }

        .form-title {
          font-family: 'Instrument Serif', serif;
          font-size: 32px;
          color: #f1f5f9;
          margin-bottom: 6px;
          font-weight: 400;
        }

        .form-subtitle {
          font-size: 13px;
          color: #475569;
          margin-bottom: 36px;
          font-weight: 300;
        }

        /* Ant overrides */
        .login-form .ant-form-item-label > label {
          color: #94a3b8 !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.07em !important;
          font-family: 'DM Sans', sans-serif !important;
        }

        .login-form .ant-input,
        .login-form .ant-input-password {
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 12px !important;
          color: #f1f5f9 !important;
          height: 48px !important;
          font-size: 14px !important;
          font-family: 'DM Sans', sans-serif !important;
          transition: border-color 0.2s, box-shadow 0.2s !important;
          padding: 0 16px !important;
        }

        .login-form .ant-input-password {
          padding: 0 !important;
        }

        .login-form .ant-input-password .ant-input {
          height: 46px !important;
          border: none !important;
          background: transparent !important;
          padding-left: 16px !important;
        }

        .login-form .ant-input::placeholder,
        .login-form .ant-input-password input::placeholder {
          color: #334155 !important;
        }

        .login-form .ant-input:focus,
        .login-form .ant-input-password:focus-within {
          border-color: #0ea5e9 !important;
          box-shadow: 0 0 0 3px rgba(14,165,233,0.15) !important;
        }

        .login-form .ant-input-password .ant-input-suffix {
          margin-right: 12px;
        }

        .login-form .ant-input-password .ant-input-suffix .anticon {
          color: #475569 !important;
        }

        .login-form .ant-form-item-explain-error {
          font-size: 12px !important;
          color: #f87171 !important;
          font-family: 'DM Sans', sans-serif !important;
        }

        .login-btn {
          width: 100% !important;
          height: 50px !important;
          border-radius: 12px !important;
          font-size: 14px !important;
          font-weight: 600 !important;
          letter-spacing: 0.03em !important;
          background: linear-gradient(135deg, #0ea5e9, #6366f1) !important;
          border: none !important;
          font-family: 'DM Sans', sans-serif !important;
          cursor: pointer !important;
          position: relative !important;
          overflow: hidden !important;
          transition: opacity 0.2s, transform 0.15s !important;
          box-shadow: 0 4px 24px rgba(14,165,233,0.3) !important;
        }

        .login-btn:hover:not(:disabled) {
          opacity: 0.92 !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 8px 32px rgba(14,165,233,0.4) !important;
        }

        .login-btn:active {
          transform: translateY(0) !important;
        }

        .hint-box {
          margin-top: 24px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
        }

        .hint-box p {
          font-size: 12px;
          color: #334155;
          line-height: 1.8;
          font-family: 'DM Sans', sans-serif;
        }

        .hint-box code {
          background: rgba(14,165,233,0.1);
          color: #38bdf8;
          padding: 1px 6px;
          border-radius: 4px;
          font-size: 11px;
        }

        /* Animations */
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50%       { transform: translate(20px, -20px); }
        }
        @keyframes shimmer {
          0%   { background-position: 0% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }

        @media (max-width: 768px) {
          .login-left { display: none; }
          .login-right { width: 100%; padding: 40px 28px; }
        }
      `}</style>

      <div className="login-root">
        {/* ── Left panel ── */}
        <div className="login-left">
          <div className="orb orb-1" />
          <div className="orb orb-2" />

          <div className="left-logo">
            <div className="logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="logo-text">MediCare Pro</span>
          </div>

          <div className="left-hero">
            <h1>
              Chăm sóc sức khoẻ<br />
              thế hệ <em>mới</em>
            </h1>
            <p>
              Nền tảng quản lý y tế toàn diện — kết nối bác sĩ, bệnh nhân và phòng khám trong một hệ sinh thái thống nhất.
            </p>

            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-num">2.4k</span>
                <span className="stat-label">Bệnh nhân</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">186</span>
                <span className="stat-label">Bác sĩ</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">98%</span>
                <span className="stat-label">Hài lòng</span>
              </div>
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 2, fontSize: 12, color: "#1e293b", animation: "fadeSlideUp 0.9s ease 0.3s both" }}>
            © 2026 MediCare Pro. All rights reserved.
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="login-right">
          <div className="form-box">
            <div className="form-tag">
              <span className="dot" />
              Hệ thống đang hoạt động
            </div>

            <h2 className="form-title">Đăng nhập</h2>
            <p className="form-subtitle">Chào mừng trở lại. Vui lòng xác thực tài khoản.</p>

            <Form layout="vertical" onFinish={onFinish} className="login-form">
              <Form.Item label="Email" name="email" rules={[{ required: true, type: "email", message: "Vui lòng nhập email hợp lệ" }]}>
                <Input placeholder="example@email.com" />
              </Form.Item>

              <Form.Item
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                style={{ marginBottom: 28 }}
              >
                <Input.Password placeholder="Nhập mật khẩu" />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  className="login-btn"
                >
                  {loading ? "Đang xác thực..." : "Đăng nhập"}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
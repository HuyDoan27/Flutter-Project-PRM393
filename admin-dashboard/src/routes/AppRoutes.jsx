import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import AdminRoutes from "./AdminRoutes";
import DoctorRoutes from "./DoctorRoutes";

const AppRoutes = () => (
  <Routes>
    {/* ✅ Mặc định vào login */}
    <Route path="/" element={<Navigate to="/login" replace />} />

    <Route path="/login" element={<Login />} />

    {AdminRoutes}
    {DoctorRoutes}

    {/* ✅ Nếu nhập sai URL */}
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRoutes;
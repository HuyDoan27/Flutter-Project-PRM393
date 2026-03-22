import { Route } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import Dashboard from "../pages/admin/dashboard/Dashboard";
import DoctorList from "../pages/admin/doctors/DoctorList";
import AppointmentList from "../pages/admin/appointments/AppoinmentList";
import UserList from "../pages/admin/users/UserList";
import ClinicList from "../pages/admin/clinic/ClinicList";
import ProtectedRoute from "./ProtectedRoutes";

const AdminRoutes = (
    <Route
        path="/admin"
        element={
            <ProtectedRoute role="admin">
                <AdminLayout />
            </ProtectedRoute>
        }
    >
        <Route index element={<Dashboard />} />
        <Route path="/admin/doctors" element={<DoctorList />} />
        <Route path="/admin/users" element={<UserList />} />
        <Route path="/admin/clinics" element={<ClinicList />} />
        <Route path="/admin/appointments" element={<AppointmentList />} />
    </Route>
);

export default AdminRoutes;
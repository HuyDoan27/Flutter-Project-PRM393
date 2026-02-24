import { Routes, Route } from "react-router-dom";
import AdminLayout from "../components/layout/AdminLayout";
import Dashboard from "../pages/dashboard/Dashboard";
import DoctorList from "../pages/doctors/DoctorList";
import UserList from "../pages/users/UserList";
import ClinicList from "../pages/clinic/ClinicList";
import AppointmentList from "../pages/appointments/AppoinmentList";

const AppRoutes = () => (
  <Routes>
    <Route element={<AdminLayout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/doctors" element={<DoctorList />} />
      <Route path="/users" element={<UserList/>}/>
      <Route path="/clinics" element={<ClinicList />} />
      <Route path="/appointments" element={<AppointmentList />} />
    </Route>
  </Routes>
);

export default AppRoutes;
  
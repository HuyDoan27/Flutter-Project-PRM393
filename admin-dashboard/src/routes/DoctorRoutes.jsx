import { Route } from "react-router-dom";
import DoctorLayout from "../components/layout/DoctorLayout";
import DoctorAppointments from "../pages/doctor/appointments/DoctorAppointments";

import ProtectedRoute from "./ProtectedRoutes";

const DoctorRoutes = (
    <Route
        path="/doctor"
        element={
            <ProtectedRoute role="doctor">
                <DoctorLayout />
            </ProtectedRoute>
        }
    >
        <Route index element={<DoctorAppointments />} />
    </Route>
);

export default DoctorRoutes;
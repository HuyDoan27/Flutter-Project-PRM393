import { Outlet } from "react-router-dom";
import DoctorSidebar from "./DoctorSidebar";

function DoctorLayout() {
  return (
    <div className="flex h-screen w-[100vw] bg-gray-100">
      <DoctorSidebar />
      <div style={{ flex: 1, padding: 20 }}>
        <Outlet />
      </div>
    </div>
  );
}

export default DoctorLayout;
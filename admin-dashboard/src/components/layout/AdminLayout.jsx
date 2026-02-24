import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AdminLayout = () => {
  return (
    <div className="flex h-screen w-[100vw] bg-gray-100">
      <Sidebar />

      {/* Outlet chiếm toàn bộ không gian còn lại, scroll độc lập */}
      <div className="flex-1 overflow-y-auto flex flex-col min-h-screen">
        <div className="flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';

import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import EmployeeForm from './pages/EmployeeForm';
import DepartmentList from './pages/DepartmentList';
import DepartmentForm from './pages/DepartmentForm';
import PayrollList from './pages/PayrollList';
import PayrollForm from './pages/PayrollForm';
import RequestList from './pages/RequestList';
import RequestForm from './pages/RequestForm';
import Sidebar from './components/Sidebar';
import AttendanceList from './pages/attendanceList';
import Report from './pages/Report';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      {user && <Sidebar />}

      <div style={{ flexGrow: 1, marginLeft: user ? '250px' : 0, transition: 'margin 0.3s' }}>
        <Routes>
          <Route
            path="/dangnhap"
            element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
          />

          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/dangnhap" replace />}
          />

          {/* --- NHÓM QUYỀN HR (QUẢN LÝ) --- */}
          <Route path="/nhanvien" element={user?.role === 'HR' ? <EmployeeList /> : <Navigate to="/dangnhap" />} />
          <Route path="/nhanvien/them" element={user?.role === 'HR' ? <EmployeeForm /> : <Navigate to="/dangnhap" />} />
          <Route path="/nhanvien/:id/sua" element={user?.role === 'HR' ? <EmployeeForm /> : <Navigate to="/dangnhap" />} />
          <Route path="/baocao" element={user?.role === 'HR' ? <Report /> : <Navigate to="/dashboard" />} />
          <Route path="/phongban" element={user?.role === 'HR' ? <DepartmentList /> : <Navigate to="/dangnhap" />} />
          <Route path="/phongban/them" element={user?.role === 'HR' ? <DepartmentForm /> : <Navigate to="/dangnhap" />} />
          <Route path="/phongban/:id/sua" element={user?.role === 'HR' ? <DepartmentForm /> : <Navigate to="/dangnhap" />} />

          <Route path="/bangluong/them" element={user?.role === 'HR' ? <PayrollForm /> : <Navigate to="/dangnhap" />} />
          <Route path="/bangluong/:id/sua" element={user?.role === 'HR' ? <PayrollForm /> : <Navigate to="/dangnhap" />} />

          {/* --- NHÓM DÙNG CHUNG (HR & EMP) --- */}
          <Route path="/bangluong" element={user ? <PayrollList /> : <Navigate to="/dangnhap" />} />
          <Route path="/dontu" element={user ? <RequestList /> : <Navigate to="/dangnhap" />} />

          {/* --- NHÓM QUYỀN EMP (NHÂN VIÊN) --- */}
          <Route path="/dontu/them" element={user?.role === 'EMP' ? <RequestForm /> : <Navigate to="/dangnhap" />} />
          <Route path="/chamcong" element={user ? <AttendanceList /> : <Navigate to="/dangnhap" />} />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/dangnhap"} replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
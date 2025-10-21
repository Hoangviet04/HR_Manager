/* giaodien/src/App.js */
import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/Login';
import EmployeeList from './pages/EmployeeList';
import EmployeeForm from './pages/EmployeeForm';
import DepartmentList from './pages/DepartmentList';
import DepartmentForm from './pages/DepartmentForm';
import PayrollList from './pages/PayrollList';
import PayrollForm from './pages/PayrollForm';
import RequestList from './pages/RequestList';
import RequestForm from './pages/RequestForm';
import NavBar from './components/NavBar';

function App() {
  // Khởi tạo state currentUser từ localStorage nếu có (giữ đăng nhập sau refresh)
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Xử lý khi đăng nhập thành công (nhận user và token, lưu và cập nhật state)
  const handleLoginSuccess = (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentUser(user);
  };

  return (
    <div>
      {/* Hiển thị thanh NavBar nếu đã đăng nhập */}
      {currentUser && <NavBar user={currentUser} onLogout={handleLogout} />}
      <div className="container mt-3">
        <Routes>
          {/* Trang đăng nhập (nếu đã login thì chuyển hướng về trang chính) */}
          <Route path="/dangnhap" element={currentUser ? <Navigate to={currentUser.role === 'HR' ? '/nhanvien' : '/dontu'} replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />} />
          {/* Các route chỉ dành cho HR */}
          <Route path="/nhanvien" element={currentUser && currentUser.role === 'HR' ? <EmployeeList /> : <Navigate to="/dangnhap" replace />} />
          <Route path="/nhanvien/them" element={currentUser && currentUser.role === 'HR' ? <EmployeeForm /> : <Navigate to="/dangnhap" replace />} />
          <Route path="/nhanvien/:id/sua" element={currentUser && currentUser.role === 'HR' ? <EmployeeForm /> : <Navigate to="/dangnhap" replace />} />
          <Route path="/phongban" element={currentUser && currentUser.role === 'HR' ? <DepartmentList /> : <Navigate to="/dangnhap" replace />} />
          <Route path="/phongban/them" element={currentUser && currentUser.role === 'HR' ? <DepartmentForm /> : <Navigate to="/dangnhap" replace />} />
          <Route path="/phongban/:id/sua" element={currentUser && currentUser.role === 'HR' ? <DepartmentForm /> : <Navigate to="/dangnhap" replace />} />
          <Route path="/bangluong/them" element={currentUser && currentUser.role === 'HR' ? <PayrollForm /> : <Navigate to="/dangnhap" replace />} />
          <Route path="/bangluong/:id/sua" element={currentUser && currentUser.role === 'HR' ? <PayrollForm /> : <Navigate to="/dangnhap" replace />} />
          {/* Các route dùng cho cả HR và nhân viên */}
          <Route path="/bangluong" element={currentUser ? <PayrollList /> : <Navigate to="/dangnhap" replace />} />
          <Route path="/dontu" element={currentUser ? <RequestList /> : <Navigate to="/dangnhap" replace />} />
          {/* Route gửi đơn từ chỉ cho nhân viên thường */}
          <Route path="/dontu/them" element={currentUser && currentUser.role === 'EMP' ? <RequestForm /> : <Navigate to="/dangnhap" replace />} />
          {/* Route mặc định: chuyển hướng tùy theo trạng thái đăng nhập */}
          <Route path="/" element={<Navigate to={currentUser ? (currentUser.role === 'HR' ? '/nhanvien' : '/dontu') : '/dangnhap'} replace />} />
          {/* Bất kỳ route không khớp nào khác */}
          <Route path="*" element={<Navigate to="/dangnhap" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

/* giaodien/src/components/NavBar.jsx */
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

function NavBar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Gọi hàm onLogout từ props để xóa trạng thái đăng nhập
    onLogout();
    // Chuyển hướng về trang đăng nhập
    navigate('/dangnhap');
  };

  return (
    <nav className="navbar navbar-expand navbar-dark bg-dark">
      <div className="container-fluid">
        {/* Thương hiệu hoặc tiêu đề ứng dụng */}
        <span className="navbar-brand">HRM</span>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/* Nếu là HR thì hiển thị menu quản lý đầy đủ */}
            {user.role === 'HR' ? (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/nhanvien">Nhân viên</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/phongban">Phòng ban</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/bangluong">Bảng lương</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/dontu">Đơn từ</NavLink>
                </li>
              </>
            ) : (
              // Nếu là nhân viên thường thì menu giới hạn
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/bangluong">Bảng lương</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/dontu">Đơn từ</NavLink>
                </li>
              </>
            )}
          </ul>
          {/* Thông tin người dùng và nút đăng xuất bên phải */}
          <span className="navbar-text me-3">Xin chào, {user.hoTen || user.username}</span>
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>Đăng xuất</button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;

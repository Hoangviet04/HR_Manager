/* giaodien/src/pages/Login.jsx */
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gọi API đăng nhập
      const response = await axios.post('/api/auth/login', { username, password });
      const { token, user } = response.data;
      // Gọi hàm onLoginSuccess từ App để cập nhật trạng thái đăng nhập
      onLoginSuccess(user, token);
      // Điều hướng người dùng đến trang phù hợp dựa trên vai trò
      if (user.role === 'HR') {
        navigate('/nhanvien');
      } else {
        navigate('/dontu');
      }
    } catch (error) {
      // Nếu lỗi (ví dụ sai tài khoản/mật khẩu), hiển thị thông báo
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert('Đăng nhập thất bại. Vui lòng thử lại.');
      }
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-4">
        <h3 className="text-center">Đăng nhập</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Tên đăng nhập</label>
            <input 
              type="text" 
              className="form-control" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Mật khẩu</label>
            <input 
              type="password" 
              className="form-control" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Đăng nhập</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;

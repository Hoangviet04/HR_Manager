/* giaodien/src/pages/EmployeeForm.jsx */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function EmployeeForm() {
  const { id } = useParams(); // Lấy tham số ID nhân viên từ URL (nếu có)
  const navigate = useNavigate();
  const isEdit = !!id; // có id => chế độ chỉnh sửa, không có => thêm mới

  // State cho thông tin nhân viên trên form
  const [employeeData, setEmployeeData] = useState({
    hoTen: '',
    gioiTinh: 'Nam',
    ngaySinh: '',
    diaChi: '',
    soDienThoai: '',
    email: '',
    phongBanId: '',
    chucVu: 'Nhân viên',
    ngayVaoLam: '',
    luongCoBan: ''
  });
  // State danh sách phòng ban (để chọn trong select)
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Nếu chế độ sửa, lấy thông tin nhân viên hiện tại
    const fetchEmployee = async () => {
      try {
        const res = await axios.get(`/api/nhanvien/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEmployeeData(res.data);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin nhân viên:', error);
      }
    };
    // Luôn lấy danh sách phòng ban để đổ vào <select>
    const fetchDepartments = async () => {
      try {
        const res = await axios.get('/api/phongban', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDepartments(res.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách phòng ban:', error);
      }
    };
    if (isEdit) {
      fetchEmployee();
    }
    fetchDepartments();
  }, [isEdit, id]);

  // Xử lý khi thay đổi các trường input
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Nếu field là phongBanId (number) thì chuyển sang kiểu số
    const newValue = name === 'phongBanId' ? parseInt(value) : value;
    setEmployeeData({
      ...employeeData,
      [name]: newValue
    });
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (isEdit) {
        // Gửi yêu cầu cập nhật nhân viên
        await axios.put(`/api/nhanvien/${id}`, employeeData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Cập nhật nhân viên thành công');
      } else {
        // Gửi yêu cầu thêm nhân viên mới
        await axios.post('/api/nhanvien', employeeData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Thêm nhân viên mới thành công');
      }
      navigate('/nhanvien');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        console.error('Lỗi khi lưu nhân viên:', error);
      }
    }
  };

  return (
    <div>
      <h4>{isEdit ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Họ và tên</label>
          <input 
            type="text" 
            name="hoTen"
            className="form-control" 
            value={employeeData.hoTen} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Giới tính</label>
          <select 
            name="gioiTinh"
            className="form-select" 
            value={employeeData.gioiTinh} 
            onChange={handleChange}
          >
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Ngày sinh</label>
          <input 
            type="date" 
            name="ngaySinh"
            className="form-control" 
            value={employeeData.ngaySinh} 
            onChange={handleChange} 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Địa chỉ</label>
          <input 
            type="text" 
            name="diaChi"
            className="form-control" 
            value={employeeData.diaChi} 
            onChange={handleChange} 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Số điện thoại</label>
          <input 
            type="text" 
            name="soDienThoai"
            className="form-control" 
            value={employeeData.soDienThoai} 
            onChange={handleChange} 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input 
            type="email" 
            name="email"
            className="form-control" 
            value={employeeData.email} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Phòng ban</label>
          <select 
            name="phongBanId"
            className="form-select" 
            value={employeeData.phongBanId || ''} 
            onChange={handleChange} 
            required
          >
            <option value="" disabled>-- Chọn phòng ban --</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>
                {dept.tenPhong}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Chức vụ</label>
          <input 
            type="text" 
            name="chucVu"
            className="form-control" 
            value={employeeData.chucVu} 
            onChange={handleChange} 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Ngày vào làm</label>
          <input 
            type="date" 
            name="ngayVaoLam"
            className="form-control" 
            value={employeeData.ngayVaoLam} 
            onChange={handleChange} 
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Lương cơ bản</label>
          <input 
            type="number" 
            name="luongCoBan"
            className="form-control" 
            value={employeeData.luongCoBan} 
            onChange={handleChange} 
            required 
          />
        </div>
        <button type="submit" className="btn btn-primary">
          {isEdit ? 'Cập nhật' : 'Thêm mới'}
        </button>
      </form>
    </div>
  );
}

export default EmployeeForm;

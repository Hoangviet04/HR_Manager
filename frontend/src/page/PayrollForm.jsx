/* giaodien/src/pages/PayrollForm.jsx */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function PayrollForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  // Danh sách nhân viên để chọn trong form
  const [employees, setEmployees] = useState([]);
  // Thông tin bảng lương trên form
  const [payrollData, setPayrollData] = useState({
    nhanVienId: '',
    thang: new Date().getMonth() + 1,
    nam: new Date().getFullYear(),
    luong: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    // Lấy danh sách nhân viên cho dropdown
    const fetchEmployees = axios.get('/api/nhanvien', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (isEdit) {
      // Nếu sửa, lấy dữ liệu bảng lương hiện tại song song với employees
      const fetchPayroll = axios.get(`/api/bangluong/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Promise.all([fetchEmployees, fetchPayroll])
        .then(([resEmp, resPayroll]) => {
          setEmployees(resEmp.data);
          // Điền dữ liệu bảng lương vào form
          const data = resPayroll.data;
          setPayrollData({
            nhanVienId: data.nhanVienId,
            thang: data.thang,
            nam: data.nam,
            luong: data.luong
          });
        })
        .catch(error => {
          console.error('Lỗi khi tải dữ liệu:', error);
        });
    } else {
      // Thêm mới: chỉ cần lấy danh sách nhân viên
      fetchEmployees
        .then(resEmp => {
          setEmployees(resEmp.data);
        })
        .catch(err => {
          console.error('Lỗi khi lấy danh sách nhân viên:', err);
        });
    }
  }, [isEdit, id]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = (name === 'nhanVienId' || name === 'thang' || name === 'nam') ? parseInt(value) : value;
    setPayrollData({
      ...payrollData,
      [name]: newValue
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (isEdit) {
        await axios.put(`/api/bangluong/${id}`, payrollData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Đã cập nhật bảng lương');
      } else {
        await axios.post('/api/bangluong', payrollData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Đã thêm bảng lương');
      }
      navigate('/bangluong');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        console.error('Lỗi khi lưu bảng lương:', error);
      }
    }
  };

  return (
    <div>
      <h4>{isEdit ? 'Cập nhật bảng lương' : 'Thêm bảng lương mới'}</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Nhân viên</label>
          <select 
            name="nhanVienId"
            className="form-select"
            value={payrollData.nhanVienId || ''} 
            onChange={handleChange}
            required
          >
            <option value="" disabled>-- Chọn nhân viên --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.hoTen}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Tháng</label>
          <input 
            type="number" 
            name="thang"
            className="form-control"
            value={payrollData.thang}
            onChange={handleChange}
            min="1" max="12"
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Năm</label>
          <input 
            type="number" 
            name="nam"
            className="form-control"
            value={payrollData.nam}
            onChange={handleChange}
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Lương (VND)</label>
          <input 
            type="number" 
            name="luong"
            className="form-control"
            value={payrollData.luong}
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

export default PayrollForm;

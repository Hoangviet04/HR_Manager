/* giaodien/src/pages/EmployeeList.jsx */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    // Lấy dữ liệu nhân viên và phòng ban đồng thời
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [empRes, deptRes] = await Promise.all([
          axios.get('/api/nhanvien', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/phongban', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setEmployees(empRes.data);
        setDepartments(deptRes.data);
      } catch (error) {
        console.error('Lỗi khi tải danh sách nhân viên/phòng ban:', error);
      }
    };
    fetchData();
  }, []);

  // Xử lý xóa nhân viên
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/nhanvien/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Cập nhật danh sách nhân viên sau khi xóa thành công
        setEmployees(employees.filter(e => e.id !== id));
        alert('Đã xóa nhân viên');
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
        } else {
          console.error('Lỗi khi xóa nhân viên:', error);
        }
      }
    }
  };

  // Tạo bảng ánh xạ phòng ban (id -> tên) để hiển thị tên phòng ban dễ dàng
  const departmentMap = {};
  departments.forEach(d => {
    departmentMap[d.id] = d.tenPhong;
  });

  return (
    <div>
      <h4>Danh sách nhân viên</h4>
      <Link to="/nhanvien/them" className="btn btn-success mb-2">Thêm nhân viên</Link>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead>
            <tr>
              <th>Mã NV</th>
              <th>Họ tên</th>
              <th>Phòng ban</th>
              <th>Chức vụ</th>
              <th>Email</th>
              <th>Điện thoại</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}>
                <td>{emp.id}</td>
                <td>{emp.hoTen}</td>
                <td>{departmentMap[emp.phongBanId] || emp.phongBanId}</td>
                <td>{emp.chucVu}</td>
                <td>{emp.email}</td>
                <td>{emp.soDienThoai}</td>
                <td>
                  <Link to={`/nhanvien/${emp.id}/sua`} className="btn btn-primary btn-sm me-2">Sửa</Link>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp.id)}>Xóa</button>
                </td>
              </tr>
            ))}
            {employees.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center">Chưa có nhân viên</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default EmployeeList;

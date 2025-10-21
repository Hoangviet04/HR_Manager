/* giaodien/src/pages/PayrollList.jsx */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function PayrollList() {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [role, setRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const userRole = currentUser ? currentUser.role : '';
    setRole(userRole);

    const fetchData = async () => {
      try {
        // Lấy danh sách bảng lương
        const resPayroll = await axios.get('/api/bangluong', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayrolls(resPayroll.data);
        // Nếu người dùng là HR, lấy thêm danh sách nhân viên để tra cứu tên
        if (userRole === 'HR') {
          const resEmp = await axios.get('/api/nhanvien', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setEmployees(resEmp.data);
        }
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu bảng lương:', error);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa bảng lương này?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/bangluong/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPayrolls(payrolls.filter(p => p.id !== id));
        alert('Đã xóa bảng lương');
      } catch (error) {
        console.error('Lỗi khi xóa bảng lương:', error);
      }
    }
  };

  // Nếu là HR, tạo map id nhân viên -> tên để hiển thị tên trong bảng
  const empNameMap = {};
  if (role === 'HR') {
    employees.forEach(emp => {
      empNameMap[emp.id] = emp.hoTen;
    });
  }

  // Sắp xếp các bản ghi lương theo năm và tháng giảm dần (mới nhất trước)
  const sortedPayrolls = [...payrolls].sort((a, b) => {
    if (a.nam !== b.nam) return b.nam - a.nam;
    return b.thang - a.thang;
  });

  return (
    <div>
      <h4>Bảng lương</h4>
      {role === 'HR' && <Link to="/bangluong/them" className="btn btn-success mb-2">Thêm bảng lương</Link>}
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            {role === 'HR' && <th>Nhân viên</th>}
            <th>Tháng</th>
            <th>Năm</th>
            <th>Lương (VND)</th>
            {role === 'HR' && <th></th>}
          </tr>
        </thead>
        <tbody>
          {sortedPayrolls.map(p => (
            <tr key={p.id}>
              {role === 'HR' && <td>{empNameMap[p.nhanVienId] || p.nhanVienId}</td>}
              <td>{p.thang}</td>
              <td>{p.nam}</td>
              <td>{p.luong.toLocaleString()}</td>
              {role === 'HR' && 
                <td>
                  <Link to={`/bangluong/${p.id}/sua`} className="btn btn-primary btn-sm me-2">Sửa</Link>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Xóa</button>
                </td>
              }
            </tr>
          ))}
          {payrolls.length === 0 && (
            <tr>
              <td colSpan={role === 'HR' ? 5 : 4} className="text-center">Không có dữ liệu</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PayrollList;

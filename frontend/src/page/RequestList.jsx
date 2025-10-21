/* giaodien/src/pages/RequestList.jsx */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function RequestList() {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [role, setRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const userRole = currentUser ? currentUser.role : '';
    setRole(userRole);

    const fetchRequests = async () => {
      try {
        const resReq = await axios.get('/api/dontu', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(resReq.data);
        if (userRole === 'HR') {
          const resEmp = await axios.get('/api/nhanvien', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setEmployees(resEmp.data);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn từ:', error);
      }
    };
    fetchRequests();
  }, []);

  const handleApprove = async (requestId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`/api/dontu/${requestId}`, { trangThai: 'Đã duyệt' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Cập nhật trạng thái đơn trong danh sách
      setRequests(requests.map(r => r.id === requestId ? { ...r, trangThai: 'Đã duyệt' } : r));
    } catch (error) {
      console.error('Lỗi khi duyệt đơn:', error);
    }
  };

  const handleReject = async (requestId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.put(`/api/dontu/${requestId}`, { trangThai: 'Từ chối' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(requests.map(r => r.id === requestId ? { ...r, trangThai: 'Từ chối' } : r));
    } catch (error) {
      console.error('Lỗi khi từ chối đơn:', error);
    }
  };

  // Map id nhân viên -> tên (cho HR)
  const empNameMap = {};
  if (role === 'HR') {
    employees.forEach(emp => {
      empNameMap[emp.id] = emp.hoTen;
    });
  }

  return (
    <div>
      <h4>Danh sách đơn từ</h4>
      {role === 'EMP' && <Link to="/dontu/them" className="btn btn-success mb-2">Gửi đơn mới</Link>}
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            {role === 'HR' && <th>Nhân viên</th>}
            <th>Loại đơn</th>
            <th>Từ ngày</th>
            <th>Đến ngày</th>
            <th>Lý do</th>
            <th>Trạng thái</th>
            {role === 'HR' && <th></th>}
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id}>
              {role === 'HR' && <td>{empNameMap[req.nhanVienId] || req.nhanVienId}</td>}
              <td>{req.loai}</td>
              <td>{req.tuNgay}</td>
              <td>{req.denNgay}</td>
              <td>{req.lyDo}</td>
              <td>{req.trangThai}</td>
              {role === 'HR' && 
                <td>
                  {req.trangThai === 'Chờ duyệt' ? (
                    <>
                      <button className="btn btn-success btn-sm me-2" onClick={() => handleApprove(req.id)}>Duyệt</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleReject(req.id)}>Từ chối</button>
                    </>
                  ) : (
                    <span className="text-muted">--</span>
                  )}
                </td>
              }
            </tr>
          ))}
          {requests.length === 0 && (
            <tr>
              <td colSpan={role === 'HR' ? 7 : 6} className="text-center">Không có đơn</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RequestList;

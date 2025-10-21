/* giaodien/src/pages/DepartmentList.jsx */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function DepartmentList() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/phongban', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDepartments(res.data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách phòng ban:', error);
      }
    };
    fetchDepartments();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa phòng ban này?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/phongban/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDepartments(departments.filter(d => d.id !== id));
        alert('Đã xóa phòng ban');
      } catch (error) {
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message);
        } else {
          console.error('Lỗi khi xóa phòng ban:', error);
        }
      }
    }
  };

  return (
    <div>
      <h4>Danh sách phòng ban</h4>
      <Link to="/phongban/them" className="btn btn-success mb-2">Thêm phòng ban</Link>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tên phòng ban</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {departments.map(dept => (
            <tr key={dept.id}>
              <td>{dept.id}</td>
              <td>{dept.tenPhong}</td>
              <td>
                <Link to={`/phongban/${dept.id}/sua`} className="btn btn-primary btn-sm me-2">Sửa</Link>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(dept.id)}>Xóa</button>
              </td>
            </tr>
          ))}
          {departments.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center">Chưa có phòng ban</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DepartmentList;

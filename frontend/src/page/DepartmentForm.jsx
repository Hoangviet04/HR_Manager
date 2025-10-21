/* giaodien/src/pages/DepartmentForm.jsx */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

function DepartmentForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [tenPhong, setTenPhong] = useState('');

  useEffect(() => {
    if (isEdit) {
      const token = localStorage.getItem('token');
      // Lấy thông tin phòng ban nếu đang sửa
      axios.get(`/api/phongban/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        setTenPhong(res.data.tenPhong);
      })
      .catch(err => {
        console.error('Lỗi khi lấy thông tin phòng ban:', err);
      });
    }
  }, [isEdit, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      if (isEdit) {
        await axios.put(`/api/phongban/${id}`, { tenPhong }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Đã cập nhật phòng ban');
      } else {
        await axios.post('/api/phongban', { tenPhong }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Đã thêm phòng ban mới');
      }
      navigate('/phongban');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        console.error('Lỗi khi lưu phòng ban:', error);
      }
    }
  };

  return (
    <div>
      <h4>{isEdit ? 'Cập nhật phòng ban' : 'Thêm phòng ban'}</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Tên phòng ban</label>
          <input 
            type="text" 
            className="form-control" 
            value={tenPhong} 
            onChange={(e) => setTenPhong(e.target.value)} 
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

export default DepartmentForm;

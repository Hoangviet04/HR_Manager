/* giaodien/src/pages/RequestForm.jsx */
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RequestForm() {
  const navigate = useNavigate();
  const [loai, setLoai] = useState('Nghỉ phép');
  const [tuNgay, setTuNgay] = useState('');
  const [denNgay, setDenNgay] = useState('');
  const [lyDo, setLyDo] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post('/api/dontu', { loai, tuNgay, denNgay, lyDo }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Đã gửi đơn thành công');
      navigate('/dontu');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        console.error('Lỗi khi gửi đơn:', error);
      }
    }
  };

  return (
    <div>
      <h4>Gửi đơn mới</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Loại đơn</label>
          <select className="form-select" value={loai} onChange={(e) => setLoai(e.target.value)}>
            <option>Nghỉ phép</option>
            <option>Công tác</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="form-label">Từ ngày</label>
          <input 
            type="date" 
            className="form-control"
            value={tuNgay} 
            onChange={(e) => setTuNgay(e.target.value)} 
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Đến ngày</label>
          <input 
            type="date" 
            className="form-control"
            value={denNgay} 
            onChange={(e) => setDenNgay(e.target.value)} 
            required 
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Lý do</label>
          <input 
            type="text" 
            className="form-control"
            value={lyDo} 
            onChange={(e) => setLyDo(e.target.value)} 
          />
        </div>
        <button type="submit" className="btn btn-primary">Gửi đơn</button>
      </form>
    </div>
  );
}

export default RequestForm;

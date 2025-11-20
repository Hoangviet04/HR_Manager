const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireHR } = require('../middlewares/authMiddleware');

const mapRequest = (row) => ({
    id: row.id,
    nhanVienId: row.nhan_vien_id,
    loai: row.loai,
    tuNgay: row.tu_ngay,
    denNgay: row.den_ngay,
    lyDo: row.ly_do,
    trangThai: row.trang_thai
});

router.get('/', verifyToken, async (req, res) => {
    try {
        let sql = 'SELECT * FROM don_tu';
        let params = [];
        if (req.user.role !== 'HR') {
            sql += ' WHERE nhan_vien_id = ?';
            params.push(req.user.nhanVienId);
        }
        const [rows] = await db.execute(sql, params);
        return res.json(rows.map(mapRequest));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post('/', verifyToken, async (req, res) => {
    if (req.user.role !== 'EMP') return res.status(403).json({ message: 'Chỉ nhân viên tạo đơn' });

    const { loai, tuNgay, denNgay, lyDo } = req.body;
    try {
        const sql = 'INSERT INTO don_tu (nhan_vien_id, loai, tu_ngay, den_ngay, ly_do, trang_thai) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await db.execute(sql, [req.user.nhanVienId, loai, tuNgay, denNgay, lyDo, 'Chờ duyệt']);

        return res.status(201).json({ message: 'Đã gửi đơn', request: { id: result.insertId, ...req.body, trangThai: 'Chờ duyệt' } });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.put('/:id', verifyToken, requireHR, async (req, res) => {
    const { trangThai } = req.body;
    if (!['Đã duyệt', 'Từ chối'].includes(trangThai)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
    try {
        const [result] = await db.execute('UPDATE don_tu SET trang_thai = ? WHERE id = ?', [trangThai, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Không tìm thấy đơn' });
        return res.json({ message: 'Đã cập nhật trạng thái' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;
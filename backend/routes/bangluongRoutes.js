const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireHR } = require('../middlewares/authMiddleware');

const mapPayroll = (row) => ({
    id: row.id,
    nhanVienId: row.nhan_vien_id,
    hoTen: row.ho_ten,
    thang: row.thang,
    nam: row.nam,
    luongCoBan: row.luong_co_ban,
    phuCap: row.phu_cap,
    thuong: row.thuong,
    chuyenCan: row.chuyen_can === 1,
});

router.get('/', verifyToken, async (req, res) => {
    try {
        let sql = `
            SELECT bl.*, nv.ho_ten 
            FROM bang_luong bl
            JOIN nhan_vien nv ON bl.nhan_vien_id = nv.id
        `;
        let params = [];

        if (req.user.role !== 'HR') {
            sql += ' WHERE bl.nhan_vien_id = ?';
            params.push(req.user.nhanVienId);
        }

        const [rows] = await db.execute(sql, params);
        return res.json(rows.map(mapPayroll));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM bang_luong WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy' });

        const row = rows[0];
        return res.json({
            id: row.id,
            nhanVienId: row.nhan_vien_id,
            thang: row.thang,
            nam: row.nam,
            luongCoBan: row.luong_co_ban,
            phuCap: row.phu_cap,
            thuong: row.thuong,
            chuyenCan: row.chuyen_can === 1
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post('/', verifyToken, requireHR, async (req, res) => {
    const { nhanVienId, thang, nam, luongCoBan, phuCap, thuong, chuyenCan } = req.body;
    try {
        const [exist] = await db.execute(
            'SELECT id FROM bang_luong WHERE nhan_vien_id = ? AND thang = ? AND nam = ?',
            [nhanVienId, thang, nam]
        );
        if (exist.length > 0) return res.status(400).json({ message: 'Đã có bảng lương tháng này' });

        await db.execute(
            'INSERT INTO bang_luong (nhan_vien_id, thang, nam, luong_co_ban, phu_cap, thuong, chuyen_can) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [nhanVienId, thang, nam, luongCoBan || 0, phuCap || 0, thuong || 0, chuyenCan ? 1 : 0]
        );
        return res.status(201).json({ message: 'Đã thêm bảng lương' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.put('/:id', verifyToken, requireHR, async (req, res) => {
    const { nhanVienId, thang, nam, luongCoBan, phuCap, thuong, chuyenCan } = req.body;
    try {
        await db.execute(
            'UPDATE bang_luong SET nhan_vien_id=?, thang=?, nam=?, luong_co_ban=?, phu_cap=?, thuong=?, chuyen_can=? WHERE id=?',
            [nhanVienId, thang, nam, luongCoBan, phuCap, thuong, chuyenCan ? 1 : 0, req.params.id]
        );
        return res.json({ message: 'Đã cập nhật bảng lương' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', verifyToken, requireHR, async (req, res) => {
    try {
        await db.execute('DELETE FROM bang_luong WHERE id = ?', [req.params.id]);
        return res.json({ message: 'Đã xóa' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;
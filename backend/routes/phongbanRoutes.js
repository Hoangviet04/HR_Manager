const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireHR } = require('../middlewares/authMiddleware');


router.get('/', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM phong_ban');
        const result = rows.map(row => ({ id: row.id, tenPhong: row.ten_phong }));
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get('/:id', verifyToken, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM phong_ban WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Phòng ban không tồn tại' });
        return res.json({ id: rows[0].id, tenPhong: rows[0].ten_phong });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post('/', verifyToken, requireHR, async (req, res) => {
    const { tenPhong } = req.body;
    if (!tenPhong) return res.status(400).json({ message: 'Tên phòng ban trống' });

    try {
        const [exist] = await db.execute('SELECT id FROM phong_ban WHERE ten_phong = ?', [tenPhong]);
        if (exist.length > 0) return res.status(400).json({ message: 'Tên phòng ban đã tồn tại' });

        const [result] = await db.execute('INSERT INTO phong_ban (ten_phong) VALUES (?)', [tenPhong]);
        return res.status(201).json({ message: 'Đã thêm', department: { id: result.insertId, tenPhong } });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.put('/:id', verifyToken, requireHR, async (req, res) => {
    const deptId = req.params.id;
    const { tenPhong } = req.body;
    if (!tenPhong) return res.status(400).json({ message: 'Tên phòng ban trống' });

    try {
        const [check] = await db.execute('SELECT id FROM phong_ban WHERE id = ?', [deptId]);
        if (check.length === 0) return res.status(404).json({ message: 'Phòng ban không tồn tại' });

        const [exist] = await db.execute('SELECT id FROM phong_ban WHERE ten_phong = ? AND id != ?', [tenPhong, deptId]);
        if (exist.length > 0) return res.status(400).json({ message: 'Tên phòng ban đã tồn tại' });

        await db.execute('UPDATE phong_ban SET ten_phong = ? WHERE id = ?', [tenPhong, deptId]);
        return res.json({ message: 'Đã cập nhật', department: { id: deptId, tenPhong } });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', verifyToken, requireHR, async (req, res) => {
    const deptId = req.params.id;
    try {
        const [hasEmp] = await db.execute('SELECT count(*) as count FROM nhan_vien WHERE phong_ban_id = ?', [deptId]);
        if (hasEmp[0].count > 0) {
            return res.status(400).json({ message: 'Không thể xóa vì còn nhân viên trong phòng' });
        }

        const [result] = await db.execute('DELETE FROM phong_ban WHERE id = ?', [deptId]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Phòng ban không tồn tại' });

        return res.json({ message: 'Đã xóa phòng ban' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;
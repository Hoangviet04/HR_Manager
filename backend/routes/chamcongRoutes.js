const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken } = require('../middlewares/authMiddleware');

const getTodayDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0];
};

const getCurrentTime = () => {
    const date = new Date();
    return date.toTimeString().split(' ')[0];
};

/**
 * @route POST /api/chamcong/checkin
 * @desc Nhân viên bấm Check-in (Giờ vào)
 */
router.post('/checkin', verifyToken, async (req, res) => {
    const nhanVienId = req.user.nhanVienId;
    const today = getTodayDate();
    const now = getCurrentTime();

    try {
        const [exist] = await db.execute(
            'SELECT id FROM cham_cong WHERE nhan_vien_id = ? AND ngay = ?',
            [nhanVienId, today]
        );

        if (exist.length > 0) {
            return res.status(400).json({ message: 'Hôm nay bạn đã check-in rồi!' });
        }

        let trangThai = 'Đúng giờ';
        if (now > '08:30:00') {
            trangThai = 'Đi muộn';
        }

        await db.execute(
            'INSERT INTO cham_cong (nhan_vien_id, ngay, gio_vao, trang_thai) VALUES (?, ?, ?, ?)',
            [nhanVienId, today, now, trangThai]
        );

        return res.json({ message: 'Check-in thành công!', gioVao: now });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

/**
 * @route POST /api/chamcong/checkout
 * @desc Nhân viên bấm Check-out (Giờ ra)
 */
router.post('/checkout', verifyToken, async (req, res) => {
    const nhanVienId = req.user.nhanVienId;
    const today = getTodayDate();
    const now = getCurrentTime();

    try {
        const [rows] = await db.execute(
            'SELECT id FROM cham_cong WHERE nhan_vien_id = ? AND ngay = ?',
            [nhanVienId, today]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: 'Bạn chưa check-in hôm nay!' });
        }

        await db.execute(
            'UPDATE cham_cong SET gio_ra = ? WHERE id = ?',
            [now, rows[0].id]
        );

        return res.json({ message: 'Check-out thành công!', gioRa: now });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

/**
 * @route GET /api/chamcong
 * @desc Lấy lịch sử chấm công
 */
router.get('/', verifyToken, async (req, res) => {
    try {
        let sql = `
            SELECT cc.*, nv.ho_ten 
            FROM cham_cong cc
            JOIN nhan_vien nv ON cc.nhan_vien_id = nv.id
        `;
        const params = [];

        if (req.user.role !== 'HR') {
            sql += ' WHERE cc.nhan_vien_id = ?';
            params.push(req.user.nhanVienId);
        }

        sql += ' ORDER BY cc.ngay DESC, cc.gio_vao DESC';

        const [rows] = await db.execute(sql, params);

        const result = rows.map(row => ({
            id: row.id,
            nhanVienId: row.nhan_vien_id,
            hoTen: row.ho_ten,
            ngay: row.ngay,
            gioVao: row.gio_vao,
            gioRa: row.gio_ra,
            trangThai: row.trang_thai
        }));

        return res.json(result);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

/**
 * @route GET /api/chamcong/homnay
 * @desc Kiểm tra trạng thái hôm nay của user 
 */
router.get('/homnay', verifyToken, async (req, res) => {
    const nhanVienId = req.user.nhanVienId;
    const today = getTodayDate();

    try {
        const [rows] = await db.execute(
            'SELECT * FROM cham_cong WHERE nhan_vien_id = ? AND ngay = ?',
            [nhanVienId, today]
        );

        if (rows.length === 0) return res.json({ checkedIn: false, checkedOut: false });

        const record = rows[0];
        return res.json({
            checkedIn: true,
            checkedOut: !!record.gio_ra,
            gioVao: record.gio_vao,
            gioRa: record.gio_ra
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;
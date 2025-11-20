const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireHR } = require('../middlewares/authMiddleware');

const mapEmployee = (row) => ({
    id: row.id,
    hoTen: row.ho_ten,
    gioiTinh: row.gioi_tinh,
    ngaySinh: row.ngay_sinh,
    diaChi: row.dia_chi,
    soDienThoai: row.so_dien_thoai,
    email: row.email,
    phongBanId: row.phong_ban_id,
    chucVu: row.chuc_vu,
    ngayVaoLam: row.ngay_vao_lam,
    luongCoBan: row.luong_co_ban
});

router.get('/', verifyToken, requireHR, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM nhan_vien');
        return res.json(rows.map(mapEmployee));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.get('/:id', verifyToken, async (req, res) => {
    const empId = parseInt(req.params.id);
    if (req.user.role !== 'HR' && req.user.nhanVienId !== empId) {
        return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    try {
        const [rows] = await db.execute('SELECT * FROM nhan_vien WHERE id = ?', [empId]);
        if (rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
        return res.json(mapEmployee(rows[0]));
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.post('/', verifyToken, requireHR, async (req, res) => {
    const { hoTen, gioiTinh, ngaySinh, diaChi, soDienThoai, email, phongBanId, chucVu, ngayVaoLam, luongCoBan } = req.body;

    try {
        const [exist] = await db.execute('SELECT id FROM nhan_vien WHERE email = ?', [email]);
        if (exist.length > 0) return res.status(400).json({ message: 'Email đã tồn tại' });

        const sql = `
        INSERT INTO nhan_vien 
        (ho_ten, gioi_tinh, ngay_sinh, dia_chi, so_dien_thoai, email, phong_ban_id, chuc_vu, ngay_vao_lam, luong_co_ban) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const values = [hoTen, gioiTinh, ngaySinh, diaChi, soDienThoai, email, phongBanId, chucVu, ngayVaoLam, luongCoBan];

        const [result] = await db.execute(sql, values);
        return res.status(201).json({ message: 'Thêm thành công', employee: { id: result.insertId, ...req.body } });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi CSDL: ' + error.message });
    }
});

router.put('/:id', verifyToken, requireHR, async (req, res) => {
    const empId = req.params.id;
    const { hoTen, gioiTinh, ngaySinh, diaChi, soDienThoai, email, phongBanId, chucVu, ngayVaoLam, luongCoBan } = req.body;

    try {
        const [exist] = await db.execute('SELECT id FROM nhan_vien WHERE email = ? AND id != ?', [email, empId]);
        if (exist.length > 0) return res.status(400).json({ message: 'Email đã được sử dụng bởi nhân viên khác' });

        const sql = `
        INSERT INTO nhan_vien 
        (ho_ten, gioi_tinh, ngay_sinh, dia_chi, so_dien_thoai, email, phong_ban_id, chuc_vu, ngay_vao_lam, luong_co_ban) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [hoTen, gioiTinh, ngaySinh, diaChi, soDienThoai, email, phongBanId, chucVu, ngayVaoLam, luongCoBan, empId];

        const [result] = await db.execute(sql, values);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Nhân viên không tồn tại' });

        return res.json({ message: 'Cập nhật thành công', employee: { id: empId, ...req.body } });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});

router.delete('/:id', verifyToken, requireHR, async (req, res) => {
    const empId = req.params.id;
    try {
        await db.execute('DELETE FROM nhan_vien WHERE id = ?', [empId]);

        await db.execute('DELETE FROM nguoi_dung WHERE nhan_vien_id = ?', [empId]);

        return res.json({ message: 'Đã xóa nhân viên' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(400).json({ message: 'Không thể xóa: Nhân viên này còn dữ liệu bảng lương hoặc đơn từ.' });
        }
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;
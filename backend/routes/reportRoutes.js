const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireHR } = require('../middlewares/authMiddleware');

router.get('/tong-hop', verifyToken, requireHR, async (req, res) => {
    const { thang, nam } = req.query;

    if (!thang || !nam) {
        return res.status(400).json({ message: "Vui lòng chọn tháng và năm" });
    }

    try {
        // 1. Thống kê Nhân sự
        const [totalEmp] = await db.execute('SELECT COUNT(*) as count FROM nhan_vien');
        const [newEmp] = await db.execute(
            'SELECT COUNT(*) as count FROM nhan_vien WHERE MONTH(ngay_vao_lam) = ? AND YEAR(ngay_vao_lam) = ?',
            [thang, nam]
        );

        // 2. Thống kê Tài chính Tổng quan 
        const [payroll] = await db.execute(
            `SELECT 
                SUM(luong_co_ban + phu_cap + thuong + (CASE WHEN chuyen_can = 1 THEN 500000 ELSE 0 END)) as totalIncome,
                SUM(luong_co_ban * 0.08) as totalBHXH,
                COUNT(*) as totalPaid
             FROM bang_luong 
             WHERE thang = ? AND nam = ?`,
            [thang, nam]
        );

        // 3. Thống kê Đơn từ
        const [requests] = await db.execute(
            `SELECT loai, COUNT(*) as count 
             FROM don_tu 
             WHERE MONTH(tu_ngay) = ? AND YEAR(tu_ngay) = ? AND trang_thai = 'Đã duyệt'
             GROUP BY loai`,
            [thang, nam]
        );

        // Công thức: (Lương CB + Phụ cấp + Thưởng + Chuyên cần) - (Lương CB * 8%)
        const [deptStats] = await db.execute(
            `SELECT 
                pb.ten_phong, 
                COUNT(nv.id) as count, 
                SUM(
                    (COALESCE(bl.luong_co_ban, 0) + 
                     COALESCE(bl.phu_cap, 0) + 
                     COALESCE(bl.thuong, 0) + 
                     (CASE WHEN bl.chuyen_can = 1 THEN 500000 ELSE 0 END))
                    - 
                    (COALESCE(bl.luong_co_ban, 0) * 0.08)
                ) as totalNetSalary
             FROM phong_ban pb
             LEFT JOIN nhan_vien nv ON pb.id = nv.phong_ban_id
             LEFT JOIN bang_luong bl ON nv.id = bl.nhan_vien_id AND bl.thang = ? AND bl.nam = ?
             GROUP BY pb.id, pb.ten_phong`,
            [thang, nam]
        );

        return res.json({
            nhanSu: {
                tong: totalEmp[0].count,
                moi: newEmp[0].count
            },
            taiChinh: {
                tongChi: payroll[0].totalIncome || 0,
                bhxh: payroll[0].totalBHXH || 0,
                soNguoiDaNhan: payroll[0].totalPaid
            },
            nghiPhep: requests,
            phongBan: deptStats
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: error.message });
    }
});

module.exports = router;
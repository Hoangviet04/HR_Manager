/* maychu/routes/bangluongRoutes.js */
const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { verifyToken, requireHR } = require('../middlewares/authMiddleware');

/**
 * @route GET /bangluong
 * @desc Lấy danh sách bảng lương. 
 *       - HR xem được tất cả.
 *       - Nhân viên thường chỉ xem lương của chính mình.
 * @access Private (đã đăng nhập)
 */
router.get('/', verifyToken, (req, res) => {
    if (req.user.role === 'HR') {
        // HR xem tất cả bảng lương
        return res.json(db.payrolls);
    } else {
        // Nhân viên chỉ xem các bản ghi lương của mình
        const myPayrolls = db.payrolls.filter(p => p.nhanVienId === req.user.nhanVienId);
        return res.json(myPayrolls);
    }
});

/**
 * @route GET /bangluong/:id
 * @desc Lấy thông tin một bản ghi bảng lương theo ID (phải đăng nhập)
 * @access Private
 */
router.get('/:id', verifyToken, (req, res) => {
    const payrollId = parseInt(req.params.id);
    const payroll = db.payrolls.find(p => p.id === payrollId);
    if (!payroll) {
        return res.status(404).json({ message: 'Bảng lương không tồn tại' });
    }
    // Nếu người dùng không phải HR và cũng không phải chủ nhân của bảng lương này, chặn truy cập
    if (req.user.role !== 'HR' && req.user.nhanVienId !== payroll.nhanVienId) {
        return res.status(403).json({ message: 'Không được phép xem bảng lương này' });
    }
    return res.json(payroll);
});

/**
 * @route POST /bangluong
 * @desc Thêm bảng lương cho một nhân viên (HR)
 * @access Private (HR)
 */
router.post('/', verifyToken, requireHR, (req, res) => {
    const { nhanVienId, thang, nam, luong } = req.body;
    if (!nhanVienId || !thang || !nam || luong == null) {
        return res.status(400).json({ message: 'Thiếu thông tin bảng lương (nhân viên, tháng, năm, lương)' });
    }
    // Kiểm tra nhân viên có tồn tại không
    const employee = db.employees.find(e => e.id === nhanVienId);
    if (!employee) {
        return res.status(400).json({ message: 'Nhân viên không tồn tại' });
    }
    // Kiểm tra trùng lặp (nếu đã có bảng lương tháng đó cho nhân viên này rồi)
    const existed = db.payrolls.find(p => p.nhanVienId === nhanVienId && p.thang === thang && p.nam === nam);
    if (existed) {
        return res.status(400).json({ message: 'Đã tồn tại bảng lương của nhân viên này trong tháng/năm này' });
    }
    const newId = db.payrolls.length > 0 ? Math.max(...db.payrolls.map(p => p.id)) + 1 : 1;
    const newPayroll = { id: newId, nhanVienId, thang, nam, luong };
    db.payrolls.push(newPayroll);
    db.saveData('bangluong.json', db.payrolls);
    return res.status(201).json({ message: 'Đã thêm bảng lương', payroll: newPayroll });
});

/**
 * @route PUT /bangluong/:id
 * @desc Cập nhật thông tin bảng lương (HR)
 * @access Private (HR)
 */
router.put('/:id', verifyToken, requireHR, (req, res) => {
    const payrollId = parseInt(req.params.id);
    const payroll = db.payrolls.find(p => p.id === payrollId);
    if (!payroll) {
        return res.status(404).json({ message: 'Bảng lương không tồn tại' });
    }
    const { nhanVienId, thang, nam, luong } = req.body;
    if (!nhanVienId || !thang || !nam || luong == null) {
        return res.status(400).json({ message: 'Thiếu thông tin bảng lương' });
    }
    const employee = db.employees.find(e => e.id === nhanVienId);
    if (!employee) {
        return res.status(400).json({ message: 'Nhân viên không tồn tại' });
    }
    // Kiểm tra trùng (trừ chính nó)
    const existed = db.payrolls.find(p => p.id !== payrollId && p.nhanVienId === nhanVienId && p.thang === thang && p.nam === nam);
    if (existed) {
        return res.status(400).json({ message: 'Đã tồn tại bảng lương của nhân viên này trong tháng/năm này' });
    }
    // Cập nhật thông tin
    payroll.nhanVienId = nhanVienId;
    payroll.thang = thang;
    payroll.nam = nam;
    payroll.luong = luong;
    db.saveData('bangluong.json', db.payrolls);
    return res.json({ message: 'Đã cập nhật bảng lương', payroll });
});

/**
 * @route DELETE /bangluong/:id
 * @desc Xóa một bản ghi bảng lương (HR)
 * @access Private (HR)
 */
router.delete('/:id', verifyToken, requireHR, (req, res) => {
    const payrollId = parseInt(req.params.id);
    const payroll = db.payrolls.find(p => p.id === payrollId);
    if (!payroll) {
        return res.status(404).json({ message: 'Bảng lương không tồn tại' });
    }
    db.payrolls = db.payrolls.filter(p => p.id !== payrollId);
    db.saveData('bangluong.json', db.payrolls);
    return res.json({ message: 'Đã xóa bảng lương' });
});

module.exports = router;

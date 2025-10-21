/* maychu/routes/nhanvienRoutes.js */
const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { verifyToken, requireHR } = require('../middlewares/authMiddleware');

/**
 * @route GET /nhanvien
 * @desc Lấy danh sách tất cả nhân viên (chỉ HR có quyền)
 * @access Private (HR)
 */
router.get('/', verifyToken, requireHR, (req, res) => {
    // Trả về danh sách nhân viên hiện có
    return res.json(db.employees);
});

/**
 * @route GET /nhanvien/:id
 * @desc Lấy thông tin một nhân viên theo ID (HR hoặc chính nhân viên đó mới xem được)
 * @access Private (HR hoặc chính nhân viên)
 */
router.get('/:id', verifyToken, (req, res) => {
    const empId = parseInt(req.params.id);
    // Tìm nhân viên theo ID
    const employee = db.employees.find(e => e.id === empId);
    if (!employee) {
        return res.status(404).json({ message: 'Nhân viên không tồn tại' });
    }
    // Kiểm tra quyền: HR hoặc nhân viên đó
    if (req.user.role !== 'HR' && req.user.nhanVienId !== empId) {
        return res.status(403).json({ message: 'Không được phép xem thông tin nhân viên này' });
    }
    return res.json(employee);
});

/**
 * @route POST /nhanvien
 * @desc Thêm mới một nhân viên (chỉ HR)
 * @access Private (HR)
 */
router.post('/', verifyToken, requireHR, (req, res) => {
    const { hoTen, gioiTinh, ngaySinh, diaChi, soDienThoai, email, phongBanId, chucVu, ngayVaoLam, luongCoBan } = req.body;
    // Kiểm tra trường bắt buộc
    if (!hoTen || !email || !phongBanId) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc (họ tên, email, phòng ban)' });
    }
    // Kiểm tra trùng email
    const existed = db.employees.find(e => e.email === email);
    if (existed) {
        return res.status(400).json({ message: 'Email nhân viên đã tồn tại' });
    }
    // Kiểm tra phòng ban có hợp lệ không
    const department = db.departments.find(d => d.id === phongBanId);
    if (!department) {
        return res.status(400).json({ message: 'Phòng ban không hợp lệ' });
    }
    // Tạo ID mới (lấy id lớn nhất + 1)
    const newId = db.employees.length > 0 ? Math.max(...db.employees.map(e => e.id)) + 1 : 1;
    const newEmployee = {
        id: newId,
        hoTen,
        gioiTinh,
        ngaySinh,
        diaChi,
        soDienThoai,
        email,
        phongBanId,
        chucVu,
        ngayVaoLam,
        luongCoBan
    };
    // Thêm vào danh sách
    db.employees.push(newEmployee);
    // Lưu lại file JSON
    db.saveData('nhanvien.json', db.employees);
    return res.status(201).json({ message: 'Đã thêm nhân viên mới', employee: newEmployee });
});

/**
 * @route PUT /nhanvien/:id
 * @desc Cập nhật thông tin nhân viên (chỉ HR)
 * @access Private (HR)
 */
router.put('/:id', verifyToken, requireHR, (req, res) => {
    const empId = parseInt(req.params.id);
    const employee = db.employees.find(e => e.id === empId);
    if (!employee) {
        return res.status(404).json({ message: 'Nhân viên không tồn tại' });
    }
    const { hoTen, gioiTinh, ngaySinh, diaChi, soDienThoai, email, phongBanId, chucVu, ngayVaoLam, luongCoBan } = req.body;
    if (!hoTen || !email || !phongBanId) {
        return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    // Kiểm tra trùng email (trừ chính nhân viên này)
    const existed = db.employees.find(e => e.email === email && e.id !== empId);
    if (existed) {
        return res.status(400).json({ message: 'Email nhân viên đã tồn tại' });
    }
    // Kiểm tra phòng ban
    const department = db.departments.find(d => d.id === phongBanId);
    if (!department) {
        return res.status(400).json({ message: 'Phòng ban không hợp lệ' });
    }
    // Cập nhật thông tin nhân viên
    employee.hoTen = hoTen;
    employee.gioiTinh = gioiTinh;
    employee.ngaySinh = ngaySinh;
    employee.diaChi = diaChi;
    employee.soDienThoai = soDienThoai;
    employee.email = email;
    employee.phongBanId = phongBanId;
    employee.chucVu = chucVu;
    employee.ngayVaoLam = ngayVaoLam;
    employee.luongCoBan = luongCoBan;
    // Lưu file sau khi cập nhật
    db.saveData('nhanvien.json', db.employees);
    return res.json({ message: 'Đã cập nhật thông tin nhân viên', employee });
});

/**
 * @route DELETE /nhanvien/:id
 * @desc Xóa một nhân viên (chỉ HR)
 * @access Private (HR)
 */
router.delete('/:id', verifyToken, requireHR, (req, res) => {
    const empId = parseInt(req.params.id);
    const employee = db.employees.find(e => e.id === empId);
    if (!employee) {
        return res.status(404).json({ message: 'Nhân viên không tồn tại' });
    }
    // Kiểm tra ràng buộc: nếu nhân viên còn bảng lương hoặc đơn từ thì không cho xóa
    const hasPayroll = db.payrolls.some(p => p.nhanVienId === empId);
    const hasRequest = db.requests.some(r => r.nhanVienId === empId);
    if (hasPayroll || hasRequest) {
        return res.status(400).json({ message: 'Không thể xóa nhân viên vì còn thông tin liên quan (bảng lương hoặc đơn từ)' });
    }
    // Xóa nhân viên khỏi danh sách
    db.employees = db.employees.filter(e => e.id !== empId);
    // Xóa tài khoản người dùng liên quan (nếu có)
    db.users = db.users.filter(u => u.nhanVienId !== empId);
    // Lưu file sau khi xóa
    db.saveData('nhanvien.json', db.employees);
    db.saveData('users.json', db.users);
    return res.json({ message: 'Đã xóa nhân viên' });
});

module.exports = router;

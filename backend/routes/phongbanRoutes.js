/* maychu/routes/phongbanRoutes.js */
const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { verifyToken, requireHR } = require('../middlewares/authMiddleware');

/**
 * @route GET /phongban
 * @desc Lấy danh sách phòng ban
 * @access Private (đăng nhập bất kỳ vai trò nào)
 */
router.get('/', verifyToken, (req, res) => {
    return res.json(db.departments);
});

/**
 * @route GET /phongban/:id
 * @desc Lấy thông tin một phòng ban theo ID
 * @access Private (đăng nhập)
 */
router.get('/:id', verifyToken, (req, res) => {
    const deptId = parseInt(req.params.id);
    const department = db.departments.find(d => d.id === deptId);
    if (!department) {
        return res.status(404).json({ message: 'Phòng ban không tồn tại' });
    }
    return res.json(department);
});

/**
 * @route POST /phongban
 * @desc Thêm mới phòng ban
 * @access Private (HR)
 */
router.post('/', verifyToken, requireHR, (req, res) => {
    const { tenPhong } = req.body;
    if (!tenPhong) {
        return res.status(400).json({ message: 'Tên phòng ban không được để trống' });
    }
    // Kiểm tra trùng tên phòng ban
    const existed = db.departments.find(d => d.tenPhong.toLowerCase() === tenPhong.toLowerCase());
    if (existed) {
        return res.status(400).json({ message: 'Tên phòng ban đã tồn tại' });
    }
    const newId = db.departments.length > 0 ? Math.max(...db.departments.map(d => d.id)) + 1 : 1;
    const newDept = { id: newId, tenPhong };
    db.departments.push(newDept);
    db.saveData('phongban.json', db.departments);
    return res.status(201).json({ message: 'Đã thêm phòng ban mới', department: newDept });
});

/**
 * @route PUT /phongban/:id
 * @desc Cập nhật thông tin phòng ban
 * @access Private (HR)
 */
router.put('/:id', verifyToken, requireHR, (req, res) => {
    const deptId = parseInt(req.params.id);
    const department = db.departments.find(d => d.id === deptId);
    if (!department) {
        return res.status(404).json({ message: 'Phòng ban không tồn tại' });
    }
    const { tenPhong } = req.body;
    if (!tenPhong) {
        return res.status(400).json({ message: 'Tên phòng ban không được để trống' });
    }
    // Kiểm tra trùng tên (trừ chính nó)
    const existed = db.departments.find(d => d.tenPhong.toLowerCase() === tenPhong.toLowerCase() && d.id !== deptId);
    if (existed) {
        return res.status(400).json({ message: 'Tên phòng ban đã tồn tại' });
    }
    department.tenPhong = tenPhong;
    db.saveData('phongban.json', db.departments);
    return res.json({ message: 'Đã cập nhật phòng ban', department });
});

/**
 * @route DELETE /phongban/:id
 * @desc Xóa một phòng ban
 * @access Private (HR)
 */
router.delete('/:id', verifyToken, requireHR, (req, res) => {
    const deptId = parseInt(req.params.id);
    const department = db.departments.find(d => d.id === deptId);
    if (!department) {
        return res.status(404).json({ message: 'Phòng ban không tồn tại' });
    }
    // Không cho xóa nếu còn nhân viên thuộc phòng ban này
    const hasEmployees = db.employees.some(e => e.phongBanId === deptId);
    if (hasEmployees) {
        return res.status(400).json({ message: 'Không thể xóa phòng ban vì còn nhân viên thuộc phòng ban này' });
    }
    db.departments = db.departments.filter(d => d.id !== deptId);
    db.saveData('phongban.json', db.departments);
    return res.json({ message: 'Đã xóa phòng ban' });
});

module.exports = router;

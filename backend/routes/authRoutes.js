/* maychu/routes/authRoutes.js */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../data/db');
const { JWT_SECRET } = require('../middlewares/authMiddleware');

/**
 * @route POST /auth/login
 * @desc Xác thực người dùng, trả về JWT nếu đăng nhập thành công
 * @access Public
 */
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Tìm người dùng theo username
    const user = db.users.find(u => u.username === username);
    if (!user) {
        // Không tìm thấy user
        return res.status(400).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    }
    // So sánh password (đã được băm) bằng bcrypt
    const match = bcrypt.compareSync(password, user.password);
    if (!match) {
        return res.status(400).json({ message: 'Sai tài khoản hoặc mật khẩu' });
    }
    // Tạo payload cho JWT
    const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
        nhanVienId: user.nhanVienId
    };
    // Ký token (có thể thêm { expiresIn: '1h' } để token hết hạn sau 1 giờ, ở đây để đơn giản không đặt)
    const token = jwt.sign(payload, JWT_SECRET);
    // Chuẩn bị dữ liệu người dùng trả về (ẩn mật khẩu)
    let userInfo = {
        id: user.id,
        username: user.username,
        role: user.role,
        nhanVienId: user.nhanVienId
    };
    // Nếu user có liên kết với nhân viên, đính kèm tên nhân viên (hoTen) để tiện hiển thị
    if (user.nhanVienId) {
        const emp = db.employees.find(e => e.id === user.nhanVienId);
        if (emp) {
            userInfo.hoTen = emp.hoTen;
        }
    }
    return res.json({
        message: 'Đăng nhập thành công',
        token,
        user: userInfo
    });
});

module.exports = router;

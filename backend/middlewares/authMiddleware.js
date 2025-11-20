const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret_mac_dinh_cho_dev';

const verifyToken = (req, res, next) => {
    const tokenHeader = req.headers['authorization'];
    const token = tokenHeader && tokenHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Chưa đăng nhập (Thiếu Token)' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

const requireHR = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Chưa xác thực người dùng' });
    }
    if (req.user.role !== 'HR') {
        return res.status(403).json({ message: 'Bạn không có quyền thực hiện hành động này' });
    }
    next();
};

module.exports = { verifyToken, requireHR, JWT_SECRET };
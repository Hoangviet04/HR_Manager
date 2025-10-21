/* maychu/middlewares/authMiddleware.js */
const jwt = require('jsonwebtoken');

// Khóa bí mật để ký JWT (nên lưu trong file .env bảo mật, ở đây đặt cứng để minh họa)
const JWT_SECRET = 'mysecretkey';

/**
 * Middleware kiểm tra JWT trong header Authorization.
 * Nếu hợp lệ, giải mã token và gắn thông tin người dùng vào req.user.
 * Nếu không, trả về lỗi 401 (Unauthorized).
 */
function verifyToken(req, res, next) {
    // Lấy token từ header Authorization (định dạng "Bearer <token>")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        // Không có token
        return res.status(401).json({ message: 'Yêu cầu đăng nhập' });
    }
    try {
        // Xác minh token và giải mã payload
        const decoded = jwt.verify(token, JWT_SECRET);
        // Gắn thông tin người dùng vào request để dùng ở các middleware/route sau
        req.user = decoded;
        next();
    } catch (err) {
        // Token không hợp lệ hoặc hết hạn
        return res.status(403).json({ message: 'Token không hợp lệ' });
    }
}

/**
 * Middleware kiểm tra vai trò HR.
 * Yêu cầu đã qua verifyToken trước đó (có req.user).
 * Nếu người dùng không phải HR, trả về 403 Forbidden.
 */
function requireHR(req, res, next) {
    if (!req.user) {
        return res.status(401).json({ message: 'Chưa đăng nhập' });
    }
    if (req.user.role !== 'HR') {
        return res.status(403).json({ message: 'Không có quyền truy cập (cần quyền HR)' });
    }
    next();
}

module.exports = {
    verifyToken,
    requireHR,
    JWT_SECRET
};

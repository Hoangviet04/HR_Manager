const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { verifyToken, JWT_SECRET } = require('../middlewares/authMiddleware');

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const sql = `
            SELECT nd.*, nv.ho_ten, pb.ten_phong 
            FROM nguoi_dung nd
            LEFT JOIN nhan_vien nv ON nd.nhan_vien_id = nv.id
            LEFT JOIN phong_ban pb ON nv.phong_ban_id = pb.id
            WHERE nd.username = ?
        `;
        const [users] = await db.execute(sql, [username]);

        if (users.length === 0) return res.status(400).json({ message: 'Tài khoản không tồn tại' });

        const user = users[0];

        let match = await bcrypt.compare(password, user.password);
        if (!match && password === user.password) match = true;

        if (!match) return res.status(400).json({ message: 'Sai mật khẩu' });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, nhanVienId: user.nhan_vien_id },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        return res.json({
            message: 'Đăng nhập thành công',
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                nhanVienId: user.nhan_vien_id,
                hoTen: user.ho_ten || user.username,
                tenPhong: user.ten_phong || 'Văn phòng',
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi Server' });
    }
});

router.post('/change-password', verifyToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Vui lòng nhập đủ thông tin' });
    }

    try {
        const [users] = await db.execute('SELECT password FROM nguoi_dung WHERE id = ?', [userId]);
        const user = users[0];

        let match = await bcrypt.compare(oldPassword, user.password);
        if (!match && oldPassword === user.password) match = true;

        if (!match) return res.status(400).json({ message: 'Mật khẩu cũ không đúng' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.execute('UPDATE nguoi_dung SET password = ? WHERE id = ?', [hashedPassword, userId]);

        return res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi đổi mật khẩu' });
    }
});

module.exports = router;
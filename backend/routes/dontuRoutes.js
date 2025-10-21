/* maychu/routes/dontuRoutes.js */
const express = require('express');
const router = express.Router();
const db = require('../data/db');
const { verifyToken, requireHR } = require('../middlewares/authMiddleware');

/**
 * @route GET /dontu
 * @desc Lấy danh sách đơn từ.
 *       - HR: xem tất cả đơn của nhân viên.
 *       - Nhân viên: xem đơn của chính mình.
 * @access Private
 */
router.get('/', verifyToken, (req, res) => {
    if (req.user.role === 'HR') {
        // HR xem tất cả đơn
        return res.json(db.requests);
    } else {
        // Nhân viên xem đơn của mình
        const myRequests = db.requests.filter(reqt => reqt.nhanVienId === req.user.nhanVienId);
        return res.json(myRequests);
    }
});

/**
 * @route POST /dontu
 * @desc Gửi đơn từ (nhân viên tạo đơn xin nghỉ phép, công tác)
 * @access Private (nhân viên thường)
 */
router.post('/', verifyToken, (req, res) => {
    // Chỉ cho phép nhân viên (EMP) tạo đơn, HR không tạo ở đây
    if (req.user.role !== 'EMP') {
        return res.status(403).json({ message: 'Chỉ nhân viên mới được tạo đơn' });
    }
    const { loai, tuNgay, denNgay, lyDo } = req.body;
    if (!loai || !tuNgay || !denNgay) {
        return res.status(400).json({ message: 'Thiếu thông tin đơn (loại đơn, từ ngày, đến ngày)' });
    }
    // Tạo đối tượng đơn từ mới
    const newId = db.requests.length > 0 ? Math.max(...db.requests.map(r => r.id)) + 1 : 1;
    const newRequest = {
        id: newId,
        nhanVienId: req.user.nhanVienId,
        loai,
        tuNgay,
        denNgay,
        lyDo,
        trangThai: 'Chờ duyệt'
    };
    db.requests.push(newRequest);
    db.saveData('dontu.json', db.requests);
    return res.status(201).json({ message: 'Đã gửi đơn', request: newRequest });
});

/**
 * @route PUT /dontu/:id
 * @desc Duyệt hoặc cập nhật trạng thái đơn từ (HR duyệt đơn)
 * @access Private (HR)
 */
router.put('/:id', verifyToken, requireHR, (req, res) => {
    const reqId = parseInt(req.params.id);
    const request = db.requests.find(r => r.id === reqId);
    if (!request) {
        return res.status(404).json({ message: 'Đơn không tồn tại' });
    }
    const { trangThai } = req.body;
    if (!trangThai) {
        return res.status(400).json({ message: 'Thiếu trạng thái mới' });
    }
    // Chỉ cho phép cập nhật thành "Đã duyệt" hoặc "Từ chối"
    const allowed = ['Đã duyệt', 'Từ chối'];
    if (!allowed.includes(trangThai)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
    // Cập nhật trạng thái
    request.trangThai = trangThai;
    db.saveData('dontu.json', db.requests);
    return res.json({ message: 'Đã cập nhật trạng thái đơn', request });
});

module.exports = router;

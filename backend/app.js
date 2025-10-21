/* maychu/app.js */
const express = require('express');
const cors = require('cors');

// Khởi tạo ứng dụng Express
const app = express();

// Cấu hình cổng cho server (mặc định 5000 hoặc lấy từ biến môi trường)
const PORT = process.env.PORT || 5000;

// Middleware để parse JSON body từ các request
app.use(express.json());

// Middleware cho CORS (cho phép các request từ domain khác - cần cho React frontend)
app.use(cors());

// Middleware đơn giản log request (tùy chọn, có thể bỏ nếu không cần)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Import các route module
const authRoutes = require('./routes/authRoutes');
const nhanvienRoutes = require('./routes/nhanvienRoutes');
const phongbanRoutes = require('./routes/phongbanRoutes');
const bangluongRoutes = require('./routes/bangluongRoutes');
const dontuRoutes = require('./routes/dontuRoutes');

// Sử dụng các route module với đường dẫn gốc tương ứng
app.use('/api/auth', authRoutes);
app.use('/api/nhanvien', nhanvienRoutes);
app.use('/api/phongban', phongbanRoutes);
app.use('/api/bangluong', bangluongRoutes);
app.use('/api/dontu', dontuRoutes);

// Route đơn giản kiểm tra server
app.get('/api', (req, res) => {
    res.send('Server quản lý nhân sự đang chạy');
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const phongbanRoutes = require('./routes/phongbanRoutes');
const nhanvienRoutes = require('./routes/nhanvienRoutes');
const bangluongRoutes = require('./routes/bangluongRoutes');
const dontuRoutes = require('./routes/dontuRoutes');
const chamcongRoutes = require('./routes/chamcongRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/phongban', phongbanRoutes);
app.use('/api/nhanvien', nhanvienRoutes);
app.use('/api/bangluong', bangluongRoutes);
app.use('/api/dontu', dontuRoutes);
app.use('/api/chamcong', chamcongRoutes);
app.use('/api/baocao', reportRoutes);

app.get('/', (req, res) => {
    res.send('HR Management API is running with MySQL...');
});

app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
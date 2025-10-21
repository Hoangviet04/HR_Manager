/* maychu/data/db.js */
const fs = require('fs');
const path = require('path');

// Đường dẫn tới thư mục hiện tại (chứa các file JSON dữ liệu)
const dataDir = __dirname;

// Đọc dữ liệu từ các file JSON và parse thành Object/Array khi khởi động
let users = JSON.parse(fs.readFileSync(path.join(dataDir, 'users.json'), 'utf8'));
let employees = JSON.parse(fs.readFileSync(path.join(dataDir, 'nhanvien.json'), 'utf8'));
let departments = JSON.parse(fs.readFileSync(path.join(dataDir, 'phongban.json'), 'utf8'));
let payrolls = JSON.parse(fs.readFileSync(path.join(dataDir, 'bangluong.json'), 'utf8'));
let requests = JSON.parse(fs.readFileSync(path.join(dataDir, 'dontu.json'), 'utf8'));

/**
 * Lưu dữ liệu JSON vào file.
 * @param {string} fileName Tên file (bao gồm .json)
 * @param {Object|Array} data Dữ liệu cần lưu (sẽ được stringify và ghi vào file)
 */
function saveData(fileName, data) {
    fs.writeFileSync(path.join(dataDir, fileName), JSON.stringify(data, null, 4), 'utf8');
}

// Xuất ra các biến và hàm để module khác sử dụng
module.exports = {
    users,
    employees,
    departments,
    payrolls,
    requests,
    saveData
};

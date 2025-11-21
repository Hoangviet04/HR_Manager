# 🏢 HR Manager - Hệ thống Quản lý Nhân sự

![Node.js](https://img.shields.io/badge/Node.js-v14%2B-green)
![React](https://img.shields.io/badge/React-v18-blue)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)

Đây là dự án Fullstack Web Application giúp doanh nghiệp quản lý nhân sự, chấm công, tính lương và báo cáo một cách hiệu quả. Hệ thống phân quyền rõ ràng giữa Quản trị viên và Nhân viên .

## 👥 Đội ngũ phát triển

Dự án này được xây dựng và phát triển bởi nhóm sinh viên:

| STT | Họ và tên |MSSV|
|:---:|:---|:---|
| 1 | **Đinh Hoàng Việt** | 22010354 |
| 2 | **Chu Công Vinh** | 22010358 |
| 3 | **Đặng Tuấn Cảnh** | 22010374 |
| 4 | **Lê Vũ Danh** | 22014522 |

**Giảng viên hướng dẫn: ThS. Vũ Quang Dũng**

## 🌟 Tính năng nổi bật

### 👨‍💼 Dành cho Quản trị viên (HR)
* **Quản lý Nhân viên:** Thêm, sửa, xóa, tìm kiếm, lọc theo phòng ban/giới tính.
* **Quản lý Phòng ban:** Thêm mới, cập nhật danh sách phòng ban.
* **Tính lương tự động:** * Tự động load mức lương cơ bản.
    * Tính toán phụ cấp, thưởng chuyên cần, khấu trừ BHXH (8%) và thực lĩnh.
    * Xuất bảng lương ra **Excel** và **PDF**.
* **Quản lý Đơn từ:** Duyệt hoặc từ chối đơn xin nghỉ phép/công tác.
* **Báo cáo & Thống kê:**
    * Dashboard trực quan với biểu đồ (Recharts).
    * Báo cáo tổng hợp theo tháng (Biến động nhân sự, tổng chi lương).
    * Xuất báo cáo tổng hợp ra file.

### 👩‍💻 Dành cho Nhân viên (Employee)
* **Chấm công:** Check-in / Check-out hàng ngày.
* **Xem lịch sử:** Theo dõi lịch sử đi làm, trạng thái đi muộn/về sớm.
* **Đơn từ:** Tạo đơn xin nghỉ phép, công tác và theo dõi trạng thái duyệt.
* **Bảng lương:** Xem chi tiết phiếu lương cá nhân và in phiếu lương (PDF).
* **Cá nhân:** Đổi mật khẩu, xem thông tin hồ sơ cá nhân.
* **Giới thiệu:** Xem thông tin về đội ngũ phát triển dự án.

## 🛠️ Công nghệ sử dụng

### Backend
* **Node.js & Express:** Xây dựng RESTful API.
* **MySQL:** Cơ sở dữ liệu quan hệ.
* **JWT (JsonWebToken):** Xác thực và phân quyền bảo mật.
* **Bcrypt:** Mã hóa mật khẩu.

### Frontend
* **ReactJS:** Thư viện UI Component.
* **Material UI (MUI):** Giao diện hiện đại, chuẩn UX.
* **Axios:** Kết nối API.
* **Recharts:** Vẽ biểu đồ thống kê.
* **XLSX & jsPDF:** Xử lý xuất file báo cáo, bảng lương.

---

## 🚀 Hướng dẫn cài đặt

Làm theo các bước sau để chạy dự án trên máy local:

### 1. Clone dự án
```bash
git clone https://github.com/Hoangviet04/HR_Manager.git
```

### 2. Cài đặt Cơ sở dữ liệu (Database)
1. Mở MySQL Workbench hoặc phpMyAdmin.
2. Tạo database mới tên là `quanlynhansu`.
3. Import file `database/quanlynhansu.sql` vào database vừa tạo.

### 3. Cài đặt Backend
```bash
cd backend
npm install
```
Tạo file .env trong thư mục backend và cấu hình:
```Đoạn mã
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mat_khau_mysql_cua_ban
DB_NAME=quan_ly_nhan_su
JWT_SECRET=chuoi_bi_mat_cua_ban
```

Chạy server:
Bash
```
node server.js
```

* Hoặc nếu dùng nodemon: npm run dev

Server sẽ chạy tại: http://localhost:5000

### 4. Cài đặt Frontend
Mở một terminal mới:
```bash
cd frontend
npm install
npm start
```
Trang web sẽ tự động mở tại: http://localhost:3000

---

## 🔐 Tài khoản Demo

Sử dụng các tài khoản sau để trải nghiệm hệ thống:

| Vai trò | Username | Password |
| :--- | :--- | :--- |
| **Quản trị (HR)** | `admin` | `123456` |
| **Nhân viên (EMP)** | `nhanvien` | `123456` |

---



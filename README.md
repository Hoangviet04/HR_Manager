Dự án Quản Lý Nhân Sự (HR Management System)
🧠 Giới thiệu dự án

Tên đề tài: Xây dựng phần mềm quản lý nhân sự (Human Resource Management System – HRM)
Trường: Trường Đại học Phenikaa
Giảng viên hướng dẫn: TS. Vũ Quang Dũng
Nhóm thực hiện:
Đinh Hoàng Việt – 22010354
Đặng Tuấn Cảnh – 22010374
Chu Công Vinh – 22010358
Vũ Danh - 

🎯 Mục tiêu dự án

Hệ thống HRM được xây dựng nhằm:

Tự động hóa nghiệp vụ nhân sự: quản lý hồ sơ nhân viên, hợp đồng, chấm công, tính lương, duyệt đơn từ.

Cung cấp giao diện trực quan: giúp HR dễ thao tác, nhân viên dễ tra cứu thông tin.

Xuất báo cáo chính xác: về nhân sự, chấm công và lương theo phòng ban hoặc toàn công ty.

Bảo mật và toàn vẹn dữ liệu, hỗ trợ phân quyền rõ ràng giữa HR Manager và nhân viên.

🧩 Chức năng chính
🔹 Phân hệ Quản lý (HR Manager)

Quản lý hồ sơ nhân viên (thêm, sửa, xóa, tra cứu)

Quản lý chấm công và ca làm

Tính lương tự động

Duyệt/từ chối đơn từ (nghỉ phép, làm thêm giờ, công tác)

Xuất báo cáo tổng hợp (Excel/PDF)

🔹 Phân hệ Nhân viên

Xem và cập nhật hồ sơ cá nhân

Gửi đơn xin nghỉ phép / làm thêm giờ / công tác

Tra cứu bảng lương và lịch làm việc

Nhận thông báo duyệt/từ chối từ HR

⚙️ Kiến trúc hệ thống

Ứng dụng được thiết kế theo mô hình Client – Server gồm 3 tầng:

Frontend (Client):

Dự kiến sử dụng ReactJS hoặc VueJS.

Cung cấp giao diện cho HR và nhân viên truy cập qua trình duyệt.

Backend (Server):

Sử dụng Node.js (Express) hoặc Python (Django/FastAPI).

Cung cấp API RESTful cho Frontend.

Xử lý nghiệp vụ: quản lý hồ sơ, tính lương, duyệt đơn, sinh báo cáo.

Database:

Dùng MySQL hoặc PostgreSQL.

Lưu trữ tập trung dữ liệu nhân viên, chấm công, bảng lương, đơn từ.

🧱 Mô hình cơ sở dữ liệu (tóm tắt)

NhanVien ↔ PhongBan: N–1

NhanVien ↔ ChucVu: N–1

NhanVien ↔ HopDong: 1–N

NhanVien ↔ ChamCong: 1–N

NhanVien ↔ BangLuong: 1–N

🖥️ Hướng dẫn cài đặt
📌 Yêu cầu môi trường

Node.js >= 18

npm hoặc yarn

MySQL >= 8

Git

🔧 Cách cài đặt và chạy

Giải nén file dự án

quanlynhansu.rar → ./quanlynhansu/


Cài đặt dependencies

cd backend
npm install


Cấu hình file .env (trong thư mục backend)

PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=quanlynhansu
JWT_SECRET=secret_key


Khởi tạo cơ sở dữ liệu

npx sequelize db:create
npx sequelize db:migrate


Chạy backend

npm start


Mặc định tại: http://localhost:5000

Chạy frontend

cd frontend
npm install
npm start


Mặc định tại: http://localhost:3000

📊 Hướng dẫn sử dụng

Truy cập giao diện web.

Đăng nhập:

HR Manager (Admin): có toàn quyền quản lý

Nhân viên: chỉ xem và gửi đơn

Các chức năng chính nằm ở menu bên trái:

“Quản lý nhân viên”, “Chấm công”, “Tính lương”, “Đơn từ”, “Báo cáo”.

🚀 Hướng phát triển tương lai

Thêm module tuyển dụng và đào tạo.

Tích hợp thiết bị chấm công vân tay hoặc QR code.

Phát triển ứng dụng di động (React Native / Flutter).

Kết nối API với hệ thống ERP hoặc kế toán.
NhanVien ↔ DonTu: 1–N

NguoiDung ↔ NhanVien: 1–1

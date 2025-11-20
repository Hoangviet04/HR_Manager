-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: quanlynhansu
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bang_luong`
--

DROP TABLE IF EXISTS `bang_luong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bang_luong` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nhan_vien_id` int NOT NULL,
  `thang` int NOT NULL,
  `nam` int NOT NULL,
  `luong_co_ban` decimal(15,0) DEFAULT NULL,
  `phu_cap` decimal(15,0) DEFAULT '0',
  `thuong` decimal(15,0) DEFAULT '0',
  `chuyen_can` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_payroll` (`nhan_vien_id`,`thang`,`nam`),
  CONSTRAINT `bang_luong_ibfk_1` FOREIGN KEY (`nhan_vien_id`) REFERENCES `nhan_vien` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lưu trữ lịch sử lương của nhân viên';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bang_luong`
--

LOCK TABLES `bang_luong` WRITE;
/*!40000 ALTER TABLE `bang_luong` DISABLE KEYS */;
INSERT INTO `bang_luong` VALUES (10,1,1,2025,50000000,300000,2000000,1),(11,5,1,2025,12000000,500000,1500000,1),(12,2,11,2025,15000000,1000000,3000000,1),(13,6,3,2025,10000000,1000000,4500000,0),(14,11,5,2025,12000000,1000000,5000000,1),(15,12,6,2025,10000000,1000000,5000000,1),(16,1,12,2025,50000000,1000000,5000000,1),(17,8,8,2025,10000000,1500000,5000000,1);
/*!40000 ALTER TABLE `bang_luong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cham_cong`
--

DROP TABLE IF EXISTS `cham_cong`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cham_cong` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nhan_vien_id` int NOT NULL,
  `ngay` date NOT NULL,
  `gio_vao` time DEFAULT NULL,
  `gio_ra` time DEFAULT NULL,
  `trang_thai` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'Đúng giờ',
  `ghi_chu` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `idx_chamcong_ngay` (`ngay`),
  KEY `idx_chamcong_nv` (`nhan_vien_id`),
  CONSTRAINT `cham_cong_ibfk_1` FOREIGN KEY (`nhan_vien_id`) REFERENCES `nhan_vien` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cham_cong`
--

LOCK TABLES `cham_cong` WRITE;
/*!40000 ALTER TABLE `cham_cong` DISABLE KEYS */;
INSERT INTO `cham_cong` VALUES (1,1,'2025-11-20','22:36:28','22:36:39','Đi muộn',NULL),(2,2,'2025-11-20','23:09:53','23:09:57','Đi muộn',NULL);
/*!40000 ALTER TABLE `cham_cong` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `don_tu`
--

DROP TABLE IF EXISTS `don_tu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `don_tu` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nhan_vien_id` int NOT NULL,
  `loai` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Ví dụ: Nghỉ phép, Công tác',
  `tu_ngay` date NOT NULL,
  `den_ngay` date NOT NULL,
  `ly_do` text COLLATE utf8mb4_unicode_ci,
  `trang_thai` enum('Chờ duyệt','Đã duyệt','Từ chối') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Chờ duyệt',
  PRIMARY KEY (`id`),
  KEY `nhan_vien_id` (`nhan_vien_id`),
  CONSTRAINT `don_tu_ibfk_1` FOREIGN KEY (`nhan_vien_id`) REFERENCES `nhan_vien` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lưu trữ các đơn từ của nhân viên';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `don_tu`
--

LOCK TABLES `don_tu` WRITE;
/*!40000 ALTER TABLE `don_tu` DISABLE KEYS */;
INSERT INTO `don_tu` VALUES (4,2,'Nghỉ phép','2025-11-20','2025-11-25','Việc gia đình','Từ chối'),(5,2,'Công tác','2025-11-22','2025-11-30','Công tác','Đã duyệt'),(6,2,'Nghỉ phép','2025-11-20','2025-11-23','Sức khỏe','Đã duyệt'),(7,2,'Nghỉ phép','2025-10-29','2025-11-11','ko','Chờ duyệt');
/*!40000 ALTER TABLE `don_tu` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nguoi_dung`
--

DROP TABLE IF EXISTS `nguoi_dung`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nguoi_dung` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Lưu mật khẩu đã được băm (hashed)',
  `role` enum('HR','EMP') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Vai trò: HR (Quản lý nhân sự), EMP (Nhân viên)',
  `nhan_vien_id` int DEFAULT NULL COMMENT 'Liên kết 1-1 với nhân viên, không được trùng',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `nhan_vien_id` (`nhan_vien_id`),
  CONSTRAINT `nguoi_dung_ibfk_1` FOREIGN KEY (`nhan_vien_id`) REFERENCES `nhan_vien` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lưu trữ tài khoản đăng nhập và phân quyền';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nguoi_dung`
--

LOCK TABLES `nguoi_dung` WRITE;
/*!40000 ALTER TABLE `nguoi_dung` DISABLE KEYS */;
INSERT INTO `nguoi_dung` VALUES (4,'admin','$2b$10$LOhJg9ngI.QZTRgMFD6hQOaEJ7DpBhzt.m0bBpZ.3YoDdHQ7UZg5W','HR',1),(5,'nhanvien','$2b$10$GEOqI14/qicZv2MCVZEP4uPeLskJYk1c28tIiC/AlkZgS5NcXT57a','EMP',2);
/*!40000 ALTER TABLE `nguoi_dung` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `nhan_vien`
--

DROP TABLE IF EXISTS `nhan_vien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nhan_vien` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ho_ten` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gioi_tinh` enum('Nam','Nữ','Khác') COLLATE utf8mb4_unicode_ci DEFAULT 'Nam',
  `ngay_sinh` date DEFAULT NULL,
  `dia_chi` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `so_dien_thoai` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Email là duy nhất cho mỗi nhân viên',
  `phong_ban_id` int DEFAULT NULL,
  `chuc_vu` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ngay_vao_lam` date DEFAULT NULL,
  `luong_co_ban` decimal(15,2) DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `phong_ban_id` (`phong_ban_id`),
  CONSTRAINT `nhan_vien_ibfk_1` FOREIGN KEY (`phong_ban_id`) REFERENCES `phong_ban` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lưu trữ thông tin chi tiết của nhân viên';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `nhan_vien`
--

LOCK TABLES `nhan_vien` WRITE;
/*!40000 ALTER TABLE `nhan_vien` DISABLE KEYS */;
INSERT INTO `nhan_vien` VALUES (1,'Đinh Hoàng Việt','Nam','1990-01-01','Hà Nội','0909123456','admin@company.com',1,'Trưởng phòng','2023-01-01',50000000.00),(2,'Chu Công Vinh','Nam','1998-05-20','TP.HCM','0912345678','dev@company.com',2,'Lập trình viên','2023-06-01',15000000.00),(5,'Nguyễn Văn Tuấn','Nam','2000-12-31','Hà Nội','0999999999','tuan@gmail.com',2,'Nhân viên','2025-11-04',12000000.00),(6,'Nguyễn Văn Tú','Nam','2000-12-12','Hồ Chí Minh','0999999998','tu@gmail.com',5,'Nhân viên','2025-11-02',10000000.00),(7,'Nguyễn Văn An','Nam','2001-11-11','Đà Nẵng','0898787876','an@gmail.com',6,'Nhân viên','2025-11-20',120000000.00),(8,'Đỗ Văn Tuấn','Nam','2001-02-22','Phú Thọ','0378541254','dtuan@gmail.com',4,'Nhân viên','2025-11-20',10000000.00),(9,'Đỗ Duy Long','Nam','2000-11-01','Hà Nội','0988776655','long@gmail.com',4,'Nhân viên','2025-11-20',15000000.00),(10,'Nguyễn Hải Vân','Nữ','2000-02-04','Hà Nội','0345345456','van@gmail.com',7,'Nhân viên','2025-10-27',15000000.00),(11,'Nguyễn Ngọc Linh','Nữ','2002-04-05','Đà Nẵng','0453567453','linh@gmail.com',8,'Nhân viên','2025-11-11',12000000.00),(12,'Lương Văn Trường','Nam','2025-10-28','Hà Nội','0987654321','truong@gmail.com',6,'Nhân viên','2025-11-19',10000000.00),(13,'Trần Thị Uyên','Nữ','1999-01-11','Hồ Chí Minh','0356654458','uyen@gmail.com',7,'Nhân viên','2025-10-29',15000000.00);
/*!40000 ALTER TABLE `nhan_vien` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phong_ban`
--

DROP TABLE IF EXISTS `phong_ban`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `phong_ban` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ten_phong` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên phòng ban, không được trùng',
  PRIMARY KEY (`id`),
  UNIQUE KEY `ten_phong` (`ten_phong`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Lưu trữ danh sách các phòng ban trong công ty';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phong_ban`
--

LOCK TABLES `phong_ban` WRITE;
/*!40000 ALTER TABLE `phong_ban` DISABLE KEYS */;
INSERT INTO `phong_ban` VALUES (7,'Chăm sóc khách hàng'),(5,'Kế toán'),(6,'Kinh doanh'),(8,'Marketing'),(4,'Nhân sự'),(2,'Phòng IT'),(1,'Phòng Quản trị');
/*!40000 ALTER TABLE `phong_ban` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-21  2:45:30

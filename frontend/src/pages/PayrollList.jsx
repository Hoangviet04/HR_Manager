import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Link } from "react-router-dom";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, Stack, Tooltip,
  TextField, MenuItem, InputAdornment, Grid
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Hàm chuyển tiếng Việt có dấu -> không dấu
const removeVietnameseTones = (str) => {
  if (!str) return "";
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  return str;
}

function PayrollList() {
  const [payrolls, setPayrolls] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterMonth, setFilterMonth] = useState("all");

  const BONUS_CHUYEN_CAN = 500000;

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    setRole(currentUser ? currentUser.role : "");
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axiosClient.get("/api/bangluong");
      setPayrolls(res.data);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa bảng lương này?")) {
      try {
        await axiosClient.delete(`/api/bangluong/${id}`);
        setPayrolls((prev) => prev.filter((p) => p.id !== id));
        alert("Đã xóa bảng lương");
      } catch (error) {
        console.error("Lỗi xóa:", error);
      }
    }
  };

  const calculateData = (p) => {
    const chuyenCan = p.chuyenCan ? BONUS_CHUYEN_CAN : 0;
    const tongThuNhap = Number(p.luongCoBan) + Number(p.phuCap) + Number(p.thuong) + chuyenCan;
    const bhxh = Number(p.luongCoBan) * 0.08;
    const thucLinh = tongThuNhap - bhxh;
    return { chuyenCan, tongThuNhap, bhxh, thucLinh };
  };

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredPayrolls = payrolls.filter((p) => {
    // 1. Lọc theo tên nhân viên (chuyển về thường để so sánh)
    const nameMatch = p.hoTen.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Lọc theo tháng
    const monthMatch = filterMonth === "all" || p.thang === parseInt(filterMonth);

    return nameMatch && monthMatch;
  });

  // --- XUẤT EXCEL ---
  const exportToExcel = () => {
    const excelData = filteredPayrolls.map(p => {
      const { chuyenCan, bhxh, thucLinh, tongThuNhap } = calculateData(p);
      return {
        'Tháng': p.thang,
        'Năm': p.nam,
        'Họ Tên': p.hoTen,
        'Lương Cơ Bản': p.luongCoBan,
        'Phụ Cấp': p.phuCap,
        'Thưởng': p.thuong,
        'Chuyên Cần': chuyenCan,
        'Tổng Thu Nhập': tongThuNhap,
        'Trừ BHXH (8%)': bhxh,
        'THỰC LĨNH': thucLinh
      };
    });
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BangLuong");
    XLSX.writeFile(wb, `Bang_Luong_Loc_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // --- XUẤT PDF ---
  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Khổ ngang

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("BANG LUONG TONG HOP NHAN VIEN", 14, 15);

    const tableColumn = ["Thang/Nam", "Ten Nhan Vien", "Luong CB", "Phu Cap", "Thuong", "Chuyen Can", "BHXH (8%)", "THUC LINH"];
    const tableRows = [];

    filteredPayrolls.forEach(p => {
      const { chuyenCan, bhxh, thucLinh } = calculateData(p);
      const fmt = (num) => Number(num).toLocaleString('en-US');
      const rowData = [
        `${p.thang}/${p.nam}`,
        removeVietnameseTones(p.hoTen),
        fmt(p.luongCoBan),
        fmt(p.phuCap),
        fmt(p.thuong),
        fmt(chuyenCan),
        fmt(bhxh),
        fmt(thucLinh)
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      theme: 'grid',
      styles: { font: "helvetica", fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
    });

    doc.save(`Bang_Luong_Tong_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // --- IN PHIẾU CÁ NHÂN ---
  const printPayslip = (p) => {
    const doc = new jsPDF();
    const { chuyenCan, bhxh, thucLinh, tongThuNhap } = calculateData(p);
    const fmt = (num) => `${Number(num).toLocaleString('en-US')} VND`;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("PHIEU LUONG CHI TIET", 105, 20, null, null, "center");

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Nhan vien: ${removeVietnameseTones(p.hoTen)}`, 20, 40);
    doc.text(`Ky luong: Thang ${p.thang}/${p.nam}`, 20, 50);
    doc.line(20, 55, 190, 55);

    let y = 70;
    const addLine = (label, value) => {
      doc.text(label, 20, y);
      doc.text(value, 190, y, null, null, "right");
      y += 10;
    };

    addLine("Luong co ban:", fmt(p.luongCoBan));
    addLine("Phu cap:", fmt(p.phuCap));
    addLine("Thuong:", fmt(p.thuong));
    addLine("Chuyen can:", fmt(chuyenCan));

    doc.setFont("helvetica", "bold");
    addLine("--- Tong thu nhap ---", fmt(tongThuNhap));

    doc.setFont("helvetica", "normal");
    doc.setTextColor(220, 38, 38);
    addLine("Tru BHXH (8%):", `-${fmt(bhxh)}`);

    doc.line(20, y, 190, y);
    y += 15;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("THUC LINH:", 20, y);
    doc.text(fmt(thucLinh), 190, y, null, null, "right");

    doc.save(`PhieuLuong_${removeVietnameseTones(p.hoTen)}.pdf`);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", px: 3, mt: 3, gap: 3 }}>

      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(180deg, #1E293B 0%, #334155 100%)", borderRadius: "12px", px: 3, py: 2.5, boxShadow: "0 4px 20px rgba(30, 41, 59, 0.3)" }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "white" }}>💰 Bảng lương nhân viên</Typography>

        {role === "HR" && (
          <Stack direction="row" spacing={2}>
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportToExcel} sx={{ bgcolor: "#10B981", "&:hover": { bgcolor: "#059669" } }}>
              Excel
            </Button>

            <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={exportToPDF} sx={{ bgcolor: "#F59E0B", "&:hover": { bgcolor: "#D97706" } }}>
              PDF Tổng
            </Button>

            <Button component={Link} to="/bangluong/them" startIcon={<AddIcon />} sx={{
              bgcolor: "#38BDF8", color: "#0F172A", fontWeight: "bold", borderRadius: "8px", px: 2, "&:hover": { bgcolor: "#0EA5E9" }
            }}>
              Tính lương
            </Button>
          </Stack>
        )}
      </Box>

      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Tìm theo tên nhân viên..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Tháng"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterAltIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="all">Tất cả các tháng</MenuItem>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((thang) => (
                <MenuItem key={thang} value={thang}>Tháng {thang}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Nút Reset */}
          <Grid item xs={6} md={2}>
            <Button
              color="secondary"
              onClick={() => { setSearchTerm(""); setFilterMonth("all"); }}
              disabled={!searchTerm && filterMonth === "all"}
            >
              Xóa lọc
            </Button>
          </Grid>

          {/* Hiển thị số lượng kết quả */}
          <Grid item xs={12} md={2} sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary" fontWeight="bold">
              {filteredPayrolls.length} bản ghi
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Table */}
      {loading ? <Box sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /></Box> : (
        <TableContainer component={Paper} sx={{ boxShadow: "0 10px 35px rgba(0,0,0,0.05)", borderRadius: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#334155" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Kỳ lương</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Nhân viên</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Lương CB</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Phụ cấp/Thưởng</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Chuyên cần</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>BHXH (8%)</TableCell>
                <TableCell sx={{ color: "#4ADE80", fontWeight: "bold" }}>THỰC LĨNH</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }} align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayrolls.length > 0 ? filteredPayrolls.map((p) => {
                const { chuyenCan, bhxh, thucLinh } = calculateData(p);
                const extra = Number(p.phuCap) + Number(p.thuong);
                const chuyenCanAmount = chuyenCan;

                return (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.thang}/{p.nam}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{p.hoTen}</TableCell>
                    <TableCell>{Number(p.luongCoBan).toLocaleString()}</TableCell>
                    <TableCell>{extra > 0 ? `+${extra.toLocaleString()}` : '-'}</TableCell>
                    <TableCell sx={{ color: chuyenCanAmount > 0 ? '#10B981' : 'inherit', fontWeight: chuyenCanAmount > 0 ? 500 : 400 }}>
                      {chuyenCanAmount > 0 ? `+${chuyenCanAmount.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell sx={{ color: '#DC2626' }}>-{bhxh.toLocaleString()}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#059669', fontSize: '1rem' }}>
                      {thucLinh.toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" justifyContent="center" spacing={1}>
                        <Tooltip title="In phiếu lương">
                          <Button variant="outlined" size="small" onClick={() => printPayslip(p)} sx={{ minWidth: 0, px: 1 }}>
                            <PrintIcon fontSize="small" />
                          </Button>
                        </Tooltip>
                        {role === "HR" && (
                          <>
                            <Button component={Link} to={`/bangluong/${p.id}/sua`} sx={{ minWidth: 0, px: 1 }}><EditIcon fontSize="small" /></Button>
                            <Button color="error" onClick={() => handleDelete(p.id)} sx={{ minWidth: 0, px: 1 }}><DeleteIcon fontSize="small" /></Button>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.secondary' }}>Không tìm thấy dữ liệu phù hợp.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default PayrollList;
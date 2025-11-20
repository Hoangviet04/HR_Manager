import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Link } from "react-router-dom";
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, CircularProgress, TextField, MenuItem, InputAdornment, Grid
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState("all");
  const [filterGender, setFilterGender] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empRes, deptRes] = await Promise.all([
          axiosClient.get("/api/nhanvien"),
          axiosClient.get("/api/phongban"),
        ]);
        setEmployees(empRes.data);
        setDepartments(deptRes.data);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa nhân viên này?")) {
      try {
        await axiosClient.delete(`/api/nhanvien/${id}`);
        setEmployees(employees.filter((e) => e.id !== id));
        alert("Đã xóa nhân viên");
      } catch (error) {
        console.error("Lỗi xóa nhân viên:", error);
        alert(error.response?.data?.message || "Không thể xóa nhân viên này.");
      }
    }
  };

  // --- LOGIC LỌC DỮ LIỆU ---
  const filteredEmployees = employees.filter((emp) => {
    // 1. Lọc theo tên hoặc email
    const matchSearch =
      emp.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Lọc theo phòng ban
    const matchDept = filterDept === "all" || emp.phongBanId === parseInt(filterDept);

    // 3. Lọc theo giới tính
    const matchGender = filterGender === "all" || emp.gioiTinh === filterGender;

    return matchSearch && matchDept && matchGender;
  });

  const departmentMap = {};
  departments.forEach((d) => { departmentMap[d.id] = d.tenPhong; });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", px: 3, mt: 3, gap: 3 }}>

      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "linear-gradient(180deg, #1E293B 0%, #334155 100%)",
        borderRadius: "12px",
        px: 3, py: 2.5,
        boxShadow: "0 4px 20px rgba(30, 41, 59, 0.3)"
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "white" }}>👥 Danh sách nhân viên</Typography>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', px: 1.5, py: 0.5, borderRadius: '8px', color: '#94a3b8', fontSize: '0.875rem' }}>
            {filteredEmployees.length} nhân sự
          </Box>
        </Box>
        <Button
          component={Link}
          to="/nhanvien/them"
          startIcon={<AddIcon />}
          sx={{
            bgcolor: "#90c7e8ff",
            color: "#0F172A",
            fontWeight: "bold",
            borderRadius: "8px",
            px: 2,
            "&:hover": { bgcolor: "#548ea9d5" }
          }}
        >
          Thêm mới
        </Button>
      </Box>

      {/* Thanh Công Cụ (Tìm kiếm & Filter) */}
      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <Grid container spacing={2} alignItems="center">
          {/* Ô tìm kiếm */}
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên hoặc email..."
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

          {/* Lọc Phòng ban */}
          <Grid item xs={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Phòng ban"
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterAltIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="all">Tất cả phòng ban</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept.id} value={dept.id}>{dept.tenPhong}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Lọc Giới tính */}
          <Grid item xs={6} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Giới tính"
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="Nam">Nam</MenuItem>
              <MenuItem value="Nữ">Nữ</MenuItem>
            </TextField>
          </Grid>

          {/* Nút Reset (nếu cần) */}
          <Grid item xs={12} md={1} sx={{ textAlign: 'right' }}>
            <Button
              variant="text"
              size="small"
              color="secondary"
              onClick={() => { setSearchTerm(""); setFilterDept("all"); setFilterGender("all"); }}
              disabled={!searchTerm && filterDept === "all" && filterGender === "all"}
            >
              Xóa lọc
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Bảng dữ liệu */}
      {loading ? (
        <Box sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: "0 10px 35px rgba(0,0,0,0.05)", borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#334155" }}> {/* Màu header bảng cũng đổi sang tông tối nhẹ */}
              <TableRow>
                {["Mã NV", "Họ tên", "Giới tính", "Phòng ban", "Chức vụ", "Email", "Điện thoại", "Hành động"].map(head => (
                  <TableCell key={head} sx={{ color: "white", fontWeight: "bold", whiteSpace: 'nowrap' }}>{head}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEmployees.length > 0 ? filteredEmployees.map((emp) => (
                <TableRow key={emp.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>{emp.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{emp.hoTen}</TableCell>
                  <TableCell>{emp.gioiTinh}</TableCell>
                  <TableCell>
                    <Box component="span" sx={{
                      bgcolor: '#F1F5F9', color: '#475569',
                      px: 1, py: 0.5, borderRadius: 1, fontSize: '0.75rem', fontWeight: 'bold'
                    }}>
                      {departmentMap[emp.phongBanId]}
                    </Box>
                  </TableCell>
                  <TableCell>{emp.chucVu}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>{emp.soDienThoai}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button component={Link} to={`/nhanvien/${emp.id}/sua`} variant="outlined" size="small" sx={{ minWidth: 0, p: 0.5 }}><EditIcon fontSize="small" /></Button>
                      <Button variant="outlined" color="error" size="small" sx={{ minWidth: 0, p: 0.5 }} onClick={() => handleDelete(emp.id)}><DeleteIcon fontSize="small" /></Button>
                    </Box>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                    Không tìm thấy nhân viên nào phù hợp.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}

export default EmployeeList;
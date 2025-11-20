import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { Link } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Grid
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Cancel";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

function RequestList() {
  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const userRole = currentUser ? currentUser.role : "";
    setRole(userRole);

    const fetchData = async () => {
      try {
        const resReq = await axiosClient.get("/api/dontu");
        setRequests(resReq.data);

        if (userRole === "HR") {
          const resEmp = await axiosClient.get("/api/nhanvien");
          setEmployees(resEmp.data);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đơn từ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      await axiosClient.put(`/api/dontu/${requestId}`, { trangThai: "Đã duyệt" });
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, trangThai: "Đã duyệt" } : r));
    } catch (error) {
      console.error("Lỗi khi duyệt đơn:", error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axiosClient.put(`/api/dontu/${requestId}`, { trangThai: "Từ chối" });
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, trangThai: "Từ chối" } : r));
    } catch (error) {
      console.error("Lỗi khi từ chối đơn:", error);
    }
  };

  const empNameMap = {};
  if (role === "HR") {
    employees.forEach((emp) => { empNameMap[emp.id] = emp.hoTen; });
  }

  // Logic lọc
  const filteredRequests = requests.filter((req) => {
    const empName = empNameMap[req.nhanVienId] || "";
    const matchSearch =
      empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.loai.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === "all" || req.trangThai === filterStatus;

    return matchSearch && matchStatus;
  });

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", px: 3, mt: 3, gap: 3 }}>

      {/* Header Gradient Đồng bộ */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(180deg, #1E293B 0%, #334155 100%)",
          borderRadius: "12px",
          px: 3,
          py: 2.5,
          boxShadow: "0 4px 20px rgba(30, 41, 59, 0.3)",
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "white" }}>
            📄 Danh sách đơn từ
          </Typography>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', px: 1.5, py: 0.5, borderRadius: '8px', color: '#94a3b8', fontSize: '0.875rem' }}>
            {filteredRequests.length} đơn
          </Box>
        </Box>

        {role === "EMP" && (
          <Button
            component={Link}
            to="/dontu/them"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: "#38BDF8",
              color: "#0F172A",
              fontWeight: "bold",
              borderRadius: "8px",
              px: 2,
              "&:hover": { bgcolor: "#0EA5E9" },
            }}
          >
            Gửi đơn mới
          </Button>
        )}
      </Box>

      {/* Thanh Công cụ Filter */}
      <Paper sx={{ p: 2, borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              placeholder={role === 'HR' ? "Tìm theo tên nhân viên hoặc loại đơn..." : "Tìm theo loại đơn..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              size="small"
              label="Trạng thái"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><FilterAltIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>,
              }}
            >
              <MenuItem value="all">Tất cả trạng thái</MenuItem>
              <MenuItem value="Chờ duyệt">Chờ duyệt</MenuItem>
              <MenuItem value="Đã duyệt">Đã duyệt</MenuItem>
              <MenuItem value="Từ chối">Từ chối</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Bảng dữ liệu */}
      {loading ? (
        <Box sx={{ textAlign: "center", mt: 5 }}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: "0 10px 35px rgba(0,0,0,0.05)", borderRadius: 3, overflow: "hidden" }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#334155" }}>
              <TableRow>
                {role === "HR" && <TableCell sx={{ color: "white", fontWeight: "bold" }}>Nhân viên</TableCell>}
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Loại đơn</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Từ ngày</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Đến ngày</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Lý do</TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Trạng thái</TableCell>
                {role === "HR" && <TableCell sx={{ color: "white", fontWeight: "bold" }}>Hành động</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.length > 0 ? filteredRequests.map((req) => (
                <TableRow key={req.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  {role === "HR" && <TableCell sx={{ fontWeight: 500 }}>{empNameMap[req.nhanVienId]}</TableCell>}
                  <TableCell>
                    <Chip
                      label={req.loai}
                      size="small"
                      sx={{ bgcolor: req.loai === 'Nghỉ phép' ? '#EFF6FF' : '#FDF2F8', color: req.loai === 'Nghỉ phép' ? '#1D4ED8' : '#BE185D', fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>{req.tuNgay}</TableCell>
                  <TableCell>{req.denNgay}</TableCell>
                  <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{req.lyDo}</TableCell>
                  <TableCell>
                    <Chip
                      label={req.trangThai}
                      size="small"
                      color={req.trangThai === "Đã duyệt" ? "success" : req.trangThai === "Từ chối" ? "error" : "warning"}
                      sx={{ fontWeight: "bold" }}
                    />
                  </TableCell>
                  {role === "HR" && (
                    <TableCell>
                      {req.trangThai === "Chờ duyệt" ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button size="small" variant="outlined" startIcon={<CheckIcon />} onClick={() => handleApprove(req.id)} sx={{ color: "#2e7d32", borderColor: "#2e7d32", minWidth: 0, px: 1 }}>
                            Duyệt
                          </Button>
                          <Button size="small" variant="outlined" color="error" startIcon={<CloseIcon />} onClick={() => handleReject(req.id)} sx={{ minWidth: 0, px: 1 }}>
                            Từ chối
                          </Button>
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">Đã xử lý</Typography>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={role === "HR" ? 7 : 6} align="center" sx={{ py: 5, color: "text.secondary" }}>
                    Không có đơn từ nào phù hợp.
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

export default RequestList;
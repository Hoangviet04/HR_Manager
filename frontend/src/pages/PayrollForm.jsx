import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box, Paper, Typography, TextField, MenuItem, Button,
  CircularProgress, Grid, Stack, FormControlLabel, Checkbox, Divider, InputAdornment
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function PayrollForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const BONUS_CHUYEN_CAN = 500000;

  const [payrollData, setPayrollData] = useState({
    nhanVienId: "",
    thang: new Date().getMonth() + 1,
    nam: new Date().getFullYear(),
    luongCoBan: 0,
    phuCap: 0,
    thuong: 0,
    chuyenCan: false,
  });

  const [calculated, setCalculated] = useState({ bhxh: 0, tongThuNhap: 0, thucLinh: 0 });

  useEffect(() => {
    const fetchEmployees = axiosClient.get("/api/nhanvien");

    if (isEdit) {
      const fetchPayroll = axiosClient.get(`/api/bangluong/${id}`);
      Promise.all([fetchEmployees, fetchPayroll])
        .then(([resEmp, resPayroll]) => {
          setEmployees(resEmp.data);
          setPayrollData(resPayroll.data);
        })
        .catch((error) => console.error("Lỗi tải dữ liệu:", error))
        .finally(() => setLoading(false));
    } else {
      fetchEmployees
        .then((res) => setEmployees(res.data))
        .catch((err) => console.error("Lỗi lấy nhân viên:", err))
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  useEffect(() => {
    const luongCB = Number(payrollData.luongCoBan) || 0;
    const phuCap = Number(payrollData.phuCap) || 0;
    const thuong = Number(payrollData.thuong) || 0;
    const tienChuyenCan = payrollData.chuyenCan ? BONUS_CHUYEN_CAN : 0;

    const tongThuNhap = luongCB + phuCap + thuong + tienChuyenCan;
    const bhxh = luongCB * 0.08;
    const thucLinh = tongThuNhap - bhxh;

    setCalculated({ bhxh, tongThuNhap, thucLinh });
  }, [payrollData]);

  // --- HÀM XỬ LÝ THAY ĐỔI DỮ LIỆU (Đã cập nhật logic tự load lương) ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;

    // Tạo bản sao dữ liệu mới
    let newData = { ...payrollData, [name]: val };

    // Nếu đang thay đổi Nhân viên -> Tự động điền lương cơ bản
    if (name === "nhanVienId") {
      const selectedEmp = employees.find(emp => emp.id === val);
      if (selectedEmp) {
        newData.luongCoBan = selectedEmp.luongCoBan || 0;
      }
    }

    setPayrollData(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...payrollData,
        luongCoBan: Number(payrollData.luongCoBan),
        phuCap: Number(payrollData.phuCap),
        thuong: Number(payrollData.thuong)
      };

      if (isEdit) {
        await axiosClient.put(`/api/bangluong/${id}`, payload);
        alert("Đã cập nhật bảng lương");
      } else {
        await axiosClient.post("/api/bangluong", payload);
        alert("Đã thêm bảng lương mới");
      }
      navigate("/bangluong");
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      alert(error.response?.data?.message || "Lỗi lưu bảng lương.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ width: "100%", px: 3, mt: 3, mb: 5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(180deg, #1E293B 0%, #334155 100%)", borderRadius: "12px", px: 3, py: 2.5, mb: 3, boxShadow: "0 4px 20px rgba(30, 41, 59, 0.3)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button onClick={() => navigate("/bangluong")} sx={{ minWidth: 0, p: 1, color: "rgba(255,255,255,0.7)", "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" } }}>
            <ArrowBackIcon />
          </Button>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "white" }}>
            {isEdit ? "Cập nhật bảng lương" : "Tính lương tháng mới"}
          </Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #E2E8F0" }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={4}>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2, color: "#334155", fontWeight: 600 }}>Thông tin chung</Typography>
              <Stack spacing={3}>
                <TextField
                  select
                  label="Nhân viên"
                  name="nhanVienId"
                  value={payrollData.nhanVienId || ""}
                  onChange={handleChange}
                  required
                  fullWidth
                  helperText="Chọn nhân viên để tự động lấy lương cơ bản"
                >
                  <MenuItem value="" disabled>-- Chọn nhân viên --</MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>{emp.hoTen}</MenuItem>
                  ))}
                </TextField>

                <Stack direction="row" spacing={2}>
                  <TextField label="Tháng" name="thang" type="number" value={payrollData.thang} onChange={handleChange} required fullWidth />
                  <TextField label="Năm" name="nam" type="number" value={payrollData.nam} onChange={handleChange} required fullWidth />
                </Stack>

                <FormControlLabel
                  control={<Checkbox checked={payrollData.chuyenCan} onChange={handleChange} name="chuyenCan" color="success" />}
                  label={<Typography fontWeight="500">Thưởng chuyên cần (+{BONUS_CHUYEN_CAN.toLocaleString()} đ)</Typography>}
                  sx={{ border: '1px solid #E2E8F0', borderRadius: 2, px: 1, py: 0.5, mr: 0 }}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2, color: "#334155", fontWeight: 600 }}>Thu nhập</Typography>
              <Stack spacing={3}>
                <TextField
                  label="Lương cơ bản"
                  name="luongCoBan"
                  type="number"
                  value={payrollData.luongCoBan}
                  onChange={handleChange}
                  required
                  fullWidth
                  InputProps={{ endAdornment: <InputAdornment position="end">VND</InputAdornment> }}
                />
                <TextField
                  label="Phụ cấp (Ăn trưa, xăng...)"
                  name="phuCap"
                  type="number"
                  value={payrollData.phuCap}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{ endAdornment: <InputAdornment position="end">VND</InputAdornment> }}
                />
                <TextField
                  label="Thưởng doanh số / KPI"
                  name="thuong"
                  type="number"
                  value={payrollData.thuong}
                  onChange={handleChange}
                  fullWidth
                  InputProps={{ endAdornment: <InputAdornment position="end">VND</InputAdornment> }}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2, color: "#334155", fontWeight: 600 }}>Tổng kết (Tạm tính)</Typography>
              <Paper sx={{ p: 3, bgcolor: '#F8FAFC', borderRadius: 2 }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography color="text.secondary">Tổng thu nhập:</Typography>
                    <Typography fontWeight="bold">{calculated.tongThuNhap.toLocaleString()} đ</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: '#DC2626' }}>
                    <Typography>Trừ BHXH (8%):</Typography>
                    <Typography fontWeight="bold">-{calculated.bhxh.toLocaleString()} đ</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">THỰC LĨNH:</Typography>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">{calculated.thucLinh.toLocaleString()} đ</Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>

          </Grid>

          <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" color="inherit" onClick={() => navigate("/bangluong")} sx={{ px: 4 }}>Hủy bỏ</Button>
            <Button type="submit" variant="contained" disabled={saving} startIcon={!saving && <SaveIcon />} sx={{ px: 4, py: 1, bgcolor: "#38BDF8", color: "#0F172A", fontWeight: "bold", "&:hover": { bgcolor: "#0EA5E9" } }}>
              {saving ? <CircularProgress size={24} /> : "Lưu bảng lương"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default PayrollForm;
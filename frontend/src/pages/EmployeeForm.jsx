import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Grid,
  Stack,
  InputAdornment
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";

function EmployeeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [employeeData, setEmployeeData] = useState({
    hoTen: "",
    gioiTinh: "Nam",
    ngaySinh: "",
    diaChi: "",
    soDienThoai: "",
    email: "",
    phongBanId: "",
    chucVu: "Nhân viên",
    ngayVaoLam: "",
    luongCoBan: "",
  });

  useEffect(() => {
    const fetchDepartments = axiosClient.get("/api/phongban");

    if (isEdit) {
      const fetchEmployee = axiosClient.get(`/api/nhanvien/${id}`);
      Promise.all([fetchDepartments, fetchEmployee])
        .then(([resDept, resEmp]) => {
          setDepartments(resDept.data);
          setEmployeeData(resEmp.data);
        })
        .catch((error) => console.error("Lỗi tải dữ liệu:", error))
        .finally(() => setLoading(false));
    } else {
      fetchDepartments
        .then((res) => setDepartments(res.data))
        .catch((err) => console.error("Lỗi lấy phòng ban:", err))
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  // --- HÀM VALIDATE ---
  const validate = () => {
    let tempErrors = {};
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!employeeData.email) {
      tempErrors.email = "Vui lòng nhập email";
      isValid = false;
    } else if (!emailRegex.test(employeeData.email)) {
      tempErrors.email = "Email không đúng định dạng";
      isValid = false;
    }

    const phoneRegex = /^0[0-9]{9}$/;
    if (employeeData.soDienThoai && !phoneRegex.test(employeeData.soDienThoai)) {
      tempErrors.soDienThoai = "SĐT phải gồm 10 số, bắt đầu bằng số 0";
      isValid = false;
    }

    if (!employeeData.hoTen) { tempErrors.hoTen = "Nhập họ tên"; isValid = false; }
    if (!employeeData.phongBanId) { tempErrors.phongBanId = "Chọn phòng ban"; isValid = false; }
    if (!employeeData.ngayVaoLam) { tempErrors.ngayVaoLam = "Chọn ngày"; isValid = false; }
    if (!employeeData.luongCoBan) { tempErrors.luongCoBan = "Nhập lương"; isValid = false; }

    setErrors(tempErrors);
    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === "phongBanId" ? parseInt(value) : value;
    setEmployeeData({ ...employeeData, [name]: newValue });
    if (errors[name]) setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (isEdit) {
        await axiosClient.put(`/api/nhanvien/${id}`, employeeData);
        alert("Cập nhật nhân viên thành công");
      } else {
        await axiosClient.post("/api/nhanvien", employeeData);
        alert("Thêm nhân viên mới thành công");
      }
      navigate("/nhanvien");
    } catch (error) {
      console.error("Lỗi khi lưu:", error);
      alert(error.response?.data?.message || "Lưu thất bại!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ width: "100%", px: 3, mt: 3, mb: 5 }}>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "linear-gradient(180deg, #1E293B 0%, #334155 100%)", borderRadius: "12px", px: 3, py: 2.5, mb: 3, boxShadow: "0 4px 20px rgba(30, 41, 59, 0.3)" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button onClick={() => navigate("/nhanvien")} sx={{ minWidth: 0, p: 1, color: "rgba(255,255,255,0.7)", "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" } }}>
            <ArrowBackIcon />
          </Button>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "white" }}>
            {isEdit ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
          </Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.05)", border: "1px solid #E2E8F0" }}>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={6}>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 3, color: "#334155", fontWeight: 600, borderBottom: '2px solid #F1F5F9', pb: 1 }}>
                Thông tin cá nhân
              </Typography>

              <Stack spacing={3}>
                <TextField
                  label="Họ và tên"
                  name="hoTen"
                  value={employeeData.hoTen}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.hoTen}
                  helperText={errors.hoTen}
                />

                <Stack direction="row" spacing={2}>
                  <Box sx={{ width: '50%' }}>
                    <TextField
                      select
                      label="Giới tính"
                      name="gioiTinh"
                      value={employeeData.gioiTinh}
                      onChange={handleChange}
                      fullWidth
                    >
                      <MenuItem value="Nam">Nam</MenuItem>
                      <MenuItem value="Nữ">Nữ</MenuItem>
                    </TextField>
                  </Box>
                  <Box sx={{ width: '50%' }}>
                    <TextField
                      label="Ngày sinh"
                      name="ngaySinh"
                      type="date"
                      value={employeeData.ngaySinh || ""}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                </Stack>

                <TextField
                  label="Địa chỉ"
                  name="diaChi"
                  value={employeeData.diaChi}
                  onChange={handleChange}
                  fullWidth
                />

                <TextField
                  label="Số điện thoại"
                  name="soDienThoai"
                  value={employeeData.soDienThoai}
                  onChange={handleChange}
                  fullWidth
                  placeholder="0xxxxxxxxx"
                  error={!!errors.soDienThoai}
                  helperText={errors.soDienThoai}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment>,
                  }}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ mb: 3, color: "#334155", fontWeight: 600, borderBottom: '2px solid #F1F5F9', pb: 1 }}>
                Thông tin công việc
              </Typography>

              <Stack spacing={3}>
                <TextField
                  label="Email đăng nhập"
                  name="email"
                  value={employeeData.email}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} /></InputAdornment>,
                  }}
                />

                <TextField
                  select
                  label="Phòng ban"
                  name="phongBanId"
                  value={employeeData.phongBanId || ""}
                  onChange={handleChange}
                  fullWidth
                  required
                  error={!!errors.phongBanId}
                  helperText={errors.phongBanId}
                >
                  <MenuItem value="" disabled>-- Chọn phòng ban --</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>{dept.tenPhong}</MenuItem>
                  ))}
                </TextField>

                <TextField
                  label="Chức vụ"
                  name="chucVu"
                  value={employeeData.chucVu}
                  onChange={handleChange}
                  fullWidth
                />

                <Stack direction="row" spacing={2}>
                  <Box sx={{ width: '50%' }}>
                    <TextField
                      label="Ngày vào làm"
                      name="ngayVaoLam"
                      type="date"
                      value={employeeData.ngayVaoLam || ""}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      required
                      error={!!errors.ngayVaoLam}
                      helperText={errors.ngayVaoLam}
                    />
                  </Box>
                  <Box sx={{ width: '50%' }}>
                    <TextField
                      label="Lương cơ bản"
                      name="luongCoBan"
                      type="number"
                      value={employeeData.luongCoBan}
                      onChange={handleChange}
                      fullWidth
                      required
                      InputProps={{
                        endAdornment: <InputAdornment position="end">VND</InputAdornment>,
                      }}
                      error={!!errors.luongCoBan}
                      helperText={errors.luongCoBan}
                    />
                  </Box>
                </Stack>
              </Stack>
            </Grid>
          </Grid>

          <Box sx={{ mt: 5, display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button variant="outlined" color="inherit" onClick={() => navigate("/nhanvien")} sx={{ px: 4 }}>
              Hủy bỏ
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={saving}
              startIcon={!saving && <SaveIcon />}
              sx={{ px: 4, py: 1, bgcolor: "#38BDF8", color: "#0F172A", fontWeight: "bold", "&:hover": { bgcolor: "#0EA5E9" } }}
            >
              {saving ? <CircularProgress size={24} /> : "Lưu thông tin"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default EmployeeForm;
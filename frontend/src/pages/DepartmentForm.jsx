import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Stack
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function DepartmentForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [tenPhong, setTenPhong] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      axiosClient
        .get(`/api/phongban/${id}`)
        .then((res) => setTenPhong(res.data.tenPhong))
        .catch((err) => console.error("Lỗi khi lấy thông tin phòng ban:", err))
        .finally(() => setLoading(false));
    }
  }, [isEdit, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tenPhong.trim()) {
      alert("Vui lòng nhập tên phòng ban");
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await axiosClient.put(`/api/phongban/${id}`, { tenPhong });
        alert("Đã cập nhật phòng ban");
      } else {
        await axiosClient.post("/api/phongban", { tenPhong });
        alert("Đã thêm phòng ban mới");
      }
      navigate("/phongban");
    } catch (error) {
      console.error("Lỗi khi lưu phòng ban:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi lưu phòng ban.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", px: 3, mt: 3, mb: 5 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "linear-gradient(180deg, #1E293B 0%, #334155 100%)",
          borderRadius: "12px",
          px: 3,
          py: 2.5,
          mb: 3,
          boxShadow: "0 4px 20px rgba(30, 41, 59, 0.3)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Button
            onClick={() => navigate("/phongban")}
            sx={{
              minWidth: 0,
              p: 1,
              color: "rgba(255,255,255,0.7)",
              "&:hover": { color: "white", bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <ArrowBackIcon />
          </Button>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "white" }}>
            {isEdit ? "Chỉnh sửa phòng ban" : "Thêm phòng ban mới"}
          </Typography>
        </Box>
      </Box>

      {/* Form Container */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 3,
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          border: "1px solid #E2E8F0",
          maxWidth: 600,
          mx: "auto"
        }}
      >
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Typography
              variant="h6"
              sx={{ color: "#334155", fontWeight: 600, borderBottom: "2px solid #F1F5F9", pb: 1 }}
            >
              Thông tin chung
            </Typography>

            <TextField
              label="Tên phòng ban"
              value={tenPhong}
              onChange={(e) => setTenPhong(e.target.value)}
              required
              fullWidth
              placeholder="Ví dụ: Phòng Kế toán"
            />

            {/* Footer Actions */}
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate("/phongban")}
                sx={{ px: 4 }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={!saving && <SaveIcon />}
                sx={{
                  px: 4,
                  py: 1,
                  bgcolor: "#38BDF8",
                  color: "#0F172A",
                  fontWeight: "bold",
                  "&:hover": { bgcolor: "#0EA5E9" },
                }}
              >
                {saving ? <CircularProgress size={24} /> : "Lưu thông tin"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default DepartmentForm;
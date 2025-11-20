import React, { useState } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Stack
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

function RequestForm() {
  const navigate = useNavigate();
  const [loai, setLoai] = useState("Nghỉ phép");
  const [tuNgay, setTuNgay] = useState("");
  const [denNgay, setDenNgay] = useState("");
  const [lyDo, setLyDo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!tuNgay || !denNgay) {
      alert("Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.");
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post("/api/dontu", { loai, tuNgay, denNgay, lyDo });
      alert("✅ Gửi đơn thành công!");
      navigate("/dontu");
    } catch (error) {
      console.error("Lỗi khi gửi đơn:", error);
      alert(error.response?.data?.message || "Gửi đơn thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", px: 3, mt: 3, mb: 5 }}>

      {/* Header Gradient */}
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
            onClick={() => navigate("/dontu")}
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
            Gửi đơn mới
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
            <Typography variant="h6" sx={{ color: "#334155", fontWeight: 600, borderBottom: "2px solid #F1F5F9", pb: 1 }}>
              Thông tin đơn
            </Typography>

            <TextField
              select
              label="Loại đơn"
              value={loai}
              onChange={(e) => setLoai(e.target.value)}
              fullWidth
              required
            >
              <MenuItem value="Nghỉ phép">Nghỉ phép</MenuItem>
              <MenuItem value="Công tác">Công tác</MenuItem>
            </TextField>

            <Stack direction="row" spacing={2}>
              <Box sx={{ width: '50%' }}>
                <TextField
                  label="Từ ngày"
                  type="date"
                  value={tuNgay}
                  onChange={(e) => setTuNgay(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
              </Box>
              <Box sx={{ width: '50%' }}>
                <TextField
                  label="Đến ngày"
                  type="date"
                  value={denNgay}
                  onChange={(e) => setDenNgay(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
              </Box>
            </Stack>

            <TextField
              label="Lý do"
              value={lyDo}
              onChange={(e) => setLyDo(e.target.value)}
              multiline
              rows={4}
              placeholder="Nhập lý do chi tiết..."
              fullWidth
            />

            {/* Footer Actions */}
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate("/dontu")}
                sx={{ px: 4 }}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={!loading && <SaveIcon />}
                sx={{
                  bgcolor: "#90c7e8ff",
                  color: "#0F172A",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  px: 2,
                  "&:hover": { bgcolor: "#548ea9d5" }
                }}
              >
                {loading ? <CircularProgress size={24} /> : "Gửi đơn"}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}

export default RequestForm;
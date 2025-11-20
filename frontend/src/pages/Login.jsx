import React, { useState, useContext } from "react";
import axiosClient from "../api/axiosClient";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Paper,
  Grid,
  CssBaseline,
  Link,
  Checkbox,
  FormControlLabel
} from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined, PersonOutline } from "@mui/icons-material";


function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosClient.post("/api/auth/login", { username, password });
      const { token, user } = response.data;
      login(user, token);
      navigate(user.role === "HR" ? "/nhanvien" : "/dontu");
    } catch (err) {
      console.error("Login Error:", err);
      const msg = err.response?.data?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      <CssBaseline />

      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundRepeat: "no-repeat",
          backgroundColor: (t) => (t.palette.mode === "light" ? t.palette.grey[50] : t.palette.grey[900]),
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)", // Màu #1E293B
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            px: 8,
            color: "white",
          }}
        >
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Quản lý Nhân sự
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.8, fontWeight: 300 }}>
              Hiệu quả - Minh bạch - Chuyên nghiệp
            </Typography>
            <Box sx={{ mt: 4, width: '60px', height: '4px', bgcolor: '#38BDF8', borderRadius: 2 }}></Box>
          </Box>
        </Box>
      </Grid>

      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: "450px"
          }}
        >
          <Box sx={{ m: 1, bgcolor: "#F1F5F9", p: 2, borderRadius: "50%" }}>
            <LockOutlined sx={{ color: "#334155", fontSize: 32 }} />
          </Box>

          <Typography component="h1" variant="h5" fontWeight="bold" sx={{ mt: 1, color: "#1E293B" }}>
            Đăng nhập hệ thống
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Vui lòng nhập thông tin tài khoản của bạn
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: "100%", mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1, width: "100%" }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Tên đăng nhập"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "12px" }
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": { borderRadius: "12px" }
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label={<Typography variant="body2" color="text.secondary">Ghi nhớ đăng nhập</Typography>}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: "16px",
                fontWeight: "bold",
                borderRadius: "12px",
                bgcolor: "#1E293B",
                "&:hover": { bgcolor: "#0F172A" },
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(30, 41, 59, 0.25)"
              }}
            >
              {loading ? <CircularProgress size={26} sx={{ color: "white" }} /> : "Đăng nhập ngay"}
            </Button>

          </Box>
        </Box>
      </Grid>
    </Grid>
  );
}

export default LoginPage;
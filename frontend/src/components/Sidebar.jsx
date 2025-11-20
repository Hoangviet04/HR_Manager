import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { AuthContext } from "../context/AuthContext";
import {
    Box, Typography, List, ListItem, ListItemIcon, ListItemText,
    ListItemButton, Avatar, Menu, MenuItem, Divider, Dialog,
    DialogTitle, DialogContent, DialogActions, TextField, Button, CircularProgress
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import PaperIcon from "@mui/icons-material/Description";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import BusinessIcon from "@mui/icons-material/Business";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LockResetIcon from "@mui/icons-material/LockReset";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import AssessmentIcon from "@mui/icons-material/Assessment";

function Sidebar() {
    const { user, logout } = useContext(AuthContext) || {};
    const navigate = useNavigate();
    const location = useLocation();

    // State cho Menu Dropdown
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    // State cho Modal Đổi Mật Khẩu
    const [openDialog, setOpenDialog] = useState(false);
    const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);

    // --- XỬ LÝ MENU ---
    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
        navigate("/dangnhap");
    };

    // --- XỬ LÝ ĐỔI MẬT KHẨU ---
    const handleOpenDialog = () => {
        handleMenuClose();
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    };

    const handleChangePass = async () => {
        if (!passData.oldPassword || !passData.newPassword) {
            alert("Vui lòng nhập đầy đủ thông tin");
            return;
        }
        if (passData.newPassword !== passData.confirmPassword) {
            alert("Mật khẩu mới không khớp");
            return;
        }

        setLoading(true);
        try {
            await axiosClient.post("/api/auth/change-password", {
                oldPassword: passData.oldPassword,
                newPassword: passData.newPassword
            });
            alert("✅ Đổi mật khẩu thành công!");
            handleCloseDialog();
        } catch (error) {
            alert(error.response?.data?.message || "Đổi mật khẩu thất bại");
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { text: "Trang chủ", icon: <DashboardIcon />, path: "/dashboard", roles: ['HR', 'EMP'] },
        { text: "Nhân sự", icon: <PeopleIcon />, path: "/nhanvien", roles: ['HR'] },
        { text: "Phòng ban", icon: <BusinessIcon />, path: "/phongban", roles: ['HR'] },
        { text: "Chấm công", icon: <AccessTimeIcon />, path: "/chamcong", roles: ['HR', 'EMP'] },
        { text: "Bảng lương", icon: <MonetizationOnIcon />, path: "/bangluong", roles: ['HR', 'EMP'] },
        { text: "Đơn từ", icon: <PaperIcon />, path: "/dontu", roles: ['HR', 'EMP'] },
        { text: "Báo cáo", icon: <AssessmentIcon />, path: "/baocao", roles: ['HR'] }
    ];

    return (
        <>
            <Box
                sx={{
                    width: 260,
                    background: "linear-gradient(180deg, #1E293B 0%, #0F172A 100%)",
                    color: "white",
                    boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "fixed",
                    height: "100vh",
                    top: 0,
                    left: 0,
                    zIndex: 1200
                }}
            >
                {/* 1. Logo & Menu List */}
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" fontWeight="bold" align="center" sx={{ mb: 4, mt: 2, textTransform: "uppercase", background: "linear-gradient(90deg, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        HR Manager
                    </Typography>

                    <List>
                        {menuItems.map((item, index) => {
                            if (!item.roles.includes(user?.role)) return null;
                            const isActive = location.pathname.startsWith(item.path);
                            return (
                                <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                                    <ListItemButton component={Link} to={item.path} sx={{ borderRadius: "12px", bgcolor: isActive ? "rgba(56, 189, 248, 0.15)" : "transparent", borderLeft: isActive ? "4px solid #38BDF8" : "4px solid transparent", "&:hover": { bgcolor: "rgba(255, 255, 255, 0.1)" } }}>
                                        <ListItemIcon sx={{ color: isActive ? "#38BDF8" : "rgba(255,255,255,0.7)", minWidth: 40 }}>{item.icon}</ListItemIcon>
                                        <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 600 : 400, color: isActive ? "white" : "rgba(255,255,255,0.9)" }} />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Box>

                {/* 2. User Footer*/}
                {user && (
                    <Box sx={{ p: 2, borderTop: "1px solid rgba(255,255,255,0.1)", bgcolor: "rgba(0,0,0,0.2)" }}>
                        <ListItemButton
                            onClick={handleMenuClick}
                            sx={{ borderRadius: "12px", "&:hover": { bgcolor: "rgba(255,255,255,0.05)" } }}
                        >
                            <Avatar sx={{ width: 40, height: 40, bgcolor: "#38BDF8", color: "#0F172A", fontWeight: "bold", mr: 2 }}>
                                {user.hoTen ? user.hoTen.charAt(0).toUpperCase() : "U"}
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="subtitle2" fontWeight="bold" noWrap>{user.hoTen}</Typography>
                                <Typography variant="caption" color="rgba(255,255,255,0.6)" noWrap>
                                    {user.tenPhong || user.role}
                                </Typography>
                            </Box>
                            <ExpandLessIcon sx={{ color: "rgba(255,255,255,0.5)" }} />
                        </ListItemButton>

                        {/* Dropdown Menu */}
                        <Menu
                            anchorEl={anchorEl}
                            open={openMenu}
                            onClose={handleMenuClose}
                            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                            transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                            PaperProps={{
                                sx: { bgcolor: "#1E293B", color: "white", border: "1px solid rgba(255,255,255,0.1)", minWidth: 200 }
                            }}
                        >
                            <MenuItem onClick={handleOpenDialog} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,0.1)" } }}>
                                <ListItemIcon><LockResetIcon sx={{ color: "white" }} /></ListItemIcon>
                                <ListItemText>Đổi mật khẩu</ListItemText>
                            </MenuItem>
                            <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
                            <MenuItem onClick={handleLogout} sx={{ "&:hover": { bgcolor: "rgba(244, 67, 54, 0.15)" } }}>
                                <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
                                <ListItemText sx={{ color: "#ff5252" }}>Đăng xuất</ListItemText>
                            </MenuItem>
                        </Menu>
                    </Box>
                )}
            </Box>

            {/* Đổi Mật Khẩu */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: "bold" }}>Đổi mật khẩu</DialogTitle>
                <DialogContent>
                    <TextField
                        margin="dense" label="Mật khẩu cũ" type="password" fullWidth variant="outlined"
                        value={passData.oldPassword}
                        onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
                    />
                    <TextField
                        margin="dense" label="Mật khẩu mới" type="password" fullWidth variant="outlined"
                        value={passData.newPassword}
                        onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                    />
                    <TextField
                        margin="dense" label="Nhập lại mật khẩu mới" type="password" fullWidth variant="outlined"
                        value={passData.confirmPassword}
                        onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDialog} color="inherit">Hủy</Button>
                    <Button onClick={handleChangePass} variant="contained" disabled={loading}>
                        {loading ? <CircularProgress size={24} /> : "Xác nhận"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default Sidebar;
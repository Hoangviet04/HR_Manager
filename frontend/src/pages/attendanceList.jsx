import React, { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import {
    Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, CircularProgress, Chip, Card, CardContent, Stack
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";

function AttendanceList() {
    const [logs, setLogs] = useState([]);
    const [todayStatus, setTodayStatus] = useState({ checkedIn: false, checkedOut: false, gioVao: null, gioRa: null });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [role, setRole] = useState("");

    const fetchData = async () => {
        try {
            const [resLogs, resStatus] = await Promise.all([
                axiosClient.get("/api/chamcong"),
                axiosClient.get("/api/chamcong/homnay")
            ]);
            setLogs(resLogs.data);
            setTodayStatus(resStatus.data);
        } catch (error) {
            console.error("Lỗi tải dữ liệu chấm công:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setRole(user?.role || "");
        fetchData();
    }, []);

    const handleCheckIn = async () => {
        if (!window.confirm("Xác nhận Check-in vào làm?")) return;
        setActionLoading(true);
        try {
            await axiosClient.post("/api/chamcong/checkin");
            alert("Check-in thành công!");
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi Check-in");
        } finally {
            setActionLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (!window.confirm("Xác nhận Check-out ra về?")) return;
        setActionLoading(true);
        try {
            await axiosClient.post("/api/chamcong/checkout");
            alert("Check-out thành công! Hẹn gặp lại.");
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || "Lỗi Check-out");
        } finally {
            setActionLoading(false);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    };

    return (
        <Box sx={{ width: "100%", px: 3, mt: 3, mb: 5, display: 'flex', flexDirection: 'column', gap: 3 }}>

            <Box sx={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "linear-gradient(180deg, #1E293B 0%, #334155 100%)",
                borderRadius: "12px", px: 3, py: 2.5, boxShadow: "0 4px 20px rgba(30, 41, 59, 0.3)"
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "white" }}>
                        ⏰ Chấm công & Điểm danh
                    </Typography>
                </Box>
                <Chip
                    icon={<AccessTimeIcon sx={{ color: '#94a3b8 !important' }} />}
                    label={new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                />
            </Box>

            <Card sx={{ borderRadius: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" color="#334155">Hôm nay bạn thế nào?</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {todayStatus.checkedIn
                                ? `Bạn đã vào làm lúc ${todayStatus.gioVao}. ${todayStatus.checkedOut ? `Đã ra về lúc ${todayStatus.gioRa}` : "Chúc bạn một ngày làm việc hiệu quả!"}`
                                : "Đừng quên bấm Check-in trước khi bắt đầu công việc nhé."}
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={2}>
                        {!todayStatus.checkedIn && (
                            <Button
                                variant="contained"
                                size="large"
                                startIcon={<LoginIcon />}
                                onClick={handleCheckIn}
                                disabled={actionLoading}
                                sx={{ bgcolor: "#10B981", "&:hover": { bgcolor: "#059669" }, px: 4, py: 1.5, borderRadius: 2 }}
                            >
                                CHECK IN
                            </Button>
                        )}

                        {todayStatus.checkedIn && !todayStatus.checkedOut && (
                            <Button
                                variant="contained"
                                size="large"
                                color="warning"
                                startIcon={<LogoutIcon />}
                                onClick={handleCheckOut}
                                disabled={actionLoading}
                                sx={{ bgcolor: "#F59E0B", "&:hover": { bgcolor: "#D97706" }, px: 4, py: 1.5, borderRadius: 2 }}
                            >
                                CHECK OUT
                            </Button>
                        )}

                        {todayStatus.checkedIn && todayStatus.checkedOut && (
                            <Button variant="outlined" disabled sx={{ px: 4, py: 1.5, borderRadius: 2 }}>
                                Đã hoàn thành hôm nay
                            </Button>
                        )}
                    </Stack>
                </CardContent>
            </Card>

            {loading ? <Box sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /></Box> : (
                <TableContainer component={Paper} sx={{ boxShadow: "0 10px 35px rgba(0,0,0,0.05)", borderRadius: 3, overflow: 'hidden' }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: "#334155" }}>
                            <TableRow>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Ngày</TableCell>
                                {role === 'HR' && <TableCell sx={{ color: "white", fontWeight: "bold" }}>Nhân viên</TableCell>}
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Giờ vào</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Giờ ra</TableCell>
                                <TableCell sx={{ color: "white", fontWeight: "bold" }}>Trạng thái</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs.length > 0 ? logs.map((log) => (
                                <TableRow key={log.id} hover>
                                    <TableCell sx={{ fontWeight: 500 }}>{formatDate(log.ngay)}</TableCell>
                                    {role === 'HR' && <TableCell>{log.hoTen}</TableCell>}
                                    <TableCell sx={{ color: '#10B981', fontWeight: 500 }}>{log.gioVao}</TableCell>
                                    <TableCell sx={{ color: '#F59E0B', fontWeight: 500 }}>{log.gioRa || "--:--:--"}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={log.trangThai}
                                            size="small"
                                            color={log.trangThai === 'Đi muộn' ? 'error' : 'success'}
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={role === 'HR' ? 5 : 4} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                                        Chưa có dữ liệu chấm công.
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

export default AttendanceList;
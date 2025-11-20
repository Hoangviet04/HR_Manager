import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import {
    Box, Typography, Grid, Card, CardContent, CircularProgress,
    Alert, Stack, Chip, Avatar, Divider
} from "@mui/material";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar
} from "recharts";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AssignmentIcon from "@mui/icons-material/Assignment";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";

function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dữ liệu chung
    const [userRole, setUserRole] = useState("");
    const [userName, setUserName] = useState("");

    // Dữ liệu MANAGER
    const [hrStats, setHrStats] = useState({
        totalEmployees: 0,
        pendingRequests: 0,
        newEmployees: 0,
        departmentChart: [],
        payrollChart: []
    });

    // Dữ liệu EMP
    const [empStats, setEmpStats] = useState({
        workDays: 0,
        lateDays: 0,
        latestSalary: 0,
        pendingRequests: 0,
        attendanceChart: []
    });

    const COLORS = ['#7B61FF', '#FF6B6B', '#4ECDC4', '#FFD93D', '#6C5CE7', '#26de81'];

    useEffect(() => {
        const currentUser = JSON.parse(localStorage.getItem("user"));
        setUserRole(currentUser?.role || "");
        setUserName(currentUser?.hoTen || currentUser?.username || "Nhân viên");

        const fetchData = async () => {
            try {
                if (currentUser?.role === 'HR') {
                    const [employeesRes, departmentsRes, payrollsRes, requestsRes] = await Promise.all([
                        axiosClient.get("/api/nhanvien"),
                        axiosClient.get("/api/phongban"),
                        axiosClient.get("/api/bangluong"),
                        axiosClient.get("/api/dontu")
                    ]);
                    processHrData(employeesRes.data, departmentsRes.data, payrollsRes.data, requestsRes.data);
                } else {

                    const [payrollsRes, requestsRes, logsRes] = await Promise.all([
                        axiosClient.get("/api/bangluong"),
                        axiosClient.get("/api/dontu"),
                        axiosClient.get("/api/chamcong")
                    ]);
                    processEmpData(payrollsRes.data, requestsRes.data, logsRes.data);
                }

            } catch (err) {
                setError("Không thể tải dữ liệu Dashboard.");
                console.error("Dashboard Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // --- XỬ LÝ DỮ LIỆU MANAGER ---
    const processHrData = (employees, departments, payrolls, requests) => {
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        // 1. Nhân viên mới
        const newEmps = employees.filter(e => {
            const d = new Date(e.ngayVaoLam);
            return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
        }).length;

        // 2. Donut Chart (Phòng ban)
        const deptCounts = {};
        employees.forEach(emp => {
            const d = departments.find(dept => dept.id === emp.phongBanId);
            const name = d ? d.tenPhong : "Khác";
            deptCounts[name] = (deptCounts[name] || 0) + 1;
        });
        const deptChart = Object.keys(deptCounts).map(name => ({ name, value: deptCounts[name] }));

        // 3. Line Chart (Lương)
        let targetYear = currentYear;
        if (payrolls.length > 0) targetYear = Math.max(...payrolls.map(p => p.nam));

        const payrollChart = [];
        for (let i = 1; i <= 12; i++) {
            const total = payrolls
                .filter(p => Number(p.thang) === i && Number(p.nam) === targetYear)
                .reduce((sum, p) => {
                    const extra = Number(p.phuCap || 0) + Number(p.thuong || 0) + (p.chuyenCan ? 500000 : 0);
                    return sum + Number(p.luongCoBan || 0) + extra;
                }, 0);
            payrollChart.push({ month: `T${i}`, cost: total / 1000000 });
        }

        setHrStats({
            totalEmployees: employees.length,
            pendingRequests: requests.filter(r => r.trangThai === "Chờ duyệt").length,
            newEmployees: newEmps,
            departmentChart: deptChart,
            payrollChart: payrollChart
        });
    };

    // --- XỬ LÝ DỮ LIỆU EMP ---
    const processEmpData = (payrolls, requests, logs) => {
        const currentMonth = new Date().getMonth() + 1;

        // 1. Lương gần nhất
        const sortedPayroll = [...payrolls].sort((a, b) => b.nam - a.nam || b.thang - a.thang);
        const latestSalaryRec = sortedPayroll.length > 0 ? sortedPayroll[0] : null;

        let latestNet = 0;
        if (latestSalaryRec) {
            const extra = Number(latestSalaryRec.phuCap || 0) + Number(latestSalaryRec.thuong || 0) + (latestSalaryRec.chuyenCan ? 500000 : 0);
            const gross = Number(latestSalaryRec.luongCoBan || 0) + extra;
            latestNet = gross - (Number(latestSalaryRec.luongCoBan || 0) * 0.08);
        }

        // 2. Công tháng này
        const thisMonthLogs = logs.filter(l => {
            const d = new Date(l.ngay);
            return d.getMonth() + 1 === currentMonth;
        });
        const lateCount = thisMonthLogs.filter(l => l.trangThai === 'Đi muộn').length;

        // 3. Chart 7 ngày gần nhất
        const last7Days = logs.slice(0, 7).reverse().map(l => ({
            date: `${new Date(l.ngay).getDate()}/${new Date(l.ngay).getMonth() + 1}`,
            status: l.trangThai === 'Đi muộn' ? 0.5 : 1,
            rawStatus: l.trangThai
        }));

        setEmpStats({
            workDays: thisMonthLogs.length,
            lateDays: lateCount,
            latestSalary: latestNet,
            pendingRequests: requests.filter(r => r.trangThai === "Chờ duyệt").length,
            attendanceChart: last7Days
        });
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
    if (error) return <Box sx={{ p: 3 }}><Alert severity="error">{error}</Alert></Box>;

    // ================= MANAGER UI =================
    if (userRole === 'HR') {
        return (
            <Box sx={{ flexGrow: 1, p: 2, bgcolor: "#F8F9FB", minHeight: "100vh" }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">Tổng quan</Typography>
                    <Typography variant="body2" color="text.secondary">Xin chào, chúc một ngày tốt lành!</Typography>
                </Box>

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <CardStats title="Tổng nhân viên" value={hrStats.totalEmployees} sub="Toàn công ty" color="#7B61FF" icon={<WorkHistoryIcon />} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <CardStats title="Đơn chờ duyệt" value={hrStats.pendingRequests} sub="Cần xử lý" color="#FF6B6B" icon={<AssignmentIcon />} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <CardStats title="Nhân viên mới" value={`+${hrStats.newEmployees}`} sub="Tháng này" color="#26de81" icon={<AccessTimeIcon />} />
                    </Grid>
                </Grid>

                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={8}>
                        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: '400px' }}>
                            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Chi lương theo tháng (Triệu VND)</Typography>
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={hrStats.payrollChart}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="cost" stroke="#7B61FF" strokeWidth={3} dot={{ r: 4, fill: '#7B61FF', strokeWidth: 2, stroke: '#fff' }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: '400px' }}>
                            <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>Phân bổ nhân sự</Typography>
                                <Box sx={{ flexGrow: 1, display: 'flex' }}>
                                    <ResponsiveContainer width="60%" height="100%">
                                        <PieChart>
                                            <Pie data={hrStats.departmentChart} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                                {hrStats.departmentChart.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <Box sx={{ width: '40%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1, maxHeight: 300, overflowY: 'auto' }}>
                                        {hrStats.departmentChart.map((entry, index) => (
                                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: COLORS[index % COLORS.length] }} />
                                                <Typography variant="caption" noWrap>{entry.name} ({entry.value})</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    // ================= EMPLOYEE UI =================
    return (
        <Box sx={{ flexGrow: 1, p: 2, bgcolor: "#F8F9FB", minHeight: "100vh" }}>

            {/* Welcome Banner */}
            <Box sx={{
                mb: 4, p: 3, borderRadius: 4, color: 'white',
                background: 'linear-gradient(135deg, #6C5CE7 0%, #a29bfe 100%)',
                boxShadow: '0 10px 20px rgba(108, 92, 231, 0.2)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">Xin chào, {userName}!</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>Chúc bạn một ngày làm việc hiệu quả.</Typography>
                </Box>
                <Chip
                    icon={<AccessTimeIcon style={{ color: 'white' }} />}
                    label={new Date().toLocaleDateString('vi-VN')}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 'bold' }}
                />
            </Box>

            {/* Stats Cards Cá nhân */}
            <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                    <CardStats
                        title="Công tháng này"
                        value={`${empStats.workDays} ngày`}
                        sub={`Đi muộn: ${empStats.lateDays} lần`}
                        color="#10B981"
                        icon={<WorkHistoryIcon />}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <CardStats
                        title="Lương thực lĩnh"
                        value={`${empStats.latestSalary.toLocaleString()} đ`}
                        sub="Tháng gần nhất"
                        color="#F59E0B"
                        icon={<MonetizationOnIcon />}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <CardStats
                        title="Đơn của tôi"
                        value={empStats.pendingRequests}
                        sub="Đang chờ duyệt"
                        color="#3B82F6"
                        icon={<AssignmentIcon />}
                    />
                </Grid>
            </Grid>

            {/* Biểu đồ cá nhân */}
            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={8}>
                    <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Lịch sử đi làm (7 ngày gần nhất)</Typography>
                            <Box sx={{ height: 300 }}>
                                {empStats.attendanceChart.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={empStats.attendanceChart}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} />
                                            <YAxis hide />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 8 }} />
                                            <Bar dataKey="status" name="Trạng thái" radius={[4, 4, 0, 0]}>
                                                {empStats.attendanceChart.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.rawStatus === 'Đi muộn' ? '#FF6B6B' : '#10B981'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Box sx={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                        Chưa có dữ liệu chấm công
                                    </Box>
                                )}
                            </Box>
                            <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
                                <Chip label="Đúng giờ" size="small" sx={{ bgcolor: '#10B981', color: 'white' }} />
                                <Chip label="Đi muộn" size="small" sx={{ bgcolor: '#FF6B6B', color: 'white' }} />
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: '100%', bgcolor: '#1E293B', color: 'white' }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
                            <AccessTimeIcon sx={{ fontSize: 60, opacity: 0.8 }} />
                            <Divider sx={{ width: '50%', bgcolor: 'rgba(255,255,255,0.2)' }} />
                            <Typography variant="body2" align="center" sx={{ opacity: 0.7, mb: 2 }}>
                                Đừng quên check-in mỗi sáng và check-out khi ra về để ghi nhận công nhé.
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

// Component Card thống kê nhỏ (Tái sử dụng)
function CardStats({ title, value, sub, color, icon }) {
    return (
        <Card sx={{ borderRadius: 3, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", height: '100%' }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="bold" sx={{ mb: 0.5 }}>{title}</Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ color: '#333' }}>{value}</Typography>
                    <Typography variant="caption" sx={{ color: color, bgcolor: `${color}20`, px: 1, py: 0.5, borderRadius: 1, mt: 1, display: 'inline-block' }}>
                        {sub}
                    </Typography>
                </Box>
                <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
                    {icon}
                </Avatar>
            </CardContent>
        </Card>
    );
}

export default Dashboard;
import React, { useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";
import {
    Box, Typography, Grid, Card, CardContent, TextField, Button,
    CircularProgress, Stack, Divider
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Report() {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);

    const [thang, setThang] = useState(new Date().getMonth() + 1);
    const [nam, setNam] = useState(new Date().getFullYear());

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get(`/api/baocao/tong-hop?thang=${thang}&nam=${nam}`);
            setData(res.data);
        } catch (error) {
            console.error("Lỗi tải báo cáo:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [thang, nam]);

    // --- XUẤT EXCEL ---
    const exportExcel = () => {
        if (!data) return;

        const summaryData = [
            { "Mục": "Tổng nhân sự", "Giá trị": data.nhanSu.tong },
            { "Mục": "Nhân viên mới", "Giá trị": data.nhanSu.moi },
            { "Mục": "Tổng thu nhập (Gross)", "Giá trị": data.taiChinh.tongChi },
            { "Mục": "Đóng BHXH", "Giá trị": data.taiChinh.bhxh },
        ];

        const deptData = data.phongBan.map(d => ({
            "Phòng ban": d.ten_phong,
            "Số nhân viên": d.count,
            "Tổng thực lĩnh": d.totalNetSalary || 0
        }));

        const wb = XLSX.utils.book_new();
        const wsSummary = XLSX.utils.json_to_sheet(summaryData);
        const wsDept = XLSX.utils.json_to_sheet(deptData);

        XLSX.utils.book_append_sheet(wb, wsSummary, "Tong_Quan");
        XLSX.utils.book_append_sheet(wb, wsDept, "Chi_Tiet_Phong_Ban");

        XLSX.writeFile(wb, `Bao_Cao_Thang_${thang}_${nam}.xlsx`);
    };

    // --- XUẤT PDF ---
    const exportPDF = () => {
        if (!data) return;
        const doc = new jsPDF();

        doc.setFont("helvetica", "bold");
        doc.text(`BAO CAO TONG HOP THANG ${thang}/${nam}`, 105, 20, null, null, "center");

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`Ngay xuat: ${new Date().toLocaleDateString('en-GB')}`, 105, 30, null, null, "center");

        const financeRows = [
            ["Tong Nhan Su", `${data.nhanSu.tong} nguoi`],
            ["Nhan Vien Moi", `${data.nhanSu.moi} nguoi`],
            ["Tong Thu Nhap (Gross)", `${Number(data.taiChinh.tongChi).toLocaleString()} VND`],
            ["Tong BHXH", `${Number(data.taiChinh.bhxh).toLocaleString()} VND`],
        ];

        autoTable(doc, {
            head: [["Chi Tieu", "Gia Tri"]],
            body: financeRows,
            startY: 40,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] }
        });

        const deptRows = data.phongBan.map(d => [
            d.ten_phong,
            d.count,
            Number(d.totalNetSalary || 0).toLocaleString()
        ]);

        doc.text("CHI TIET THEO PHONG BAN", 14, doc.lastAutoTable.finalY + 15);

        autoTable(doc, {
            head: [["Phong Ban", "So Luong NV", "Tong Thuc Linh"]],
            body: deptRows,
            startY: doc.lastAutoTable.finalY + 20,
            theme: 'striped'
        });

        doc.save(`Bao_Cao_Thang_${thang}_${nam}.pdf`);
    };

    return (
        <Box sx={{ flexGrow: 1, p: 2, bgcolor: "#F8F9FB", minHeight: "100vh" }}>
            {/* Header */}
            <Box sx={{
                display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3,
                background: "linear-gradient(180deg, #1E293B 0%, #334155 100%)",
                borderRadius: "12px", px: 3, py: 2.5, boxShadow: "0 4px 20px rgba(30, 41, 59, 0.3)", color: 'white'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AssessmentIcon />
                    <Typography variant="h5" fontWeight="bold">Báo cáo tổng hợp</Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                    <TextField
                        label="Tháng"
                        type="number"
                        size="small"
                        value={thang}
                        onChange={(e) => setThang(e.target.value)}
                        InputProps={{ inputProps: { min: 1, max: 12 } }}
                        sx={{ bgcolor: 'white', borderRadius: 1 }}
                    />
                    <TextField
                        label="Năm"
                        type="number"
                        size="small"
                        value={nam}
                        onChange={(e) => setNam(e.target.value)}
                        sx={{ bgcolor: 'white', borderRadius: 1 }}
                    />
                    <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportExcel} sx={{ bgcolor: "#10B981" }}>
                        Excel
                    </Button>
                    <Button variant="contained" startIcon={<PictureAsPdfIcon />} onClick={exportPDF} sx={{ bgcolor: "#F59E0B" }}>
                        PDF
                    </Button>
                </Stack>
            </Box>

            {loading ? <Box sx={{ textAlign: 'center', mt: 10 }}><CircularProgress /></Box> : data && (
                <Grid container spacing={3}>

                    {/* Card Tổng quan */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">Nhân sự tháng {thang}</Typography>
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Tổng nhân viên:</Typography>
                                        <Typography fontWeight="bold" variant="h5">{data.nhanSu.tong}</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Tuyển mới:</Typography>
                                        <Typography fontWeight="bold" color="success.main">+{data.nhanSu.moi}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom fontWeight="bold" color="error">Tài chính tháng {thang}</Typography>
                                <Stack spacing={2}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Tổng thu nhập (Gross):</Typography>
                                        <Typography fontWeight="bold" variant="h6">{Number(data.taiChinh.tongChi).toLocaleString()} đ</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Đóng BHXH (8%):</Typography>
                                        <Typography fontWeight="bold">{Number(data.taiChinh.bhxh).toLocaleString()} đ</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Card sx={{ height: '100%', borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom fontWeight="bold" color="info.main">Nghỉ phép</Typography>
                                {data.nghiPhep.length > 0 ? (
                                    <Stack spacing={1}>
                                        {data.nghiPhep.map((item, index) => (
                                            <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography color="text.secondary">{item.loai}:</Typography>
                                                <Typography fontWeight="bold">{item.count} lượt</Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography color="text.secondary" align="center" sx={{ mt: 2 }}>Không có đơn nghỉ nào</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Biểu đồ Chi phí theo phòng ban */}
                    <Grid item xs={12}>
                        <Card sx={{ borderRadius: 3, p: 2 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, ml: 2 }}>Tổng lương theo phòng ban</Typography>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={data.phongBan} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="ten_phong" width={150} />
                                    <Tooltip formatter={(value) => value.toLocaleString() + ' VND'} />
                                    <Legend />
                                    <Bar dataKey="totalNetSalary" name="Tổng lương" fill="#10B981" barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Grid>

                </Grid>
            )}
        </Box>
    );
}

export default Report;
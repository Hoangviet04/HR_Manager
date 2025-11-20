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
  TextField,
  InputAdornment
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";


function DepartmentList() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axiosClient.get("/api/phongban");
        setDepartments(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phòng ban:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa phòng ban này?")) {
      try {
        await axiosClient.delete(`/api/phongban/${id}`);
        setDepartments((prev) => prev.filter((d) => d.id !== id));
        alert(" Đã xóa phòng ban");
      } catch (error) {
        console.error("Lỗi khi xóa phòng ban:", error);
        alert(error.response?.data?.message || "Không thể xóa phòng ban (Có thể đang có nhân viên).");
      }
    }
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.tenPhong.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%", px: 3, mt: 3, gap: 3 }}>

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
            🏢 Danh sách phòng ban
          </Typography>
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', px: 1.5, py: 0.5, borderRadius: '8px', color: '#94a3b8', fontSize: '0.875rem' }}>
            {filteredDepartments.length} phòng ban
          </Box>
        </Box>

        <Button
          component={Link}
          to="/phongban/them"
          startIcon={<AddIcon />}
          sx={{
            bgcolor: "#90c7e8ff",
            color: "#0F172A",
            fontWeight: "bold",
            borderRadius: "8px",
            px: 2,
            "&:hover": { bgcolor: "#548ea9d5" }
          }}
        >
          Thêm phòng ban
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", mt: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            boxShadow: "0 10px 35px rgba(0,0,0,0.05)",
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#334155" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Mã phòng
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Tên phòng ban
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold", width: 150 }}>
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDepartments.length > 0 ? (
                filteredDepartments.map((dept) => (
                  <TableRow
                    key={dept.id}
                    hover
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell>{dept.id}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{dept.tenPhong}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          component={Link}
                          to={`/phongban/${dept.id}/sua`}
                          variant="outlined"
                          size="small"
                          sx={{ minWidth: 0, p: 0.5 }}
                        >
                          <EditIcon fontSize="small" />
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          onClick={() => handleDelete(dept.id)}
                          sx={{ minWidth: 0, p: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 5, color: "text.secondary" }}>
                    Không tìm thấy phòng ban nào.
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

export default DepartmentList;
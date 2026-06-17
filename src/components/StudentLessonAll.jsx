import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    CircularProgress, Typography, Select, MenuItem, FormControl
} from '@mui/material';
import axiosClient from '../api/axios';

const StudentLessonAll = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('Barchasi');

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const res = await axiosClient.get(`/groups/${id}/lessons/all`);
                setLessons(res.data.data || res.data || []);
            } catch (error) {
                console.error("Error fetching lessons:", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) {
            fetchLessons();
        }
    }, [id]);

    const formatDateCustom = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy} M${mm} ${dd}`;
    };

    const formatEndTime = (dateString, status) => {
        if (status === 'Berilmagan') return '-';
        const baseDate = formatDateCustom(dateString);
        return `${baseDate} 20:00`;
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Qaytarilgan':
                return { bg: '#F59E0B', color: '#fff' }; // Amber
            case 'Qabul qilingan':
                return { bg: '#10B981', color: '#fff' }; // Emerald
            case 'Berilmagan':
                return { bg: '#6B7280', color: '#fff' }; // Gray
            case 'Bajarilmagan':
                return { bg: '#EF4444', color: '#fff' }; // Red
            default:
                return { bg: '#E5E7EB', color: '#374151' }; // Default
        }
    };

    const filteredLessons = lessons.filter(lesson => {
        if (filterStatus === 'Barchasi') return true;
        return lesson.status === filterStatus;
    });

    return (
        <Box sx={{ py: 2, px: 3 }}>
            <Typography variant="subtitle1" sx={{ color: '#4B5563', mb: 1 }}>Uy vazifa statusi</Typography>
            <FormControl sx={{ mb: 3, minWidth: 200, backgroundColor: '#fff' }} size="small">
                <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    sx={{ borderRadius: '8px', '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D1D5DB' } }}
                >
                    <MenuItem value="Barchasi">Barchasi</MenuItem>
                    <MenuItem value="Qaytarilgan">Qaytarilgan</MenuItem>
                    <MenuItem value="Qabul qilingan">Qabul qilingan</MenuItem>
                    <MenuItem value="Berilmagan">Berilmagan</MenuItem>
                    <MenuItem value="Bajarilmagan">Bajarilmagan</MenuItem>
                </Select>
            </FormControl>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ backgroundColor: '#fff' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#111827', borderBottom: '1px solid', borderColor: 'divider' }}>Mavzular</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#111827', borderBottom: '1px solid', borderColor: 'divider' }}>Video</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#111827', borderBottom: '1px solid', borderColor: 'divider' }}>Uyga vazifa Holati</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#111827', borderBottom: '1px solid', borderColor: 'divider' }}>Uyga vazifa tugash vaqti</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#111827', borderBottom: '1px solid', borderColor: 'divider' }}>Dars sanasi</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                    <CircularProgress sx={{ color: '#6B4BE8' }} />
                                </TableCell>
                            </TableRow>
                        ) : filteredLessons.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                                    Ma'lumot topilmadi
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLessons.map((lesson) => {
                                const statusStyle = getStatusStyle(lesson.status);
                                return (
                                    <TableRow 
                                        key={lesson.id} 
                                        onClick={() => navigate(`/dashboard/my-groups/${id}/lessons/${lesson.id}`)}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer', '&:hover': { backgroundColor: '#F9FAFB' } }}
                                    >
                                        <TableCell sx={{ color: '#374151', fontSize: 14, borderBottom: '1px solid', borderColor: 'divider' }}>{lesson.topic}</TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                            <Box sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 28,
                                                height: 28,
                                                borderRadius: '50%',
                                                border: '1px solid #3B82F6',
                                                color: '#3B82F6',
                                                fontSize: 14
                                            }}>
                                                {lesson.videoCount || 0}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
                                            <Box sx={{
                                                display: 'inline-block',
                                                px: 2,
                                                py: 1,
                                                borderRadius: '4px',
                                                backgroundColor: statusStyle.bg,
                                                color: statusStyle.color,
                                                fontSize: 14,
                                                fontWeight: 500
                                            }}>
                                                {lesson.status || 'Noma\'lum'}
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ color: '#374151', fontSize: 14, borderBottom: '1px solid', borderColor: 'divider' }}>
                                            {formatEndTime(lesson.created_at, lesson.status)}
                                        </TableCell>
                                        <TableCell sx={{ color: '#374151', fontSize: 14, borderBottom: '1px solid', borderColor: 'divider' }}>
                                            {formatDateCustom(lesson.created_at)}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default StudentLessonAll;

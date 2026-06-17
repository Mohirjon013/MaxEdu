import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, CircularProgress, Dialog, DialogContent, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axiosClient from '../api/axios';

const PURPLE_MAIN = "#6B4BE8";

const MyGroups = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleOpenModal = (group, e) => {
        e.stopPropagation();
        setSelectedGroup(group);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedGroup(null);
    };

    const formatDays = (days) => {
        if (!days) return '-';
        if (typeof days === 'string') return days;
        if (Array.isArray(days)) {
            const dayMap = {
                'Monday': 'Du',
                'Tuesday': 'Se',
                'Wednesday': 'Ch',
                'Thursday': 'Pa',
                'Friday': 'Ju',
                'Saturday': 'Sha',
                'Sunday': 'Ya',
                'MONDAY': 'Du',
                'TUESDAY': 'Se',
                'WEDNESDAY': 'Ch',
                'THURSDAY': 'Pa',
                'FRIDAY': 'Ju',
                'SATURDAY': 'Sha',
                'SUNDAY': 'Ya'
            };
            return days.map(d => dayMap[d] || d).join(', ');
        }
        return '-';
    };

    const calculateEndTime = (startTime) => {
        if (!startTime) return '';
        const parts = startTime.split(':');
        if (parts.length < 2) return '';
        const endHours = (parseInt(parts[0], 10) + 2).toString().padStart(2, '0');
        return `${endHours}:${parts[1]}`;
    };

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const res = await axiosClient.get('/students/my/groups');
                setGroups(res.data.data || []);
            } catch (error) {
                console.error("Error fetching groups:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Oddiy sana formatiga o'tkazish, masalan 2026-06-01
        return date.toISOString().split('T')[0]; 
    };

    return (
        <Box sx={{ py: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    TabIndicatorProps={{ style: { backgroundColor: PURPLE_MAIN } }}
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 600,
                            color: 'text.secondary',
                            fontSize: '15px'
                        },
                        '& .Mui-selected': {
                            color: `${PURPLE_MAIN} !important`,
                        }
                    }}
                >
                    <Tab label="Faol" />
                    <Tab label="Tugagan" />
                </Tabs>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
                <Table sx={{ minWidth: 650 }}>
                    <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, color: '#374151', width: '5%' }}>#</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#374151', width: '25%' }}>Guruh nomi</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#374151', width: '25%' }}>Yo'nalishi</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#374151', width: '20%' }}>O'qituvchi</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: '#374151', width: '25%' }}>Boshlash vaqti</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                    <CircularProgress sx={{ color: PURPLE_MAIN }} />
                                </TableCell>
                            </TableRow>
                        ) : groups.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 5, color: 'text.secondary' }}>
                                    Ma'lumot topilmadi
                                </TableCell>
                            </TableRow>
                        ) : (
                            groups.map((group, index) => {
                                const teacherName = group.teachers?.[0]?.full_name || '?';
                                const initial = teacherName.charAt(0).toUpperCase();

                                return (
                                    <TableRow 
                                        key={group.groupId || index} 
                                        onClick={() => navigate(`/dashboard/my-groups/${group.groupId}`)}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 }, cursor: 'pointer', '&:hover': { backgroundColor: '#F3F4F6' }, transition: 'background-color 0.2s' }}
                                    >
                                        <TableCell sx={{ color: '#4B5563', fontSize: 14 }}>{index + 1}</TableCell>
                                        <TableCell sx={{ color: '#4B5563', fontSize: 14 }}>{group.groupName}</TableCell>
                                        <TableCell sx={{ color: '#9CA3AF', fontSize: 14 }}>{group.courseName}</TableCell>
                                        <TableCell>
                                            <Avatar 
                                                onClick={(e) => handleOpenModal(group, e)}
                                                sx={{ 
                                                    width: 32, 
                                                    height: 32, 
                                                    bgcolor: PURPLE_MAIN, 
                                                    fontSize: 14, 
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: '#5a3ec8',
                                                        transform: 'scale(1.1)'
                                                    }
                                                }}
                                            >
                                                {group.teachers?.length || group.teachersCount || 0}
                                            </Avatar>
                                        </TableCell>
                                        <TableCell sx={{ color: '#4B5563', fontSize: 14 }}>{formatDate(group.startDate)}</TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '12px' } }}>
                <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" sx={{ color: '#111827', mb: 1 }}>
                            {selectedGroup?.groupName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {tabValue === 0 ? 'Faol' : 'Tugagan'}
                        </Typography>
                    </Box>
                    <IconButton onClick={handleCloseModal} sx={{ color: 'text.secondary' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <DialogContent sx={{ p: 3, pt: 0 }}>
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px' }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#F9FAFB' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>O'qituvchi</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Roli</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Dars kunlari</TableCell>
                                    <TableCell sx={{ fontWeight: 600, color: '#374151' }}>Dars vaqti</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {selectedGroup?.teachers?.map((teacher, idx) => (
                                    <TableRow key={idx} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                        <TableCell sx={{ color: '#4B5563' }}>{teacher.full_name || 'Noma\'lum'}</TableCell>
                                        <TableCell sx={{ color: '#4B5563' }}>{teacher.role === 'TEACHER' ? 'TEACHER' : teacher.role || 'TEACHER'}</TableCell>
                                        <TableCell sx={{ color: '#4B5563' }}>{formatDays(selectedGroup?.week_day || selectedGroup?.days || teacher.week_day || teacher.days)}</TableCell>
                                        <TableCell sx={{ color: '#4B5563' }}>
                                            {(() => {
                                                const start = selectedGroup?.start_time || selectedGroup?.startTime || teacher.start_time || teacher.startTime;
                                                if (!start) return '-';
                                                const end = selectedGroup?.end_time || selectedGroup?.endTime || teacher.end_time || teacher.endTime || calculateEndTime(start);
                                                return `${start} - ${end}`;
                                            })()}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {(!selectedGroup?.teachers || selectedGroup.teachers.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                            O'qituvchilar topilmadi
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default MyGroups;

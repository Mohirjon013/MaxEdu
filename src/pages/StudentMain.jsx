import React from 'react';
import { Box, Typography, Paper, LinearProgress, IconButton } from '@mui/material';
import { Diamond, TrendingUp, Language, ChevronLeft, ChevronRight, KeyboardArrowDown } from '@mui/icons-material';

const StudentMain = () => {
    return (
        <Box sx={{ py: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 3, display: 'flex', alignItems: 'center', gap: 1, color: '#1F2937' }}>
                Kumushlar: 6315 <Diamond sx={{ color: '#9CA3AF', fontSize: 24 }} />
            </Typography>

            <Box sx={{ display: 'flex', gap: 3, flexDirection: 'column', maxWidth: '320px' }}>
                <Paper sx={{ p: 2.5, borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TrendingUp sx={{ color: '#3B82F6', fontSize: 20 }} />
                        <Typography sx={{ fontWeight: 600, color: '#374151', fontSize: 15 }}>Bosqich: 4</Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 0.5 }}>
                            <Box sx={{ backgroundColor: '#4ADE80', color: 'white', px: 1.5, py: 0.3, borderRadius: '12px', fontSize: 11, fontWeight: 600 }}>
                                1104 / 1500
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                            <LinearProgress 
                                variant="determinate" 
                                value={(1104 / 1500) * 100} 
                                sx={{ 
                                    height: 10, 
                                    borderRadius: '5px', 
                                    flex: 1,
                                    backgroundColor: '#D1FAE5', 
                                    '& .MuiLinearProgress-bar': { backgroundColor: '#4ADE80', borderRadius: '5px' } 
                                }} 
                            />
                            <Box sx={{ height: 10, width: '40px', backgroundColor: '#D1FAE5', borderTopRightRadius: '5px', borderBottomRightRadius: '5px', ml: '-2px' }} />
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                        <Language sx={{ color: '#10B981', fontSize: 20 }} />
                        <Typography sx={{ fontWeight: 600, color: '#374151', fontSize: 15 }}>XP: 1104</Typography>
                    </Box>

                    <Box>
                        <Typography sx={{ fontWeight: 600, mb: 0.5, color: '#374151', fontSize: 15 }}>Reyting</Typography>
                        <Typography sx={{ color: '#6B7280', fontSize: 14 }}>
                            <span style={{ color: '#111827', fontWeight: 600 }}>Umumiy:</span> 476 - o'rin
                        </Typography>
                    </Box>
                </Paper>

                <Typography sx={{ fontWeight: 600, mt: 1, color: '#374151', fontSize: 15 }}>Dars jadvali</Typography>
                <Paper sx={{ p: 2, borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography sx={{ fontWeight: 500, color: '#4B5563', fontSize: 14, display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}>
                            Iyun 2026 <KeyboardArrowDown sx={{ fontSize: 18 }} />
                        </Typography>
                        <Box>
                            <IconButton size="small" sx={{ p: 0.5, color: '#9CA3AF' }}><ChevronLeft sx={{ fontSize: 20 }} /></IconButton>
                            <IconButton size="small" sx={{ p: 0.5, color: '#9CA3AF' }}><ChevronRight sx={{ fontSize: 20 }} /></IconButton>
                        </Box>
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, textAlign: 'center' }}>
                        {['D', 'S', 'C', 'P', 'J', 'S', 'Y'].map((day, i) => (
                            <Typography key={i} sx={{ fontSize: 12, color: '#9CA3AF', mb: 1.5, fontWeight: 500 }}>{day}</Typography>
                        ))}
                        {[...Array(30)].map((_, i) => {
                            const date = i + 1;
                            const isToday = date === 16;
                            const hasDot = [17, 18, 19, 20, 22, 23, 24, 25, 26, 27, 29, 30].includes(date);
                            return (
                                <Box key={i} sx={{ position: 'relative', height: 36, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Box sx={{ 
                                        width: 32, height: 32, 
                                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                                        borderRadius: '50%',
                                        border: isToday ? '1px solid #9CA3AF' : '1px solid transparent',
                                        fontSize: 13,
                                        color: '#374151',
                                        fontWeight: isToday ? 500 : 400
                                    }}>
                                        {date}
                                    </Box>
                                    {hasDot && <Box sx={{ position: 'absolute', bottom: 2, width: 6, height: 6, backgroundColor: '#EF4444', borderRadius: '50%' }} />}
                                </Box>
                            )
                        })}
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}

export default StudentMain;

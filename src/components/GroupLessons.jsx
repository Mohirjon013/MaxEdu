import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import axiosClient from '../api/axios';

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = date.getDate();
  const year = date.getFullYear();
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  const month = months[date.getMonth()];
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day} ${month}, ${year} ${hours}:${minutes}`;
};

const formatDateOnly = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = date.getDate();
  const year = date.getFullYear();
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  const month = months[date.getMonth()];
  return `${day} ${month}, ${year}`;
};

const calculateDeadline = (dateString, hours = 20) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  date.setHours(date.getHours() + hours);
  return date;
};

function GroupLessons() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeLessonTab, setActiveLessonTab] = useState('Uyga vazifa');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchLessons() {
      if (activeLessonTab === 'Uyga vazifa') {
        setLoading(true);
        try {
          const res = await axiosClient.get(`/homework/${id}`);
          const data = res.data?.data || res.data || [];
          console.log(data);

          setLessons(Array.isArray(data) ? data : [data]);
        } catch (error) {
          console.error("Homework yuklashda xatolik:", error);
          setLessons([]);
        } finally {
          setLoading(false);
        }
      } else {
        setLessons([]);
      }
    }
    fetchLessons();
  }, [id, activeLessonTab]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>Guruh darsliklari</Typography>
          <Box sx={{ display: 'flex', bgcolor: '#f8fafc', borderRadius: '8px', p: 0.5 }}>
            {['Uyga vazifa', 'Videolar', 'Imtihonlar', 'Jurnal'].map(tab => (
              <Button
                key={tab}
                onClick={() => setActiveLessonTab(tab)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: activeLessonTab === tab ? '#111827' : '#64748b',
                  bgcolor: activeLessonTab === tab ? '#fff' : 'transparent',
                  boxShadow: activeLessonTab === tab ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  borderRadius: '6px',
                  px: 3,
                  py: 0.75,
                  minWidth: '100px',
                  '&:hover': {
                    bgcolor: activeLessonTab === tab ? '#fff' : '#f1f5f9',
                  }
                }}
              >
                {tab}
              </Button>
            ))}
          </Box>
        </Box>
        <Button
          onClick={() => navigate(`/dashboard/groups/${id}/homework/create`)}
          variant="contained"
          sx={{
            bgcolor: '#10b981',
            color: '#fff',
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '15px',
            borderRadius: '10px',
            px: 3.5,
            py: 0.8,
            boxShadow: '0px 1px 3px rgba(16, 185, 129, 0.4)',
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: '#059669',
              boxShadow: '0px 2px 4px rgba(16, 185, 129, 0.5)',
            },
            '&:active': {
              boxShadow: '0px 2px 3px rgba(16, 185, 129, 0.4)',
            }
          }}
        >
          Qo'shish
        </Button>
      </Box>

      {/* Table */}
      <Paper sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: 'none' }}>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2, borderBottom: '1px solid #e2e8f0' }}>#</TableCell>
                <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2, borderBottom: '1px solid #e2e8f0' }}>Mavzu</TableCell>
                <TableCell align="center" sx={{ color: '#94a3b8', py: 2, borderBottom: '1px solid #e2e8f0' }}><PersonOutlinedIcon fontSize="small" /></TableCell>
                <TableCell align="center" sx={{ color: '#f59e0b', py: 2, borderBottom: '1px solid #e2e8f0' }}><TimerOutlinedIcon fontSize="small" /></TableCell>
                <TableCell align="center" sx={{ color: '#10b981', py: 2, borderBottom: '1px solid #e2e8f0' }}><CheckCircleOutlinedIcon fontSize="small" /></TableCell>
                <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2, borderBottom: '1px solid #e2e8f0' }}>Berilgan vaqt</TableCell>
                <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2, borderBottom: '1px solid #e2e8f0' }}>Tugash vaqti</TableCell>
                <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2, borderBottom: '1px solid #e2e8f0' }}>Dars sanasi</TableCell>
                <TableCell align="right" sx={{ color: '#64748b', fontWeight: 600, py: 2, borderBottom: '1px solid #e2e8f0' }}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={30} sx={{ color: '#7C3AED' }} />
                  </TableCell>
                </TableRow>
              ) : lessons.length > 0 ? (
                lessons.map((lesson, index) => (
                  <TableRow key={lesson.id || index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell sx={{ color: '#1e293b', fontWeight: 600, fontSize: '14px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{index + 1}</TableCell>
                    <TableCell sx={{ color: '#1e293b', fontWeight: 600, fontSize: '14px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{lesson.topic || '—'}</TableCell>
                    <TableCell align="center" sx={{ color: '#1e293b', fontWeight: 600, fontSize: '14px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{lesson.existStudentsIngroup || 0}</TableCell>
                    <TableCell align="center" sx={{ color: '#1e293b', fontWeight: 600, fontSize: '14px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{lesson.homeworkPending || 0}</TableCell>
                    <TableCell align="center" sx={{ color: '#1e293b', fontWeight: 600, fontSize: '14px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{lesson.homeworkAccept || 0}</TableCell>
                    <TableCell sx={{ color: '#475569', fontWeight: 500, fontSize: '13px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{formatDate(lesson.homework?.[0]?.created_at || lesson.created_at)}</TableCell>
                    <TableCell sx={{ color: '#475569', fontWeight: 500, fontSize: '13px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{formatDate(lesson.deadline || calculateDeadline(lesson.homework?.[0]?.created_at || lesson.created_at, 20))}</TableCell>
                    <TableCell sx={{ color: '#475569', fontWeight: 500, fontSize: '13px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>{formatDateOnly(lesson.created_at)}</TableCell>
                    <TableCell align="right" sx={{ py: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                      <IconButton size="small" sx={{ color: '#94a3b8' }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ color: '#64748b', py: 3, fontSize: '14px' }}>
                    Hozircha ma'lumot yo'q.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default GroupLessons;

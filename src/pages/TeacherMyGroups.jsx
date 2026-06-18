import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Switch,
  CircularProgress,
  Button
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArchiveIcon from '@mui/icons-material/Archive';
import GroupsIcon from '@mui/icons-material/Groups';
import axiosClient from '../api/axios';
import loadingImg from "../assets/images/loading.gif";
import ErrorModal from '../components/ErrorModal';

const WEEK_MAP = {
  MONDAY: 'Du',
  TUESDAY: 'Se',
  WEDNESDAY: 'Chor',
  THURSDAY: 'Pay',
  FRIDAY: 'Ju',
  SATURDAY: 'Shan',
  SUNDAY: 'Yak'
};

function TeacherMyGroups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });

  // Only "guruhlar" tab is needed according to the design
  const [activeTab, setActiveTab] = useState('guruhlar'); 

  useEffect(() => {
    async function fetchMyGroups() {
      setIsLoading(true);
      try {
        const res = await axiosClient.get('/teachers/my/groups');
        setGroups(res.data?.data || []);
      } catch (err) {
        console.error(err);
        setErrorModal({ open: true, message: 'Ma\'lumotlarni yuklashda xato yuz berdi: ' + (err.response?.data?.message || err.message) });
      } finally {
        setIsLoading(false);
      }
    }
    fetchMyGroups();
  }, []);

  return (
    <>
      <Box sx={{ mt: 3, fontFamily: 'Roboto, sans-serif' }}>
        
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '30px' }}>
            Guruhlar
          </Typography>
        </Box>

        {/* Tabs (as in screenshot) */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, alignItems: 'center' }}>
          <Button
            disableElevation
            onClick={() => setActiveTab('guruhlar')}
            sx={{
              fontWeight: 600, px: 2.5, py: 0.8, fontSize: '14.5px',
              borderRadius: '8px', textTransform: 'none',
              bgcolor: activeTab === 'guruhlar' ? 'background.paper' : 'transparent',
              color: activeTab === 'guruhlar' ? 'text.primary' : 'text.secondary',
              boxShadow: activeTab === 'guruhlar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              border: 'none',
              '&:hover': {
                bgcolor: activeTab === 'guruhlar' ? 'background.paper' : 'action.hover',
              }
            }}
          >
            Guruhlar
          </Button>
          <Button
            disableElevation
            onClick={() => setActiveTab('arxiv')}
            startIcon={<ArchiveIcon sx={{ fontSize: '18px !important' }} />}
            sx={{
              fontWeight: 600, px: 2.5, py: 0.8, fontSize: '14.5px',
              borderRadius: '8px', textTransform: 'none',
              bgcolor: activeTab === 'arxiv' ? 'background.paper' : 'transparent',
              color: activeTab === 'arxiv' ? 'text.primary' : 'text.secondary',
              boxShadow: activeTab === 'arxiv' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              border: 'none',
              '&:hover': {
                bgcolor: activeTab === 'arxiv' ? 'background.paper' : 'action.hover',
              }
            }}
          >
            Arxiv
          </Button>
        </Box>

        {/* Table */}
        <Paper sx={{ height: '580px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <TableContainer sx={{
            flex: 1, overflowY: 'auto',
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: '#e5e7eb', borderRadius: '10px' },
            '&::-webkit-scrollbar-thumb:hover': { background: '#d1d5db' },
          }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '395px' }}>
                <img src={loadingImg} alt="loading" width={90} height={90} />
              </Box>
            ) : (
              <Table sx={{ minWidth: 900 }} stickyHeader>
                <TableHead sx={{ bgcolor: '#fafafa' }}>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#555', fontSize: '13px', bgcolor: '#fafafa' }}>Status</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#555', fontSize: '13px', bgcolor: '#fafafa' }}>Guruh nomi</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#555', fontSize: '13px', bgcolor: '#fafafa' }}>Kurs</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#555', fontSize: '13px', bgcolor: '#fafafa' }}>Davomiyligi</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#555', fontSize: '13px', bgcolor: '#fafafa' }}>Dars vaqti</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#555', fontSize: '13px', bgcolor: '#fafafa' }}>Xona</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#555', fontSize: '13px', bgcolor: '#fafafa' }}>O'qituvchi</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#555', fontSize: '13px', bgcolor: '#fafafa' }}>Talabalar</TableCell>
                    <TableCell align="right" sx={{ bgcolor: '#fafafa' }}>
                      <IconButton size="small" sx={{ color: '#888', }}>
                        <RefreshIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4, color: '#6b7280', fontSize: '14px' }}>
                        Ma'lumot topilmadi
                      </TableCell>
                    </TableRow>
                  ) : (
                    groups.map((group, index) => {
                      const isActive = group.status === 'active';
                      return (
                        <TableRow 
                          key={group.id} 
                          hover 
                          onClick={() => navigate(`/dashboard/groups/${group.id}`, { state: { groupData: group } })} 
                          sx={{ cursor: 'pointer', '& td': { borderBottom: '1px solid #eee' } }}
                        >
                          {/* Status */}
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                              <Switch
                                checked={isActive}
                                disabled
                                size="small"
                                color="primary"
                              />
                              <Chip
                                label={isActive ? 'FAOL' : 'NOFAOL'}
                                size="small"
                                sx={{
                                  width: '60px',
                                  fontSize: '11px', fontWeight: 700, height: '22px',
                                  bgcolor: isActive ? '#dcfce7' : '#fee2e2',
                                  color: isActive ? '#16a34a' : '#dc2626',
                                }}
                              />
                            </Box>
                          </TableCell>

                          {/* Guruh nomi */}
                          <TableCell align="center">
                            <Typography sx={{ fontWeight: 700, color: '#1a1a1a', fontSize: '14px' }}>
                              {group.name}
                            </Typography>
                          </TableCell>

                          {/* Kurs */}
                          <TableCell align="center">
                            <Chip
                              label={group.course?.name || '—'}
                              size="small"
                              sx={{
                                bgcolor: '#fce7f3', color: '#db2777',
                                fontWeight: 600, fontSize: '12px', borderRadius: '6px'
                              }}
                            />
                          </TableCell>

                          {/* Davomiyligi */}
                          <TableCell align="center" sx={{ color: '#555', fontSize: '14px' }}>
                            {group.course?.duration_month || 0} oy
                          </TableCell>

                          {/* Dars vaqti */}
                          <TableCell align="center">
                            <Typography sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>
                              {(group.start_time || '')?.slice(0, 5)}
                            </Typography>
                            <Typography sx={{ fontSize: '12px', color: '#888' }}>
                              {group.week_day?.map(day => WEEK_MAP[day]).join(', ')}
                            </Typography>
                          </TableCell>

                          {/* Xona */}
                          <TableCell align="center" sx={{ color: '#555', fontSize: '14px' }}>
                            {group.room || '—'}
                          </TableCell>

                          {/* O'qituvchi */}
                          <TableCell align="center">
                            <Typography sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>
                              {group.teachers?.length > 0 ? group.teachers[0].full_name : '—'}
                            </Typography>
                          </TableCell>

                          {/* Talabalar */}
                          <TableCell align="center" sx={{ color: '#555', fontSize: '14px', fontWeight: 500 }}>
                            {group.student_count || 0}
                          </TableCell>

                          {/* Actions */}
                          <TableCell align="right">
                            <IconButton size="small" sx={{ color: '#888', '&:hover': { color: '#7C3AED' } }}>
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Paper>

        <ErrorModal
          open={errorModal.open}
          onClose={() => setErrorModal({ ...errorModal, open: false })}
          message={errorModal.message}
        />

      </Box>
    </>
  );
}

export default TeacherMyGroups;

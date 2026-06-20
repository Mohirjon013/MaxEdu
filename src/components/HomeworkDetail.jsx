import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Paper, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, CircularProgress, Chip } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import axiosClient from '../api/axios';
import Loader from './Loader';

function HomeworkDetail() {
  const { id, hwId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [allSubmissions, setAllSubmissions] = useState([[], [], [], []]);
  const [homework, setHomework] = useState(null);

  const tabs = [
    { label: "Kutayotganlar", value: 0 },
    { label: "Qaytarilganlar", value: 1 },
    { label: "Qabul qilinganlar", value: 2 },
    { label: "Bajarilmagan", value: 3 }
  ];

  const getCount = (tabIndex) => allSubmissions[tabIndex]?.length || 0;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const statuses = ['PENDING', 'REJECTED', 'ACCEPTED', ''];

        // Barcha tablar uchun ma'lumotlarni parallel yuklash
        const requests = statuses.map(st =>
          axiosClient.get(`/group/${id}/homework/${hwId}/results`, { params: st ? { status: st } : {} })
        );

        // Uyga vazifa ma'lumotlarini olish uchun guruh darsliklarini so'rash
        requests.push(axiosClient.get(`/homework/${id}`));

        const responses = await Promise.all(requests);

        // Eng oxirgi response bu /homework/${id} dan kelgan
        const hwResponse = responses.pop();
        const hwData = hwResponse.data?.data || hwResponse.data || [];
        const hwList = Array.isArray(hwData) ? hwData : [];
        const currentHw = hwList.find(h => String(h.id) === String(hwId) || (h.homework && h.homework.some(hw => String(hw.id) === String(hwId))));

        if (currentHw) {
          // Tugash vaqtini hisoblash (yuborilgan vaqtga 20 soat qo'shish)
          const baseDateStr = currentHw.homework?.[0]?.created_at || currentHw.created_at;
          if (baseDateStr) {
            const baseDate = new Date(baseDateStr);
            if (!isNaN(baseDate.getTime())) {
              baseDate.setHours(baseDate.getHours() + 20);
              currentHw.deadline = baseDate.toISOString();
            }
          }
          setHomework(currentHw);
        }

        const newAllSubmissions = responses.map(res => {
          const d = res.data?.data;
          if (Array.isArray(d)) return d;
          if (d?.students && Array.isArray(d.students)) return d.students;
          return [];
        });

        setAllSubmissions(newAllSubmissions);

      } catch (err) {
        console.error("Ma'lumotni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, hwId]);

  const currentSubmissions = allSubmissions[activeTab] || [];

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month}, ${year} ${h}:${m}`;
  };

  return (
    <Box sx={{ fontFamily: 'Roboto, sans-serif', pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton
            onClick={() => navigate(`/dashboard/groups/${id}`)}
            sx={{
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              color: '#334155',
              '&:hover': { bgcolor: '#f1f5f9' },
              width: 38,
              height: 38,
              borderRadius: '10px'
            }}
          >
            <ArrowBackIosNewIcon sx={{ fontSize: '16px', ml: '2px' }} />
          </IconButton>
          <Typography sx={{ fontWeight: 700, fontSize: '24px', color: '#111827' }}>
            {homework?.topic || 'Uyga vazifa'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 8, bgcolor: '#f8fafc', p: 2.5, borderRadius: '8px' }}>
          <Box>
            <Typography sx={{ fontSize: '13px', color: '#64748b', mb: 0.5, fontWeight: 500 }}>Mavzu</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>
              {homework?.topic || '—'}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '13px', color: '#64748b', mb: 0.5, fontWeight: 500 }}>Tugash vaqti</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>
              {formatDate(homework?.deadline)}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: 'none', mb: 3, pt: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{
            px: 2,
            borderBottom: '1px solid #e5e7eb',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, color: '#111827', fontSize: '14px', minWidth: 'auto', px: 3 },
            '& .Mui-selected': { color: '#7C3AED !important' },
            '& .MuiTabs-indicator': { bgcolor: '#7C3AED', height: '3px', borderRadius: '3px 3px 0 0' }
          }}
        >
          {tabs.map((tab, idx) => {
            const count = getCount(idx);
            return (
              <Tab
                key={idx}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.label}
                    {count > 0 && (
                      <Box sx={{
                        bgcolor: '#7C3AED', color: '#fff', fontSize: '12px',
                        fontWeight: 700, borderRadius: '50%', width: '22px', height: '22px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {count}
                      </Box>
                    )}
                  </Box>
                }
              />
            );
          })}
        </Tabs>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2.5, borderBottom: '1px solid #e2e8f0' }}>O'quvchi ismi</TableCell>
                <TableCell sx={{ color: '#64748b', fontWeight: 600, fontSize: '13px', py: 2.5, borderBottom: '1px solid #e2e8f0' }}>Uyga vazifa jo'natilgan vaqt</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={30} sx={{ color: '#7C3AED' }} />
                  </TableCell>
                </TableRow>
              ) : currentSubmissions.length > 0 ? (
                currentSubmissions.map((sub, index) => {
                  const studentId = sub.student?.id || sub.students?.id || sub.id;
                  return (
                    <TableRow
                      key={studentId ? `hw-sub-${studentId}-${index}` : `hw-sub-idx-${index}`}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                        cursor: activeTab !== 3 ? 'pointer' : 'default',
                        '&:hover': { bgcolor: activeTab !== 3 ? '#f8fafc' : 'inherit' }
                      }}
                      onClick={() => activeTab !== 3 && navigate(`/dashboard/groups/${id}/homework/${hwId}/result/${studentId}`)}
                    >
                      <TableCell sx={{ color: '#1e293b', fontWeight: 500, fontSize: '14px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                        {sub.student?.full_name || sub.students?.full_name || sub.full_name || 'Noma\'lum o\'quvchi'}
                      </TableCell>
                      <TableCell sx={{ color: '#475569', fontWeight: 500, fontSize: '14px', py: 2.5, borderBottom: '1px solid #f1f5f9' }}>
                        {formatDate(sub.created_at || sub.submitted_at || sub.time || homework?.homework?.[0]?.created_at)}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: '#64748b', py: 4, fontSize: '14px' }}>
                    {tabs[activeTab].label} ro'yxatida ma'lumot topilmadi.
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

export default HomeworkDetail;

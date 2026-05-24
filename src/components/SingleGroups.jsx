import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Typography, Button, IconButton, Chip, Tabs, Tab, Paper, Avatar, Collapse } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import BarChartIcon from '@mui/icons-material/BarChart';
import axiosClient from '../api/axios';
import GroupLessons from './GroupLessons';
import Loader from './Loader';

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate();
  const year = date.getFullYear();
  const months = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
  const month = months[date.getMonth()];
  return `${day} ${month}, ${year}`;
};

function SingleGroups() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [group, setGroup] = useState(null);

  const tabParam = parseInt(searchParams.get('tab') || '0', 10);
  const activeTab = isNaN(tabParam) ? 0 : tabParam;

  const handleTabChange = (event, newValue) => {
    setSearchParams({ tab: newValue });
  };

  const [isMentorsOpen, setIsMentorsOpen] = useState(true);
  const [isParamsOpen, setIsParamsOpen] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [showAllSchedules, setShowAllSchedules] = useState(false);

  useEffect(() => {
    async function fetchGroup() {
      try {
        const res = await axiosClient.get(`/groups/one/${id}`);
        console.log(res.data);

        const rawData = res.data.data || res.data;
        const actualGroup = Array.isArray(rawData) ? rawData[0] : (rawData.group || rawData);
        setGroup(actualGroup);
      } catch (error) {
        console.error(error);
      }
    }

    async function fetchSchedules() {
      try {
        const res = await axiosClient.get(`/groups/${id}/schedules`);
        let data = res.data?.data || res.data || [];
        let parsedSchedules = [];
        if (Array.isArray(data)) {
          data.forEach(item => {
            Object.entries(item).forEach(([key, value]) => {
              parsedSchedules.push({ monthKey: key, monthData: value });
            });
          });
        } else if (typeof data === 'object' && data !== null) {
          Object.entries(data).forEach(([key, value]) => {
            parsedSchedules.push({ monthKey: key, monthData: value });
          });
        }
        setSchedules(parsedSchedules);
      } catch (error) {
        console.error(error);
      }
    }

    fetchGroup();
    fetchSchedules();
  }, [id]);

  if (!group) return <Loader fullScreen />;

  return (
    <Box sx={{ fontFamily: 'Roboto, sans-serif' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ color: '#111827' }}>
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
            {group.name || group.course?.name || `Guruh`}
          </Typography>
          <Chip label={group.is_active !== false ? "Aktiv" : "Nofaol"} size="small" sx={{ bgcolor: group.is_active !== false ? '#dcfce7' : '#fee2e2', color: group.is_active !== false ? '#16a34a' : '#dc2626', fontWeight: 600, borderRadius: '6px' }} />
        </Box>
        <Button variant="outlined" startIcon={<BarChartIcon />} sx={{ color: '#374151', borderColor: '#e5e7eb', borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
          Statistika
        </Button>
      </Box>

      {/* Tabs */}
      <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: '1px solid #e5e7eb', mb: 3, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, color: '#6b7280' }, '& .Mui-selected': { color: '#7C3AED !important' }, '& .MuiTabs-indicator': { bgcolor: '#7C3AED' } }}>
        <Tab label="Ma'lumotlar" />
        <Tab label="Guruh darsliklari" />
        <Tab label="Akademik davomati" />
      </Tabs>

      {/* Content */}
      {activeTab === 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, alignItems: 'start' }}>

            {/* Guruh mentorlari */}
            <Paper sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
              <Box onClick={() => setIsMentorsOpen(!isMentorsOpen)} sx={{ cursor: 'pointer', bgcolor: '#3b82f6', color: '#fff', px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>Guruh mentorlari</Typography>
                <IconButton size="small" sx={{ color: '#fff', p: 0, transform: isMentorsOpen ? 'rotate(0deg)' : 'rotate(45deg)', transition: '0.3s' }}>
                  <span style={{ fontSize: '18px' }}>✕</span>
                </IconButton>
              </Box>
              <Collapse in={isMentorsOpen} timeout="auto" unmountOnExit>
                <Box sx={{ p: 3, display: 'flex', gap: 3 }}>
                  {group.teachers?.map((teacher, idx) => (
                    <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Avatar src={teacher.image || ''} sx={{ width: 64, height: 64, mb: 1, border: '2px solid #e5e7eb' }}>
                        {!teacher.image && teacher.full_name?.charAt(0)}
                      </Avatar>
                      <Typography sx={{ fontSize: '12px', color: '#10b981', fontWeight: 600, mb: 0.5 }}>Teacher</Typography>
                      <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{teacher.full_name}</Typography>
                    </Box>
                  ))}
                  {(!group.teachers || group.teachers.length === 0) && (
                    <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>Mentor biriktirilmagan</Typography>
                  )}
                </Box>
              </Collapse>
            </Paper>

            {/* Parametrlar */}
            <Paper sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: 'none' }}>
              <Box onClick={() => setIsParamsOpen(!isParamsOpen)} sx={{ cursor: 'pointer', bgcolor: '#3b82f6', color: '#fff', px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>Parametrlar</Typography>
                <IconButton size="small" sx={{ color: '#fff', p: 0, transform: isParamsOpen ? 'rotate(0deg)' : 'rotate(45deg)', transition: '0.3s' }}>
                  <span style={{ fontSize: '18px' }}>✕</span>
                </IconButton>
              </Box>
              <Collapse in={isParamsOpen} timeout="auto" unmountOnExit>
                <Box sx={{ p: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #f3f4f6' }}>
                    <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>Kurs:</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{group.course?.name || '—'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #f3f4f6' }}>
                    <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>O'rta yosh:</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>—</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #f3f4f6' }}>
                    <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>O'quvchilar sig'imi:</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{group.max_student || 20}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #f3f4f6' }}>
                    <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>Mavjud o'quvchilar:</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{group.student_count || 0}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #f3f4f6' }}>
                    <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>O'quv oyidagi darslar soni:</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>12</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, borderBottom: '1px solid #f3f4f6' }}>
                    <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>Kurs davomiyligi (oy):</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{group.course?.duration_month ? `${group.course.duration_month}.0` : '—'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
                    <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>Jami darslar soni:</Typography>
                    <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#111827' }}>{group.course?.duration_month ? group.course.duration_month * 12 : '—'}</Typography>
                  </Box>
                </Box>
              </Collapse>
            </Paper>
          </Box>

          {/* Dars jadvali */}
          <Paper sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e5e7eb', boxShadow: 'none', mb: 4 }}>
            <Box sx={{ px: 3, py: 2 }}>
              <Typography sx={{ fontWeight: 700, fontSize: '16px', color: '#111827' }}>Dars jadvali</Typography>
            </Box>
            <Box sx={{ p: 3, pt: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: '#f8fafc', borderRadius: '8px' }}>
                <Typography sx={{ color: '#2563eb', fontWeight: 600, fontSize: '14px', flex: 1 }}>
                  {group.teachers?.length > 0 ? group.teachers[0].full_name : 'O\'qituvchi yo\'q'}
                </Typography>
                <Typography sx={{ color: '#475569', fontSize: '14px', flex: 1, textAlign: 'center' }}>
                  {group.week_day?.map(d => ({ MONDAY: 'Du', TUESDAY: 'Se', WEDNESDAY: 'Ch', THURSDAY: 'Pa', FRIDAY: 'Ju', SATURDAY: 'Sh', SUNDAY: 'Yak' }[d])).join('/') || '—'}
                </Typography>
                <Typography sx={{ color: '#475569', fontSize: '14px', flex: 1, textAlign: 'center' }}>
                  {(group.start_time || '').slice(0, 5)} dan - {group.end_time ? group.end_time.slice(0, 5) : '12:30'} gacha
                </Typography>
                <Typography sx={{ color: '#475569', fontSize: '14px', flex: 1, textAlign: 'center' }}>
                  {group.start_date ? formatDate(group.start_date) : '15 Yan, 2026'} - {group.end_date ? formatDate(group.end_date) : '27 Iyun, 2026'}
                </Typography>
                <Typography sx={{ color: '#475569', fontSize: '14px', flex: 1, textAlign: 'right' }}>
                  {group.room?.name || '—'} // {group.room?.max_student || group.max_student || 18}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <Button variant="outlined" sx={{ color: '#475569', borderColor: '#e2e8f0', borderRadius: '8px', textTransform: 'none', px: 3, py: 0.5, fontWeight: 500 }}>
                  Yana ko'rsatish (9)
                </Button>
              </Box>

              {/* Schedules display */}
              {!showAllSchedules && schedules.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  {(schedules.find(s => s.monthData?.isActive) ? [schedules.find(s => s.monthData?.isActive)] : schedules.slice(0, 1)).map((scheduleItem, index) => {
                    const { monthKey, monthData } = scheduleItem;
                    return (
                      <Box key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <IconButton size="small" sx={{ border: '1px solid #e2e8f0', width: 28, height: 28 }}><ArrowBackIosNewIcon sx={{ fontSize: '12px' }} /></IconButton>
                          <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{monthKey}-o'quv oyi</Typography>
                          {monthData?.isActive && <Chip label="Joriy oy" size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 600, borderRadius: '6px', height: '24px', fontSize: '12px' }} />}
                          <IconButton size="small" sx={{ border: '1px solid #e2e8f0', width: 28, height: 28 }}><ArrowBackIosNewIcon sx={{ fontSize: '12px', transform: 'rotate(180deg)' }} /></IconButton>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
                          {monthData?.days?.map((dayObj, dIdx) => {
                            const today = new Date();
                            const todayMonth = today.getMonth();
                            const todayDate = today.getDate();
                            const monthsList = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                            const mIndex = monthsList.indexOf((dayObj.month || '').substring(0, 3).toLowerCase());
                            const isPast = mIndex !== -1 && (mIndex < todayMonth || (mIndex === todayMonth && dayObj.day < todayDate));

                            return (
                              <Box key={dIdx} sx={{ minWidth: '48px', height: '56px', bgcolor: isPast ? '#e2e8f0' : '#fff', border: isPast ? 'none' : '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: isPast ? '#cbd5e1' : '#f8fafc' } }}>
                                <Typography sx={{ fontSize: '11px', color: isPast ? '#64748b' : '#94a3b8' }}>{dayObj.month.slice(0, 3)}</Typography>
                                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: isPast ? '#334155' : '#64748b' }}>{dayObj.day}</Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Show all schedules */}
              {showAllSchedules && schedules.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {schedules.map((scheduleItem, index) => {
                    const { monthKey, monthData } = scheduleItem;
                    return (
                      <Box key={index}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>{monthKey}-o'quv oyi</Typography>
                          {monthData?.isActive && <Chip label="Joriy oy" size="small" sx={{ bgcolor: '#dcfce7', color: '#16a34a', fontWeight: 600, borderRadius: '6px', height: '24px', fontSize: '12px' }} />}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {monthData?.days?.map((dayObj, dIdx) => {
                            const today = new Date();
                            const todayMonth = today.getMonth();
                            const todayDate = today.getDate();
                            const monthsList = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
                            const mIndex = monthsList.indexOf((dayObj.month || '').substring(0, 3).toLowerCase());
                            const isPast = mIndex !== -1 && (mIndex < todayMonth || (mIndex === todayMonth && dayObj.day < todayDate));

                            return (
                              <Box key={dIdx} sx={{ width: '48px', height: '56px', bgcolor: isPast ? '#e2e8f0' : '#fff', border: isPast ? 'none' : '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { bgcolor: isPast ? '#cbd5e1' : '#f8fafc' } }}>
                                <Typography sx={{ fontSize: '11px', color: isPast ? '#64748b' : '#94a3b8' }}>{dayObj.month.slice(0, 3)}</Typography>
                                <Typography sx={{ fontSize: '15px', fontWeight: 600, color: isPast ? '#334155' : '#64748b' }}>{dayObj.day}</Typography>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}

              {/* Fallback if no schedules */}
              {schedules.length === 0 && (
                <Typography sx={{ textAlign: 'center', color: '#64748b', mt: 2, fontSize: '14px' }}>Dars jadvali ma'lumotlari topilmadi.</Typography>
              )}

              {schedules.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button onClick={() => setShowAllSchedules(!showAllSchedules)} variant="contained" sx={{ bgcolor: '#f1f5f9', color: '#475569', boxShadow: 'none', borderRadius: '8px', textTransform: 'none', px: 3, py: 0.5, fontWeight: 500, '&:hover': { bgcolor: '#e2e8f0', boxShadow: 'none' } }}>
                    {showAllSchedules ? "Qisqartirish" : "Barchasini ko'rish"}
                  </Button>
                </Box>
              )}

            </Box>
          </Paper>
        </Box>
      )}

      {/* Guruh darsliklari */}
      {activeTab === 1 && (
        <GroupLessons />
      )}
    </Box>
  );
}

export default SingleGroups;

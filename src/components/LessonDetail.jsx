import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Avatar, Tabs, Tab, Switch, Button,
  Radio, RadioGroup, FormControlLabel, TextField, IconButton, Paper, Select, MenuItem, Snackbar, Alert, CircularProgress
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import axiosClient from '../api/axios';
import Loader from './Loader';
import ErrorModal from './ErrorModal';

const monthsList = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const monthNums = { 'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06', 'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12' };

const toIso = (dayObj) => {
  const mKey = (dayObj.month || '').substring(0, 3).toLowerCase();
  const mNum = monthNums[mKey] || '01';
  const year = new Date().getFullYear();
  return `${year}-${mNum}-${String(dayObj.day).padStart(2, '0')}`;
};

const formatDisplay = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y} M${m} ${day}`;
};

function LessonDetail() {
  const { id, date } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [mavzuType, setMavzuType] = useState('boshqa');
  const [mavzu, setMavzu] = useState('');
  const [topics, setTopics] = useState([]);
  const [tavsif, setTavsif] = useState('');
  const [attendance, setAttendance] = useState({});
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });
  const [successSnackbar, setSuccessSnackbar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // const today = new Date();
  // today.setHours(0, 0, 0, 0);

  const parseIsoToDate = (isoString) => {
    if (!isoString) return new Date();
    const parts = isoString.split('-');
    if (parts.length !== 3) return new Date();
    const dt = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    dt.setHours(0, 0, 0, 0);
    return dt;
  };

  const currentDateObj = parseIsoToDate(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isCurrentDateFuture = currentDateObj > today;
  const isCurrentDatePast = currentDateObj < today;
  const isReadOnly = isCurrentDateFuture || isCurrentDatePast;

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [lessonRes, schedRes, topicsRes, groupRes] = await Promise.all([
          axiosClient.get(`/groups/${id}/lesson?date=${date}`),
          axiosClient.get(`/groups/${id}/schedules`),
          axiosClient.get(`/lessons/my/group/${id}`).catch(() => ({ data: { data: [] } })),
          axiosClient.get(`/groups/${id}`).catch(() => ({ data: { data: {} } })),
        ]);

        const gData = groupRes.data?.data || groupRes.data || {};
        setGroupData(gData);

        const lessonData = lessonRes.data?.data || lessonRes.data;
        setLesson(lessonData);

        const topicsData = topicsRes.data?.data || topicsRes.data || [];
        setTopics(Array.isArray(topicsData) ? topicsData : []);

        if (lessonData?.attendance) {
          const att = {};
          lessonData.attendance.forEach((s, idx) => {
            att[idx] = s.isPresent || false;
          });
          setAttendance(att);
        } else {
          setAttendance({});
        }

        const actualLesson = lessonData?.lesson || {};
        setMavzu(actualLesson.topic || '');
        setTavsif(actualLesson.description || '');
        
        if (actualLesson.topic) {
          const isReja = (Array.isArray(topicsData) ? topicsData : []).some(t => {
            const tName = t.title || t.topic || t.name;
            return tName === actualLesson.topic;
          });
          setMavzuType(isReja ? 'reja' : 'boshqa');
        } else {
          setMavzuType('boshqa');
        }

        // Parse schedules → find active month days
        let data = schedRes.data?.data || schedRes.data || [];
        let parsed = [];
        if (Array.isArray(data)) {
          data.forEach(item => Object.entries(item).forEach(([k, v]) => parsed.push({ monthKey: k, monthData: v })));
        } else if (data && typeof data === 'object') {
          Object.entries(data).forEach(([k, v]) => parsed.push({ monthKey: k, monthData: v }));
        }
        const active = parsed.find(s => s.monthData?.isActive) || parsed[0];
        setDays(active?.monthData?.days || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [id, date]);

  const handleSave = async () => {
    if (isCurrentDateFuture) return;

    if (!mavzu) {
      setErrorModal({ open: true, message: "Iltimos, mavzuni kiriting yoki tanlang!" });
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        group_id: Number(id),
        topic: mavzu,
        lesson_date: date,
        description: tavsif,
        attendances: students.reduce((acc, student, sIdx) => {
          if (attendance[sIdx]) {
            const sid = student.student_id || student.student?.id || student.id;
            acc.push({
              student_id: Number(sid),
              isPresent: true
            });
          }
          return acc;
        }, [])
      };

      await axiosClient.post(`/groups/${id}/lesson`, payload);

      setSuccessSnackbar(true);
    } catch (err) {
      console.error(err);
      setErrorModal({ open: true, message: err.response?.data?.message || "Xatolik yuz berdi!" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  const teachers = lesson?.lesson?.teachers || lesson?.teachers || groupData?.teachers || [];
  const currentTeacher = teachers[activeTab] || teachers[0] || {};
  const students = lesson?.attendance || [];

  const activeMonthKey = days.length > 0 ? (lesson?.month_key || 1) : 1; // Assuming month_key or fallback

  return (
    <Box sx={{ fontFamily: 'Roboto, sans-serif', pb: 4 }}>
      {/* Back Button */}
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
          Guruhga qaytish
        </Typography>
      </Box>

      {/* Top Header (Days) */}
      <Paper sx={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: 'none', mb: 3, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton size="small" sx={{ border: '1px solid #e5e7eb', borderRadius: '8px', p: 1 }}>
            <ArrowBackIosNewIcon sx={{ fontSize: '14px', color: '#6b7280' }} />
          </IconButton>
          <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>
            {activeMonthKey}-o'quv oyi
          </Typography>
          <IconButton size="small" sx={{ border: '1px solid #e5e7eb', borderRadius: '8px', p: 1 }}>
            <ArrowBackIosNewIcon sx={{ fontSize: '14px', color: '#6b7280', transform: 'rotate(180deg)' }} />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
          {days.map((dayObj, idx) => {
            const iso = toIso(dayObj);
            const isSelected = iso === date;

            const targetDateObj = parseIsoToDate(iso);

            const isFuture = targetDateObj > today;
            const isPast = targetDateObj < today;

            return (
              <Box
                key={idx}
                onClick={(e) => {
                  if (isFuture) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  navigate(`/dashboard/groups/${id}/lesson/${iso}`);
                }}
                sx={{
                  minWidth: '46px', height: '54px',
                  bgcolor: isSelected ? '#10b981' : (isPast ? '#f1f5f9' : '#fff'),
                  border: isSelected || isPast ? 'none' : '1px solid #e5e7eb',
                  borderRadius: '8px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  cursor: isFuture ? 'not-allowed' : 'pointer',
                  opacity: isFuture ? 0.5 : 1,
                  '&:hover': { opacity: isFuture ? 0.5 : 0.8 },
                }}
              >
                <Typography sx={{ fontSize: '11px', fontWeight: 500, color: isSelected ? '#fff' : (isPast ? '#94a3b8' : '#94a3b8') }}>
                  {dayObj.month.slice(0, 3)}
                </Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: isSelected ? '#fff' : (isPast ? '#64748b' : '#64748b') }}>
                  {dayObj.day}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* Teacher Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        sx={{
          mb: 3,
          borderBottom: '1px solid #e5e7eb',
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, color: '#6b7280', fontSize: '14px', minWidth: 'auto', px: 3 },
          '& .Mui-selected': { color: '#10b981 !important' },
          '& .MuiTabs-indicator': { bgcolor: '#10b981', height: '3px', borderRadius: '3px 3px 0 0' }
        }}
      >
        <Tab label="Assistant" />
        <Tab label="Teacher" />
      </Tabs>

      {/* Ma'lumot */}
      <Paper sx={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: 'none', mb: 3, p: 3, bgcolor: '#fafafa' }}>
        <Typography sx={{ fontWeight: 700, fontSize: '14px', color: '#111827', mb: 2.5 }}>Ma'lumot</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: '#cbd5e1', color: '#fff', fontSize: '20px', fontWeight: 500 }}>
            {(currentTeacher?.full_name || 'T').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Box sx={{ minWidth: '140px' }}>
              <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#111827', mb: 0.5 }}>{currentTeacher?.full_name || '—'}</Typography>
              <Typography sx={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>{currentTeacher?.role || (activeTab === 0 ? 'Assistant' : 'Teacher')}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '11px', color: '#94a3b8', mb: 0.5, fontWeight: 600 }}>Dars kuni</Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{formatDisplay(date)}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '11px', color: '#94a3b8', mb: 0.5, fontWeight: 600 }}>Holat</Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: lesson?.lesson ? '#7C3AED' : '#64748b' }}>
                {lesson?.lesson ? "Dars o'tildi" : "Dars o'tilmagan"}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Yo'qlama va mavzu */}
      <Paper sx={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: 'none', mb: 3 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f3f4f6' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>Yo'qlama va mavzu kiritish</Typography>
        </Box>
        <Box sx={{ p: 3, pointerEvents: isReadOnly ? 'none' : 'auto', opacity: isReadOnly ? 0.6 : 1 }}>
          <RadioGroup row value={mavzuType} onChange={(e) => { setMavzuType(e.target.value); setMavzu(''); }} sx={{ mb: 3 }}>
            <FormControlLabel
              value="reja"
              control={<Radio sx={{ '&.Mui-checked': { color: '#10b981' } }} />}
              label={<Typography sx={{ fontSize: '14px', color: mavzuType === 'reja' ? '#10b981' : '#6b7280', fontWeight: mavzuType === 'reja' ? 600 : 400 }}>O'quv reja bo'yicha</Typography>}
            />
            <FormControlLabel
              value="boshqa"
              control={<Radio sx={{ '&.Mui-checked': { color: '#10b981' } }} />}
              label={<Typography sx={{ fontSize: '14px', color: mavzuType === 'boshqa' ? '#10b981' : '#6b7280', fontWeight: mavzuType === 'boshqa' ? 600 : 400 }}>Boshqa</Typography>}
            />
          </RadioGroup>

          <Typography sx={{ fontSize: '10px', color: '#ef4444', mb: 0.5, fontWeight: 500 }}>* Mavzu</Typography>
          {mavzuType === 'reja' ? (
            <Select
              fullWidth
              displayEmpty
              value={mavzu}
              onChange={(e) => setMavzu(e.target.value)}
              sx={{
                mb: 3,
                borderRadius: '8px',
                bgcolor: '#f8fafc',
                fontSize: '14px',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#e5e7eb' },
              }}
            >
              <MenuItem value="" disabled sx={{ color: '#94a3b8', fontSize: '14px' }}>Mavzuni tanlang...</MenuItem>
              {topics.map((t, index) => {
                const topicName = t.title || t.topic || t.name || 'Nomsiz mavzu';
                return (
                  <MenuItem key={t.id || index} value={topicName} sx={{ fontSize: '14px' }}>
                    {topicName}
                  </MenuItem>
                );
              })}
            </Select>
          ) : (
            <TextField fullWidth placeholder="Mavzuni kiriting..." value={mavzu} onChange={(e) => setMavzu(e.target.value)}
              sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '14px', bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e5e7eb' } } }} />
          )}

          <Typography sx={{ fontSize: '13px', color: '#111827', mb: 0.5, fontWeight: 500 }}>Tavsif (ixtiyoriy)</Typography>
          <TextField fullWidth multiline rows={3} placeholder="Dars haqida qo'shimcha ma'lumot..." value={tavsif} onChange={(e) => setTavsif(e.target.value)}
            sx={{ mb: 4, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '14px', bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e5e7eb' } } }} />

          {/* Student attendance table */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px', pb: 1.5, borderBottom: '1px solid #f3f4f6', px: 2 }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>#</Typography>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>O'quvchi ismi</Typography>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', textAlign: 'right' }}>Keldi</Typography>
            </Box>
            {students.length > 0 ? students.map((student, sIdx) => (
              <Box key={student.student_id || student.id || sIdx} sx={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px', alignItems: 'center', borderBottom: '1px solid #f8fafc', py: 1.5, px: 2 }}>
                <Typography sx={{ fontSize: '14px', color: '#111827', fontWeight: 500 }}>{sIdx + 1}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar src={student.photo || student.avatar || student.image ? `https://najot-edu.softwareengineer.uz/files/${student.photo || student.avatar || student.image}` : ''} sx={{ width: 32, height: 32, bgcolor: '#cbd5e1', color: '#fff', fontSize: '13px' }}>
                    {!(student.photo || student.avatar || student.image) && (student.full_name || 'S').charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography sx={{ fontSize: '14px', color: '#111827' }}>{student.full_name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Switch
                    checked={!!attendance[sIdx]}
                    onChange={(e) => {
                      setAttendance(prev => ({ ...prev, [sIdx]: e.target.checked }));
                    }}
                    sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#10b981' } }}
                  />
                </Box>
              </Box>
            )) : (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography sx={{ fontSize: '14px', color: '#6b7280' }}>O'quvchilar yo'q</Typography>
              </Box>
            )}
          </Box>

          {/* Fixed Save button */}
          {!isReadOnly && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleSave} variant="contained" disabled={isSaving}
                sx={{ bgcolor: '#7C3AED', color: '#fff', borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 4, py: 1, boxShadow: 'none', '&:hover': { bgcolor: '#6d28d9', boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: '#c4b5fd', color: '#fff' } }}>
                {isSaving ? <CircularProgress size={20} color="inherit" /> : 'Saqlash'}
              </Button>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Success Snackbar */}
      <Snackbar
        open={successSnackbar}
        autoHideDuration={3000}
        onClose={() => setSuccessSnackbar(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="success" onClose={() => setSuccessSnackbar(false)} sx={{ width: '100%' }}>
          Muvaffaqiyatli saqlandi!
        </Alert>
      </Snackbar>

      {/* Error Modal */}
      <ErrorModal
        open={errorModal.open}
        onClose={() => setErrorModal({ open: false, message: '' })}
        message={errorModal.message}
      />
    </Box>
  );
}

export default LessonDetail;

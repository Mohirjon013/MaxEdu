import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Avatar, Tabs, Tab, Switch, Button,
  Radio, RadioGroup, FormControlLabel, TextField, IconButton, Paper
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import axiosClient from '../api/axios';
import Loader from './Loader';

const monthsList = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
const monthNums  = {'jan':'01','feb':'02','mar':'03','apr':'04','may':'05','jun':'06','jul':'07','aug':'08','sep':'09','oct':'10','nov':'11','dec':'12'};

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

  const [lesson, setLesson]       = useState(null);
  const [days, setDays]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [mavzuType, setMavzuType] = useState('boshqa');
  const [mavzu, setMavzu]         = useState('');
  const [tavsif, setTavsif]       = useState('');
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [lessonRes, schedRes] = await Promise.all([
          axiosClient.get(`/groups/${id}/lesson?date=${date}`),
          axiosClient.get(`/groups/${id}/schedules`),
        ]);

        const lessonData = lessonRes.data?.data || lessonRes.data;
        setLesson(lessonData);

        if (lessonData?.attendance) {
          const att = {};
          lessonData.attendance.forEach(s => { att[s.student_id] = s.isPresent || false; });
          setAttendance(att);
        }
        
        const actualLesson = lessonData?.lesson || {};
        if (actualLesson?.topic)       setMavzu(actualLesson.topic);
        if (actualLesson?.description) setTavsif(actualLesson.description);

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
    try {
      await axiosClient.post(`/groups/${id}/lesson`, {
        date,
        topic: mavzu,
        description: tavsif,
        topicType: mavzuType,
        attendance: Object.entries(attendance).map(([studentId, attended]) => ({ studentId, attended })),
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader fullScreen />;

  const teachers = lesson?.lesson?.teachers || lesson?.teachers || [];
  const currentTeacher = teachers[activeTab] || teachers[0] || {};
  const students = lesson?.attendance || [];
  const today = new Date();

  const activeMonthKey = days.length > 0 ? (lesson?.month_key || 1) : 1; // Assuming month_key or fallback

  return (
    <Box sx={{ fontFamily: 'Roboto, sans-serif', pb: 4 }}>
      {/* Top Header (Days) */}
      <Paper sx={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: 'none', mb: 3, p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton size="small" onClick={() => navigate(`/dashboard/groups/${id}`)} sx={{ border: '1px solid #e5e7eb', borderRadius: '8px', p: 1 }}>
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
            const mIdx = monthsList.indexOf((dayObj.month || '').substring(0, 3).toLowerCase());
            const isPast = mIdx !== -1 && (mIdx < today.getMonth() || (mIdx === today.getMonth() && dayObj.day < today.getDate()));
            return (
              <Box
                key={idx}
                onClick={() => navigate(`/dashboard/groups/${id}/lesson/${iso}`)}
                sx={{
                  minWidth: '46px', height: '54px',
                  bgcolor: isSelected ? '#10b981' : (isPast ? '#f1f5f9' : '#fff'),
                  border: isSelected || isPast ? 'none' : '1px solid #e5e7eb',
                  borderRadius: '8px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  '&:hover': { opacity: 0.8 },
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
        {teachers.length > 0
          ? teachers.map((t, i) => <Tab key={i} label={t.role || `Teacher ${i + 1}`} />)
          : [<Tab key={0} label="Assistant" />, <Tab key={1} label="Teacher" />]
        }
      </Tabs>

      {/* Ma'lumot */}
      <Paper sx={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: 'none', mb: 3 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f3f4f6' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>Ma'lumot</Typography>
        </Box>
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: '#cbd5e1', color: '#fff', fontSize: '20px', fontWeight: 500 }}>
            {(currentTeacher?.full_name || 'T').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ minWidth: '150px' }}>
            <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#111827', mb: 0.5 }}>{currentTeacher?.full_name || '—'}</Typography>
            <Typography sx={{ fontSize: '13px', color: '#6b7280' }}>{currentTeacher?.role || 'Teacher'}</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 6 }}>
            <Box>
              <Typography sx={{ fontSize: '11px', color: '#94a3b8', mb: 0.5 }}>Dars kuni</Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{formatDisplay(date)}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '11px', color: '#94a3b8', mb: 0.5 }}>Holat</Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8' }}>{lesson?.status || "Dars o'tilmagan"}</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Yo'qlama va mavzu */}
      <Paper sx={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: 'none', mb: 3 }}>
        <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f3f4f6' }}>
          <Typography sx={{ fontWeight: 700, fontSize: '15px', color: '#111827' }}>Yo'qlama va mavzu kiritish</Typography>
        </Box>
        <Box sx={{ p: 3 }}>
          <RadioGroup row value={mavzuType} onChange={(e) => setMavzuType(e.target.value)} sx={{ mb: 3 }}>
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

          <Typography sx={{ fontSize: '13px', color: '#ef4444', mb: 0.5, fontWeight: 500 }}>* Mavzu</Typography>
          <TextField fullWidth placeholder="Mavzuni kiriting..." value={mavzu} onChange={(e) => setMavzu(e.target.value)}
            sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: '8px', fontSize: '14px', bgcolor: '#f8fafc', '& fieldset': { borderColor: '#e5e7eb' } } }} />

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
              <Box key={student.student_id || sIdx} sx={{ display: 'grid', gridTemplateColumns: '60px 1fr 100px', alignItems: 'center', borderBottom: '1px solid #f8fafc', py: 1.5, px: 2 }}>
                <Typography sx={{ fontSize: '14px', color: '#111827', fontWeight: 500 }}>{sIdx + 1}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar src={student.photo ? `https://najot-edu.softwareengineer.uz/uploads/${student.photo}` : ''} sx={{ width: 32, height: 32, bgcolor: '#cbd5e1', color: '#fff', fontSize: '13px' }}>
                    {!student.photo && (student.full_name || 'S').charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography sx={{ fontSize: '14px', color: '#111827' }}>{student.full_name}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Switch
                    checked={!!attendance[student.student_id]}
                    onChange={(e) => setAttendance(prev => ({ ...prev, [student.student_id]: e.target.checked }))}
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
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleSave} variant="contained"
              sx={{ bgcolor: '#7C3AED', color: '#fff', borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 4, py: 1, boxShadow: 'none', '&:hover': { bgcolor: '#6d28d9', boxShadow: 'none' } }}>
              Saqlash
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default LessonDetail;

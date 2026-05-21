import React, { useState } from 'react';
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
  Chip,
  IconButton,
  Avatar,
  AvatarGroup,
  Switch,
  Drawer,
  Dialog,
  TextField,
  ThemeProvider,
  createTheme,
  MenuItem,
  Checkbox,
  Select,
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArchiveIcon from '@mui/icons-material/Archive';
import CloseIcon from '@mui/icons-material/Close';

const theme = createTheme({
  palette: {
    primary: { main: '#7C3AED' },
  },
  components: {
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#7C3AED',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#7C3AED',
            borderWidth: '1px',
          },
        },
        notchedOutline: {
          borderColor: '#d1d5db',
          transition: 'border-color 0.3s ease-in-out, border-width 0.3s ease-in-out',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', borderRadius: '8px' },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          '&.Mui-checked': { color: '#7C3AED' },
          '&.Mui-checked + .MuiSwitch-track': { backgroundColor: '#7C3AED' },
        },
      },
    },
  },
});

const inputSx = {
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': { borderColor: '#7C3AED' },
    '&.Mui-focused fieldset': { borderColor: '#7C3AED', borderWidth: '2px' },
  },
};

const groups = [
  {
    id: 1,
    name: 'N26',
    kurs: 'Backend',
    davomiyligi: '6 oy',
    darsVaqti: '09:30',
    kunlar: 'Du, Se, Chor, Pay, Ju',
    xona: 'Autodesk',
    oqituvchi: 'Mohirbek',
    talabalar: 1,
    faol: true,
    studentAvatars: ['https://i.pravatar.cc/150?img=1'],
  },
  {
    id: 2,
    name: 'n105',
    kurs: 'Backend',
    davomiyligi: '6 oy',
    darsVaqti: '16:00',
    kunlar: 'Se, Pay, Shan',
    xona: 'Autodesk',
    oqituvchi: 'Mohirbek',
    talabalar: 4,
    faol: true,
    studentAvatars: [
      'https://i.pravatar.cc/150?img=2',
      'https://i.pravatar.cc/150?img=3',
      'https://i.pravatar.cc/150?img=4',
    ],
  },
];

function Groups() {
  const [activeTab, setActiveTab] = useState('guruhlar');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedKurs, setSelectedKurs] = useState('');
  const [selectedDavomiylik, setSelectedDavomiylik] = useState('');
  const [selectedXona, setSelectedXona] = useState('');

  // Form states
  const [groupName, setGroupName] = useState('');
  const [groupTime, setGroupTime] = useState('09:00');
  const [groupStartDate, setGroupStartDate] = useState('');
  const [groupDesc, setGroupDesc] = useState('');

  // Teacher modal
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState('');

  // Student modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');

  const availableTeachers = ['Mohirbek'];
  const availableStudents = ['Ali Valiyev', 'Salim Qodirov', 'Bobur', 'Qodir Salimov'];

  const filteredTeachers = availableTeachers.filter(t =>
    t.toLowerCase().includes(teacherSearch.toLowerCase())
  );
  const filteredStudents = availableStudents.filter(s =>
    s.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const toggleTeacher = (t) => setSelectedTeachers(prev =>
    prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
  );
  const toggleStudent = (s) => setSelectedStudents(prev =>
    prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
  );

  const [groupStatuses, setGroupStatuses] = useState(
    groups.reduce((acc, g) => ({ ...acc, [g.id]: g.faol }), {})
  );

  const days = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'];

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleStatus = (id) => {
    setGroupStatuses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ mt: 3, fontFamily: 'Roboto, sans-serif' }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', fontSize: '30px' }}>
            Guruhlar
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsDrawerOpen(true)}
            sx={{
              px: 2, py: 0.8, fontWeight: 600, fontSize: '14px', borderRadius: '8px',
              boxShadow: 'none', transition: 'all 0.3s ease', textTransform: 'none',
              '&:hover': { bgcolor: '#5B21B6', boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.39)' }
            }}
          >
            <span style={{ fontSize: '18px', marginRight: '6px', lineHeight: 1 }}>+</span>
            Guruh qo'shish
          </Button>
        </Box>

        {/* Tabs */}
        <Box sx={{ display: 'flex', gap: 1.5, mb: 3, alignItems: 'center' }}>
          <Button
            disableElevation
            onClick={() => setActiveTab('guruhlar')}
            sx={{
              fontWeight: 600, px: 2.5, py: 0.8, fontSize: '14.5px',
              borderRadius: '8px', textTransform: 'none',
              bgcolor: activeTab === 'guruhlar' ? '#fff' : 'transparent',
              color: activeTab === 'guruhlar' ? '#111827' : '#6b7280',
              boxShadow: activeTab === 'guruhlar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              border: 'none',
              '&:hover': {
                bgcolor: activeTab === 'guruhlar' ? '#fff' : '#f3f4f6',
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
              bgcolor: activeTab === 'arxiv' ? '#fff' : 'transparent',
              color: activeTab === 'arxiv' ? '#111827' : '#6b7280',
              boxShadow: activeTab === 'arxiv' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              border: 'none',
              '&:hover': {
                bgcolor: activeTab === 'arxiv' ? '#fff' : '#f3f4f6',
              }
            }}
          >
            Arxiv
          </Button>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2.5, mb: 3 }}>
          {/* Jami guruhlar */}
          <Paper sx={{ p: 2, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GroupsIcon sx={{ fontSize: 20, color: '#4b5563' }} />
              </Box>
              <IconButton size="small" sx={{ color: '#9ca3af', p: 0.5 }}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', color: '#6b7280', mb: 0.5, fontWeight: 500 }}>Jami guruhlar</Typography>
              <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#111827', lineHeight: 1 }}>{groups.length}</Typography>
            </Box>
          </Paper>

          {/* O'qituvchilar */}
          <Paper sx={{ p: 2, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <GroupsIcon sx={{ fontSize: 20, color: '#4b5563' }} />
              </Box>
              <IconButton size="small" sx={{ color: '#9ca3af', p: 0.5 }}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', color: '#6b7280', mb: 0.5, fontWeight: 500 }}>O'qituvchilar</Typography>
              <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#111827', lineHeight: 1 }}>0</Typography>
            </Box>
          </Paper>

          {/* O'quvchilar */}
          <Paper sx={{ p: 2, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ width: 36, height: 36, borderRadius: '8px', bgcolor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SchoolIcon sx={{ fontSize: 20, color: '#4b5563' }} />
              </Box>
              <IconButton size="small" sx={{ color: '#9ca3af', p: 0.5 }}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ fontSize: '13px', color: '#6b7280', mb: 0.5, fontWeight: 500 }}>O'quvchilar</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#111827', lineHeight: 1 }}>0</Typography>
                <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '10px', border: '2px solid #fff', fontWeight: 600 } }}>
                  <Avatar sx={{ bgcolor: '#1e1b4b', color: '#fff' }}>I</Avatar>
                  <Avatar sx={{ bgcolor: '#ea580c', color: '#fff' }}>M</Avatar>
                  <Avatar sx={{ bgcolor: '#ec4899', color: '#fff' }}>S</Avatar>
                </AvatarGroup>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Table */}
        <Paper sx={{ borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <TableContainer>
            <Table sx={{ minWidth: 900 }}>
              <TableHead sx={{ bgcolor: '#fafafa' }}>
                <TableRow>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#555', fontSize: '13px' }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#555', fontSize: '13px' }}>Guruh nomi</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#555', fontSize: '13px' }}>Kurs</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#555', fontSize: '13px' }}>Davomiyligi</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#555', fontSize: '13px' }}>Dars vaqti</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#555', fontSize: '13px' }}>Xona</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#555', fontSize: '13px' }}>O'qituvchi</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#555', fontSize: '13px' }}>Talabalar</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" sx={{ color: '#888' }}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groups.map((group) => (
                  <TableRow key={group.id} hover sx={{ '& td': { borderBottom: '1px solid #eee' } }}>
                    {/* Status */}
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                        <Switch
                          checked={groupStatuses[group.id]}
                          onChange={() => toggleStatus(group.id)}
                          size="small"
                          color="primary"
                        />
                        <Chip
                          label={groupStatuses[group.id] ? 'FAOL' : 'NOFAOL'}
                          size="small"
                          sx={{
                            width: '60px',
                            fontSize: '11px', fontWeight: 700, height: '22px',
                            bgcolor: groupStatuses[group.id] ? '#dcfce7' : '#fee2e2',
                            color: groupStatuses[group.id] ? '#16a34a' : '#dc2626',
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
                        label={group.kurs}
                        size="small"
                        sx={{
                          bgcolor: '#fce7f3', color: '#db2777',
                          fontWeight: 600, fontSize: '12px', borderRadius: '6px'
                        }}
                      />
                    </TableCell>

                    {/* Davomiyligi */}
                    <TableCell align="center" sx={{ color: '#555', fontSize: '14px' }}>{group.davomiyligi}</TableCell>

                    {/* Dars vaqti */}
                    <TableCell align="center">
                      <Typography sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>
                        {group.darsVaqti}
                      </Typography>
                      <Typography sx={{ fontSize: '12px', color: '#888' }}>
                        {group.kunlar}
                      </Typography>
                    </TableCell>

                    {/* Xona */}
                    <TableCell align="center" sx={{ color: '#555', fontSize: '14px' }}>{group.xona}</TableCell>

                    {/* O'qituvchi */}
                    <TableCell align="center">
                      <Typography sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>
                        {group.oqituvchi}
                      </Typography>
                    </TableCell>

                    {/* Talabalar */}
                    <TableCell align="center" sx={{ color: '#555', fontSize: '14px', fontWeight: 500 }}>
                      {group.talabalar}
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <IconButton size="small" sx={{ color: '#888', '&:hover': { color: '#7C3AED' } }}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Add Group Drawer */}
        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          sx={{ zIndex: 9999, '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 }, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' } }}
        >
          {/* Drawer Header */}
          <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid #e5e7eb', position: 'relative' }}>
            <IconButton
              onClick={() => setIsDrawerOpen(false)}
              sx={{ position: 'absolute', right: 16, top: 16, color: '#9ca3af', '&:hover': { color: '#111827' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#111827', mb: 0.5 }}>
              Guruh qo'shish
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#6b7280' }}>
              Yangi guruh yaratish uchun quyidagi ma'lumotlarni kiriting.
            </Typography>
          </Box>

          {/* Drawer Body */}
          <Box sx={{ p: 3, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>

            {/* Guruh nomi */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>
                Guruh nomi
              </Typography>
              <TextField
                fullWidth
                placeholder="Frontend 2024"
                size="small"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}

              />
            </Box>

            {/* Kurs */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>
                Kurs
              </Typography>
              <Select
                displayEmpty
                fullWidth
                value={selectedKurs}
                onChange={(e) => setSelectedKurs(e.target.value)}
                size="small"
                MenuProps={{ style: { zIndex: 99999 } }}
              >
                <MenuItem value="" disabled><em style={{ color: '#9ca3af', fontStyle: 'normal' }}>Kursni tanlang</em></MenuItem>
                <MenuItem value="Frontend">Frontend</MenuItem>
                <MenuItem value="Backend">Backend</MenuItem>
                <MenuItem value="FullStack">Full Stack</MenuItem>
                <MenuItem value="Python">Python</MenuItem>
                <MenuItem value="Mobile">Mobile (Flutter)</MenuItem>
                <MenuItem value="UI/UX">UI/UX Design</MenuItem>
              </Select>
            </Box>

            {/* Davomiyligi */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>
                Davomiyligi
              </Typography>
              <Select
                displayEmpty
                fullWidth
                value={selectedDavomiylik}
                onChange={(e) => setSelectedDavomiylik(e.target.value)}
                size="small"
                MenuProps={{ style: { zIndex: 99999 } }}
              >
                <MenuItem value="" disabled><em style={{ color: '#9ca3af', fontStyle: 'normal' }}>Davomiylikni tanlang</em></MenuItem>
                <MenuItem value="1 oy">1 oy</MenuItem>
                <MenuItem value="2 oy">2 oy</MenuItem>
                <MenuItem value="3 oy">3 oy</MenuItem>
                <MenuItem value="4 oy">4 oy</MenuItem>
                <MenuItem value="6 oy">6 oy</MenuItem>
                <MenuItem value="8 oy">8 oy</MenuItem>
                <MenuItem value="12 oy">12 oy</MenuItem>
              </Select>
            </Box>

            {/* Xona */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>
                Xona
              </Typography>
              <Select
                displayEmpty
                fullWidth
                value={selectedXona}
                onChange={(e) => setSelectedXona(e.target.value)}
                size="small"
                MenuProps={{ style: { zIndex: 99999 } }}
              >
                <MenuItem value="" disabled><em style={{ color: '#9ca3af', fontStyle: 'normal' }}>Xonani tanlang</em></MenuItem>
                <MenuItem value="Autodesk">Autodesk</MenuItem>
                <MenuItem value="NodeJs">NodeJs xonasi</MenuItem>
                <MenuItem value="React">React xonasi</MenuItem>
                <MenuItem value="Python">Python xonasi</MenuItem>
              </Select>
            </Box>

            {/* Dars kunlari */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>
                Dars kunlari
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {days.map((day) => {
                  const isChecked = selectedDays.includes(day);
                  return (
                    <Box
                      key={day}
                      onClick={() => toggleDay(day)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: `1px solid ${isChecked ? '#7C3AED' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        px: 1,
                        py: 0.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        bgcolor: isChecked ? '#f5f3ff' : '#fff',
                        '&:hover': {
                          borderColor: '#7C3AED',
                          bgcolor: '#f5f3ff',
                          '& .day-text': { color: '#7C3AED' }
                        }
                      }}
                    >
                      <Checkbox
                        checked={isChecked}
                        size="small"
                        sx={{
                          p: 0.5, mr: 0.5, color: '#d1d5db',
                          '&.Mui-checked': { color: '#7C3AED' }
                        }}
                      />
                      <Typography className="day-text" sx={{ fontSize: '13px', fontWeight: 600, color: isChecked ? '#7C3AED' : '#111827', userSelect: 'none', transition: 'color 0.2s' }}>
                        {day}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            </Box>

            {/* Dars vaqti */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>
                Dars vaqti
              </Typography>
              <TextField sx={{ cursor: 'pointer' }}
                type="time"
                value={groupTime}
                onChange={(e) => setGroupTime(e.target.value)}
                fullWidth
                size="small"
                inputProps={{ style: { cursor: 'pointer' } }}
                onClick={(e) => e.currentTarget.querySelector('input')?.showPicker?.()}
              />
            </Box>

            {/* Boshlanish sanasi */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>
                Boshlanish sanasi
              </Typography>
              <TextField
                type="date"
                fullWidth
                size="small"
                value={groupStartDate}
                onChange={(e) => setGroupStartDate(e.target.value)}
                inputProps={{ style: { cursor: 'pointer' } }}
                onClick={(e) => e.currentTarget.querySelector('input')?.showPicker?.()}
              />
            </Box>

            {/* Tavsif */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>
                Tavsif
              </Typography>
              <TextField
                multiline
                rows={3}
                fullWidth
                placeholder="Guruh haqida qo'shimcha ma'lumot (ixtiyoriy)"
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f9fafb' } }}
              />
            </Box>

            {/* O'qituvchilar */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>
                O'qituvchilar
              </Typography>
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', minHeight: '42px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {selectedTeachers.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, px: 1.5, pt: 1.5 }}>
                    {selectedTeachers.map(t => (
                      <Chip key={t} label={t} color="primary" onDelete={() => toggleTeacher(t)} size="small"
                        sx={{ bgcolor: '#ede7f6', color: '#7C3AED', fontWeight: 500, borderRadius: '16px', '& .MuiChip-deleteIcon': { color: '#7C3AED', '&:hover': { color: '#5B21B6' } } }}
                      />
                    ))}
                  </Box>
                )}
                <Button
                  variant={selectedTeachers.length > 0 ? 'text' : 'outlined'}
                  color="primary"
                  onClick={() => setIsTeacherModalOpen(true)}
                  sx={{ width: '100%', alignSelf: 'flex-start', justifyContent: 'flex-start', borderColor: 'transparent', p: 1.5, minWidth: 0, fontWeight: 500, '&:hover': { borderColor: '#7C3AED', bgcolor: '#fbf8ff' } }}
                >
                  <span style={{ fontSize: '20px', marginRight: '8px', lineHeight: 1 }}>+</span> Qo'shish
                </Button>
              </Box>
            </Box>

            {/* Talabalar */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>
                Talabalar
              </Typography>
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', minHeight: '42px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {selectedStudents.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, px: 1.5, pt: 1.5 }}>
                    {selectedStudents.map(s => (
                      <Chip key={s} label={s} color="primary" onDelete={() => toggleStudent(s)} size="small"
                        sx={{ bgcolor: '#ede7f6', color: '#7C3AED', fontWeight: 500, borderRadius: '16px', '& .MuiChip-deleteIcon': { color: '#7C3AED', '&:hover': { color: '#5B21B6' } } }}
                      />
                    ))}
                  </Box>
                )}
                <Button
                  variant={selectedStudents.length > 0 ? 'text' : 'outlined'}
                  color="primary"
                  onClick={() => setIsStudentModalOpen(true)}
                  sx={{ width: '100%', alignSelf: 'flex-start', justifyContent: 'flex-start', borderColor: 'transparent', p: 1.5, minWidth: 0, fontWeight: 500, '&:hover': { borderColor: '#7C3AED', bgcolor: '#fbf8ff' } }}
                >
                  <span style={{ fontSize: '20px', marginRight: '8px', lineHeight: 1 }}>+</span> Qo'shish
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Drawer Footer */}
          <Box sx={{ px: 3, py: 2, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 2, bgcolor: '#fff' }}>
            <Button
              onClick={() => setIsDrawerOpen(false)}
              sx={{
                color: '#1f2937',
                bgcolor: '#fff',
                border: '1px solid #e5e7eb',
                px: 3.5,
                py: 1,
                borderRadius: '8px',
                fontWeight: 600,
                '&:hover': { bgcolor: '#f9fafb', borderColor: '#d1d5db' }
              }}
            >
              Bekor qilish
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#8b5cf6',
                color: '#fff',
                px: 4,
                py: 1,
                borderRadius: '8px',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#7c3aed', boxShadow: 'none' }
              }}
            >
              Saqlash
            </Button>
          </Box>
        </Drawer>

        {/* O'qituvchi qo'shish modal */}
        <Dialog
          open={isTeacherModalOpen}
          onClose={() => setIsTeacherModalOpen(false)}
          sx={{ zIndex: 99999 }}
          PaperProps={{ sx: { borderRadius: '12px', overflow: 'hidden', m: 2 } }}
        >
          <Box sx={{ p: 2, width: '500px', overflowX: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
              <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '22px' }}>
                O'qituvchi qo'shish
              </Typography>
              <IconButton onClick={() => setIsTeacherModalOpen(false)} sx={{ color: '#9CA3AF', p: 0.5, mt: -0.5, mr: -0.5 }}>
                <CloseIcon sx={{ fontSize: 25 }} />
              </IconButton>
            </Box>
            <Typography sx={{ color: '#6B7280', fontSize: '14px', lineHeight: '20px', mb: 2 }}>
              Bitta yoki bir nechta o'qituvchini tanlang
            </Typography>
            <TextField
              fullWidth
              placeholder="O'qituvchi qidirish..."
              size="small"
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': { borderColor: '#E5E7EB' },
                  '&:hover fieldset': { borderColor: '#E5E7EB' },
                  '&.Mui-focused fieldset': { borderColor: '#7C3AED', borderWidth: '1px' },
                },
              }}
            />
            <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', mb: 3, maxHeight: '220px', overflowY: 'auto', overflowX: 'hidden' }}>
              {filteredTeachers.map((teacher, index) => (
                <Box
                  key={teacher}
                  onClick={() => toggleTeacher(teacher)}
                  sx={{
                    display: 'flex', alignItems: 'center',
                    px: 2, py: 1.5,
                    borderBottom: index !== filteredTeachers.length - 1 ? '1px solid #E5E7EB' : 'none',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F9FAFB' },
                  }}
                >
                  <Checkbox
                    checked={selectedTeachers.includes(teacher)}
                    disableRipple
                    sx={{ p: 0, mr: 1.5, pointerEvents: 'none', color: '#D1D5DB', '&.Mui-checked': { color: '#7C3AED' }, '& .MuiSvgIcon-root': { fontSize: 20 } }}
                  />
                  <Typography sx={{ fontWeight: 500, color: '#111827', fontSize: '14px', userSelect: 'none' }}>
                    {teacher}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setIsTeacherModalOpen(false)}
                sx={{ bgcolor: '#fff', color: '#374151', border: '1px solid #E5E7EB', px: 3, py: 1, borderRadius: '8px', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#F9FAFB' } }}
              >
                Bekor qilish
              </Button>
              <Button
                variant="contained"
                onClick={() => setIsTeacherModalOpen(false)}
                sx={{ bgcolor: '#7C3AED', color: '#fff', px: 3, py: 1, borderRadius: '8px', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#5B21B6', boxShadow: 'none' } }}
              >
                Saqlash
              </Button>
            </Box>
          </Box>
        </Dialog>

        {/* Talaba qo'shish modal */}
        <Dialog
          open={isStudentModalOpen}
          onClose={() => setIsStudentModalOpen(false)}
          sx={{ zIndex: 99999 }}
          PaperProps={{ sx: { borderRadius: '12px', overflow: 'hidden', m: 2 } }}
        >
          <Box sx={{ p: 2, width: '500px', overflowX: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
              <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '22px' }}>
                Talaba qo'shish
              </Typography>
              <IconButton onClick={() => setIsStudentModalOpen(false)} sx={{ color: '#9CA3AF', p: 0.5, mt: -0.5, mr: -0.5 }}>
                <CloseIcon sx={{ fontSize: 25 }} />
              </IconButton>
            </Box>
            <Typography sx={{ color: '#6B7280', fontSize: '14px', lineHeight: '20px', mb: 2 }}>
              Bitta yoki bir nechta talabani tanlang
            </Typography>
            <TextField
              fullWidth
              placeholder="Talaba qidirish..."
              size="small"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': { borderColor: '#E5E7EB' },
                  '&:hover fieldset': { borderColor: '#E5E7EB' },
                  '&.Mui-focused fieldset': { borderColor: '#7C3AED', borderWidth: '1px' },
                },
              }}
            />
            <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', mb: 3, maxHeight: '220px', overflowY: 'auto', overflowX: 'hidden' }}>
              {filteredStudents.map((student, index) => (
                <Box
                  key={student}
                  onClick={() => toggleStudent(student)}
                  sx={{
                    display: 'flex', alignItems: 'center',
                    px: 2, py: 1.5,
                    borderBottom: index !== filteredStudents.length - 1 ? '1px solid #E5E7EB' : 'none',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F9FAFB' },
                  }}
                >
                  <Checkbox
                    checked={selectedStudents.includes(student)}
                    disableRipple
                    sx={{ p: 0, mr: 1.5, pointerEvents: 'none', color: '#D1D5DB', '&.Mui-checked': { color: '#7C3AED' }, '& .MuiSvgIcon-root': { fontSize: 20 } }}
                  />
                  <Typography sx={{ fontWeight: 500, color: '#111827', fontSize: '14px', userSelect: 'none' }}>
                    {student}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setIsStudentModalOpen(false)}
                sx={{ bgcolor: '#fff', color: '#374151', border: '1px solid #E5E7EB', px: 3, py: 1, borderRadius: '8px', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#F9FAFB' } }}
              >
                Bekor qilish
              </Button>
              <Button
                variant="contained"
                onClick={() => setIsStudentModalOpen(false)}
                sx={{ bgcolor: '#7C3AED', color: '#fff', px: 3, py: 1, borderRadius: '8px', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#5B21B6', boxShadow: 'none' } }}
              >
                Saqlash
              </Button>
            </Box>
          </Box>
        </Dialog>

      </Box>
    </ThemeProvider>
  );
}

export default Groups;

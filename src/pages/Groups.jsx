import React, { useEffect, useState, useRef, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ListItemText,
  CircularProgress,
  Select,
  MenuItem,
  Checkbox,
  Menu,
  ListItemIcon
} from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import SchoolIcon from '@mui/icons-material/School';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArchiveIcon from '@mui/icons-material/Archive';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import axiosClient from '../api/axios';
import loading from "../assets/images/loading.gif";
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ErrorModal from '../components/ErrorModal';

// Removed local theme to use global ThemeContextProvider

const inputSx = {
  '& .MuiOutlinedInput-root': {
    '&:hover fieldset': { borderColor: '#7C3AED' },
    '&.Mui-focused fieldset': { borderColor: '#7C3AED', borderWidth: '2px' },
  },
};



function Groups() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([])
  const [courses, setCourses] = useState([])
  const [availableTeacherss, setAvailableTeacherss] = useState([])
  const [availableStudents, setAvailableStudents] = useState([])
  const [availableRooms, setAvailableRooms] = useState([])
  const [errorModal, setErrorModal] = useState({ open: false, message: '' })
  const [isLoading, setIsLoading] = useState(false);



  const [activeTab, setActiveTab] = useState('guruhlar');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editGroupId, setEditGroupId] = useState(null);

  // Menu State
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const handleOpenMenu = (event, id) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedGroupId(id);
  };

  const handleCloseMenu = (e) => {
    if (e) e.stopPropagation();
    setAnchorEl(null);
  };

  const handleEditClick = async (e) => {
    if (e) e.stopPropagation();

    if (!selectedGroupId) return;

    try {
      const res = await axiosClient.get(`/groups/one/${selectedGroupId}`);
      const data = res.data?.data || res.data;

      // API id bermaydi — nom bo'yicha topamiz (case-insensitive + partial match)
      const courseName = data.course?.name?.toLowerCase().trim();
      const roomName = data.room?.toLowerCase().trim();

      const matchedCourse = courses.find(c => c.name?.toLowerCase().trim() === courseName)
        || courses.find(c => c.name?.toLowerCase().trim().includes(courseName) || courseName?.includes(c.name?.toLowerCase().trim()));

      const matchedRoom = availableRooms.find(r => r.name?.toLowerCase().trim() === roomName)
        || availableRooms.find(r => r.name?.toLowerCase().trim().includes(roomName) || roomName?.includes(r.name?.toLowerCase().trim()));

      setCreateGroup({
        name: data.name || '',
        description: data.description || '',
        course_id: matchedCourse?.id || null,
        teachers: data.teachers?.map(t => t.id) || [],
        students: data.students?.map(s => s.id) || [],
        room_id: matchedRoom?.id || null,
        start_date: data.start_date?.split('T')[0] || '',
        week_day: data.week_day || [],
        start_time: (data.start_time || '').slice(0, 5).replace('.', ':'),
        max_student: data.max_student ?? groups.find(g => g.id === selectedGroupId)?.max_student ?? null
      });

      setSelectedDays(data.week_day || []);
      setSelectedTeachers(data.teachers?.map(t => t.id) || []);
      setSelectedStudents(data.students?.map(s => s.id) || []);

      setEditGroupId(selectedGroupId);
      setIsEditing(true);
      setIsDrawerOpen(true);
    } catch (error) {
      console.error("Guruh ma'lumotlarini yuklashda xatolik:", error);
      setErrorModal({ open: true, message: "Guruh ma'lumotlarini yuklashda xatolik yuz berdi" });
    } finally {
      handleCloseMenu(e);
    }
  };

  const handleDeleteClick = (e) => {
    if (e) e.stopPropagation();
    setDeleteModalOpen(true);
    handleCloseMenu(e);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedGroupId) return;
    try {
      await axiosClient.delete(`/groups/${selectedGroupId}`);
      setGroups(prev => prev.filter(g => g.id !== selectedGroupId));
    } catch (error) {
      console.error("Guruhni o'chirishda xatolik:", error);
      setErrorModal({ open: true, message: error.response?.data?.message || "Guruhni o'chirishda xatolik yuz berdi" });
    } finally {
      setDeleteModalOpen(false);
      setSelectedGroupId(null);
    }
  };



  // Teacher modal
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState('');

  const filteredTeachers = availableTeacherss.filter(t =>
    t.full_name.toLowerCase().includes(teacherSearch.toLowerCase())
  );
  const toggleTeacher = (id) => setSelectedTeachers(prev => {
    const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
    setCreateGroup(p => ({ ...p, teachers: updated }));
    return updated;
  });

  // Student modal
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');




  const filteredStudents = availableStudents.filter(s =>
    s.full_name.toLowerCase().includes(studentSearch.toLowerCase())
  );
  const toggleStudent = (id) => setSelectedStudents(prev => {
    const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
    setCreateGroup(p => ({ ...p, students: updated }));
    return updated;
  });





  const [groupStatuses, setGroupStatuses] = useState({});

  const [createGroup, setCreateGroup] = useState({
    name: '',
    description: '',
    course_id: null,
    teachers: [],        // [id, id, ...]
    students: [],        // bo'sh bo'lsa []
    room_id: null,
    start_date: '',      // "2026-01-01"
    week_day: [],        // ["MONDAY", "WEDNESDAY"]
    start_time: '',      // "09:00"
    max_student: null
  })


  const days = [
    { label: 'Dushanba', value: 'MONDAY' },
    { label: 'Seshanba', value: 'TUESDAY' },
    { label: 'Chorshanba', value: 'WEDNESDAY' },
    { label: 'Payshanba', value: 'THURSDAY' },
    { label: 'Juma', value: 'FRIDAY' },
    { label: 'Shanba', value: 'SATURDAY' },
    { label: 'Yakshanba', value: 'SUNDAY' },
  ]


  const toggleDay = (day) => {
    setSelectedDays(prev => {
      const updated = prev.includes(day.value)
        ? prev.filter(d => d !== day.value)
        : [...prev, day.value];

      setCreateGroup(p => ({ ...p, week_day: updated })); // ← createGroup ga ham yozadi
      return updated;
    });
  };

  const toggleStatus = async (id) => {
    const currentStatus = groupStatuses[id];
    setGroupStatuses(prev => ({ ...prev, [id]: !currentStatus }));
    try {
      await axiosClient.patch(`/groups/${id}`, { is_active: !currentStatus });
    } catch (err) {
      console.error("Statusni yangilashda xatolik:", err);
      setGroupStatuses(prev => ({ ...prev, [id]: currentStatus }));
      setErrorModal({ open: true, message: "Statusni yangilashda xatolik yuz berdi" });
    }
  };


  const drawerDataLoaded = useRef(false);

  // Sahifa yuklanishida faqat guruhlar va kurslarni olib keladi (tez)
  useEffect(() => {
    drawerDataLoaded.current = false; // tab o'zgarganda qayta yuklaydi
    async function handleGroups() {
      setIsLoading(true);
      try {
        const endpoint = activeTab === 'arxiv' ? '/groups/archive' : '/groups/all';
        const [groupsRes, coursesRes] = await Promise.all([
          axiosClient.get(endpoint),
          axiosClient.get('/courses?limit=33'),
        ])
        const fetchedGroups = groupsRes.data?.data ?? groupsRes.data ?? [];
        const safeGroups = Array.isArray(fetchedGroups) ? fetchedGroups : [];

        startTransition(() => {
          setGroups(safeGroups)
          setCourses(coursesRes.data.data)
          setGroupStatuses(safeGroups.reduce((acc, g) => ({ ...acc, [g.id]: g.is_active ?? true }), {}))
        });
      } catch (err) {
        console.error(err)
        setErrorModal({ open: true, message: 'Ma\'lumotlarni yuklashda xato yuz berdi: ' + (err.response?.data?.message || err.message) })
      } finally {
        setIsLoading(false);
      }
    }
    handleGroups()
  }, [activeTab])

  // Drawer ochilganda teachers/students/rooms ni lazy load qiladi
  useEffect(() => {
    if (!isDrawerOpen || drawerDataLoaded.current) return;
    async function loadDrawerData() {
      try {
        const [teachersRes, studentRes, roomsRes] = await Promise.all([
          axiosClient.get('/teachers?limit=33'),
          axiosClient.get('/students?limit=33'),
          axiosClient.get('/rooms?limit=33'),
        ])
        setAvailableTeacherss(teachersRes.data.data)
        setAvailableStudents(studentRes.data.data)
        setAvailableRooms(roomsRes.data.data)
        drawerDataLoaded.current = true;
      } catch (err) {
        console.error('Drawer data yuklashda xato:', err)
      }
    }
    loadDrawerData();
  }, [isDrawerOpen])

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setCreateGroup({
      name: '',
      description: '',
      course_id: null,
      teachers: [],
      students: [],
      room_id: null,
      start_date: '',
      week_day: [],
      start_time: '',
      max_student: null
    });
    setSelectedDays([]);
    setSelectedTeachers([]);
    setSelectedStudents([]);
    setTeacherSearch('');
    setStudentSearch('');
    setIsEditing(false);
    setEditGroupId(null);
  };

  async function createGroups() {
    try {
      // API ga yuborishdan oldin payloadni tozalash
      // null, NaN, bo'sh string qiymatlarni olib tashlash
      let finalStartTime = createGroup.start_time;
      if (finalStartTime && finalStartTime.length === 5) {
        finalStartTime += ':00';
      }

      const payload = {
        ...createGroup,
        start_time: finalStartTime || undefined,
        course_id: createGroup.course_id ?? undefined,
        room_id: createGroup.room_id ?? undefined,
        max_student: (createGroup.max_student && !isNaN(createGroup.max_student))
          ? Number(createGroup.max_student)
          : undefined,
      }
      // undefined bo'lgan fieldlarni olib tashlaymiz
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key])

      let res;
      if (isEditing) {
        res = await axiosClient.patch(`/groups/${editGroupId}`, payload);
      } else {
        res = await axiosClient.post('/groups', payload);
      }

      if (res.status === 201 || res.status === 200) {
        const groupsRes = await axiosClient.get('/groups/all')
        const fetchedGroups = groupsRes.data.data
        setGroups(fetchedGroups)
        setGroupStatuses(prev => ({
          ...prev,
          ...fetchedGroups.reduce((acc, g) => ({ ...acc, [g.id]: g.is_active ?? true }), {})
        }))
        handleCloseDrawer()
      }
    } catch (err) {
      console.error(err)
      // Server xato xabarini ko'rsatish
      const serverMsg = err.response?.data?.message
        || err.response?.data?.error
        || err.message
        || 'Guruh qo\'shishda xato yuz berdi'
      setErrorModal({ open: true, message: serverMsg })
    }
  }


  const WEEK_MAP = {
    MONDAY: 'Du',
    TUESDAY: 'Se',
    WEDNESDAY: 'Chor',
    THURSDAY: 'Pay',
    FRIDAY: 'Ju',
    SATURDAY: 'Shan',
    SUNDAY: 'Yak'
  }

  function getGroupInfo(e) {
    setCreateGroup(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }


  return (
    <>
      <Box sx={{ mt: 3, fontFamily: 'Roboto, sans-serif' }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '30px' }}>
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
              <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#111827', lineHeight: 1 }}>{new Set(groups.flatMap(g => (g.teachers || []).map(t => t.id))).size}</Typography>
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
                <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#111827', lineHeight: 1 }}>{groups.reduce((sum, g) => sum + (g.student_count || 0), 0)}</Typography>
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
        <Paper sx={{ height: '480px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <TableContainer sx={{
            flex: 1, overflowY: 'auto',
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: '#e5e7eb', borderRadius: '10px' },
            '&::-webkit-scrollbar-thumb:hover': { background: '#d1d5db' },
          }}>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '395px' }}>
                <img src={loading} alt="loading" width={90} height={90} />
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
                    groups.map((group, index) => (
                      <TableRow key={group.id ? `group-${group.id}-${index}` : index} hover onClick={() => navigate(`/dashboard/groups/${group.id}`)} sx={{ cursor: 'pointer', '& td': { borderBottom: '1px solid #eee' } }}>
                        {/* Status */}
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5 }}>
                            <Switch
                              checked={groupStatuses[group.id]}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => { e.stopPropagation(); toggleStatus(group.id); }}
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
                            label={group.courses?.name || group.course?.name || '—'}
                            size="small"
                            sx={{
                              bgcolor: '#fce7f3', color: '#db2777',
                              fontWeight: 600, fontSize: '12px', borderRadius: '6px'
                            }}
                          />
                        </TableCell>

                        {/* Davomiyligi */}
                        <TableCell align="center" sx={{ color: '#555', fontSize: '14px' }}>{group.courses?.duration_month || group.course?.duration_month || 0} oy</TableCell>

                        {/* Dars vaqti */}
                        <TableCell align="center">
                          <Typography sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>
                            {(group.start_time || group.time || group.class_time || '')?.slice(0, 5)}
                          </Typography>
                          <Typography sx={{ fontSize: '12px', color: '#888' }}>
                            {group.week_day?.map(day => WEEK_MAP[day]).join(', ')}
                          </Typography>
                        </TableCell>

                        {/* Xona */}
                        <TableCell align="center" sx={{ color: '#555', fontSize: '14px' }}>
                          {group.rooms?.name || group.room?.name || group.room || '—'}
                        </TableCell>

                        {/* O'qituvchi */}
                        <TableCell align="center">
                          <Typography sx={{ fontWeight: 600, color: '#1a1a1a', fontSize: '14px' }}>
                            {group.teachers?.length > 0 ? group.teachers[0].full_name : '—'}
                          </Typography>
                        </TableCell>

                        {/* Talabalar */}
                        <TableCell align="center" sx={{ color: '#555', fontSize: '14px', fontWeight: 500 }}>
                          {group.student_count ?? group.students?.length ?? 0}
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <IconButton size="small" onClick={(e) => handleOpenMenu(e, group.id)} sx={{ color: '#888', '&:hover': { color: '#7C3AED' } }}>
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>
        </Paper>

        {/* Add Group Drawer */}
        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={handleCloseDrawer}
          sx={{ zIndex: 9999, '& .MuiDrawer-paper': { width: { xs: '100%', sm: 400 }, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' } }}
        >
          {/* Drawer Header */}
          <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid #e5e7eb', position: 'relative' }}>
            <IconButton
              onClick={handleCloseDrawer}
              sx={{ position: 'absolute', right: 16, top: 16, color: '#9ca3af', '&:hover': { color: '#111827' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#111827', mb: 0.5 }}>
              {isEditing ? "Guruhni tahrirlash" : "Guruh qo'shish"}
            </Typography>
            <Typography sx={{ fontSize: '13px', color: '#6b7280' }}>
              {isEditing ? "Guruh ma'lumotlarini tahrirlash uchun quyidagilarni o'zgartiring." : "Yangi guruh yaratish uchun quyidagi ma'lumotlarni kiriting."}
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
                name='name'
                value={createGroup.name}
                placeholder="Frontend 2024"
                size="small"
                onChange={getGroupInfo}
              />
            </Box>

            {/* Kurs */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>
                Kurs
              </Typography>
              <Select
                name='course_id'
                value={createGroup.course_id ?? ''}
                displayEmpty
                fullWidth
                onChange={(e) => setCreateGroup(p => ({ ...p, course_id: e.target.value ? Number(e.target.value) : null }))}
                size="small"
                MenuProps={{ style: { zIndex: 99999 } }}
              >
                <MenuItem value="" disabled><em style={{ color: '#9ca3af', fontStyle: 'normal' }}>Kursni tanlang</em></MenuItem>
                {
                  courses.map((item) => (
                    <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                  ))
                }
              </Select>
            </Box>

            {/* Davomiyligi */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>
                Davomiyligi
              </Typography>
              <Box sx={{ border: '1px solid #d1d5db', borderRadius: '8px', px: 2, py: 1, bgcolor: '#f9fafb' }}>
                <Typography sx={{ fontSize: '14px', color: createGroup.course_id ? '#111827' : '#9ca3af' }}>
                  {createGroup.course_id
                    ? `${courses.find(c => c.id === Number(createGroup.course_id))?.duration_month} oy`
                    : 'Avval kursni tanlang'
                  }
                </Typography>
              </Box>
            </Box>

            {/* Xona */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>
                Xona
              </Typography>
              <Select
                name='room_id'
                value={createGroup.room_id ?? ''}
                displayEmpty
                fullWidth
                onChange={(e) => setCreateGroup(p => ({ ...p, room_id: e.target.value ? Number(e.target.value) : null }))}
                size="small"
                MenuProps={{ style: { zIndex: 99999 } }}
              >
                <MenuItem value="" disabled><em style={{ color: '#9ca3af', fontStyle: 'normal' }}>Xonani tanlang</em></MenuItem>

                {availableRooms.map(item => (
                  <MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>
                ))}
              </Select>
            </Box>

            {/* Dars kunlari */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>
                Dars kunlari
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {days.map((day) => {
                  const isChecked = selectedDays.includes(day.value);
                  return (
                    <Box
                      name="week_day"
                      key={day.value}
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
                        {day.label}
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
              <TextField
                name='start_time'
                type="time"
                value={createGroup.start_time}
                onChange={getGroupInfo}
                fullWidth
                size="small"
              />
            </Box>

            {/* Boshlanish sanasi */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>
                Boshlanish sanasi
              </Typography>
              <TextField
                name='start_date'
                type="date"
                fullWidth
                size="small"
                value={createGroup.start_date}
                onChange={getGroupInfo}
              />
            </Box>

            {/* Tavsif */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>
                Tavsif
              </Typography>
              <TextField
                name='description'
                value={createGroup.description}
                multiline
                rows={3}
                fullWidth
                placeholder="Guruh haqida qo'shimcha ma'lumot (ixtiyoriy)"
                onChange={getGroupInfo}
                sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#f9fafb' } }}
              />
            </Box>

            {/* Maksimal talabalar soni */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>
                Maksimal talabalar soni
              </Typography>
              <TextField
                fullWidth
                name='max_student'
                type='number'
                placeholder="20"
                size="small"
                value={createGroup.max_student ?? ''}
                onChange={(e) => {
                  const val = e.target.value
                  setCreateGroup(prev => ({
                    ...prev,
                    max_student: val === '' ? null : Number(val)
                  }))
                }}
                slotProps={{ htmlInput: { min: 1 } }}
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
                    {selectedTeachers.map(id => {
                      const teacher = availableTeacherss.find(item => item.id === id)
                      if (!teacher) return null;
                      return (
                        <Chip key={id} label={teacher.full_name} color="primary" onDelete={() => toggleTeacher(id)} size="small"
                          sx={{ bgcolor: '#ede7f6', color: '#7C3AED', fontWeight: 500, borderRadius: '16px', '& .MuiChip-deleteIcon': { color: '#7C3AED', '&:hover': { color: '#5B21B6' } } }}
                        />
                      )
                    })}
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
                    {selectedStudents.map(id => {
                      const student = availableStudents.find(item => item.id === id)
                      if (!student) return null;
                      return (
                        <Chip key={id} label={student.full_name} color="primary" onDelete={() => toggleStudent(id)} size="small"
                          sx={{ bgcolor: '#ede7f6', color: '#7C3AED', fontWeight: 500, borderRadius: '16px', '& .MuiChip-deleteIcon': { color: '#7C3AED', '&:hover': { color: '#5B21B6' } } }}
                        />
                      )
                    })}
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
              onClick={handleCloseDrawer}
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
              onClick={createGroups}
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
          slotProps={{ paper: { sx: { borderRadius: '12px', overflow: 'hidden', m: 2 } } }}
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
                  key={teacher.id}
                  onClick={() => toggleTeacher(teacher.id)}
                  sx={{
                    display: 'flex', alignItems: 'center',
                    px: 2, py: 1.5,
                    borderBottom: index !== filteredTeachers.length - 1 ? '1px solid #E5E7EB' : 'none',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F9FAFB' },
                  }}
                >
                  <Checkbox
                    checked={selectedTeachers.includes(teacher.id)}
                    disableRipple
                    sx={{ p: 0, mr: 1.5, pointerEvents: 'none', color: '#D1D5DB', '&.Mui-checked': { color: '#7C3AED' }, '& .MuiSvgIcon-root': { fontSize: 20 } }}
                  />
                  <Typography sx={{ fontWeight: 500, color: '#111827', fontSize: '14px', userSelect: 'none' }}>
                    {teacher.full_name}
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
          slotProps={{ paper: { sx: { borderRadius: '12px', overflow: 'hidden', m: 2 } } }}
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
                  key={student.id}
                  onClick={() => toggleStudent(student.id)}
                  sx={{
                    display: 'flex', alignItems: 'center',
                    px: 2, py: 1.5,
                    borderBottom: index !== filteredStudents.length - 1 ? '1px solid #E5E7EB' : 'none',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#F9FAFB' },
                  }}
                >
                  <Checkbox
                    checked={selectedStudents.includes(student.id)}
                    disableRipple
                    sx={{ p: 0, mr: 1.5, pointerEvents: 'none', color: '#D1D5DB', '&.Mui-checked': { color: '#7C3AED' }, '& .MuiSvgIcon-root': { fontSize: 20 } }}
                  />
                  <Typography sx={{ fontWeight: 500, color: '#111827', fontSize: '14px', userSelect: 'none' }}>
                    {student.full_name}
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

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          open={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedGroupId(null);
          }}
          title="Guruhni o'chirish"
          onConfirm={handleDeleteConfirm}
        />

        {/* Error Modal */}
        <ErrorModal
          open={errorModal.open}
          onClose={() => setErrorModal({ open: false, message: '' })}
          message={errorModal.message}
        />

        {/* Actions Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleCloseMenu}
          onClick={(e) => e.stopPropagation()}
          slotProps={{ paper: {
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
              mt: 1.5,
              borderRadius: '8px',
              minWidth: 140,
              '& .MuiMenuItem-root': {
                px: 2,
                py: 1,
                fontSize: '14px',
                color: '#374151',
                '&:hover': { bgcolor: '#f3f4f6' }
              }
            },
          }}}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={handleEditClick}>
            <ListItemIcon sx={{ minWidth: '30px !important' }}>
              <EditIcon fontSize="small" sx={{ color: '#7C3AED' }} />
            </ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontSize: '14px', fontWeight: 500 }}>Edit</Typography>} />
          </MenuItem>
          <MenuItem onClick={handleDeleteClick}>
            <ListItemIcon sx={{ minWidth: '30px !important' }}>
              <DeleteIcon fontSize="small" sx={{ color: '#ef4444' }} />
            </ListItemIcon>
            <ListItemText primary={<Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#ef4444' }}>Delete</Typography>} />
          </MenuItem>
        </Menu>
      </Box>
    </>
  );
}

export default Groups;

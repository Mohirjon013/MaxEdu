import React, { useState, useRef, useEffect, useTransition } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Checkbox, Avatar, Chip, IconButton,
  InputBase, Pagination, Drawer, Dialog, TextField, ThemeProvider, createTheme,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import axiosClient from '../api/axios';
import loading from "../assets/images/loading.gif";
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ErrorModal from '../components/ErrorModal';

const theme = createTheme({
  palette: { primary: { main: '#7C3AED' } },
  components: {
    MuiTextField: { defaultProps: { variant: 'outlined', size: 'small' } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#7C3AED' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7C3AED', borderWidth: '1px' },
        },
        notchedOutline: {
          borderColor: '#e0e0e0',
          transition: 'border-color 0.3s ease-in-out, border-width 0.3s ease-in-out',
        },
      },
    },
    MuiButton: { styleOverrides: { root: { textTransform: 'none', borderRadius: '8px' } } },
  },
});

function Student() {
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [groupSearch, setGroupSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editStudentId, setEditStudentId] = useState(null);
  const [isArchiveView, setIsArchiveView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const fileInputRef = useRef(null);

  const [student, setStudent] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);

  const [createStudent, setCreateStudent] = useState({
    full_name: '', email: '', password: '', phone: '', address: '', birth_date: '', groups: [],
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
  };

  const filteredGroups = availableGroups.filter(g =>
    g.name?.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const toggleGroup = (groupId) => {
    setCreateStudent(prev => ({
      ...prev,
      groups: prev.groups.includes(groupId)
        ? prev.groups.filter(id => id !== groupId)
        : [...prev.groups, groupId],
    }));
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsRes, groupsRes] = await Promise.all([
          axiosClient.get(isArchiveView ? '/students/archive' : '/students?limit=1000'),
          axiosClient.get('/groups/all')
        ]);
        if (studentsRes.status === 200) {
          startTransition(() => setStudent(studentsRes.data.data));
        }
        if (groupsRes.status === 200) {
          const gData = groupsRes.data?.data || groupsRes.data || [];
          setAvailableGroups(Array.isArray(gData) ? gData : []);
        }
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchData();
  }, [isArchiveView]);

  function resetForm() {
    setCreateStudent({ full_name: '', email: '', password: '', phone: '', address: '', birth_date: '', groups: [] });
    setSelectedImage(null);
    setIsEditing(false);
    setEditStudentId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleCreateStudent() {
    if (!createStudent.full_name || !createStudent.phone || !createStudent.email || (!isEditing && !createStudent.password)) {
      setErrorModal({ open: true, message: "Iltimos, barcha majburiy maydonlarni to'ldiring!" });
      return;
    }
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('full_name', createStudent.full_name);
      formData.append('email', createStudent.email);
      if (createStudent.password) {
        formData.append('password', createStudent.password);
      }
      let formattedPhone = createStudent.phone.replace(/\s+/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }
      formData.append('phone', formattedPhone);
      formData.append('address', createStudent.address);
      if (createStudent.birth_date) {
        formData.append('birth_date', createStudent.birth_date);
      }
      createStudent.groups.forEach(g => formData.append('groups', Number(g)));
      if (fileInputRef.current?.files[0]) {
        formData.append('photo', fileInputRef.current.files[0]);
      }

      let res;
      if (isEditing) {
        res = await axiosClient.patch(`/students/${editStudentId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await axiosClient.post('/students', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.status === 201 || res.status === 200) {
        const updated = await axiosClient.get('/students?limit=1000');
        const students = updated.data?.data || updated.data || [];
        startTransition(() => setStudent(students));
        setPage(1);
        setIsDrawerOpen(false);
        resetForm();
      }
    } catch (error) {
      setErrorModal({ open: true, message: `Xato: ${error.response?.data?.message || error.message}` });
    } finally {
      setIsSaving(false);
    }
  }

  function getStudentInfo(e) {
    setCreateStudent(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const handleEditClick = async (id) => {
    try {
      const res = await axiosClient.get(`/students/one/${id}`);
      const data = res.data?.data || res.data;

      const groupIds = [];
      if (Array.isArray(data.groups)) {
        data.groups.forEach(g => {
          if (typeof g === 'object' && g.id) { groupIds.push(g.id); }
          else if (typeof g === 'string') {
            const found = availableGroups.find(ag => ag.name === g);
            if (found) groupIds.push(found.id);
          }
        });
      }

      setCreateStudent({
        full_name: data.full_name || '',
        email: data.email || '',
        password: '',
        phone: data.phone || '',
        address: data.address || '',
        birth_date: data.birth_date ? data.birth_date.split('T')[0] : '',
        groups: groupIds,
      });

      if (data.photo) {
        setSelectedImage(`https://najot-edu.softwareengineer.uz/uploads/${data.photo}`);
      } else {
        setSelectedImage(null);
      }

      setEditStudentId(id);
      setIsEditing(true);
      setIsDrawerOpen(true);
    } catch (error) {
      setErrorModal({ open: true, message: "Talaba ma'lumotlarini yuklashda xatolik yuz berdi" });
    }
  };

  const filteredStudents = student.filter(t =>
    (t.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (t.phone || '').includes(searchQuery)
  );

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const paginatedStudents = filteredStudents.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleDeleteConfirm = async () => {
    if (!studentToDelete?.id) return;
    try {
      const res = await axiosClient.delete(`/students/${studentToDelete.id}`);
      if (res.status === 200 || res.status === 204) {
        setStudent(prev => prev.filter(t => t.id !== studentToDelete.id));
      }
    } catch (error) {
      setErrorModal({ open: true, message: "Ma'lumotni o'chirishda xatolik yuz berdi!" });
    } finally {
      setDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ mt: 3, fontFamily: 'Roboto, sans-serif' }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ maxWidth: 950 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: '#1a1a1a', fontSize: '28px' }}>
              Talabalar {isArchiveView && <span style={{ color: '#7C3AED', fontSize: '28px' }}>(Arxiv)</span>}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.6 }}>
              Ushbu sahifada siz talabalar ro'yxatini va ularning ma'lumotlarini topasiz.
            </Typography>
          </Box>
          <Button variant="contained" color="primary" onClick={() => setIsDrawerOpen(true)}
            sx={{ px: 1.5, py: 0.8, fontWeight: 600, fontSize: '14px', boxShadow: 'none', '&:hover': { bgcolor: '#5B21B6', boxShadow: '0 4px 14px 0 rgba(124,58,237,0.39)' } }}>
            <span style={{ fontSize: '20px', marginRight: '6px', lineHeight: 1 }}>+</span>
            Talaba qo'shish
          </Button>
        </Box>

        {/* Table */}
        <Paper sx={{ height: '500px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<FilterListIcon />}
                sx={{ color: '#333', borderColor: '#e0e0e0', fontWeight: 500, '&:hover': { borderColor: '#ccc', bgcolor: '#f9f9f9' } }}>
                Filters
              </Button>
              <Button
                variant={isArchiveView ? "contained" : "outlined"}
                onClick={() => { setIsArchiveView(!isArchiveView); setPage(1); }}
                sx={{
                  fontWeight: 500,
                  ...(isArchiveView
                    ? { bgcolor: '#7C3AED', color: '#fff', '&:hover': { bgcolor: '#5B21B6' } }
                    : { color: '#333', borderColor: '#e0e0e0', '&:hover': { borderColor: '#ccc', bgcolor: '#f9f9f9' } }
                  )
                }}>
                Arxiv
              </Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: '8px', px: 2, py: 0.5, width: '300px', bgcolor: '#fcfcfc' }}>
              <InputBase
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                sx={{ ml: 1, flex: 1, fontSize: '14px' }}
              />
            </Box>
          </Box>

          <TableContainer sx={{ overflowY: 'auto', pr: 1, flex: 1 }} >
            {isPending ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '395px', }}>
                <img src={loading} alt="loading" width={90} height={90} />
              </Box>
            ) : (
              <Table sx={{ minWidth: 700 }} size="small">
                <TableHead sx={{ bgcolor: '#fafafa' }}>
                  <TableRow>
                    <TableCell padding="checkbox"><Checkbox color="primary" /></TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#555', borderBottom: '1px solid #eee', whiteSpace: 'nowrap', px: 1 }}>Nomi ↓</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#555', borderBottom: '1px solid #eee', whiteSpace: 'nowrap', px: 1 }}>Guruh</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#555', borderBottom: '1px solid #eee', whiteSpace: 'nowrap', px: 1 }}>Telefon</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#555', borderBottom: '1px solid #eee', px: 1 }}>Email</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#555', borderBottom: '1px solid #eee', px: 1 }}>Tug'ilgan</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#555', borderBottom: '1px solid #eee', px: 1 }}>Manzil</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#555', borderBottom: '1px solid #eee', whiteSpace: 'nowrap', px: 1 }}>Sana</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: '#555', borderBottom: '1px solid #eee', whiteSpace: 'nowrap', px: 1 }}>Amallar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedStudents.length > 0 ? paginatedStudents.map((studentItem, index) => (
                    <TableRow key={index} hover sx={{ '& td': { borderBottom: 'px solid #eee', py: 1, px: 1 } }}>
                      <TableCell padding="checkbox"><Checkbox color="primary" /></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={studentItem.avatar || studentItem.image} alt={studentItem.full_name} sx={{ width: 32, height: 32, fontSize: '14px' }}>
                            {studentItem.full_name?.charAt(0)}
                          </Avatar>
                          <Typography sx={{ fontWeight: 500, color: '#222', fontSize: '14px' }}>{studentItem.full_name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ maxWidth: 150 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                          {studentItem.groups?.length > 0 ? studentItem.groups.map((g, i) => (
                            <Chip key={i} label={g?.name || g} size="small"
                              sx={{ bgcolor: '#f0f0f0', color: '#555', fontWeight: 500, borderRadius: '6px', height: '24px', fontSize: '12px' }} />
                          )) : <Typography variant="body2" sx={{ color: '#999' }}>-</Typography>}
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ color: '#4b5563', whiteSpace: 'nowrap', fontSize: '14px' }}>{studentItem.phone || '-'}</TableCell>
                      <TableCell align="center" sx={{ color: '#4b5563', fontSize: '14px', wordBreak: 'break-word', maxWidth: 180 }}>{studentItem.email || '-'}</TableCell>
                      <TableCell align="center" sx={{ color: '#4b5563', fontSize: '14px', whiteSpace: 'nowrap' }}>{studentItem.birth_date ? studentItem.birth_date.split('T')[0] : '-'}</TableCell>
                      <TableCell align="center" sx={{ color: '#4b5563', fontSize: '14px', maxWidth: 120 }}>{studentItem.address || '-'}</TableCell>
                      <TableCell align="center" sx={{ color: '#4b5563', whiteSpace: 'nowrap', fontSize: '14px' }}>{studentItem.created_at?.split('T')[0] || '-'}</TableCell>
                      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton size="small" sx={{ color: '#777', '&:hover': { color: '#7C3AED' } }}><VisibilityIcon fontSize="small" /></IconButton>
                        <IconButton size="small" sx={{ color: '#777', '&:hover': { color: '#f44336' } }} onClick={() => {
                          setStudentToDelete(studentItem);
                          setDeleteModalOpen(true);
                        }}><DeleteIcon fontSize="small" /></IconButton>
                        <IconButton size="small" sx={{ color: '#7C3AED', '&:hover': { color: '#5B21B6' } }} onClick={() => handleEditClick(studentItem.id)}><EditIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 10, pt: 15, borderBottom: 'none' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, opacity: 0.8 }}>
                          <SearchOffIcon sx={{ fontSize: 56, color: '#9CA3AF' }} />
                          <Typography sx={{ color: '#6B7280', fontSize: '15px', fontWeight: 500 }}>
                            {searchQuery ? "Qidiruvingiz bo'yicha ma'lumot topilmadi" : "Hozircha ma'lumotlar mavjud emas"}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee' }}>
            <Button disabled={page === 1} onClick={() => setPage(page - 1)} variant="outlined" sx={{ color: '#555', borderColor: '#e0e0e0', '&:hover': { bgcolor: '#f9f9f9', borderColor: '#ccc' }, '&.Mui-disabled': { color: '#bbb', borderColor: '#eee' } }}>← Previous</Button>
            <Pagination count={totalPages || 1} page={page} onChange={handlePageChange} siblingCount={1} boundaryCount={1} shape="rounded" color="primary" />
            <Button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)} variant="outlined" sx={{ color: '#555', borderColor: '#e0e0e0', '&:hover': { bgcolor: '#f9f9f9', borderColor: '#ccc' }, '&.Mui-disabled': { color: '#bbb', borderColor: '#eee' } }}>Next →</Button>
          </Box>
        </Paper>

        {/* Drawer */}
        <Drawer anchor="right" open={isDrawerOpen} onClose={() => { setIsDrawerOpen(false); resetForm(); }}
          sx={{ zIndex: 9999, '& .MuiDrawer-paper': { width: { xs: '100%', sm: 450 }, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' } }}>
          <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid #c9cacd', position: 'relative' }}>
            <IconButton onClick={() => { setIsDrawerOpen(false); resetForm(); }} sx={{ position: 'absolute', right: 16, top: 16, color: '#9ca3af', '&:hover': { color: '#111827' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#111827', mb: 0.5 }}>
              {isEditing ? "Talabani tahrirlash" : "Talaba qo'shish"}
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
              {isEditing ? "Bu yerda talaba ma'lumotlarini tahrirlashingiz mumkin." : "Bu yerda siz yangi talaba qo'shishingiz mumkin."}
            </Typography>
          </Box>

          <Box sx={{ p: 3, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {[
              { label: 'Telefon raqam', type: 'tel', name: 'phone', placeholder: '+998 XX XXX XX XX' },
              { label: 'Mail', type: 'email', name: 'email', placeholder: 'Elektron pochtani kiriting' },
              { label: "Talaba FIO", type: 'text', name: 'full_name', placeholder: "Ma'lumotni kiriting" },
              { label: "Tug'ilgan sanasi", type: 'date', name: 'birth_date', placeholder: "" },
            ].map(({ label, type, placeholder, name }) => (
              <Box key={name}>
                <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.75, color: '#333' }}>{label}</Typography>
                <TextField fullWidth type={type} name={name} placeholder={placeholder}
                  value={createStudent[name]} onChange={getStudentInfo} size="small" />
              </Box>
            ))}

            {/* Guruh */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.75, color: '#333' }}>Guruh</Typography>
              <Box sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', p: createStudent.groups.length > 0 ? 1.5 : 0, minHeight: '42px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {createStudent.groups.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    {createStudent.groups.map(id => {
                      const group = availableGroups.find(g => g.id === id);
                      return (
                        <Chip key={id} label={group?.name || id} color="primary"
                          onDelete={() => toggleGroup(id)} size="small"
                          sx={{ bgcolor: '#ede7f6', color: '#7C3AED', fontWeight: 500, borderRadius: '16px', '& .MuiChip-deleteIcon': { color: '#7C3AED', '&:hover': { color: '#5B21B6' } } }} />
                      );
                    })}
                  </Box>
                )}
                <Button variant={createStudent.groups.length > 0 ? 'text' : 'outlined'} color="primary"
                  onClick={() => setIsGroupModalOpen(true)}
                  sx={{ width: createStudent.groups.length > 0 ? 'auto' : '100%', alignSelf: 'flex-start', justifyContent: 'flex-start', borderColor: '#e0e0e0', p: createStudent.groups.length > 0 ? 0 : 1.5, minWidth: 0, fontWeight: 500, '&:hover': { borderColor: '#7C3AED', bgcolor: createStudent.groups.length > 0 ? 'transparent' : '#fbf8ff' } }}>
                  <span style={{ fontSize: '20px', marginRight: '8px', lineHeight: 1 }}>+</span> Qo'shish
                </Button>
              </Box>
            </Box>

            {/* Surati */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.75, color: '#333' }}>Surati</Typography>
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageChange} />
              <Box onClick={() => fileInputRef.current.click()}
                sx={{ border: '2px dashed #e0e0e0', borderRadius: '8px', p: 4, textAlign: 'center', bgcolor: '#fafafa', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: '#7C3AED', bgcolor: '#fbf8ff' } }}>
                {selectedImage ? (
                  <img src={selectedImage} alt="preview" style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} />
                ) : (
                  <>
                    <CloudUploadOutlinedIcon sx={{ color: '#b0b0b0', fontSize: 40, mb: 1 }} />
                    <Typography sx={{ fontSize: '14px', color: '#555', fontWeight: 500 }}>
                      <span style={{ color: '#7C3AED', fontWeight: 600 }}>Click to upload</span> or drag and drop
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: '#999', mt: 0.5 }}>JPG or PNG (max. 800x800px)</Typography>
                  </>
                )}
              </Box>
            </Box>

            {/* Manzil */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.75, color: '#333' }}>Manzil</Typography>
              <TextField fullWidth name="address" type="text" placeholder="Manzilni kiriting"
                size="small" autoComplete='off' value={createStudent.address} onChange={getStudentInfo} />
            </Box>

            {/* Parol */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.75, color: '#333' }}>Parol</Typography>
              <form autoComplete="off" onSubmit={(e) => e.preventDefault()} style={{ margin: 0 }}>
                <TextField fullWidth name="password" type="password" placeholder="Parolni kiriting"
                  size="small" value={createStudent.password} onChange={getStudentInfo}
                  autoComplete="new-password" />
              </form>
            </Box>
          </Box>

          <Box sx={{ px: 3, py: 2, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => { setIsDrawerOpen(false); resetForm(); }}
              sx={{ color: '#1f2937', bgcolor: '#fff', border: '1px solid #e5e7eb', px: 3.5, py: 1, borderRadius: '8px', fontWeight: 600, '&:hover': { bgcolor: '#f9fafb', borderColor: '#d1d5db' } }}>
              Bekor qilish
            </Button>
            <Button variant="contained" onClick={handleCreateStudent} disabled={isSaving}
              sx={{ bgcolor: '#8b5cf6', color: '#fff', px: 4, py: 1, borderRadius: '8px', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#7c3aed', boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: '#c4b5fd', color: '#fff' } }}>
              {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </Box>
        </Drawer>

        {/* Group Modal */}
        <Dialog open={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)}
          sx={{ zIndex: 99999 }}
          disableRestoreFocus
          slotProps={{ paper: { sx: { borderRadius: '12px', overflow: 'hidden', m: 2 } } }}>
          <Box sx={{ p: 2, width: '500px', overflowX: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
              <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '22px' }}>Guruhga biriktirish</Typography>
              <IconButton onClick={() => setIsGroupModalOpen(false)} sx={{ color: '#9CA3AF', p: 0.5, mt: -0.5, mr: -0.5 }}>
                <CloseIcon sx={{ fontSize: 25 }} />
              </IconButton>
            </Box>
            <Typography sx={{ color: '#6B7280', fontSize: '14px', lineHeight: '13px' }}>Bir yoki bir nechta guruhni tanlang</Typography>

            <TextField fullWidth placeholder="Guruh qidirish..." size="small"
              value={groupSearch} onChange={(e) => setGroupSearch(e.target.value)}
              sx={{ mt: 2, mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', '& fieldset': { borderColor: '#E5E7EB' }, '&:hover fieldset': { borderColor: '#E5E7EB' }, '&.Mui-focused fieldset': { borderColor: '#7C3AED', borderWidth: '1px' } } }} />

            <Box sx={{ border: '1px solid #E5E7EB', borderRadius: '8px', mb: 3, maxHeight: '200px', overflowY: 'auto', overflowX: 'hidden' }}>
              {filteredGroups.map((group, index) => (
                <Box key={group.id} onClick={() => toggleGroup(group.id)}
                  sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: index !== filteredGroups.length - 1 ? '1px solid #E5E7EB' : 'none', cursor: 'pointer', '&:hover': { bgcolor: '#F9FAFB' } }}>
                  <Checkbox checked={createStudent.groups.includes(group.id)} disableRipple
                    sx={{ p: 0, mr: 1.5, pointerEvents: 'none', color: '#D1D5DB', '&.Mui-checked': { color: '#7C3AED' }, '& .MuiSvgIcon-root': { fontSize: 20 } }} />
                  <Typography sx={{ fontWeight: 500, color: '#111827', fontSize: '14px', userSelect: 'none' }}>{group.name}</Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsGroupModalOpen(false)}
                sx={{ bgcolor: '#fff', color: '#374151', border: '1px solid #E5E7EB', px: 3, py: 1, borderRadius: '8px', fontWeight: 600, '&:hover': { bgcolor: '#F9FAFB' } }}>
                Bekor qilish
              </Button>
              <Button variant="contained" onClick={() => setIsGroupModalOpen(false)}
                sx={{ bgcolor: '#7C3AED', color: '#fff', px: 3, py: 1, borderRadius: '8px', fontWeight: 600, boxShadow: 'none', '&:hover': { bgcolor: '#5B21B6', boxShadow: 'none' } }}>
                Qo'shish
              </Button>
            </Box>
          </Box>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Talabani o'chirish"
          onConfirm={handleDeleteConfirm}
        />

        {/* Error Modal */}
        <ErrorModal
          open={errorModal.open}
          onClose={() => setErrorModal({ ...errorModal, open: false })}
          message={errorModal.message}
        />

      </Box>
    </ThemeProvider>
  );
}

export default Student;
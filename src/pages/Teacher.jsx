import React, { useState, useRef, useEffect, useTransition } from 'react';
import useDebounce from '../hook/useDebounce';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Checkbox, Avatar, Chip, IconButton,
  InputBase, Pagination, Drawer, Dialog, TextField, CircularProgress,
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

// Removed local theme to use global ThemeContextProvider

function Teacher() {
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [groupSearch, setGroupSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTeacherId, setEditTeacherId] = useState(null);
  const [isArchiveView, setIsArchiveView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 800);
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const fileInputRef = useRef(null);
  const groupsLoaded = useRef(false);

  const [teacher, setTeacher] = useState([]);
  const [availableGroups, setAvailableGroups] = useState([]);

  const [createTeacher, setCreateTeacher] = useState({
    full_name: '', email: '', password: '', phone: '', address: '', groups: [],
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
  };

  const filteredGroups = availableGroups.filter(g =>
    g.name?.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const toggleGroup = (groupId) => {
    setCreateTeacher(prev => ({
      ...prev,
      groups: prev.groups.includes(groupId)
        ? prev.groups.filter(id => id !== groupId)
        : [...prev.groups, groupId],
    }));
  };

  // Sahifaga kiranda faqat o'qituvchilarni yukla
  useEffect(() => {
    groupsLoaded.current = false;
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await axiosClient.get(isArchiveView ? '/teachers/archive' : '/teachers');
        if (res.status === 200) {
          startTransition(() => setTeacher(res.data.data));
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [isArchiveView]);

  // Drawer ochilganda guruhlarni lazy load qiladi
  useEffect(() => {
    if (!isDrawerOpen || groupsLoaded.current) return;
    async function fetchGroups() {
      try {
        const res = await axiosClient.get('/groups/all');
        if (res.status === 200) {
          const gData = res.data?.data || res.data || [];
          setAvailableGroups(Array.isArray(gData) ? gData : []);
          groupsLoaded.current = true;
        }
      } catch (error) {
        console.log(error.message);
      }
    }
    fetchGroups();
  }, [isDrawerOpen]);

  function resetForm() {
    setCreateTeacher({ full_name: '', email: '', password: '', phone: '', address: '', groups: [] });
    setSelectedImage(null);
    setIsEditing(false);
    setEditTeacherId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleCreateTeacher() {
    if (!createTeacher.full_name || !createTeacher.phone || !createTeacher.email || (!isEditing && !createTeacher.password)) {
      setErrorModal({ open: true, message: "Iltimos, barcha majburiy maydonlarni to'ldiring!" });
      return;
    }
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append('full_name', createTeacher.full_name);
      formData.append('email', createTeacher.email);
      if (createTeacher.password) {
        formData.append('password', createTeacher.password);
      }
      let formattedPhone = createTeacher.phone.replace(/\s+/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }
      formData.append('phone', formattedPhone);
      formData.append('address', createTeacher.address);
      createTeacher.groups.forEach(g => formData.append('groups', g));
      if (fileInputRef.current?.files[0]) {
        formData.append('photo', fileInputRef.current.files[0]);
      }

      let res;
      if (isEditing) {
        res = await axiosClient.patch(`/teachers/${editTeacherId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await axiosClient.post('/teachers', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.status === 201 || res.status === 200) {
        const updated = await axiosClient.get('/teachers');
        setTeacher(updated.data.data);
        setIsDrawerOpen(false);
        resetForm();
      }
    } catch (error) {
      console.error('Xato:', error.response?.data);
      setErrorModal({ open: true, message: `Xato: ${error.response?.data?.message || error.message}` });
    } finally {
      setIsSaving(false);
    }
  }

  function getTeacherInfo(e) {
    setCreateTeacher(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const handleEditClick = async (id) => {
    try {
      const res = await axiosClient.get(`/teachers/one/${id}`);
      const data = res.data?.data || res.data;

      const groupIds = [];
      if (Array.isArray(data.groups)) {
        data.groups.forEach(groupName => {
          const found = availableGroups.find(g => g.name === groupName);
          if (found) groupIds.push(found.id);
        });
      }

      setCreateTeacher({
        full_name: data.full_name || '',
        email: data.email || '',
        password: '',
        phone: data.phone || '',
        address: data.address || '',
        groups: groupIds,
      });

      if (data.photo) {
        setSelectedImage(`https://najot-edu.softwareengineer.uz/files/${data.photo}`);
      } else {
        setSelectedImage(null);
      }

      setEditTeacherId(id);
      setIsEditing(true);
      setIsDrawerOpen(true);
    } catch (error) {
      console.error("Ma'lumotni yuklashda xatolik:", error);
      setErrorModal({ open: true, message: "O'qituvchi ma'lumotlarini yuklashda xatolik yuz berdi" });
    }
  };

  const filteredTeachers = teacher.filter(t =>
    (t.full_name?.toLowerCase() || '').includes(debouncedSearch.toLowerCase()) ||
    (t.phone || '').includes(debouncedSearch)
  );

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const paginatedTeachers = filteredTeachers.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleDeleteConfirm = async () => {
    if (!teacherToDelete?.id) return;
    try {
      const res = await axiosClient.delete(`/teachers/${teacherToDelete.id}`);
      if (res.status === 200 || res.status === 204) {
        setTeacher(prev => prev.filter(t => t.id !== teacherToDelete.id));
      }
    } catch (error) {
      console.error("O'chirishda xatolik:", error);
      setErrorModal({ open: true, message: "Ma'lumotni o'chirishda xatolik yuz berdi!" });
    } finally {
      setDeleteModalOpen(false);
      setTeacherToDelete(null);
    }
  };

  return (
    <>
      <Box sx={{ mt: 3, fontFamily: 'Roboto, sans-serif' }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ maxWidth: 950 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: 'text.primary', fontSize: '28px' }}>
              O'qituvchilar {isArchiveView && <span style={{ color: '#7C3AED', fontSize: '28px' }}>(Arxiv)</span>}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              Ushbu sahifada siz o'qituvchilar ro'yxatini va ularning ma'lumotlarini topasiz.
            </Typography>
          </Box>
          <Button variant="contained" color="primary" onClick={() => setIsDrawerOpen(true)}
            sx={{ px: 1.5, py: 0.8, fontWeight: 600, fontSize: '14px', boxShadow: 'none', '&:hover': { bgcolor: '#5B21B6', boxShadow: '0 4px 14px 0 rgba(124,58,237,0.39)' } }}>
            <span style={{ fontSize: '20px', marginRight: '6px', lineHeight: 1 }}>+</span>
            O'qituvchi qo'shish
          </Button>
        </Box>

        {/* Table */}
        <Paper sx={{ height: '500px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<FilterListIcon />}
                sx={{ color: 'text.primary', borderColor: 'divider', fontWeight: 500, '&:hover': { borderColor: 'divider', bgcolor: 'action.hover' } }}>
                Filters
              </Button>
              <Button
                variant={isArchiveView ? "contained" : "outlined"}
                onClick={() => { setIsArchiveView(!isArchiveView); setPage(1); }}
                sx={{
                  fontWeight: 500,
                  ...(isArchiveView
                    ? { bgcolor: '#7C3AED', color: '#fff', '&:hover': { bgcolor: '#5B21B6' } }
                    : { color: 'text.primary', borderColor: 'divider', '&:hover': { borderColor: 'divider', bgcolor: 'action.hover' } }
                  )
                }}>
                Arxiv
              </Button>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid', borderColor: 'divider', borderRadius: '8px', px: 2, py: 0.5, width: '300px', bgcolor: 'background.default' }}>
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
            {isLoading || isPending || searchQuery !== debouncedSearch ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '395px', }}>
                <img src={loading} alt="loading" width={90} height={90} />
              </Box>
            ) : (
              <Table sx={{ minWidth: 700 }} size="small">
                <TableHead sx={{ bgcolor: 'background.default' }}>
                  <TableRow>
                    <TableCell padding="checkbox"><Checkbox color="primary" /></TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider', whiteSpace: 'nowrap', px: 1 }}>Nomi ↓</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider', whiteSpace: 'nowrap', px: 1 }}>Guruh</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider', whiteSpace: 'nowrap', px: 1 }}>Telefon</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider', px: 1 }}>Email</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider', px: 1 }}>Manzil</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider', whiteSpace: 'nowrap', px: 1 }}>Sana</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', borderBottom: '1px solid', borderColor: 'divider', whiteSpace: 'nowrap', px: 1 }}>Amallar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedTeachers.length > 0 ? paginatedTeachers.map((teacherItem, index) => (
                    <TableRow key={index} hover sx={{ '& td': { borderBottom: '1px solid', borderColor: 'divider', py: 1, px: 1 } }}>
                      <TableCell padding="checkbox"><Checkbox color="primary" /></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar src={teacherItem.photo || teacherItem.avatar || teacherItem.image ? `https://najot-edu.softwareengineer.uz/files/${teacherItem.photo || teacherItem.avatar || teacherItem.image}` : ''} alt={teacherItem.full_name} sx={{ width: 32, height: 32, fontSize: '14px' }}>
                            {teacherItem.full_name?.charAt(0)}
                          </Avatar>
                          <Typography sx={{ fontWeight: 500, color: 'text.primary', fontSize: '14px' }}>{teacherItem.full_name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ maxWidth: 150 }}>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center' }}>
                          {teacherItem.groups?.length > 0 ? teacherItem.groups.map((g, i) => (
                            <Chip key={i} label={g?.name || g} size="small"
                              sx={{ bgcolor: 'action.selected', color: 'text.primary', fontWeight: 500, borderRadius: '6px', height: '24px', fontSize: '12px' }} />
                          )) : <Typography variant="body2" sx={{ color: 'text.disabled' }}>-</Typography>}
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', fontSize: '14px' }}>{teacherItem.phone || '-'}</TableCell>
                      <TableCell align="center" sx={{ color: 'text.secondary', fontSize: '14px', wordBreak: 'break-word', maxWidth: 180 }}>{teacherItem.email || '-'}</TableCell>
                      <TableCell align="center" sx={{ color: 'text.secondary', fontSize: '14px', maxWidth: 120 }}>{teacherItem.address || '-'}</TableCell>
                      <TableCell align="center" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', fontSize: '14px' }}>{teacherItem.created_at?.split('T')[0] || '-'}</TableCell>
                      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton size="small" sx={{ color: 'text.secondary', '&:hover': { color: '#7C3AED' } }}><VisibilityIcon fontSize="small" /></IconButton>
                        <IconButton size="small" sx={{ color: '#777', '&:hover': { color: '#f44336' } }} onClick={() => {
                          setTeacherToDelete(teacherItem);
                          setDeleteModalOpen(true);
                        }}><DeleteIcon fontSize="small" /></IconButton>
                        <IconButton size="small" sx={{ color: '#7C3AED', '&:hover': { color: '#5B21B6' } }} onClick={() => handleEditClick(teacherItem.id)}><EditIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 10, pt: 15, borderBottom: 'none' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, opacity: 0.8 }}>
                          <SearchOffIcon sx={{ fontSize: 56, color: '#9CA3AF' }} />
                          <Typography sx={{ color: '#6B7280', fontSize: '15px', fontWeight: 500 }}>
                            {debouncedSearch ? "Qidiruvingiz bo'yicha ma'lumot topilmadi" : "Hozircha ma'lumotlar mavjud emas"}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </TableContainer>

          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid', borderColor: 'divider' }}>
            <Button disabled={page === 1} onClick={() => setPage(page - 1)} variant="outlined" sx={{ color: 'text.primary', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' }, '&.Mui-disabled': { color: 'text.disabled', borderColor: 'divider' } }}>← Previous</Button>
            <Pagination count={totalPages || 1} page={page} onChange={handlePageChange} siblingCount={1} boundaryCount={1} shape="rounded" color="primary" />
            <Button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(page + 1)} variant="outlined" sx={{ color: 'text.primary', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' }, '&.Mui-disabled': { color: 'text.disabled', borderColor: 'divider' } }}>Next →</Button>
          </Box>
        </Paper>

        {/* Drawer */}
        <Drawer anchor="right" open={isDrawerOpen} onClose={() => { setIsDrawerOpen(false); resetForm(); }}
          sx={{ zIndex: 9999, '& .MuiDrawer-paper': { width: { xs: '100%', sm: 450 }, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' } }}>
          <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider', position: 'relative' }}>
            <IconButton onClick={() => { setIsDrawerOpen(false); resetForm(); }} sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
              {isEditing ? "O'qituvchini tahrirlash" : "O'qituvchi qo'shish"}
            </Typography>
            <Typography sx={{ fontSize: '14px', color: 'text.secondary' }}>
              {isEditing ? "Bu yerda o'qituvchi ma'lumotlarini tahrirlashingiz mumkin." : "Bu yerda siz yangi o'qituvchi qo'shishingiz mumkin."}
            </Typography>
          </Box>

          <Box sx={{ p: 3, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {[
              { label: 'Telefon raqam', type: 'tel', name: 'phone', placeholder: '+998 XX XXX XX XX' },
              { label: 'Mail', type: 'email', name: 'email', placeholder: 'Elektron pochtani kiriting' },
              { label: "O'qituvchi FIO", type: 'text', name: 'full_name', placeholder: "Ma'lumotni kiriting" },
            ].map(({ label, type, placeholder, name }) => (
              <Box key={name}>
                <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.75, color: 'text.primary' }}>{label}</Typography>
                <TextField fullWidth type={type} name={name} placeholder={placeholder}
                  value={createTeacher[name]} onChange={getTeacherInfo} size="small" />
              </Box>
            ))}

            {/* Guruh */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.75, color: 'text.primary' }}>Guruh</Typography>
              <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', p: createTeacher.groups.length > 0 ? 1.5 : 0, minHeight: '42px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                {createTeacher.groups.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                    {createTeacher.groups.map(id => {
                      const group = availableGroups.find(g => g.id === id);
                      return (
                        <Chip key={id} label={group?.name || id} color="primary"
                          onDelete={() => toggleGroup(id)} size="small"
                          sx={{ bgcolor: '#ede7f6', color: '#7C3AED', fontWeight: 500, borderRadius: '16px', '& .MuiChip-deleteIcon': { color: '#7C3AED', '&:hover': { color: '#5B21B6' } } }} />
                      );
                    })}
                  </Box>
                )}
                <Button variant={createTeacher.groups.length > 0 ? 'text' : 'outlined'} color="primary"
                  onClick={() => setIsGroupModalOpen(true)}
                  sx={{ width: createTeacher.groups.length > 0 ? 'auto' : '100%', alignSelf: 'flex-start', justifyContent: 'flex-start', borderColor: 'divider', p: createTeacher.groups.length > 0 ? 0 : 1.5, minWidth: 0, fontWeight: 500, '&:hover': { borderColor: '#7C3AED', bgcolor: createTeacher.groups.length > 0 ? 'transparent' : 'action.hover' } }}>
                  <span style={{ fontSize: '20px', marginRight: '8px', lineHeight: 1 }}>+</span> Qo'shish
                </Button>
              </Box>
            </Box>

            {/* Surati */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.75, color: 'text.primary' }}>Surati</Typography>
              <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageChange} />
              <Box onClick={() => fileInputRef.current.click()}
                sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: '8px', p: 4, textAlign: 'center', bgcolor: 'background.default', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: '#7C3AED', bgcolor: 'action.hover' } }}>
                {selectedImage ? (
                  <img src={selectedImage} alt="preview" style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} />
                ) : (
                  <>
                    <CloudUploadOutlinedIcon sx={{ color: 'text.disabled', fontSize: 40, mb: 1 }} />
                    <Typography sx={{ fontSize: '14px', color: 'text.secondary', fontWeight: 500 }}>
                      <span style={{ color: '#7C3AED', fontWeight: 600 }}>Click to upload</span> or drag and drop
                    </Typography>
                    <Typography sx={{ fontSize: '12px', color: 'text.disabled', mt: 0.5 }}>JPG or PNG (max. 800x800px)</Typography>
                  </>
                )}
              </Box>
            </Box>

            {/* Manzil */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.75, color: 'text.primary' }}>Manzil</Typography>
              <TextField fullWidth name="address" type="text" placeholder="Manzilni kiriting"
                size="small" value={createTeacher.address} onChange={getTeacherInfo} />
            </Box>

            {/* Parol */}
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: '14px', mb: 0.75, color: 'text.primary' }}>Parol</Typography>
              <form autoComplete="off" onSubmit={(e) => e.preventDefault()} style={{ margin: 0 }}>
                <TextField fullWidth name="password" type="password" placeholder="Parolni kiriting"
                  size="small" value={createTeacher.password} onChange={getTeacherInfo}
                  autoComplete="new-password" />
              </form>
            </Box>
          </Box>

          <Box sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button onClick={() => { setIsDrawerOpen(false); resetForm(); }}
              sx={{ color: 'text.primary', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', px: 3.5, py: 1, borderRadius: '8px', fontWeight: 600, '&:hover': { bgcolor: 'action.hover', borderColor: 'divider' } }}>
              Bekor qilish
            </Button>
            <Button variant="contained" onClick={handleCreateTeacher} disabled={isSaving}
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
              <Typography sx={{ fontWeight: 700, color: 'text.primary', fontSize: '22px' }}>Guruhga biriktirish</Typography>
              <IconButton onClick={() => setIsGroupModalOpen(false)} sx={{ color: 'text.secondary', p: 0.5, mt: -0.5, mr: -0.5 }}>
                <CloseIcon sx={{ fontSize: 25 }} />
              </IconButton>
            </Box>
            <Typography sx={{ color: 'text.secondary', fontSize: '14px', lineHeight: '13px' }}>Bir yoki bir nechta guruhni tanlang</Typography>

            <TextField fullWidth placeholder="Guruh qidirish..." size="small"
              value={groupSearch} onChange={(e) => setGroupSearch(e.target.value)}
              sx={{ mt: 2, mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '8px', '& fieldset': { borderColor: 'divider' }, '&:hover fieldset': { borderColor: 'divider' }, '&.Mui-focused fieldset': { borderColor: '#7C3AED', borderWidth: '1px' } } }} />

            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '8px', mb: 3, maxHeight: '200px', overflowY: 'auto', overflowX: 'hidden' }}>
              {filteredGroups.map((group, index) => (
                <Box key={group.id} onClick={() => toggleGroup(group.id)}
                  sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: index !== filteredGroups.length - 1 ? '1px solid' : 'none', borderColor: 'divider', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <Checkbox checked={createTeacher.groups.includes(group.id)} disableRipple
                    sx={{ p: 0, mr: 1.5, pointerEvents: 'none', color: 'divider', '&.Mui-checked': { color: '#7C3AED' }, '& .MuiSvgIcon-root': { fontSize: 20 } }} />
                  <Typography sx={{ fontWeight: 500, color: 'text.primary', fontSize: '14px', userSelect: 'none' }}>{group.name}</Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsGroupModalOpen(false)}
                sx={{ bgcolor: 'background.paper', color: 'text.primary', border: '1px solid', borderColor: 'divider', px: 3, py: 1, borderRadius: '8px', fontWeight: 600, '&:hover': { bgcolor: 'action.hover' } }}>
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
          title="O'qituvchini o'chirish"
          onConfirm={handleDeleteConfirm}
        />

        {/* Error Modal */}
        <ErrorModal
          open={errorModal.open}
          onClose={() => setErrorModal({ ...errorModal, open: false })}
          message={errorModal.message}
        />

      </Box>
    </>
  );
}

export default Teacher;
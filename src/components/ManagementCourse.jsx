import React, { useEffect, useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper, IconButton, Drawer, TextField, Select, MenuItem, ThemeProvider, createTheme } from "@mui/material";
import { DeleteOutlined, EditOutlined, Close as CloseIcon } from "@mui/icons-material";
import axiosClient from "../api/axios";
import loading from "../assets/images/loading.gif";
import DeleteConfirmModal from "./DeleteConfirmModal";
import ErrorModal from "./ErrorModal";


const theme = createTheme({
  palette: {
    primary: { main: '#7C3AED' },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
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
          borderColor: '#9ca3af',
          transition: 'border-color 0.3s ease-in-out, border-width 0.3s ease-in-out',
        },
      },
    },
  },
});


const ManagementCourse = () => {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [course, setCourse] = useState([])
  const [courseInfo, setCourseInfo] = useState({
    name: "",
    description: "",
    price: 0,
    duration_month: 0,
    duration_hours: 0
  })
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [editCourseId, setEditCourseId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });
  const [isArchiveView, setIsArchiveView] = useState(false);

  function resetForm() {
    setCourseInfo({ name: "", description: "", price: 0, duration_month: 0, duration_hours: 0 });
    setIsEditing(false);
    setEditCourseId(null);
  }

  useEffect(() => {
    async function getCourse() {
      try{
        const res = await axiosClient.get(isArchiveView ? '/courses/archive' : '/courses')
        if(res.status === 200){
          const data = res.data?.data ?? res.data ?? [];
          startTransition(() => {
            setCourse(Array.isArray(data) ? data : []);
          })
        }
      }
      catch(error){
        console.log(error.message);
        setErrorModal({ open: true, message: `Arxiv ma'lumotlarini yuklashda xatolik: ${error.message}` });
      }
    }
    getCourse()
  },[isArchiveView])

  async function handleCreateCourse() {
    setIsSaving(true);
    try {
      const payload = {
        ...courseInfo,
        price: Number(courseInfo.price),
        duration_month: Number(courseInfo.duration_month),
        duration_hours: Number(courseInfo.duration_hours)
      };

      let res;
      if (isEditing) {
        res = await axiosClient.patch(`/courses/${editCourseId}`, payload);
      } else {
        res = await axiosClient.post('/courses', payload);
      }

      if (res.status === 201 || res.status === 200) {
        setIsDrawerOpen(false);
        resetForm();
        const updated = await axiosClient.get('/courses');
        setCourse(updated.data.data);
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
      setErrorModal({ open: true, message: `Xato: ${error.response?.data?.message || error.message}` });
    } finally {
      setIsSaving(false);
    }
  }

  const handleEditClick = async (id) => {
    try {
      const res = await axiosClient.get(`/courses/one/${id}`);
      const data = res.data?.data || res.data;
      setCourseInfo({
        name: data.name || "",
        description: data.description || "",
        price: data.price || 0,
        duration_month: data.duration_month || 0,
        duration_hours: data.duration_hours || 0
      });
      setEditCourseId(id);
      setIsEditing(true);
      setIsDrawerOpen(true);
    } catch (error) {
      console.error("Ma'lumotni yuklashda xatolik:", error);
      setErrorModal({ open: true, message: "Kurs ma'lumotlarini yuklashda xatolik yuz berdi" });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete?.id) return;
    try {
      const res = await axiosClient.delete(`/courses/${courseToDelete.id}`);
      if (res.status === 200 || res.status === 204) {
        setCourse(prev => prev.filter(c => c.id !== courseToDelete.id));
      }
    } catch (error) {
      console.error("O'chirishda xatolik:", error);
      setErrorModal({ open: true, message: "Kursni o'chirishda xatolik yuz berdi!" });
    } finally {
      setDeleteModalOpen(false);
      setCourseToDelete(null);
    }
  };

  function getInputInfo(e){
    setCourseInfo(prev => ({...prev, [e.target.name]: e.target.value}))
  }
  console.log(course);
  

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ mt: 3, fontFamily: 'Roboto, sans-serif' }}>
        {/* Page Header */}
        <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#111827', mb: 3 }}>
          Boshqarish
        </Typography>

        {/* Tabs */}
        <Box sx={{ display: 'flex', gap: 4, borderBottom: '1px solid #E5E7EB', mb: 4 }}>
          <Box
            component="button"
            onClick={() => navigate("/management/course")}
            sx={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontSize: '15px', fontWeight: 600, color: '#7C3AED', pb: 1.5,
              borderBottom: '3px solid #7C3AED', mb: '-1px'
            }}
          >
            Kurslar
          </Box>
          <Box
            component="button"
            onClick={() => navigate("/management/room")}
            sx={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontSize: '15px', fontWeight: 500, color: '#6B7280', pb: 1.5,
              borderBottom: '3px solid transparent', mb: '-1px',
              transition: 'color 0.2s', '&:hover': { color: '#7C3AED' }
            }}
          >
            Xonalar
          </Box>
          <Box
            component="button"
            sx={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontSize: '15px', fontWeight: 500, color: '#6B7280', pb: 1.5,
              borderBottom: '3px solid transparent', mb: '-1px',
              transition: 'color 0.2s', '&:hover': { color: '#7C3AED' }
            }}
          >
            Xodimlar
          </Box>
        </Box>

        {/* Main Card */}
        <Paper sx={{ height: '480px', bgcolor: '#fff', borderRadius: '12px', p: 3, border: '1px solid #f3f4f6', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' , overflow: 'hidden' }}>
          {/* Card Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontSize: '26px', fontWeight: 700, color: '#111827' }}>
              Kurslar {isArchiveView && <span style={{ color: '#7C3AED', fontSize: '24px' }}>(Arxiv)</span>}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Button
                variant={isArchiveView ? 'contained' : 'outlined'}
                onClick={() => setIsArchiveView(!isArchiveView)}
                sx={{
                  fontWeight: 600, fontSize: '14px', px: 2.5, py: 1,
                  borderRadius: '8px', textTransform: 'none', transition: 'all 0.2s',
                  ...(isArchiveView
                    ? { bgcolor: '#7C3AED', color: '#fff', boxShadow: 'none', '&:hover': { bgcolor: '#5B21B6', boxShadow: 'none' } }
                    : { color: '#333', borderColor: '#e0e0e0', boxShadow: 'none', '&:hover': { borderColor: '#ccc', bgcolor: '#f9f9f9' } }
                  )
                }}
              >
                Arxiv
              </Button>
              <Button
                onClick={() => setIsDrawerOpen(true)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#7C3AED',
                  color: '#fff', fontSize: '14px', fontWeight: 600, px: 2.5, py: 1,
                  borderRadius: '8px', textTransform: 'none', transition: 'all 0.2s',
                  boxShadow: '0 4px 14px 0 rgba(124,58,237,0.2)',
                  '&:hover': { bgcolor: '#6D28D9', boxShadow: '0 4px 14px 0 rgba(124,58,237,0.3)' }
                }}
              >
                <Typography component="span" sx={{ fontSize: '18px', lineHeight: 1 }}>+</Typography>
                Kurslar qo'shish
              </Button>
            </Box>
          </Box>

          {/* Grid */}
          {isPending ? 

          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '395px' }}>
            <img src={loading} alt="loading" width={90} height={90} />
          </Box>
          
          :
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 2 , maxHeight: '395px',  overflowY:'auto', pr:1,
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: '#e5e7eb', borderRadius: '10px' },
            '&::-webkit-scrollbar-thumb:hover': { background: '#d1d5db' },
          }}>
            {course.map((course, index) => (
              <Box
                key={index}
                sx={{ bgcolor: "#F0F5FA" , borderRadius: '16px', p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}
              >
                {/* Title */}
                <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#111827' }}>
                  {course.name ? course.name : 'No name'}

                </Typography>

                {/* Description & Actions */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
                    {course.description ? course.description : 'No description'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => { setCourseToDelete(course); setDeleteModalOpen(true); }} sx={{ color: '#6B7280', transition: 'color 0.2s', '&:hover': { color: '#ef4444' } }}>
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEditClick(course.id)} sx={{ color: '#6B7280', transition: 'color 0.2s', '&:hover': { color: '#7C3AED' } }}>
                      <EditOutlined fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Badges */}
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 0.5 }}>
                  <Box sx={{ bgcolor: '#fff', px: 1.5, py: 0.75, borderRadius: '6px', fontSize: '13px', fontWeight: 700, color: '#374151', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    {course.duration_hours} min
                  </Box>
                  <Box sx={{ bgcolor: '#fff', px: 1.5, py: 0.75, borderRadius: '6px', fontSize: '13px', fontWeight: 700, color: '#374151', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    {course.duration_month} oy
                  </Box>
                  <Box sx={{ bgcolor: '#fff', px: 1.5, py: 0.75, borderRadius: '6px', fontSize: '13px', fontWeight: 700, color: '#374151', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    {course.price}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box> }
        </Paper>




        {/* Add Course Drawer */}
        <Drawer
          anchor="right"
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': { width: { xs: '100%', sm: 450 }, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }
          }}
        >
          {/* Drawer Header */}
          <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid #c9cacdff', position: 'relative' }}>
            <IconButton
              onClick={() => { setIsDrawerOpen(false); resetForm(); }}
              sx={{ position: 'absolute', right: 16, top: 16, color: '#9ca3af', '&:hover': { color: '#111827' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#111827', mb: 0.5 }}>
              {isEditing ? "Kursni tahrirlash" : "Kurs qo'shish"}
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
              {isEditing ? "Bu yerda kurs ma'lumotlarini tahrirlashingiz mumkin." : "Bu yerda siz yangi kurs qo'shishingiz mumkin."}
            </Typography>
          </Box>

          {/* Drawer Body */}
          <Box sx={{ p: 3, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>Nomi</Typography>
              <TextField
                onChange={getInputInfo}
                value={courseInfo.name}
                fullWidth
                placeholder="HR Manager..."
                size="small"
                name="name"
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>Dars davomiyligi</Typography>
              <Select
                onChange={getInputInfo}
                value={courseInfo.duration_hours || ""}
                name="duration_hours"
                fullWidth
                size="small"
                displayEmpty
              >
                <MenuItem value="" disabled sx={{ display: 'none' }}></MenuItem>
                <MenuItem value="60">60 min</MenuItem>
                <MenuItem value="90">90 min</MenuItem>
                <MenuItem value="120">120 min</MenuItem>
              </Select>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>Kurs davomiyligi (oylarda)</Typography>
              <Select
                onChange={getInputInfo}
                value={courseInfo.duration_month || ""}
                name="duration_month"
                fullWidth
                size="small"
                displayEmpty
              >
                <MenuItem value="" disabled sx={{ display: 'none' }}></MenuItem>
                <MenuItem value="1">1 oy</MenuItem>
                <MenuItem value="3">3 oy</MenuItem>
                <MenuItem value="6">6 oy</MenuItem>
              </Select>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>Narx</Typography>
              <TextField
                onChange={getInputInfo}
                value={courseInfo.price}
                name="price"
                fullWidth
                placeholder="Narxini kiriting"
                size="small"
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>Description</Typography>
              <TextField
                onChange={getInputInfo}
                value={courseInfo.description}
                name="description"
                fullWidth
                placeholder="A little about the company and the team that you'll be working with."
                multiline
                rows={4}
              />
              <Typography sx={{ fontSize: '12px', color: '#6B7280', mt: 1 }}>
                This is a hint text to help user.
              </Typography>
            </Box>
          </Box>

          {/* Drawer Footer */}
          <Box sx={{ px: 3, py: 2, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              onClick={() => { setIsDrawerOpen(false); resetForm(); }}
              sx={{
                color: '#1f2937',
                bgcolor: '#fff',
                border: '1px solid #e5e7eb',
                textTransform: 'none',
                px: 3.5,
                py: 1,
                borderRadius: '8px',
                fontWeight: 600,
                transition: 'all 0.2s',
                '&:hover': { bgcolor: '#f9fafb', borderColor: '#d1d5db' }
              }}
            >
              Bekor qilish
            </Button>
            <Button
              onClick={handleCreateCourse}
              variant="contained"
              disabled={isSaving}
              sx={{
                bgcolor: '#8b5cf6',
                color: '#fff',
                textTransform: 'none',
                px: 4,
                py: 1,
                borderRadius: '8px',
                fontWeight: 600,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#7c3aed', boxShadow: 'none' },
                '&.Mui-disabled': { bgcolor: '#c4b5fd', color: '#fff' }
              }}
            >
              {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </Box>
        </Drawer>

        {/* Delete Modal */}
        <DeleteConfirmModal
          open={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Kursni o'chirish"
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
};

export default ManagementCourse;

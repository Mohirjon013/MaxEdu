import React, { useEffect, useState, useTransition } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper, IconButton, Drawer, TextField, Select, MenuItem, ThemeProvider, createTheme } from "@mui/material";
import { DeleteOutlined, EditOutlined, Close as CloseIcon } from "@mui/icons-material";
import axiosClient from "../api/axios";
import loading from "../assets/images/loading.gif";


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
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    async function getCourse() {
      try{
        const res = await axiosClient.get('/courses')
        if(res.status === 200){
          startTransition(() => {
            setCourse(res.data.data)
          })
        }
      }
      catch(error){
        console.log(error.message);
      }
    }
    getCourse()
  },[])

  async function handleCreateCourse() {
    try{
      const res = await axiosClient.post('/courses', courseInfo)
      if(res.status === 201){
        setIsDrawerOpen(false)
        setCourse((prev) => [...prev, courseInfo])
      }
    }
    catch(error){
      console.log(error.message);
    }
  }



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
              Kurslar
            </Typography>
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
                    <IconButton size="small" sx={{ color: '#6B7280', transition: 'color 0.2s', '&:hover': { color: '#ef4444' } }}>
                      <DeleteOutlined fontSize="small" />
                    </IconButton>
                    <IconButton size="small" sx={{ color: '#6B7280', transition: 'color 0.2s', '&:hover': { color: '#7C3AED' } }}>
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
              onClick={() => setIsDrawerOpen(false)}
              sx={{ position: 'absolute', right: 16, top: 16, color: '#9ca3af', '&:hover': { color: '#111827' } }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#111827', mb: 0.5 }}>
              Kurs qo'shish
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
              Bu yerda siz yangi kurs qo'shishingiz mumkin.
            </Typography>
          </Box>

          {/* Drawer Body */}
          <Box sx={{ p: 3, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>Nomi</Typography>
              <TextField
                onChange={getInputInfo}
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
                name="duration_hours"
                fullWidth
                size="small"
                displayEmpty
                defaultValue=""

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
                name="duration_month"
                fullWidth
                size="small"
                displayEmpty
                defaultValue=""

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
              onClick={() => setIsDrawerOpen(false)}
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
              sx={{
                bgcolor: '#8b5cf6',
                color: '#fff',
                textTransform: 'none',
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
      </Box>
    </ThemeProvider>
  );
};

export default ManagementCourse;

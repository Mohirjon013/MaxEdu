import React, { useState, useRef } from 'react';
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
  Checkbox,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  ThemeProvider,
  createTheme,
  Drawer,
  Dialog,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CloseIcon from '@mui/icons-material/Close';
import UploadOutlinedIcon from '@mui/icons-material/UploadOutlined';

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
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#d1d5db',
          '&.Mui-checked': {
            color: '#7C3AED',
          },
        },
      },
    },
  },
});

const students = [
  {
    id: 1,
    name: 'Ali Valiyev',
    avatar: 'https://i.pravatar.cc/150?img=11',
    initials: '',
    groups: ['N26', 'n105'],
    phone: '+998976541223',
    email: 'ali@gmail.com',
    dob: '12.12.2010',
    address: 'Sirdaryo',
    createdAt: '12.05.2026',
  },
  {
    id: 2,
    name: 'Salim Qodirov',
    avatar: '',
    initials: 'S',
    groups: ['n105'],
    phone: '+998977777777',
    email: 'salim@gmail.com',
    dob: '14.01.2007',
    address: 'Buxoro',
    createdAt: '14.05.2026',
  },
  {
    id: 3,
    name: 'Bobur',
    avatar: '',
    initials: 'B',
    groups: ['n105'],
    phone: '+998999999999',
    email: 'bobur@gmail.com',
    dob: '14.03.2002',
    address: 'Toshkent',
    createdAt: '14.05.2026',
  },
  {
    id: 4,
    name: 'Qodir Salimov',
    avatar: '',
    initials: 'Q',
    groups: ['n105'],
    phone: '+998911111111',
    email: 'qodir@gmail.com',
    dob: '29.04.2026',
    address: "O'zbekcha",
    createdAt: '14.05.2026',
  },
];

function Student() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [phone, setPhone] = useState('+998 ');
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [groupSearch, setGroupSearch] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(URL.createObjectURL(file));
  };

  const availableGroups = ['N26', 'n105'];
  const filteredGroups = availableGroups.filter(g =>
    g.toLowerCase().includes(groupSearch.toLowerCase())
  );

  const toggleGroup = (group) => {
    setSelectedGroups(prev =>
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith('+998 ')) {
      if (val.startsWith('+998')) {
        val = '+998 ' + val.slice(4).trimStart();
      } else {
        val = '+998 ';
      }
    }
    setPhone(val);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ mt: 3 }}>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#111827', fontSize: '28px', mb: 1 }}>
              Talabalar
            </Typography>
            <Typography sx={{ color: '#6b7280', fontSize: '14px' }}>
              Ushbu sahifada siz Talabalar ro'yxatini va ularning ma'lumotlarini topasiz. Har bir Talaba ismi, fanlari va aloqa ma'lumotlari keltirilgan.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsDrawerOpen(true)}
            sx={{
              px: 2, py: 0.8, fontWeight: 600, fontSize: '14px', borderRadius: '8px',
              boxShadow: 'none', transition: 'all 0.3s ease', whiteSpace: 'nowrap',
              '&:hover': { bgcolor: '#5B21B6', boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.39)' }
            }}
          >
            <span style={{ fontSize: '18px', marginRight: '6px', lineHeight: 1 }}>+</span>
            Talaba qo'shish
          </Button>
        </Box>

        {/* Table Container */}
        <Paper sx={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #f3f4f6' }}>

          {/* Toolbar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #f3f4f6' }}>
            <TextField
              placeholder="Search"
              size="small"
              sx={{
                width: '280px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: '#f9fafb',
                  '& fieldset': { borderColor: '#e5e7eb' },
                  '&:hover fieldset': { borderColor: '#d1d5db' },
                  '&.Mui-focused fieldset': { borderColor: '#7C3AED', borderWidth: '1px' },
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#9ca3af', fontSize: '20px' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon sx={{ fontSize: '18px !important' }} />}
                sx={{
                  color: '#374151', borderColor: '#e5e7eb', fontWeight: 500, fontSize: '13px', px: 2, py: 0.6,
                  '&:hover': { bgcolor: '#f9fafb', borderColor: '#d1d5db' }
                }}
              >
                Filters
              </Button>
              <Button
                variant="outlined"
                sx={{
                  color: '#374151', borderColor: '#e5e7eb', fontWeight: 500, fontSize: '13px', px: 2, py: 0.6,
                  '&:hover': { bgcolor: '#f9fafb', borderColor: '#d1d5db' }
                }}
              >
                Arxiv
              </Button>
            </Box>
          </Box>

          {/* Table */}
          <TableContainer>
            <Table sx={{ minWidth: 700 }} size="small">
              <TableHead sx={{ bgcolor: '#f9fafb' }}>
                <TableRow sx={{ '& th': { py: '6px', px: 1 } }}>
                  <TableCell sx={{ width: 40 }}>
                    <Checkbox size="small" />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#4b5563', fontSize: '13px', px: 1 }}>
                    Nomi <ArrowDownwardIcon sx={{ fontSize: '14px', verticalAlign: 'middle', ml: 0.5, color: '#9ca3af' }} />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#4b5563', fontSize: '13px', px: 1 }}>Guruh</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#4b5563', fontSize: '13px', px: 1 }}>Telefon</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#4b5563', fontSize: '13px', px: 1 }}>Email</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#4b5563', fontSize: '13px', px: 1 }}>Tug'ilgan</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#4b5563', fontSize: '13px', px: 1 }}>Manzil</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#4b5563', fontSize: '13px', px: 1 }}>Sana</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: '#4b5563', fontSize: '13px', px: 1 }}>Amallar</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} hover sx={{ '& td': { borderBottom: '1px solid #f3f4f6', py: 1, px: 1 } }}>
                    <TableCell>
                      <Checkbox size="small" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={student.avatar}
                          sx={{
                            width: 32, height: 32, fontSize: '13px', fontWeight: 600,
                            bgcolor: student.avatar ? 'transparent' : '#ede9fe',
                            color: '#6d28d9',
                          }}
                        >
                          {student.initials}
                        </Avatar>
                        <Typography sx={{ fontWeight: 500, color: '#111827', fontSize: '13px', whiteSpace: 'nowrap' }}>
                          {student.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ maxWidth: 150 }}>
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {student.groups.map(g => (
                          <Chip key={g} label={g} size="small" sx={{ bgcolor: '#f3f4f6', color: '#4b5563', fontWeight: 500, fontSize: '12px', borderRadius: '6px', height: '24px' }} />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#4b5563', fontSize: '13px', whiteSpace: 'nowrap' }}>{student.phone}</TableCell>
                    <TableCell align="center" sx={{ color: '#4b5563', fontSize: '13px', wordBreak: 'break-word', maxWidth: 180 }}>{student.email}</TableCell>
                    <TableCell align="center" sx={{ color: '#4b5563', fontSize: '13px', whiteSpace: 'nowrap' }}>{student.dob}</TableCell>
                    <TableCell align="center" sx={{ color: '#4b5563', fontSize: '13px', maxWidth: 120 }}>{student.address}</TableCell>
                    <TableCell align="center" sx={{ color: '#4b5563', fontSize: '13px', whiteSpace: 'nowrap' }}>{student.createdAt}</TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                        <IconButton size="small" sx={{ color: '#6b7280' }}><VisibilityOutlinedIcon sx={{ fontSize: '18px' }} /></IconButton>
                        <IconButton size="small" sx={{ color: '#6b7280' }}><DeleteOutlineOutlinedIcon sx={{ fontSize: '18px' }} /></IconButton>
                        <IconButton size="small" sx={{ color: '#7C3AED' }}><ModeEditOutlineOutlinedIcon sx={{ fontSize: '18px' }} /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: '1px solid #f3f4f6' }}>
            <Button
              variant="outlined"
              sx={{ color: '#374151', borderColor: '#e5e7eb', fontSize: '13px', fontWeight: 500, textTransform: 'none' }}
            >
              &larr; Previous
            </Button>
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <Button sx={{ minWidth: '32px', height: '32px', p: 0, bgcolor: '#f3f4f6', color: '#111827', fontWeight: 600, borderRadius: '6px' }}>1</Button>
              <Button sx={{ minWidth: '32px', height: '32px', p: 0, color: '#4b5563', fontWeight: 500, borderRadius: '6px' }}>2</Button>
              <Button sx={{ minWidth: '32px', height: '32px', p: 0, color: '#4b5563', fontWeight: 500, borderRadius: '6px' }}>3</Button>
              <Typography sx={{ color: '#9ca3af', px: 1, display: 'flex', alignItems: 'center' }}>...</Typography>
              <Button sx={{ minWidth: '32px', height: '32px', p: 0, color: '#4b5563', fontWeight: 500, borderRadius: '6px' }}>8</Button>
              <Button sx={{ minWidth: '32px', height: '32px', p: 0, color: '#4b5563', fontWeight: 500, borderRadius: '6px' }}>9</Button>
              <Button sx={{ minWidth: '32px', height: '32px', p: 0, color: '#4b5563', fontWeight: 500, borderRadius: '6px' }}>10</Button>
            </Box>
            <Button
              variant="outlined"
              sx={{ color: '#374151', borderColor: '#e5e7eb', fontSize: '13px', fontWeight: 500, textTransform: 'none' }}
            >
              Next &rarr;
            </Button>
          </Box>
        </Paper>

      </Box>

      {/* Add Student Drawer */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sx={{ zIndex: 9999, '& .MuiDrawer-paper': { width: { xs: '100%', sm: 450 }, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' } }}
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
            Talaba qo'shish
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#6B7280' }}>
            Bu yerda siz yangi Talaba qo'shishingiz mumkin.
          </Typography>
        </Box>

        {/* Drawer Body */}
        <Box sx={{ p: 3, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Telefon raqam */}
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>Telefon raqam</Typography>
            <TextField
              fullWidth
              type="tel"
              placeholder="+998 XX XXX XX XX"
              value={phone}
              onChange={handlePhoneChange}
              size="small"

            />
          </Box>

          {/* Mail */}
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>Mail</Typography>
            <TextField
              fullWidth
              type="email"
              placeholder="Elektron pochtani kiriting"
              size="small"

            />
          </Box>

          {/* Talaba FIO */}
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>Talaba FIO</Typography>
            <TextField
              fullWidth
              type="text"
              placeholder="Ma'lumotni kiriting"
              size="small"

            />
          </Box>

          {/* Tug'ilgan sanasi */}
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>Tug'ilgan sanasi</Typography>
            <TextField
              fullWidth
              type="date"
              size="small"

            />
          </Box>

          {/* Manzil */}
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>Manzil</Typography>
            <TextField
              fullWidth
              type="text"
              placeholder="Manzilni kiriting"
              size="small"

            />
          </Box>

          {/* Parol */}
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>Parol</Typography>
            <TextField
              fullWidth
              type="password"
              placeholder="Parolni kiriting"
              size="small"

            />
          </Box>

          {/* Guruh */}
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>Guruh</Typography>
            <Box sx={{
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              p: selectedGroups.length > 0 ? 1.5 : 0,
              minHeight: '42px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}>
              {selectedGroups.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                  {selectedGroups.map(g => (
                    <Chip
                      key={g}
                      label={g}
                      color="primary"
                      onDelete={() => toggleGroup(g)}
                      size="small"
                      sx={{
                        bgcolor: '#ede7f6',
                        color: '#7C3AED',
                        fontWeight: 500,
                        borderRadius: '16px',
                        '& .MuiChip-deleteIcon': { color: '#7C3AED', '&:hover': { color: '#5B21B6' } }
                      }}
                    />
                  ))}
                </Box>
              )}
              <Button
                variant={selectedGroups.length > 0 ? 'text' : 'outlined'}
                fullWidth
                onClick={() => setIsGroupModalOpen(true)}
                sx={{
                  justifyContent: 'flex-start',
                  color: '#7C3AED',
                  borderColor: 'transparent',
                  p: selectedGroups.length > 0 ? 0 : 1.5,
                  borderRadius: selectedGroups.length > 0 ? 0 : '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  '&:hover': {
                    borderColor: 'transparent',
                    bgcolor: selectedGroups.length > 0 ? 'transparent' : '#f9fafb'
                  }
                }}
              >
                <span style={{ fontSize: '18px', marginRight: '8px', lineHeight: 1 }}>+</span>
                Guruh qo'shish
              </Button>
            </Box>
          </Box>

          {/* Surati */}
          <Box>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#111827', mb: 1 }}>Surati</Typography>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <Box
              onClick={() => fileInputRef.current.click()}
              sx={{
                border: '1px dashed #d1d5db',
                borderRadius: '8px',
                p: 3,
                textAlign: 'center',
                bgcolor: '#fbfcfd',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { borderColor: '#7C3AED', bgcolor: '#faf5ff' }
              }}
            >
              {selectedImage ? (
                <img src={selectedImage} alt="preview" style={{ maxHeight: 110, maxWidth: '100%', borderRadius: 8, objectFit: 'cover' }} />
              ) : (
                <>
                  <UploadOutlinedIcon sx={{ color: '#9ca3af', fontSize: 28, mb: 1 }} />
                  <Typography sx={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                    <span style={{ color: '#7C3AED', fontWeight: 600 }}>Click to upload</span> or drag and drop
                  </Typography>
                  <Typography sx={{ fontSize: '11px', color: '#9ca3af', mt: 0.5 }}>
                    JPG or PNG (max. 2 MB)
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Bottom Actions */}
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

      {/* Add Group Modal */}
      <Dialog
        open={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        sx={{ zIndex: 99999 }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflow: 'hidden',
            m: 2
          }
        }}
      >
        <Box sx={{ p: 2, width: '500px', overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
            <Typography sx={{ fontWeight: 700, color: '#111827', fontSize: '22px' }}>
              Guruhga biriktirish
            </Typography>
            <IconButton onClick={() => setIsGroupModalOpen(false)} sx={{ color: '#9CA3AF', p: 0.5, mt: -0.5, mr: -0.5 }}>
              <CloseIcon sx={{ fontSize: 25 }} />
            </IconButton>
          </Box>

          <Typography sx={{ color: '#6B7280', fontSize: '14px' }}>
            Bir yoki bir nechta guruhni tanlang
          </Typography>

          <TextField
            fullWidth
            placeholder="Guruh qidirish..."
            size="small"
            value={groupSearch}
            onChange={(e) => setGroupSearch(e.target.value)}
            sx={{
              mt: 2, mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '& fieldset': { borderColor: '#E5E7EB' },
                '&:hover fieldset': { borderColor: '#E5E7EB' },
                '&.Mui-focused fieldset': { borderColor: '#7C3AED', borderWidth: '1px' },
              },
            }}
          />

          <Box sx={{
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            mb: 3,
            maxHeight: '200px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}>
            {filteredGroups.map((group, index) => (
              <Box
                key={group}
                onClick={() => toggleGroup(group)}
                sx={{
                  display: 'flex', alignItems: 'center',
                  px: 2, py: 1.5,
                  borderBottom: index !== filteredGroups.length - 1 ? '1px solid #E5E7EB' : 'none',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#F9FAFB' },
                }}
              >
                <Checkbox
                  checked={selectedGroups.includes(group)}
                  disableRipple
                  sx={{
                    p: 0, mr: 1.5, pointerEvents: 'none',
                    color: '#D1D5DB',
                    '&.Mui-checked': { color: '#7C3AED' },
                    '& .MuiSvgIcon-root': { fontSize: 20 },
                  }}
                />
                <Typography sx={{ fontWeight: 500, color: '#111827', fontSize: '14px', userSelect: 'none' }}>
                  {group}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              onClick={() => setIsGroupModalOpen(false)}
              sx={{
                bgcolor: '#fff', color: '#374151',
                border: '1px solid #E5E7EB',
                px: 3, py: 1, borderRadius: '8px',
                fontWeight: 600, boxShadow: 'none',
                '&:hover': { bgcolor: '#F9FAFB' },
              }}
            >
              Bekor qilish
            </Button>
            <Button
              variant="contained"
              onClick={() => setIsGroupModalOpen(false)}
              sx={{
                bgcolor: '#7C3AED', color: '#fff',
                px: 3, py: 1, borderRadius: '8px',
                fontWeight: 600, boxShadow: 'none',
                '&:hover': { bgcolor: '#5B21B6', boxShadow: 'none' },
              }}
            >
              Qo'shish
            </Button>
          </Box>
        </Box>
      </Dialog>

    </ThemeProvider>
  );
}

export default Student;

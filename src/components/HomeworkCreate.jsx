import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Button, IconButton, TextField, MenuItem, Select, Paper, Divider, CircularProgress } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import StrikethroughSIcon from '@mui/icons-material/StrikethroughS';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import CodeIcon from '@mui/icons-material/Code';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import axiosClient from '../api/axios';
import ErrorModal from './ErrorModal';

function HomeworkCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [topics, setTopics] = useState([]);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ open: false, message: '' });

  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await axiosClient.get(`/lessons/my/group/${id}`);
        const data = res.data?.data || res.data || [];
        setTopics(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Mavzularni yuklashda xatolik:", error);
      }
    }
    fetchTopics();
  }, [id]);

  const onBack = () => {
    navigate(`/dashboard/groups/${id}?tab=1`);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!topic || !description) {
      setErrorModal({ open: true, message: "Iltimos, mavzu va sarlavhani kiriting." });
      return;
    }
    
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('lesson_id', Number(topic));
      formData.append('group_id', Number(id));
      formData.append('title', description);
      if (file) {
        formData.append('file', file);
      }

      await axiosClient.post('/homework', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      onBack();
    } catch (error) {
      console.error("Vazifa yaratishda xatolik:", error.response?.data || error);
      setErrorModal({ open: true, message: "Xatolik yuz berdi: " + (error.response?.data?.message || error.message) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <IconButton onClick={onBack} sx={{ color: '#111827' }}>
          <ArrowBackIosNewIcon fontSize="small" sx={{ fontWeight: 700 }} />
        </IconButton>
        <Typography sx={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
          Yangi uyga vazifa yaratish
        </Typography>
      </Box>

      {/* Form */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>

        {/* Mavzu */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
            <span style={{ color: '#ef4444' }}>*</span> Mavzu
          </Typography>
          <Select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            displayEmpty
            size="small"
            MenuProps={{
              slotProps: {
                paper: {
                  elevation: 3,
                  sx: {
                    mt: 0.5,
                    borderRadius: '6px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    '& .MuiList-root': { padding: 0 },
                  }
                }
              }
            }}
            sx={{
              borderRadius: '6px',
              bgcolor: '#fff',
              fontSize: '15px',
              height: '42px',
              color: topic ? '#1e293b' : '#94a3b8',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#cbd5e1' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#2563eb' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#2563eb', borderWidth: '2px' },
            }}
          >
            <MenuItem value="" disabled sx={{ color: '#94a3b8', fontSize: '15px', py: 1.2 }}>Mavzulardan birini tanlang</MenuItem>
            {topics.map((t, index) => (
              <MenuItem key={t.id || index} value={t.id || t.lesson_id} sx={{ fontSize: '15px', py: 1.2 }}>
                {t.title || t.topic || t.name || 'Nomsiz mavzu'}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Izoh (Rich Text Editor Mock) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
            <span style={{ color: '#ef4444' }}>*</span> Sarlavha
          </Typography>
          <Paper variant="outlined" sx={{ borderRadius: '8px', borderColor: '#e2e8f0', overflow: 'hidden' }}>
            {/* Toolbar */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
              <Button sx={{ minWidth: 0, color: '#475569', fontWeight: 600 }}>H1</Button>
              <Button sx={{ minWidth: 0, color: '#475569', fontWeight: 600 }}>H2</Button>
              <Select size="small" defaultValue="sans" sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, color: '#475569', fontWeight: 500, height: 32 }}>
                <MenuItem value="sans">Sans Serif</MenuItem>
                <MenuItem value="serif">Serif</MenuItem>
              </Select>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
              <Select size="small" defaultValue="normal" sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' }, color: '#475569', fontWeight: 500, height: 32 }}>
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="large">Large</MenuItem>
              </Select>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
              <IconButton size="small" sx={{ color: '#475569' }}><FormatBoldIcon fontSize="small" /></IconButton>
              <IconButton size="small" sx={{ color: '#475569' }}><FormatItalicIcon fontSize="small" /></IconButton>
              <IconButton size="small" sx={{ color: '#475569' }}><FormatUnderlinedIcon fontSize="small" /></IconButton>
              <IconButton size="small" sx={{ color: '#475569' }}><StrikethroughSIcon fontSize="small" /></IconButton>
              <IconButton size="small" sx={{ color: '#475569' }}><FormatQuoteIcon fontSize="small" /></IconButton>
              <IconButton size="small" sx={{ color: '#475569' }}><CodeIcon fontSize="small" /></IconButton>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5, my: 0.5 }} />
              <IconButton size="small" sx={{ color: '#475569' }}><FormatListBulletedIcon fontSize="small" /></IconButton>
              <IconButton size="small" sx={{ color: '#475569' }}><FormatListNumberedIcon fontSize="small" /></IconButton>
              <IconButton size="small" sx={{ color: '#475569' }}><FormatAlignLeftIcon fontSize="small" /></IconButton>
              <IconButton size="small" sx={{ color: '#475569' }}><FormatAlignCenterIcon fontSize="small" /></IconButton>
              <IconButton size="small" sx={{ color: '#475569' }}><InsertLinkIcon fontSize="small" /></IconButton>
            </Box>
            {/* Editor Area */}
            <TextField
              multiline
              rows={8}
              fullWidth
              placeholder="Vazifa haqida batafsil ma'lumot kiriting..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { border: 'none' },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: '#94a3b8',
                  opacity: 1,
                }
              }}
            />
          </Paper>
        </Box>

        {/* File Upload Area */}
        <Box
          onClick={() => fileInputRef.current?.click()}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #cbd5e1',
            borderRadius: '12px',
            bgcolor: 'white',
            py: 6,
            gap: 2,
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: '#10b981',
              bgcolor: '#ecfdf5',
            }
          }}
        >
          <input
            type="file"
            hidden
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <CloudUploadIcon sx={{ fontSize: 48, color: '#10b981' }} />
          <Typography sx={{ color: '#64748b', fontSize: '15px', fontWeight: 500 }}>
            {file ? file.name : "Faylni tanlash yoki shu yerga tashlang (Ixtiyoriy)"}
          </Typography>
        </Box>

        {/* Footer Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button
            onClick={onBack}
            disabled={loading}
            variant="outlined"
            sx={{
              color: '#475569',
              borderColor: '#e2e8f0',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '15px',
              borderRadius: '10px',
              px: 4,
              py: 1,
              '&:hover': {
                bgcolor: '#f8fafc',
                borderColor: '#cbd5e1',
              }
            }}
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            variant="contained"
            sx={{
              bgcolor: '#10b981',
              color: '#fff',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '15px',
              borderRadius: '10px',
              px: 4,
              py: 1,
              boxShadow: '0px 1px 3px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#059669',
                boxShadow: '0px 3px 4px rgba(16, 185, 129, 0.5)',
              },
              '&:active': {
                boxShadow: '0px 1px 2px rgba(16, 185, 129, 0.4)',
              },
              '&.Mui-disabled': {
                bgcolor: '#a7f3d0',
                color: '#fff',
              }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "E'lon qilish"}
          </Button>
        </Box>

      </Box>
      <ErrorModal
        open={errorModal.open}
        onClose={() => setErrorModal({ open: false, message: '' })}
        message={errorModal.message}
      />
    </Box>
  );
}

export default HomeworkCreate;

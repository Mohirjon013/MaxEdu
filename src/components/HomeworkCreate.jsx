import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Button, IconButton, TextField, MenuItem, Select, Paper, Divider } from '@mui/material';
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

function HomeworkCreate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [topics, setTopics] = useState([]);

  useEffect(() => {
    async function fetchTopics() {
      try {
        const res = await axiosClient.get('/homework/all');
        const data = res.data?.data || res.data || [];
        setTopics(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Mavzularni yuklashda xatolik:", error);
      }
    }
    fetchTopics();
  }, []);

  const onBack = () => {
    navigate(`/dashboard/groups/${id}?tab=1`);
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
              PaperProps: {
                elevation: 3,
                sx: {
                  mt: 0.5,
                  borderRadius: '6px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  '& .MuiList-root': { padding: 0 },
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
              <MenuItem key={t.id || index} value={t.id || t.title} sx={{ fontSize: '15px', py: 1.2 }}>
                {t.title || 'Nomsiz mavzu'}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Izoh (Rich Text Editor Mock) */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
            <span style={{ color: '#ef4444' }}>*</span> Izoh
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
          <CloudUploadIcon sx={{ fontSize: 48, color: '#10b981' }} />
          <Typography sx={{ color: '#64748b', fontSize: '15px', fontWeight: 500 }}>
            Faylni tanlash yoki shu yerga tashlang
          </Typography>
        </Box>

        {/* Footer Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
          <Button
            onClick={onBack}
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
              }
            }}
          >
            E'lon qilish
          </Button>
        </Box>

      </Box>
    </Box>
  );
}

export default HomeworkCreate;

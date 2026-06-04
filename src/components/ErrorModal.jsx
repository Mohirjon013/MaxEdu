import React from 'react';
import { Dialog, Box, Typography, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';

const ErrorModal = ({ open, onClose, message, title = "Xatolik yuz berdi" }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      style={{ zIndex: 99999 }}
      slotProps={{
        backdrop: { invisible: true },
        paper: {
          sx: {
            borderRadius: '16px',
            width: '400px',
            maxWidth: '400px',
            overflow: 'hidden',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)'
          }
        }
      }}
    >
      <Box sx={{ position: 'relative', width: '400px', p: 3, pt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: '#9CA3AF', '&:hover': { color: '#111827', bgcolor: '#F3F4F6' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Box sx={{
          width: 60, height: 60, borderRadius: '50%', bgcolor: '#FEF2F2',
          display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2
        }}>
          <ErrorOutlineIcon sx={{ fontSize: 32, color: '#EF4444' }} />
        </Box>

        <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#111827', mb: 1 }}>
          {title}
        </Typography>

        <Typography sx={{ fontSize: '15px', color: '#6B7280', mb: 3, lineHeight: 1.5 }}>
          {message}
        </Typography>

        <Button
          variant="contained"
          fullWidth
          onClick={onClose}
          sx={{
            bgcolor: '#EF4444',
            color: '#fff',
            py: 1.2,
            borderRadius: '10px',
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '15px',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#DC2626', boxShadow: 'none' }
          }}
        >
          Tushunarli
        </Button>
      </Box>
    </Dialog>
  );
};

export default ErrorModal;

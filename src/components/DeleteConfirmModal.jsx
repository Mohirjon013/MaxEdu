import React from 'react';
import { Dialog, Box, Typography, Button } from '@mui/material';

function DeleteConfirmModal({ open, onClose, onConfirm, title }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: { sx: { borderRadius: '8px' } }
      }}
    >
      <Box sx={{ p: 2, py: 1.5, width: "310px" }}>
        <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#111827', mb: 2 }}>
          {title || "Ma'lumotni o'chirish"}
        </Typography>
        <Typography sx={{ fontSize: '14px', color: '#374151', mb: 4 }}>
          Rostdan ham o'chirishni hohlaysizmi?
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '14px',
              borderRadius: '6px',
              borderColor: '#D1D5DB',
              px: 2,
              bgcolor: 'transparent',
              borderColor: '#9CA3AF',
              color: '#374151'
            }}
          >
            Bekor qilish
          </Button>
          <Button
            variant="contained"
            onClick={onConfirm}
            sx={{
              bgcolor: '#DC2626',
              color: '#fff',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '6px',
              px: 3,
              fontSize: '14px',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' }
            }}
          >
            Ha
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

export default DeleteConfirmModal;

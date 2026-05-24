import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

function Loader({ fullScreen = false }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: fullScreen ? '100vh' : '100%',
        minHeight: fullScreen ? '100vh' : '200px',
        width: '100%',
        gap: 2,
      }}
    >
      <CircularProgress size={40} sx={{ color: '#7C3AED' }} thickness={4} />

    </Box>
  );
}

export default Loader;

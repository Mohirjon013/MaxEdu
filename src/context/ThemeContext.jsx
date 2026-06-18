import React, { createContext, useState, useMemo } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';

export const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#5a3cd9',
          },
          background: {
            default: mode === 'light' ? '#F9FAFB' : '#111827',
            paper: mode === 'light' ? '#FFFFFF' : '#1F2937',
          },
          text: {
            primary: mode === 'light' ? '#111827' : '#F9FAFB',
            secondary: mode === 'light' ? '#6B7280' : '#9CA3AF',
          },
          divider: mode === 'light' ? '#E5E7EB' : '#374151',
        },
        typography: {
          fontFamily: 'Roboto, sans-serif',
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

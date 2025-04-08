import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';

const UserLayout = ({ children }) => {
  const location = useLocation();

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          backgroundColor: '#fff',
          borderRadius: 2,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          minHeight: 'calc(100vh - 140px)'
        }}
      >
        {children}
      </Paper>
    </Container>
  );
};

export default UserLayout; 
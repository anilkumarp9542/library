import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f1f1f1',
        padding: '10px 20px',
        height: '60px',
        borderTop: '1px solid #ddd',
      }}
    >
      <Typography variant="body2" sx={{ color: '#555' }}>
        Developed by <strong>Anil Kumar</strong> @ Vegrow | January 2025
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <img src="/rails.svg" alt="Ruby on Rails" width="35px" height="35px" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <img src="/Go-Logo_LightBlue.svg" alt="Golang" width="35px" height="35px" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <img src="/react.svg" alt="React" width="35px" height="35px" />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <img src="/mysql.svg" alt="MySQL" width="35px" height="35px" />
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;

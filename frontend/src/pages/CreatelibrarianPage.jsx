import React from 'react';
import { Box, Typography } from '@mui/material';
import CreateLibrarian from '../components/CreateLibrarian';
const CreatelibrarianPage = () => {
  return (
    <Box p={4}>
      <Typography variant="h4" align="center" gutterBottom>
        Create Librarian
      </Typography>
      <Box mt={4}>
        <CreateLibrarian />
      </Box>
    </Box>
  );
};

export default CreatelibrarianPage;

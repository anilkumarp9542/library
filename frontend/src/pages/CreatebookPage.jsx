import React from 'react';
import { Box, Typography } from '@mui/material';
import CreateBook from '../components/CreateBook';

const CreatebookPage = () => {
  return (
    <Box p={4}>
      <Typography variant="h4" align="center" gutterBottom>
        Create Book
      </Typography>
      <Box mt={4}>
        <CreateBook  />
      </Box>
    </Box>
  );
};

export default CreatebookPage;

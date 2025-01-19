import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Button,
} from '@mui/material';
import { viewBorrowHistory, returnBook } from '../services/api';

const ReturnBookPage = () => {
  const [records, setRecords] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    fetchBorrowingRecords(1, recordsPerPage, searchQuery);
  }, [searchQuery]);

  const fetchBorrowingRecords = async (page, limit, search = '') => {
    try {
      const response = await viewBorrowHistory();
      const filteredRecords = response.data
        .filter((record) => !record.returned_on) // Only active borrowing records
        .filter((record) =>
          Object.values(record).some((value) =>
            value?.toString().toLowerCase().includes(search.toLowerCase())
          )
        );
      const paginatedRecords = filteredRecords.slice((page - 1) * limit, page * limit);
      if (page === 1) {
        setRecords(paginatedRecords);
      } else {
        setRecords((prevRecords) => [...prevRecords, ...paginatedRecords]);
      }
      setTotalRecords(filteredRecords.length);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to fetch borrowing records');
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleViewMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchBorrowingRecords(nextPage, recordsPerPage, searchQuery);
  };

  const handleReturn = async (bookId) => {
    try {
      await returnBook(bookId);
      alert('Book returned successfully!');
      setRecords((prevRecords) => prevRecords.filter((record) => record.book_id !== bookId)); // Remove returned record from frontend
    } catch (error) {
      console.error('Error returning book:', error);
      alert(error.response?.data?.error || 'Failed to return book');
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h3" textAlign="center" mb={4}>
        Active Borrowing Records
      </Typography>

      <Box mb={4}>
        <TextField
          fullWidth
          label="Search Records"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by Username, Book Title, etc."
        />
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Book Id</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Book Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Borrowed On</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {records.length > 0 ? (
              records.map((record) => (
                <TableRow key={record.book_id}>
                  <TableCell>{record.book_id}</TableCell>
                  <TableCell>{record.username}</TableCell>
                  <TableCell>{record.book_title}</TableCell>
                  <TableCell>{new Date(record.borrowed_on).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleReturn(record.book_id)}
                    >
                      Return Book
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No Active Records Found
                </TableCell>
              </TableRow>
            )}
            {currentPage * recordsPerPage < totalRecords && records.length > 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Button variant="contained" onClick={handleViewMore}>
                    View More
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ReturnBookPage;

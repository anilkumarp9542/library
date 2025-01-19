import React, { useState, useEffect } from 'react';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TextField,
  Paper,
  Box,
  Typography,
} from '@mui/material';
import { viewBorrowHistory } from '../services/api';

const BorrowhistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchHistory = async (page, limit, search = '') => {
    try {
      const response = await viewBorrowHistory();
      const filteredHistory = response.data.filter((record) =>
        Object.values(record).some((value) =>
          value.toString().toLowerCase().includes(search.toLowerCase())
        )
      );
      const paginatedHistory = filteredHistory.slice((page - 1) * limit, page * limit);
      if (page === 1) {
        setHistory(paginatedHistory);
      } else {
        setHistory((prevHistory) => [...prevHistory, ...paginatedHistory]);
      }
      setTotalRecords(filteredHistory.length);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to fetch borrow history');
    }
  };

  useEffect(() => {
    fetchHistory(1, recordsPerPage, searchQuery);
  }, [searchQuery]);

  const handleViewMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchHistory(nextPage, recordsPerPage, searchQuery);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  return (
    <Box p={4}>
      <Typography variant="h4" textAlign="center">
        Borrow History
      </Typography>

      <Box mt={4}>
        <TextField
          fullWidth
          label="Search History"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by Username, Email, Book Title, etc."
        />
      </Box>

      <Box mt={4}>
        <TableContainer component={Paper} style={{ maxHeight: '500px', overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 'bold' }}>Username</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Mobile</TableCell>
                <TableCell style={{ fontWeight: 'bold'}}>Book Id</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Book Title</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Author</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Borrowed On</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Returned On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{record.username}</TableCell>
                  <TableCell>{record.email}</TableCell>
                  <TableCell>{record.mobile}</TableCell>
                  <TableCell>{record.book_id}</TableCell>
                  <TableCell>{record.book_title}</TableCell>
                  <TableCell>{record.author}</TableCell>
                  <TableCell>{new Date(record.borrowed_on).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {record.returned_on? new Date(record.returned_on).toLocaleDateString(): 'Not Returned'}
                  </TableCell>
                </TableRow>
              ))}
              {currentPage * recordsPerPage < totalRecords && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
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
    </Box>
  );
};

export default BorrowhistoryPage;

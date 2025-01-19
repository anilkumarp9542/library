import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  TableContainer,
  Paper,
} from '@mui/material';
// import { useNavigate } from 'react-router-dom';
import { getAllBooks} from '../services/api';

const AdminPage = () => {
  // const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    fetchBooks(1, recordsPerPage, searchQuery);
  }, []);

  const fetchBooks = async (page, limit, search = '') => {
    try {
      const response = await getAllBooks({ page, limit, search });
      if (page === 1) {
        setBooks(response.data.books);
      } else {
        setBooks((prevBooks) => [...prevBooks, ...response.data.books]);
      }
      setTotalRecords(response.data.total);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to fetch books');
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    setCurrentPage(1);
    fetchBooks(1, recordsPerPage, query);
  };

  const handleViewMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchBooks(nextPage, recordsPerPage, searchQuery);
  };

  return (
    <Box p={4}>
      {/* Page Title */}
      <Typography variant="h3" textAlign="center">
        Admin Dashboard
      </Typography>

      {/* Search Bar */}
      <Box mt={4}>
        <TextField
          fullWidth
          label="Search Books"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by ID, Title, Author, Genre"
        />
      </Box>

      {/* Table */}
      <Box mt={4}>
        <Typography variant="h5">All Books</Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Book ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Author</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Genre</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Publication Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Total Count</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Borrowed Count</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Available</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.book_id}>
                  <TableCell>{book.book_id}</TableCell>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.genre}</TableCell>
                  <TableCell>{book.publication_date}</TableCell>
                  <TableCell>{book.total_count}</TableCell>
                  <TableCell>{book.borrowed_count}</TableCell>
                  <TableCell>{book.availability_status ? 'Yes' : 'No'}</TableCell>
                </TableRow>
              ))}
              {currentPage * recordsPerPage < totalRecords && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
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

export default AdminPage;

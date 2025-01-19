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
import { getAllBooks, borrowBook, viewBorrowHistory } from '../services/api';

const MemberPage = () => {
  const [books, setBooks] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [borrowedBooks, setBorrowedBooks] = useState({}); // Track borrowed books
  const [activeBorrowingRecords, setActiveBorrowingRecords] = useState([]); // Active borrowing records from return page
  const recordsPerPage = 10;

  useEffect(() => {
    fetchBooks(1, recordsPerPage, searchQuery);
    fetchActiveBorrowingRecords();
  }, [searchQuery]);

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

  const fetchActiveBorrowingRecords = async () => {
    try {
      const response = await viewBorrowHistory();
      const activeRecords = response.data.filter((record) => !record.returned_on);
      setActiveBorrowingRecords(activeRecords.map((record) => record.book_id));
    } catch (error) {
      console.error('Error fetching active borrowing records:', error);
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

  const handleBorrow = async (bookId) => {
    if (borrowedBooks[bookId] || activeBorrowingRecords.includes(bookId)) return; // Prevent duplicate borrowing
  
    try {
      await borrowBook(bookId);
      alert('Book borrowed successfully!');
  
      // Mark the book as borrowed locally
      setBorrowedBooks((prev) => ({ ...prev, [bookId]: true }));
      
      // Update the book list locally to reflect the borrowed status
      setBooks((prevBooks) =>
        prevBooks.map((book) =>
          book.book_id === bookId ? { ...book, availability_status: false } : book
        )
      );
  
      // Refresh active borrowing records
      fetchActiveBorrowingRecords();
    } catch (error) {
      console.error('Error borrowing book:', error);
      alert(error.response?.data?.error || 'Failed to borrow book');
    }
  };
  

  const isBorrowDisabled = (bookId) => {
    return borrowedBooks[bookId] || activeBorrowingRecords.includes(bookId);
  };

  return (
    <Box p={4}>
      <Typography variant="h3" textAlign="center" mb={4}>
        Member Dashboard
      </Typography>

      <Box mb={4}>
        <TextField
          fullWidth
          label="Search Books"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by ID, Title, Author, Genre"
        />
      </Box>

      <Typography variant="h5">All Books</Typography>
      <TableContainer component={Paper} sx={{ maxHeight: 400, overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Author</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Genre</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Publication Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Available</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
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
                <TableCell>{book.availability_status ? 'Yes' : 'No'}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={isBorrowDisabled(book.book_id)}
                    onClick={() => handleBorrow(book.book_id)}
                  >
                    {isBorrowDisabled(book.book_id) ? 'Borrowed' : 'Borrow'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {currentPage * recordsPerPage < totalRecords && (
              <TableRow>
                <TableCell colSpan={6} align="center">
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

export default MemberPage;

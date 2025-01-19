import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { getAllBooks, updateBook, deleteBook } from '../services/api';

const UpdateDeleteBook = () => {
  const [books, setBooks] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    book_id: '',
    title: '',
    author: '',
    publication_date: '',
    total_count: '',
    genre: '',
  });
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);

  useEffect(() => {
    fetchBooks(1, recordsPerPage, searchQuery);
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
      console.error('Error fetching books:', error.response?.data || error.message);
    }
  };

  const handleUpdateClick = (book) => {
    setFormData({
      book_id: book.book_id,
      title: book.title,
      author: book.author,
      publication_date: book.publication_date.split('/').reverse().join('-'),
      total_count: book.total_count,
      genre: book.genre,
    });
    setIsUpdateOpen(true);
  };

  const handleDeleteClick = async (bookId) => {
    try {
      await deleteBook(bookId);
      alert('Book deleted successfully!');
      fetchBooks(1, recordsPerPage, searchQuery); // Refresh books
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete book');
    }
  };

  const handleUpdateSubmit = async () => {
    try {
      const updatedData = {
        book_id: parseInt(formData.book_id, 10),
        title: formData.title,
        author: formData.author,
        genre: formData.genre,
        publication_date: formData.publication_date.split('-').reverse().join('/'), // Convert `yyyy-mm-dd` to `dd/mm/yyyy`
        total_count: parseInt(formData.total_count, 10),
      };

      await updateBook(updatedData.book_id, updatedData);
      alert('Book updated successfully!');
      setIsUpdateOpen(false);
      fetchBooks(1, recordsPerPage, searchQuery); // Refresh books
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to update book');
    }
  };

  const handleViewMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchBooks(nextPage, recordsPerPage, searchQuery);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <Box p={4}>
      <Typography variant="h4" textAlign="center">
        Update/Delete Books
      </Typography>

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

      <Box mt={4}>
        <TableContainer component={Paper} style={{ maxHeight: '500px', overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 'bold' }}>Book ID</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Title</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Author</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Publication Date</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Total Count</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Genre</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {books.map((book) => (
                <TableRow key={book.book_id}>
                  <TableCell>{book.book_id}</TableCell>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.publication_date}</TableCell>
                  <TableCell>{book.total_count}</TableCell>
                  <TableCell>{book.genre}</TableCell>
                  <TableCell>
                    <Button variant="outlined" onClick={() => handleUpdateClick(book)}>
                      Update
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => handleDeleteClick(book.book_id)}>
                      Delete
                    </Button>
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

        <Dialog open={isUpdateOpen} onClose={() => setIsUpdateOpen(false)}>
          <DialogTitle>Update Book</DialogTitle>
          <DialogContent>
            <TextField
              label="Book ID"
              name="book_id"
              fullWidth
              margin="dense"
              value={formData.book_id}
              onChange={handleChange}
              disabled
            />
            <TextField
              label="Title"
              name="title"
              fullWidth
              margin="dense"
              value={formData.title}
              onChange={handleChange}
            />
            <TextField
              label="Author"
              name="author"
              fullWidth
              margin="dense"
              value={formData.author}
              onChange={handleChange}
            />
            <TextField
              label="Publication Date"
              name="publication_date"
              type="date"
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
              value={formData.publication_date}
              onChange={handleChange}
            />
            <TextField
              label="Total Count"
              name="total_count"
              fullWidth
              margin="dense"
              value={formData.total_count}
              onChange={handleChange}
            />
            <TextField
              label="Genre"
              name="genre"
              fullWidth
              margin="dense"
              value={formData.genre}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsUpdateOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateSubmit}>Submit</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default UpdateDeleteBook;

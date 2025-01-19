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
import { getLibrarians, updateLibrarian, deleteLibrarian } from '../services/api';

const UpdateDeleteLibrarian = () => {
  const [librarians, setLibrarians] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    email: '',
    mobile: '',
    password: '',
    password_confirmation: '',
  });
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchLibrarians(1, recordsPerPage, searchQuery);
  }, [searchQuery]);

  const fetchLibrarians = async (page, limit, search = '') => {
    try {
      const response = await getLibrarians();
      const filteredLibrarians = response.librarians.filter((librarian) =>
        Object.values(librarian).some((value) =>
          value.toString().toLowerCase().includes(search.toLowerCase())
        )
      );
      const paginatedLibrarians = filteredLibrarians.slice((page - 1) * limit, page * limit);
      if (page === 1) {
        setLibrarians(paginatedLibrarians);
      } else {
        setLibrarians((prevLibrarians) => [...prevLibrarians, ...paginatedLibrarians]);
      }
      setTotalRecords(filteredLibrarians.length);
    } catch (error) {
      console.error('Error fetching librarians:', error);
    }
  };

  const handleUpdateClick = (librarian) => {
    setFormData({
      id: librarian.id,
      username: librarian.username,
      email: librarian.email,
      mobile: librarian.mobile,
      password: '',
      password_confirmation: '',
    });
    setIsUpdateOpen(true);
  };

  const handleDeleteClick = async (librarianId) => {
    try {
      await deleteLibrarian(librarianId);
      alert('Librarian deleted successfully!');
      fetchLibrarians(1, recordsPerPage, searchQuery); // Refresh librarians
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to delete librarian');
    }
  };

  const handleUpdateSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await updateLibrarian(formData.id, formData);
      alert('Librarian updated successfully!');
      setIsUpdateOpen(false);
      fetchLibrarians(1, recordsPerPage, searchQuery); // Refresh librarians
    } catch (error) {
      const errorResponse = error.response?.data?.errors || 'Failed to update librarian';
      setErrorMessage(Array.isArray(errorResponse) ? errorResponse.join(', ') : errorResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchLibrarians(nextPage, recordsPerPage, searchQuery);
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
        Update/Delete Librarian
      </Typography>

      <Box mt={4}>
        <TextField
          fullWidth
          label="Search Librarians"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by ID, Username, Email, Mobile"
        />
      </Box>

      <Box mt={4}>
        <TableContainer component={Paper} style={{ maxHeight: '500px', overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell style={{ fontWeight: 'bold' }}>Librarian ID</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Username</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Mobile</TableCell>
                <TableCell style={{ fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {librarians.map((librarian) => (
                <TableRow key={librarian.id}>
                  <TableCell>{librarian.id}</TableCell>
                  <TableCell>{librarian.username}</TableCell>
                  <TableCell>{librarian.email}</TableCell>
                  <TableCell>{librarian.mobile}</TableCell>
                  <TableCell>
                    <Button variant="outlined" onClick={() => handleUpdateClick(librarian)}>
                      Update
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => handleDeleteClick(librarian.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {currentPage * recordsPerPage < totalRecords && (
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

        <Dialog open={isUpdateOpen} onClose={() => setIsUpdateOpen(false)}>
          <DialogTitle>Update Librarian</DialogTitle>
          <DialogContent>
            {errorMessage && (
              <p style={{ color: 'red', fontSize: '14px', marginBottom: '16px' }}>{errorMessage}</p>
            )}
            <TextField
              label="Librarian ID"
              name="id"
              fullWidth
              margin="dense"
              value={formData.id}
              onChange={handleChange}
              disabled
            />
            <TextField
              label="Username"
              name="username"
              fullWidth
              margin="dense"
              value={formData.username}
              onChange={handleChange}
            />
            <TextField
              label="Email"
              name="email"
              fullWidth
              margin="dense"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              label="Mobile"
              name="mobile"
              fullWidth
              margin="dense"
              value={formData.mobile}
              onChange={handleChange}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              margin="dense"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              label="Password Confirmation"
              name="password_confirmation"
              type="password"
              fullWidth
              margin="dense"
              value={formData.password_confirmation}
              onChange={handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsUpdateOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default UpdateDeleteLibrarian;

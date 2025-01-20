import React, { useState } from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { createBook } from '../services/api';

const CreateBook = ({ fetchBooks }) => {
  const [formData, setFormData] = useState({
    book_id: '',
    title: '',
    author: '',
    publication_date: '',
    total_count: '',
    genre: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [open, setOpen] = useState(false); // Dialog open state

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const formattedData = {
        ...formData,
        book_id: parseInt(formData.book_id, 10),
        total_count: parseInt(formData.total_count, 10),
        publication_date: formData.publication_date.split('-').reverse().join('/'),
      };

      await createBook(formattedData);
      alert('Book created successfully!');
      
      // Reset form fields
      setFormData({
        book_id: '',
        title: '',
        author: '',
        publication_date: '',
        total_count: '',
        genre: '',
      });

      setOpen(false); // Close the dialog after successful submission
      if (fetchBooks) fetchBooks(); // Refresh the book list if fetchBooks function is passed
    } catch (error) {
      const errorResponse = error.response?.data?.errors || 'Failed to create book';
      setErrorMessage(Array.isArray(errorResponse) ? errorResponse.join(', ') : errorResponse);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog open/close
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setErrorMessage(''); // Clear errors on close
  };

  return (
    <div>
      {/* Button to open dialog */}
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Create New Book
      </Button>

      {/* Dialog box for form */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Create New Book</DialogTitle>
        <DialogContent>
          {errorMessage && (
            <p style={{ color: 'red', fontSize: '14px', marginBottom: '16px' }}>{errorMessage}</p>
          )}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Book ID"
              name="book_id"
              fullWidth
              margin="dense"
              onChange={handleChange}
              value={formData.book_id}
              required
            />
            <TextField
              label="Title"
              name="title"
              fullWidth
              margin="dense"
              onChange={handleChange}
              value={formData.title}
              required
            />
            <TextField
              label="Author"
              name="author"
              fullWidth
              margin="dense"
              onChange={handleChange}
              value={formData.author}
              required
            />
            <TextField
              label="Publication Date"
              name="publication_date"
              type="date"
              fullWidth
              margin="dense"
              InputLabelProps={{ shrink: true }}
              onChange={handleChange}
              value={formData.publication_date}
              required
            />
            <TextField
              label="Total Count"
              name="total_count"
              fullWidth
              margin="dense"
              onChange={handleChange}
              value={formData.total_count}
              required
            />
            <TextField
              label="Genre"
              name="genre"
              fullWidth
              margin="dense"
              onChange={handleChange}
              value={formData.genre}
              required
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">Cancel</Button>
          <Button type="submit" variant="contained" color="primary" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default CreateBook;

import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
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
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent duplicate submissions
  const [errorMessage, setErrorMessage] = useState(''); // Track error messages

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'publication_date') {
      setFormData({ ...formData, [name]: value }); // Directly set the value in `yyyy-mm-dd` format
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    if (isSubmitting) return; // Avoid duplicate submissions
    setIsSubmitting(true);
    setErrorMessage(''); // Clear any previous error messages

    try {
      const formattedData = {
        ...formData,
        book_id: parseInt(formData.book_id, 10),
        total_count: parseInt(formData.total_count, 10),
        publication_date: formData.publication_date.split('-').reverse().join('/'), // Convert to `dd/mm/yyyy`
      };
      await createBook(formattedData); // API call to create book
      alert('Book created successfully!');
      setFormData({
        book_id: '',
        title: '',
        author: '',
        publication_date: '',
        total_count: '',
        genre: '',
      }); // Reset the form
      
    } catch (error) {
      const errorResponse = error.response?.data?.errors || 'Failed to create book';
      setErrorMessage(Array.isArray(errorResponse) ? errorResponse.join(', ') : errorResponse);
    } finally {
      setIsSubmitting(false); // Reset submission state
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: '16px', maxWidth: '400px', margin: '0 auto' }}>
      {errorMessage && (
        <p style={{ color: 'red', fontSize: '14px', marginBottom: '16px' }}>{errorMessage}</p>
      )}
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
      <div style={{ marginTop: '16px', textAlign: 'right' }}>
        <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </form>
  );
};

export default CreateBook;

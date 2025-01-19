import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import { createLibrarian } from '../services/api';

const CreateLibrarian = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    password: '',
    password_confirmation: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent duplicate submissions
  const [errorMessage, setErrorMessage] = useState(''); // Track error messages

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    if (isSubmitting) return; // Avoid duplicate submissions
    setIsSubmitting(true);
    setErrorMessage(''); // Clear any previous error messages

    try {
      await createLibrarian(formData); // API call to create librarian
      alert('Librarian created successfully!');
      setFormData({
        username: '',
        email: '',
        mobile: '',
        password: '',
        password_confirmation: '',
      }); // Reset the form
    } catch (error) {
      const errorResponse = error.response?.data?.errors || 'Failed to create librarian';
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
        label="Username"
        name="username"
        fullWidth
        margin="dense"
        onChange={handleChange}
        value={formData.username}
        required
      />
      <TextField
        label="Email"
        name="email"
        fullWidth
        margin="dense"
        onChange={handleChange}
        value={formData.email}
        required
      />
      <TextField
        label="Mobile"
        name="mobile"
        fullWidth
        margin="dense"
        onChange={handleChange}
        value={formData.mobile}
        required
      />
      <TextField
        label="Password"
        name="password"
        type="password"
        fullWidth
        margin="dense"
        onChange={handleChange}
        value={formData.password}
        required
      />
      <TextField
        label="Password Confirmation"
        name="password_confirmation"
        type="password"
        fullWidth
        margin="dense"
        onChange={handleChange}
        value={formData.password_confirmation}
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

export default CreateLibrarian;

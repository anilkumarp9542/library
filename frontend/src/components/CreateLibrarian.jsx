import React, { useState } from 'react';
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { createLibrarian } from '../services/api';

const CreateLibrarian = ({ fetchLibrarians }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    password: '',
    password_confirmation: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent duplicate submissions
  const [errorMessage, setErrorMessage] = useState(''); // Track error messages
  const [open, setOpen] = useState(false); // Dialog open state

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload
    if (isSubmitting) return; // Avoid duplicate submissions
    setIsSubmitting(true);
    setErrorMessage(''); // Clear any previous error messages

    try {
      await createLibrarian(formData); // API call to create librarian
      alert('Librarian created successfully!');
      
      // Reset form fields
      setFormData({
        username: '',
        email: '',
        mobile: '',
        password: '',
        password_confirmation: '',
      });

      setOpen(false); // Close the dialog after successful submission
      if (fetchLibrarians) fetchLibrarians(); // Refresh librarian list
    } catch (error) {
      const errorResponse = error.response?.data?.errors || 'Failed to create librarian';
      setErrorMessage(Array.isArray(errorResponse) ? errorResponse.join(', ') : errorResponse);
    } finally {
      setIsSubmitting(false); // Reset submission state
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
        Create New Librarian
      </Button>

      {/* Dialog box for form */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Create New Librarian</DialogTitle>
        <DialogContent>
          {/* {errorMessage && (
            <p style={{ color: 'red', fontSize: '14px', marginBottom: '16px' }}>{errorMessage}</p>
          )} */}
          <form onSubmit={handleSubmit}>
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

export default CreateLibrarian;

import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { borrowBook } from '../services/api';

const Borrow = ({ refreshBooks }) => {
  const [open, setOpen] = useState(false);
  const [bookId, setBookId] = useState('');

  const handleSubmit = async () => {
    try {
      await borrowBook(bookId);
      alert('Book borrowed successfully!');
      setOpen(false);
      refreshBooks(); // Refresh the book list
    } catch (error) {
      console.error('Error borrowing book:', error);
      alert(error.response?.data?.error || 'Failed to borrow book');
    }
  };

  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Borrow Book
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Borrow Book</DialogTitle>
        <DialogContent>
          <TextField
            label="Book ID"
            fullWidth
            margin="dense"
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Borrow;

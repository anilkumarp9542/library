import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, Card, CardContent, Stack } from '@mui/material';
import { login } from '../services/api';

const LoginPage = ({ setAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await login({ email, password });
      setAuth({ isAuthenticated: true, role: response.data.role });

      if (response.data.role === 'Admin') {
        navigate('/admin');
      } else if (response.data.role === 'Librarian') {
        navigate('/librarian');
      } else {
        navigate('/member');
      }
    } catch (error) {
      alert(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
      sx={{ backgroundColor: '#f4f6f8' }}
    >
      <Card sx={{ maxWidth: 600, padding: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Login
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <Button variant="contained" size="large" onClick={handleLogin} sx={{ textTransform: 'none' }}>
              Login
            </Button>
            <Button
              color="secondary"
              fullWidth
              onClick={() => navigate('/signup')}
              sx={{ textTransform: 'none' }}
            >
              Don't have an account? Sign Up
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;

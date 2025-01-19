import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Card, CardContent, Stack, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { signup } from '../services/api';

const SignupPage = ({ setAuth }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.password_confirmation) {
      setError('All fields are required.');
      return false;
    }
    if (formData.password !== formData.password_confirmation) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(''); 
    if (!validateForm()) return;

    setLoading(true); // Disable button during request
    try {
      const response = await signup({ user: formData }); 
      const { role } = response.data;

      // Set auth state to logged in and navigate based on role
      setAuth({ isAuthenticated: true, role });
      alert('Account created successfully! Logging in...');
      console.log('Role received:', role);

      if (role === 'Member') {
        navigate('/member');
      } 
    } catch (error) {
      setError(error.response?.data?.errors?.join(', ') || 'Signup failed');
    } finally {
      setLoading(false); // Re-enable button
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
      <Card sx={{ maxWidth: 400, padding: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h4" align="center" gutterBottom>
            Signup
          </Typography>
          {error && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2}>
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Password Confirmation"
              name="password_confirmation"
              type="password"
              value={formData.password_confirmation}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={loading}
              sx={{ textTransform: 'none' }}
            >
              {loading ? 'Signing up...' : 'Signup'}
            </Button>
            <Button
              color="secondary"
              fullWidth
              onClick={() => navigate('/')}
              sx={{ textTransform: 'none' }}
            >
              Already have an account? Login
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SignupPage;

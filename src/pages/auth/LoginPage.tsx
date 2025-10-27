import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Divider,
} from '@mui/material';

import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

import loginIllustration from '../analytics/login.png'; // image import

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/api/auth/login', { username, password });
      login(res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data || err?.message || 'Login failed';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ backgroundColor: '#d8eefe', p: 2 }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 900,
          borderRadius: 4,
          boxShadow: 6,
          backgroundColor: '#fffffe',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
          <Box
            sx={{
              flex: '1 1 50%',
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#3da9fc10',
              borderRight: '1px solid #e0e0e0',
              p: 3,
            }}
          >
            <img
              src={loginIllustration}
              alt="Login Illustration"
              style={{
                width: '85%',
                maxWidth: '350px',
                objectFit: 'contain',
              }}
            />
          </Box>

          {/* ✅ Form Section */}
          <Box sx={{ flex: '1 1 50%' }}>
            <CardContent sx={{ p: 5 }}>
              <Stack spacing={3}>
                <Typography
                  variant="h4"
                  textAlign="center"
                  sx={{ color: '#094067', fontWeight: 700 }}
                >
                  Welcome Back
                </Typography>
                <Typography
                  variant="body2"
                  textAlign="center"
                  sx={{ color: '#5f6c7b' }}
                >
                  Please login to continue
                </Typography>

                <Divider />

                <Box component="form" onSubmit={onSubmit}>
                  <Stack spacing={2.5}>
                    <TextField
                      label="Username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      fullWidth
                      required
                      InputLabelProps={{ style: { color: '#094067' } }}
                    />
                    <TextField
                      label="Password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      fullWidth
                      required
                      InputLabelProps={{ style: { color: '#094067' } }}
                    />

                    {error && (
                      <Typography
                        textAlign="center"
                        sx={{ color: '#ef4565', fontWeight: 500 }}
                      >
                        {error}
                      </Typography>
                    )}

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      sx={{
                        backgroundColor: '#3da9fc',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: 3,
                        py: 1.3,
                        '&:hover': {
                          backgroundColor: '#0284d0',
                        },
                      }}
                    >
                      Login
                    </Button>
                  </Stack>
                </Box>

                <Stack spacing={1} textAlign="center">
                  <Typography variant="body2" sx={{ color: '#5f6c7b' }}>
                    Don’t have an account?{' '}
                    <Link
                      to="/register"
                      style={{
                        textDecoration: 'none',
                        color: '#ef4565',
                        fontWeight: 600,
                      }}
                    >
                      Register
                    </Link>
                  </Typography>
                  <Link
                    to="/forgot-password"
                    style={{
                      textDecoration: 'none',
                      color: '#094067',
                      fontSize: '0.9rem',
                    }}
                  >
                    Forgot your password?
                  </Link>
                </Stack>
              </Stack>
            </CardContent>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};

export default LoginPage;

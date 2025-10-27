import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
  Divider,
  Fade,
  Slide,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import registerImage from '../analytics/Register.png';

const roles = ['ENTREPRENEUR', 'INVESTOR', 'MENTOR', 'EXPERT', 'PROGRAM_ORGANISER', 'ADMIN'];

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ENTREPRENEUR');
  const [error, setError] = useState<string | null>(null);
  const [animateForm, setAnimateForm] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await api.post('/api/auth/register', { username, email, password, role });
      login(res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data || err?.message || 'Registration failed';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #d8eefe 0%, #f0f9ff 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          maxWidth: 1000,
          width: '100%',
          borderRadius: 3,
          boxShadow: 6,
          overflow: 'hidden',
        }}
      >
        {/* Form Side */}
        <Box sx={{ flex: 1, p: { xs: 3, md: 5 } }}>
          <Fade in={animateForm} timeout={1000}>
            <Stack spacing={3}>
              {/* Header */}
              <Slide direction="right" in={animateForm} timeout={800}>
                <Box>
                  <Typography variant="h4" sx={{ color: '#094067', fontWeight: 700 }}>
                    Create Your Account
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#5f6c7b' }}>
                    Join the Startup Validation Portal and bring your ideas to life.
                  </Typography>
                </Box>
              </Slide>

              <Divider sx={{ borderColor: '#e0e0e0' }} />

              {/* Form */}
              <Box component="form" onSubmit={onSubmit}>
                <Stack spacing={2.5}>
                  {['Username', 'Email', 'Password'].map((field, idx) => (
                    <TextField
                      key={field}
                      label={field}
                      type={field === 'Password' ? 'password' : field === 'Email' ? 'email' : 'text'}
                      value={idx === 0 ? username : idx === 1 ? email : password}
                      onChange={(e) => {
                        if (idx === 0) setUsername(e.target.value);
                        else if (idx === 1) setEmail(e.target.value);
                        else setPassword(e.target.value);
                      }}
                      fullWidth
                      required
                      InputLabelProps={{ style: { color: '#094067' } }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#5f6c7b' },
                          '&:hover fieldset': { borderColor: '#094067' },
                          '&.Mui-focused fieldset': { borderColor: '#094067' },
                        },
                      }}
                    />
                  ))}

                  <TextField
                    select
                    label="Role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    fullWidth
                    required
                    InputLabelProps={{ style: { color: '#094067' } }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#5f6c7b' },
                        '&:hover fieldset': { borderColor: '#094067' },
                        '&.Mui-focused fieldset': { borderColor: '#094067' },
                      },
                    }}
                  >
                    {roles.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r.charAt(0) + r.slice(1).toLowerCase()}
                      </MenuItem>
                    ))}
                  </TextField>

                  {error && (
                    <Typography variant="body2" textAlign="center" sx={{ color: '#ef4565' }}>
                      {error}
                    </Typography>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1.2,
                      backgroundColor: '#3da9fc',
                      color: '#fffffe',
                      '&:hover': { backgroundColor: '#0284d0' },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Create Account
                  </Button>
                </Stack>
              </Box>

              {/* Footer */}
              <Typography variant="body2" textAlign="center" sx={{ color: '#5f6c7b' }}>
                Already have an account?{' '}
                <Link to="/login" style={{ textDecoration: 'none', color: '#ef4565', fontWeight: 500 }}>
                  Login
                </Link>
              </Typography>
            </Stack>
          </Fade>
        </Box>

        {/* Image Side */}
        <Box
          sx={{
            flex: 1,
            display: { xs: 'none', md: 'block' },
            background: `url(${registerImage}) center center / contain no-repeat`,
            backgroundSize: 'contain',
            animation: 'fadeInRight 1s ease',
          }}
        />
      </Card>
    </Box>
  );
};

export default RegisterPage;

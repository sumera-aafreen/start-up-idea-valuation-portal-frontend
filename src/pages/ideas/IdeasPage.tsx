import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Stack, TextField, Typography, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Container, Paper, Fade, Chip, CircularProgress } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import api from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

const IdeasPage: React.FC = () => {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [confidentialityLevel, setConfidentialityLevel] = useState<'PUBLIC'|'PRIVATE'|'EXPERT_ONLY'|'INVESTOR_ACCESSIBLE'>('PUBLIC');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [contactDialog, setContactDialog] = useState<{ open: boolean; contact?: string | null; name?: string | null }>({ open: false });
  const [successDialog, setSuccessDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const init = async () => {
      if (!token) { setLoadingUser(false); return; }
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const username = payload.sub || payload.username;
        if (username) {
          const res = await api.get(`/api/users/username/${encodeURIComponent(username)}`);
          setCurrentUserId(res.data.userId);
        }
      } catch (err) { console.error(err); }
      setLoadingUser(false);
    };
    init();
  }, [token]);

  const createIdea = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!currentUserId) return alert('User not loaded yet. Please wait.');
    setIsSubmitting(true);
    try {
      await api.post('/api/ideas', { title, description, confidentialityLevel, owner: { userId: currentUserId } });
      setTitle(''); setDescription(''); setConfidentialityLevel('PUBLIC');
      setSuccessDialog(true);
    } catch (err: any) {
      console.error('createIdea error', err);
      alert('Failed to create idea');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ 
      background: theme.palette.background.default,
      position: 'relative',
      py: { xs: 4, sm: 6 },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `radial-gradient(circle at 25% 25%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                         radial-gradient(circle at 75% 75%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%)`,
        pointerEvents: 'none'
      }
    }}>
      <Container maxWidth="lg">
        <Fade in={true} timeout={800}>
          <Box>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>

              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: theme.palette.text.primary,
                mb: 1,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
              }}>
                Create Your Next Big Idea
              </Typography>
              <Typography variant="h6" sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 400,
                maxWidth: 600,
                mx: 'auto',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
              }}>
                Transform your innovative thoughts into reality with our comprehensive idea management platform
              </Typography>
            </Box>

            {/* Form Card */}
            <Paper sx={{ 
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
              background: theme.palette.mode === 'light' 
                ? `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.paper, 0.7)} 100%)`
                : theme.palette.background.paper,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              position: 'relative',
              transform: 'translateY(0)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.15)'
              }
            ,
            maxWidth: 980,
            mx: 'auto'
            }}>
              {/* Gradient Header */}
              <Box sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                p: 4,
                color: 'white',
                textAlign: 'center'
              }}>
                <LightbulbIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="h5" sx={{ 
                  fontWeight: 600,
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                }}>
                  Share Your Innovation
                </Typography>
              </Box>

              {/* Form Content */}
              <Box sx={{ p: 4 }}>
                <form onSubmit={createIdea}>
                  <Stack spacing={3}>
                    <TextField 
                      label="Idea Title" 
                      value={title} 
                      onChange={(e)=>setTitle(e.target.value)} 
                      fullWidth 
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: alpha(theme.palette.primary.main, 0.02),
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.04)
                          },
                          '&.Mui-focused': {
                            background: alpha(theme.palette.primary.main, 0.06)
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                        }
                      }}
                    />
                    
                    <TextField 
                      label="Detailed Description" 
                      value={description} 
                      onChange={(e)=>setDescription(e.target.value)} 
                      fullWidth 
                      multiline 
                      rows={5} 
                      required
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: alpha(theme.palette.primary.main, 0.02),
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.04)
                          },
                          '&.Mui-focused': {
                            background: alpha(theme.palette.primary.main, 0.06)
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                        }
                      }}
                    />
                    
                    <TextField 
                      select 
                      label="Confidentiality Level" 
                      value={confidentialityLevel} 
                      onChange={(e)=>setConfidentialityLevel(e.target.value as any)} 
                      fullWidth
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: alpha(theme.palette.primary.main, 0.02),
                          '&:hover': {
                            background: alpha(theme.palette.primary.main, 0.04)
                          },
                          '&.Mui-focused': {
                            background: alpha(theme.palette.primary.main, 0.06)
                          }
                        },
                        '& .MuiInputLabel-root': {
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                        }
                      }}
                    >
                      <MenuItem value="PUBLIC">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="Public" color="success" size="small" />
                          <Typography>Visible to everyone</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="PRIVATE">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="Private" color="error" size="small" />
                          <Typography>Only you can see</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="EXPERT_ONLY">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="Experts Only" color="warning" size="small" />
                          <Typography>Visible to experts</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="INVESTOR_ACCESSIBLE">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label="Investors" color="info" size="small" />
                          <Typography>Visible to investors</Typography>
                        </Box>
                      </MenuItem>
                    </TextField>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 2 }}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loadingUser || isSubmitting}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <RocketLaunchIcon />}
                        sx={{ 
                          flex: 1,
                          py: 1.5,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                          fontWeight: 600,
                          fontSize: '1rem',
                          boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.4)}`,
                          '&:hover': {
                            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                            transform: 'translateY(-2px)',
                            boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.5)}`
                          },
                          '&:disabled': {
                            background: theme.palette.action.disabledBackground
                          },
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                        }}
                      >
                        {isSubmitting ? 'Creating...' : 'Create Idea'}
                      </Button>
                      
                      <Button 
                        type="button" 
                        variant="outlined" 
                        onClick={() => { setTitle(''); setDescription(''); setConfidentialityLevel('PUBLIC'); }}
                        sx={{ 
                          flex: { xs: 1, sm: 'auto' },
                          py: 1.5,
                          px: 4,
                          borderRadius: 3,
                          borderWidth: 2,
                          fontWeight: 600,
                          '&:hover': {
                            borderWidth: 2,
                            background: alpha(theme.palette.primary.main, 0.04)
                          },
                          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                        }}
                      >
                        Clear Form
                      </Button>
                    </Stack>
                  </Stack>
                </form>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Container>

      {/* Success Dialog */}
      <Dialog 
        open={successDialog} 
        onClose={() => setSuccessDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
            background: theme.palette.background.paper
          }
        }}
      >
        <Box sx={{
          background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`,
          p: 4,
          textAlign: 'center',
          color: 'white'
        }}>
          <CheckCircleIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" sx={{ 
            fontWeight: 700, 
            mb: 1,
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
          }}>
            Success!
          </Typography>
          <Typography variant="h6" sx={{ 
            fontWeight: 400,
            opacity: 0.9,
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
          }}>
            Your idea has been created successfully
          </Typography>
        </Box>
        
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ 
            mb: 3,
            color: theme.palette.text.secondary,
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
          }}>
            🎉 Your innovative idea is now part of our platform! Visit your dashboard to manage your ideas and track investor interest.
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button 
            onClick={() => setSuccessDialog(false)}
            variant="contained"
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              fontWeight: 600,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default IdeasPage;

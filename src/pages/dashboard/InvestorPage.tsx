import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, CircularProgress, Chip, Divider, Container, Paper, Avatar, Fade } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import InterestsIcon from '@mui/icons-material/Interests';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../api/client';

type Idea = {
  ideaId: number;
  title: string;
  description: string;
  confidentialityLevel: string;
  owner?: { username?: string } | null;
};

const InvestorPage: React.FC = () => {
  const theme = useTheme();
  const [contact, setContact] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [myInterests, setMyInterests] = useState<any[]>([]);
  const [loadingMyInterests, setLoadingMyInterests] = useState(false);
  const [ideaMap, setIdeaMap] = useState<Record<number, Idea>>({});

  const loadIdeas = async () => {
    try {
      const res = await api.get('/api/ideas/investor-accessible');
      setIdeas(res.data);
    } catch (e) {
      console.error('Failed to load ideas', e);
    }
  };

  useEffect(() => { loadIdeas(); }, []);

  useEffect(() => { loadMyInterests(); }, []);

  const loadMyInterests = async () => {
    setLoadingMyInterests(true);
    try {
      const res = await api.get('/api/stakeholders/mine');
      const list = Array.isArray(res.data) ? res.data : [];
      setMyInterests(list);

      // fetch idea details for any ideaIds referenced
      const ids = Array.from(new Set(list.map((it: any) => it.ideaId).filter(Boolean)));
      if (ids.length > 0) {
        const calls = ids.map((id: number) => api.get(`/api/ideas/${id}`).then(r => ({ id, data: r.data })).catch(() => ({ id, data: null })));
        const results = await Promise.all(calls);
        const map: Record<number, Idea> = {};
        results.forEach((r: any) => { if (r.data) map[r.id] = r.data; });
        setIdeaMap(map);
      }
    } catch (err) {
      console.error('Failed to load my interests', err);
      setMyInterests([]);
    } finally {
      setLoadingMyInterests(false);
    }
  };

  const expressInterest = async (id: number) => {
    if (!contact || !contact.trim()) return alert('Please provide your contact information before expressing interest');
    try {
      const res = await api.post('/api/stakeholders/interest', {
        ideaId: id,
        contactInfo: contact,
        message: 'Investor expressed interest via platform'
      });
      alert('Interest recorded for idea ' + id + '. Thank you!');
    } catch (err: any) {
      console.error('Failed to express interest', err);
      alert('Failed to record interest: ' + (err?.response?.data?.message || err?.message || 'Unknown error'));
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.02)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
      py: 4
    }}>
      <Container maxWidth="lg">
        <Fade in={true} timeout={600}>
          <Box>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 2,
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.info.main} 100%)`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.3)}`
              }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'white' }} />
              </Avatar>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: theme.palette.text.primary,
                mb: 1,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
              }}>
                Investor Dashboard
              </Typography>
              <Typography variant="h6" sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 400,
                maxWidth: 600,
                mx: 'auto',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
              }}>
                Discover innovative ideas and connect with entrepreneurs
              </Typography>
            </Box>

            <Stack spacing={4}>

            <Paper sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden'
            }}>
              <Box sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                p: 3,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <ContactMailIcon sx={{ fontSize: 28 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                }}>
                  Contact Information
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <TextField 
                  label="Your Contact Details" 
                  value={contact} 
                  onChange={(e)=>setContact(e.target.value)} 
                  fullWidth 
                  placeholder="Email, Phone, or Company Name"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      background: alpha(theme.palette.primary.main, 0.02)
                    }
                  }}
                />
              </CardContent>
            </Paper>

            <Paper sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden'
            }}>
              <Box sx={{
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                p: 3,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <InterestsIcon sx={{ fontSize: 28 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                }}>
                  My Investment Interests
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                {loadingMyInterests ? (
                  <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress size={32} />
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {myInterests.length === 0 && (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <InterestsIcon sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 2 }} />
                        <Typography color="text.secondary" sx={{ fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                          You haven't expressed interest in any ideas yet
                        </Typography>
                      </Box>
                    )}
                    {myInterests.map(iv => (
                      <Paper key={iv.stakeholderId} sx={{ 
                        p: 2, 
                        background: alpha(theme.palette.success.main, 0.02),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                        borderRadius: 2
                      }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                              {(ideaMap[iv.ideaId]?.title) ?? `Idea #${iv.ideaId}`}
                            </Typography>
                            {ideaMap[iv.ideaId]?.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {ideaMap[iv.ideaId].description}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Message: {iv.message ?? 'No message'}
                            </Typography>
                            {iv.contactInfo && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                Contact: <a href={`mailto:${iv.contactInfo}`} style={{ color: theme.palette.primary.main }}>{iv.contactInfo}</a>
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Chip 
                              label={iv.createdAt ? new Date(iv.createdAt).toLocaleDateString() : 'Unknown'} 
                              size="small" 
                              color="success" 
                              variant="outlined"
                            />
                          </Box>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Paper>

            <Paper sx={{ 
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden'
            }}>
              <Box sx={{
                background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                p: 3,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <BusinessCenterIcon sx={{ fontSize: 28 }} />
                <Typography variant="h6" sx={{ 
                  fontWeight: 600,
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                }}>
                  Investment Opportunities
                </Typography>
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  {ideas.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <BusinessCenterIcon sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 2 }} />
                      <Typography color="text.secondary" sx={{ fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                        No investment opportunities available at the moment
                      </Typography>
                    </Box>
                  )}
                  {ideas.map(i => (
                    <Paper key={i.ideaId} sx={{ 
                      p: 3, 
                      background: alpha(theme.palette.info.main, 0.02),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                      }
                    }}>
                      <Stack spacing={2}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                            {i.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {i.description}
                          </Typography>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Chip 
                              label={`Owner: ${i.owner?.username ?? 'Unknown'}`} 
                              size="small" 
                              color="info" 
                              variant="outlined"
                            />
                            <Chip 
                              label={i.confidentialityLevel} 
                              size="small" 
                              color="primary" 
                              variant="filled"
                            />
                          </Stack>
                        </Box>
                        <Box>
                          <Button 
                            variant="contained" 
                            onClick={() => expressInterest(i.ideaId)}
                            startIcon={<VisibilityIcon />}
                            sx={{
                              borderRadius: 2,
                              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                              fontWeight: 600,
                              '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                                transform: 'translateY(-1px)'
                              }
                            }}
                          >
                            Express Interest
                          </Button>
                        </Box>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Paper>
            </Stack>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default InvestorPage;

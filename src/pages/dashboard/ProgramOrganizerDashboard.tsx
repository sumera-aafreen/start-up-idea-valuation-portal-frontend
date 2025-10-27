import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Card, CardContent, Stack, Paper, Avatar, Fade, TextField, CircularProgress, Tooltip } from '@mui/material';
import { motion } from 'framer-motion';
import { alpha, useTheme } from '@mui/material/styles';
import { keyframes } from '@emotion/react';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import ListIcon from '@mui/icons-material/List';
import EventIcon from '@mui/icons-material/Event';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import api from '../../api/client';
import OrganizerSidebar from '../../components/OrganizerSidebar';

// Local type for ProgramEventDTO (matches backend dto)
interface ProgramEventDTO {
  eventId?: number;
  title?: string;
  description?: string;
  place?: string;
  dateTime?: string | null;
  registrationLink?: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Form component to create a program. Emits a global event 'program-created' on success so lists can reload.
const ProgramFormSection: React.FC<{ onCreated?: () => void }> = ({ onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [place, setPlace] = useState('');
  const [dateTime, setDateTime] = useState(''); // use input type datetime-local
  const [registrationLink, setRegistrationLink] = useState('');
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setTitle(''); setDescription(''); setPlace(''); setDateTime(''); setRegistrationLink('');
  };

  const createProgram = async () => {
    if (!title.trim()) return alert('Title is required');
    setSaving(true);
    try {
      const payload: any = {
        title: title.trim(),
        description: description.trim(),
        place: place.trim(),
        registrationLink: registrationLink.trim() || null,
        dateTime: dateTime ? new Date(dateTime).toISOString() : null
      };
      const resp = await api.post('/api/events', payload);
      // notify listeners
      window.dispatchEvent(new CustomEvent('program-created', { detail: resp.data }));
      onCreated && onCreated();
      reset();
    } catch (err: any) {
      console.error('Failed to create program', err);
      alert(err?.response?.data?.message || 'Failed to create program');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={(e) => { e.preventDefault(); createProgram(); }}>
      <Stack spacing={2}>
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth required />
        <TextField label="Description" value={description} onChange={(e) => setDescription(e.target.value)} fullWidth multiline rows={3} />
        <TextField label="Place" value={place} onChange={(e) => setPlace(e.target.value)} fullWidth />
        <TextField
          label="Date & Time"
          type="datetime-local"
          value={dateTime}
          onChange={(e) => setDateTime(e.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />
        <TextField label="Registration Link" value={registrationLink} onChange={(e) => setRegistrationLink(e.target.value)} fullWidth />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={reset} disabled={saving}>Reset</Button>
          <Button type="submit" variant="contained" disabled={saving}>{saving ? <CircularProgress size={18} /> : 'Create Program'}</Button>
        </Stack>
      </Stack>
    </Box>
  );
};

// My programs list with edit and delete
const MyProgramsList: React.FC = () => {
  const [programs, setPrograms] = useState<ProgramEventDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPlace, setEditPlace] = useState('');
  const [editDateTime, setEditDateTime] = useState('');
  const [editRegistrationLink, setEditRegistrationLink] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchMyPrograms = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/api/events/me');
      setPrograms(resp.data || []);
    } catch (err) {
      console.error('Failed to load my programs', err);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyPrograms();
    const handler = () => fetchMyPrograms();
    window.addEventListener('program-created', handler as EventListener);
    return () => window.removeEventListener('program-created', handler as EventListener);
  }, []);

  const startEdit = (p: ProgramEventDTO) => {
    setEditingId(p.eventId ?? null);
    setEditTitle(p.title ?? '');
    setEditDescription(p.description ?? '');
    // convert ISO to local datetime-local value if present
    setEditDateTime(p.dateTime ? new Date(p.dateTime).toISOString().slice(0,16) : '');
    setEditPlace(p.place ?? '');
    setEditRegistrationLink(p.registrationLink ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle(''); setEditDescription(''); setEditDateTime(''); setEditPlace(''); setEditRegistrationLink('');
  };

  const saveEdit = async (id?: number) => {
    if (!id) return;
    setSavingId(id);
    try {
      const payload: any = {
        title: editTitle.trim(),
        description: editDescription.trim(),
        place: editPlace.trim(),
        registrationLink: editRegistrationLink.trim() || null,
        dateTime: editDateTime ? new Date(editDateTime).toISOString() : null
      };
      await api.put(`/api/events/${id}`, payload);
      await fetchMyPrograms();
      cancelEdit();
    } catch (err: any) {
      console.error('Failed to update program', err);
      alert(err?.response?.data?.message || 'Update failed');
    } finally {
      setSavingId(null);
    }
  };

  const deleteProgram = async (id?: number) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this program?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/events/${id}`);
      await fetchMyPrograms();
    } catch (err: any) {
      console.error('Failed to delete program', err);
      alert(err?.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>;

  return (
    <Stack spacing={2}>
      {programs.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">You have not created any programs yet.</Typography>
        </Paper>
      ) : (
        programs.map((p) => (
          <Card key={p.eventId} sx={{ borderRadius: 2 }}>
            <CardContent>
              {editingId === p.eventId ? (
                <Stack spacing={2}>
                  <TextField value={editTitle} onChange={(e) => setEditTitle(e.target.value)} fullWidth />
                  <TextField value={editDescription} onChange={(e) => setEditDescription(e.target.value)} fullWidth multiline rows={3} />
                  <TextField value={editPlace} onChange={(e) => setEditPlace(e.target.value)} fullWidth />
                  <TextField type="datetime-local" value={editDateTime} onChange={(e) => setEditDateTime(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
                  <TextField value={editRegistrationLink} onChange={(e) => setEditRegistrationLink(e.target.value)} fullWidth />
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button variant="outlined" onClick={cancelEdit}>Cancel</Button>
                    <Button variant="contained" onClick={() => saveEdit(p.eventId ?? undefined)} disabled={savingId === p.eventId}>{savingId === p.eventId ? <CircularProgress size={16} /> : 'Save'}</Button>
                  </Stack>
                </Stack>
              ) : (
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>{p.title}</Typography>
                      {p.dateTime && <Typography variant="caption" color="text.secondary">{new Date(p.dateTime).toLocaleString()}</Typography>}
                      <Typography variant="body2" sx={{ mt: 1 }}>{p.description}</Typography>
                    </Box>
                    <Stack spacing={1}>
                      <Tooltip title="Edit">
                        <Button size="small" onClick={() => startEdit(p)}>Edit</Button>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <Button size="small" color="error" onClick={() => deleteProgram(p.eventId)} disabled={deletingId === p.eventId}>{deletingId === p.eventId ? <CircularProgress size={14} /> : 'Delete'}</Button>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </Stack>
  );
};

const ProgramOrganizerDashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [username, setUsername] = useState<string>('Organizer');
  const [totalPrograms, setTotalPrograms] = useState<number>(0);
  const [upcomingPrograms, setUpcomingPrograms] = useState<number>(0);
  const [displayTotal, setDisplayTotal] = useState<number>(0);
  const [displayUpcoming, setDisplayUpcoming] = useState<number>(0);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsername(payload?.sub || payload?.username || 'Organizer');
      } catch (e) {
        console.error('Error parsing token:', e);
      }
    }
  }, [token]);

  // fetch simple stats for organizer
  useEffect(() => {
    let mounted = true;
    const loadStats = async () => {
      try {
        const res = await api.get('/api/events/me');
        const list = res.data || [];
        if (!mounted) return;
        const now = new Date();
        const upcoming = list.filter((p: any) => p.dateTime && new Date(p.dateTime) > now).length;
        setTotalPrograms(list.length || 0);
        setUpcomingPrograms(upcoming);
      } catch (err) {
        console.warn('Failed to load organizer stats', err);
      }
    };
    loadStats();
    const onCreated = () => loadStats();
    window.addEventListener('program-created', onCreated as EventListener);
    return () => { mounted = false; window.removeEventListener('program-created', onCreated as EventListener); };
  }, []);

  // animate counts
  useEffect(() => {
    let raf: number | null = null;
    const animate = () => {
      setDisplayTotal((prev) => {
        if (prev < totalPrograms) return Math.min(totalPrograms, prev + Math.ceil((totalPrograms - prev) / 6) || 1);
        return prev;
      });
      setDisplayUpcoming((prev) => {
        if (prev < upcomingPrograms) return Math.min(upcomingPrograms, prev + Math.ceil((upcomingPrograms - prev) / 6) || 1);
        return prev;
      });
      if (displayTotal < totalPrograms || displayUpcoming < upcomingPrograms) {
        raf = requestAnimationFrame(animate);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => { if (raf) cancelAnimationFrame(raf); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPrograms, upcomingPrograms]);

  const pulse = keyframes`
    0% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0); }
    70% { transform: scale(1.03); box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
    100% { transform: scale(1); box-shadow: 0 0 0 rgba(0,0,0,0); }
  `;

  const cardVariants = {
    hidden: { opacity: 0, y: 18, scale: 0.99 },
    visible: (i: number) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.12, duration: 0.6 } }),
  };

  const features = [
    {
      icon: <AddIcon />,
      title: 'Create Programs',
      description: 'Design and launch new innovation programs with custom criteria and timelines',
      color: 'primary'
    },
    {
      icon: <ListIcon />,
      title: 'Manage Programs',
      description: 'View, edit, and monitor all your active and completed programs',
      color: 'secondary'
    },
    {
      icon: <GroupIcon />,
      title: 'Track Participants',
      description: 'Monitor entrepreneur applications and program engagement',
      color: 'success'
    },
    {
      icon: <TrendingUpIcon />,
      title: 'Analytics & Reports',
      description: 'Get insights on program performance and participant success rates',
      color: 'info'
    }
  ];

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.02)} 0%, ${alpha(theme.palette.error.main, 0.02)} 100%)`,
      py: 4
    }}>
      {/* Organizer-specific sidebar (fixed drawer button) */}
      <OrganizerSidebar />
      <Container maxWidth="lg">
        <Fade in={true} timeout={600}>
          <Box>
            {/* Header Section */}
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Avatar sx={{ 
                width: 100, 
                height: 100, 
                mx: 'auto', 
                mb: 3,
                background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.error.main} 100%)`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.warning.main, 0.3)}`
              }}>
                <BusinessIcon sx={{ fontSize: 50, color: 'white' }} />
              </Avatar>
              
              <Typography variant="h2" sx={{ 
                fontWeight: 700, 
                color: theme.palette.text.primary,
                mb: 2,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
              }}>
                Welcome, {username}
              </Typography>
              
              <Typography variant="h5" sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 400,
                maxWidth: 800,
                mx: 'auto',
                mb: 4,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
              }}>
                Program Organizer Dashboard
              </Typography>

              <Paper sx={{
                p: 4,
                borderRadius: 3,
                background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.error.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                maxWidth: 700,
                mx: 'auto'
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: 2,
                  color: theme.palette.text.primary,
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                }}>
                  What You Can Do
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: theme.palette.text.secondary,
                  lineHeight: 1.7,
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                }}>
                  As a Program Organizer, you have the power to create and manage innovation programs that connect entrepreneurs with opportunities. 
                  Design programs, set criteria, track applications, and foster the next generation of innovative startups.
                </Typography>
              </Paper>
            </Box>
            {/* Organizer Workspace: create form + my programs list */}
            <Box sx={{ mt: 6, mb: 8 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>Organizer Workspace</Typography>
              <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '420px 1fr' } }}>
                <motion.div initial="hidden" animate="visible" custom={0} variants={cardVariants} style={{ display: 'block' }}>
                  <Card sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Create Program</Typography>
                    <ProgramFormSection onCreated={() => { /* stats will refresh via event */ }} />
                  </Card>
                </motion.div>

                <motion.div initial="hidden" animate="visible" custom={1} variants={cardVariants} style={{ display: 'block' }}>
                  <Card sx={{ p: 3, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>My Programs</Typography>
                    <Box sx={{ maxHeight: 520, overflow: 'auto' }}>
                      <MyProgramsList />
                    </Box>
                  </Card>
                </motion.div>
              </Box>
            </Box>

            {/* Features Section */}
            <Box sx={{ mb: 8 }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 600, 
                textAlign: 'center',
                mb: 6,
                color: theme.palette.text.primary,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
              }}>
                Platform Features
              </Typography>
              
              <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' } }}>
                {features.map((feature, index) => (
                  <motion.div key={index} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={index} variants={cardVariants} style={{ width: '100%' }}>
                    <Card sx={{
                      p: 3,
                      borderRadius: 3,
                      background: feature.color === 'primary' ? alpha(theme.palette.primary.main, 0.05) :
                                 feature.color === 'secondary' ? alpha(theme.palette.secondary.main, 0.05) :
                                 feature.color === 'success' ? alpha(theme.palette.success.main, 0.05) :
                                 alpha(theme.palette.info.main, 0.05),
                      border: feature.color === 'primary' ? `1px solid ${alpha(theme.palette.primary.main, 0.1)}` :
                             feature.color === 'secondary' ? `1px solid ${alpha(theme.palette.secondary.main, 0.1)}` :
                             feature.color === 'success' ? `1px solid ${alpha(theme.palette.success.main, 0.1)}` :
                             `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.1)'
                      }
                    }}>

                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                        <Avatar sx={{
                          background: feature.color === 'primary' ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)` :
                                     feature.color === 'secondary' ? `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.light} 100%)` :
                                     feature.color === 'success' ? `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)` :
                                     `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.light} 100%)`,
                          width: 60,
                          height: 60
                        }}>
                          {React.cloneElement(feature.icon, { sx: { fontSize: 30, color: 'white' } })}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600, 
                            mb: 1,
                            color: theme.palette.text.primary,
                            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                          }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.text.secondary,
                            lineHeight: 1.6,
                            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                          }}>
                            {feature.description}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  </motion.div>
                ))}
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 600, 
                mb: 4,
                color: theme.palette.text.primary,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
              }}>
                Get Started
              </Typography>
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/create-program')}
                  sx={{
                    px: 6,
                    py: 2,
                    borderRadius: 3,
                    background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    boxShadow: `0 6px 20px ${alpha(theme.palette.warning.main, 0.4)}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.warning.dark} 0%, ${theme.palette.warning.main} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.warning.main, 0.5)}`
                    },
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                  }}
                >
                  Create New Program
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  startIcon={<EventIcon />}
                  onClick={() => navigate('/all-programs')}
                  sx={{
                    px: 6,
                    py: 2,
                    borderRadius: 3,
                    borderWidth: 2,
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    borderColor: theme.palette.error.main,
                    color: theme.palette.error.main,
                    '&:hover': {
                      borderWidth: 2,
                      background: alpha(theme.palette.error.main, 0.04),
                      transform: 'translateY(-2px)'
                    },
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                  }}
                >
                  View All Programs
                </Button>
              </Stack>
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default ProgramOrganizerDashboard;

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CardContent,
  Stack,
  TextField,
  Typography,
  Tabs,
  Tab,
  CircularProgress,
  Container,
  Paper,
  Avatar,
  Fade,
  Chip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import SchoolIcon from '@mui/icons-material/School';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SendIcon from '@mui/icons-material/Send';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import api from '../../api/client';
import { motion } from 'framer-motion';
import { useAuth } from '../../auth/AuthContext';

type Idea = {
  ideaId: number;
  title: string;
  description: string;
  confidentialityLevel?: string;
  owner?: { username?: string };
};

type MentorConnection = {
  connectionId: number;
  idea: Idea;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
};

const MentorPage: React.FC = () => {
  const { token } = useAuth();
  const theme = useTheme();
  const [tab, setTab] = useState(0);

  // Browse ideas
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);

  // Requests
  const [requests, setRequests] = useState<MentorConnection[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Dialog for sending request
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!token) return;
    if (tab === 0) loadIdeas();
    if (tab === 1) loadRequests();
    if (tab === 2) loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, token]);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === 'mentor-connection-updated') {
        if (token && tab === 1) loadRequests();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, [token, tab]);

  const loadIdeas = async () => {
    setLoadingIdeas(true);
    try {
      const res = await api.get('/api/ideas');
      setIdeas(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load ideas:', err);
      setIdeas([]);
    } finally {
      setLoadingIdeas(false);
    }
  };

  const loadRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await api.get<MentorConnection[]>('/api/mentor/connections/my-requests');
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load requests:', err);
      setRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const loadNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const res = await api.get('/api/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const openRequestDialog = (idea: Idea) => {
    setSelectedIdea(idea);
    setRequestMessage('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedIdea(null);
    setRequestMessage('');
  };

  const sendRequest = async () => {
    if (!selectedIdea) return;
    if (!requestMessage.trim()) return alert('Please enter a message');
    setSending(true);
    try {
      const res = await api.post('/api/mentor/connections', {
        ideaId: selectedIdea.ideaId,
        message: requestMessage.trim(),
      });
      setRequests((prev) => [res.data, ...prev]);
      closeDialog();
      setTab(1);
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert('You have already sent a request for this idea');
      } else {
        console.error('Failed to send mentor request:', err);
        alert('Failed to send request');
      }
    } finally {
      setSending(false);
    }
  };

  const hasSentRequestForIdea = (ideaId: number) => {
    return requests.some((r) => r.idea?.ideaId === ideaId);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.02)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`, py: 4 }}>
      <Container maxWidth="lg">
        <Fade in={true} timeout={600}>
          <Box>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.info.main} 100%)`, boxShadow: `0 8px 32px ${alpha(theme.palette.secondary.main, 0.3)}` }}>
                <SchoolIcon sx={{ fontSize: 40, color: 'white' }} />
              </Avatar>
              <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 1, fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                Mentor Dashboard
              </Typography>
              <Typography variant="h6" sx={{ color: theme.palette.text.secondary, fontWeight: 400, maxWidth: 600, mx: 'auto', fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>
                Guide entrepreneurs and share your expertise
              </Typography>
            </Box>

            {/* Tabs */}
            <Paper sx={{ borderRadius: 3, mb: 4, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .MuiTab-root': { fontWeight: 600, fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif', textTransform: 'none', fontSize: '1rem' } }} variant="fullWidth">
                <Tab icon={<LightbulbIcon />} iconPosition="start" label={`Browse Ideas (${ideas.length})`} />
                <Tab icon={<Badge badgeContent={requests.length} color="warning"><SendIcon /></Badge>} iconPosition="start" label={`My Requests`} />
                <Tab icon={<Badge badgeContent={notifications.length} color="error"><NotificationsIcon /></Badge>} iconPosition="start" label={`Notifications`} />
              </Tabs>
            </Paper>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr' }, gap: 3 }}>
              <Box>
                {tab === 0 && (
                  <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`, p: 3, color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LightbulbIcon sx={{ fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>Available Ideas for Mentorship</Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      {loadingIdeas ? (
                        <Box display="flex" justifyContent="center" p={4}>
                          <CircularProgress size={32} />
                        </Box>
                      ) : (
                        <Stack spacing={3}>
                          {ideas.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                              <LightbulbIcon sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 2 }} />
                              <Typography color="text.secondary" sx={{ fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>No ideas available for mentorship at the moment</Typography>
                            </Box>
                          )}
                          {ideas.map((idea) => (
                            <Paper key={idea.ideaId} sx={{ p: 3, background: alpha(theme.palette.primary.main, 0.02), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`, borderRadius: 2, transition: 'all 0.2s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(0,0,0,0.1)' } }}>
                              <Stack spacing={2}>
                                <Box>
                                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{idea.title}</Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{idea.description}</Typography>
                                  <Chip label={`Owner: ${idea.owner?.username ?? 'Unknown'}`} size="small" color="primary" variant="outlined" />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                  <Button variant="contained" onClick={() => openRequestDialog(idea)} disabled={hasSentRequestForIdea(idea.ideaId)} startIcon={hasSentRequestForIdea(idea.ideaId) ? <ConnectWithoutContactIcon /> : <SendIcon />} sx={{ borderRadius: 2, background: hasSentRequestForIdea(idea.ideaId) ? theme.palette.action.disabledBackground : `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`, fontWeight: 600, '&:hover': !hasSentRequestForIdea(idea.ideaId) ? { background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`, transform: 'translateY(-1px)' } : {} }}>{hasSentRequestForIdea(idea.ideaId) ? 'Request Sent' : 'Request Mentorship'}</Button>
                                </Box>
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Paper>
                )}

                {tab === 1 && (
                  <Paper sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                    <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`, p: 3, color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <SendIcon sx={{ fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>My Mentorship Requests</Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      {loadingRequests ? (
                        <Box display="flex" justifyContent="center" p={4}>
                          <CircularProgress size={32} />
                        </Box>
                      ) : (
                        <Stack spacing={3}>
                          {requests.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                              <SendIcon sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 2 }} />
                              <Typography color="text.secondary" sx={{ fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>No mentorship requests sent yet</Typography>
                            </Box>
                          )}
                          {requests.map((r) => (
                            <Paper key={r.connectionId} sx={{ p: 3, background: alpha(theme.palette.secondary.main, 0.02), border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`, borderRadius: 2 }}>
                              <Stack spacing={2}>
                                <Box>
                                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{r.idea?.title}</Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{r.idea?.description}</Typography>
                                  <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>Message: "{r.message}"</Typography>
                                </Box>
                                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                                  <Chip label={r.status} size="small" color={r.status === 'ACCEPTED' ? 'success' : r.status === 'REJECTED' ? 'error' : 'warning'} variant="filled" />
                                  <Typography variant="caption" color="text.secondary">Sent: {new Date(r.createdAt).toLocaleDateString()}</Typography>
                                </Stack>
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                      )}
                    </CardContent>
                  </Paper>
                )}

                {tab === 2 && (
                  <Paper sx={{ borderRadius: 3, boxShadow: '0 6px 30px rgba(2,6,23,0.06)', overflow: 'hidden' }}>
                    <Box sx={{ background: `linear-gradient(135deg, ${alpha(theme.palette.info.main,0.95)} 0%, ${alpha(theme.palette.info.dark,0.95)} 100%)`, p: 3, color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <NotificationsIcon sx={{ fontSize: 28 }} />
                      <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>Notifications</Typography>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      {loadingNotifications ? (
                        <Box display="flex" justifyContent="center" p={4}>
                          <CircularProgress size={32} />
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {notifications.length === 0 && (
                            <Box sx={{ textAlign: 'center', py: 6 }}>
                              <NotificationsIcon sx={{ fontSize: 56, color: theme.palette.text.disabled, mb: 2 }} />
                              <Typography color="text.secondary" sx={{ fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif' }}>You're all caught up — no new notifications</Typography>
                            </Box>
                          )}

                          {notifications.map((n, idx) => (
                            <motion.div key={n.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: idx * 0.06 }}>
                              <Paper sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, borderRadius: 2, background: idx % 2 === 0 ? alpha(theme.palette.info.main, 0.03) : 'transparent' }}>
                                <Avatar sx={{ bgcolor: theme.palette.info.main, width: 40, height: 40 }}>
                                  <NotificationsIcon />
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body2">{n.message}</Typography>
                                  <Typography variant="caption" color="text.secondary">{new Date(n.createdAt).toLocaleString()}</Typography>
                                </Box>
                                <Chip label={n.read ? 'Read' : 'New'} size="small" color={n.read ? 'default' : 'primary'} />
                              </Paper>
                            </motion.div>
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Paper>
                )}
              </Box>

              {/* Right column removed - ideas list will occupy full width */}
            </Box>

          </Box>
        </Fade>
      </Container>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
        <DialogTitle sx={{ background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`, color: 'white', display: 'flex', alignItems: 'center', gap: 2 }}>
          <SchoolIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Request Mentorship</Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>{selectedIdea?.title}</Typography>
              <Typography variant="body2" color="text.secondary">{selectedIdea?.description}</Typography>
            </Box>
            <TextField label="Your Message" multiline rows={4} value={requestMessage} onChange={(e) => setRequestMessage(e.target.value)} fullWidth placeholder="Introduce yourself and explain how you can help..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={closeDialog} variant="outlined" sx={{ borderRadius: 2, px: 3 }}>Cancel</Button>
          <Button variant="contained" onClick={sendRequest} disabled={sending} startIcon={sending ? <CircularProgress size={16} /> : <SendIcon />} sx={{ borderRadius: 2, px: 3, background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`, fontWeight: 600 }}>{sending ? 'Sending...' : 'Send Request'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MentorPage;

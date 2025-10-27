import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack, Card, CardContent, Button, CircularProgress, Paper, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import PersonIcon from '@mui/icons-material/Person';
import api from '../../api/client';

interface MentorConnectionDTO {
  connectionId: number;
  ideaId?: number;
  ideaTitle?: string;
  ideaDescription?: string;
  ideaOwnerId?: number;
  ideaOwnerUsername?: string;
  mentorId?: number;
  mentorUsername?: string;
  message?: string;
  status?: string;
  createdAt?: string;
}

const EntrepreneurMentorRequests: React.FC = () => {
  const theme = useTheme();
  const [requests, setRequests] = useState<MentorConnectionDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const resp = await api.get('/api/mentor/connections/received');
      setRequests(resp.data || []);
    } catch (err) {
      console.error('Failed to fetch mentor requests', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id: number, status: 'ACCEPTED' | 'REJECTED') => {
    setUpdatingId(id);
    try {
      await api.put(`/api/mentor/connections/${id}/status`, null, { params: { status } });
      await fetchRequests();
      // notify other windows/tabs (and other components) that a mentor-connection changed
      try {
        localStorage.setItem('mentor-connection-updated', JSON.stringify({ id, status, ts: Date.now() }));
      } catch (e) {
        // ignore localStorage failures (e.g., private mode)
      }
    } catch (err: any) {
      console.error('Failed to update status', err);
      alert(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>Mentor Requests</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Requests sent by mentors to connect with your ideas. Accept to start a mentorship, or decline if not a fit.
      </Typography>

      {requests.length === 0 ? (
        <Paper sx={{ p: 3 }}>
          <Typography>No mentor requests at the moment.</Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 3,
            alignItems: 'start',
          }}
        >
          {requests.map((r) => (
            <motion.div
              key={r.connectionId}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Card
                sx={{
                  borderRadius: 2,
                  width: '100%',
                  // make card content height driven but compact
                  minHeight: { xs: 140, sm: 160 },
                  maxWidth: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  overflow: 'hidden',
                  p: { xs: 2, sm: 2.5 },
                }}
              >
                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 0 }}>
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48 }}>
                      {r.mentorUsername ? r.mentorUsername.charAt(0).toUpperCase() : <PersonIcon />}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>{r.mentorUsername || 'Mentor'}</Typography>
                      <Typography variant="caption" color="text.secondary">Requested for: {r.ideaTitle || '—'}</Typography>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 0.5 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{r.message}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">{r.status}</Typography>

                    {r.status === 'PENDING' && (
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="contained" onClick={() => updateStatus(r.connectionId, 'ACCEPTED')} disabled={updatingId === r.connectionId}> {updatingId === r.connectionId ? <CircularProgress size={14} /> : 'Accept'}</Button>
                        <Button size="small" color="error" variant="outlined" onClick={() => updateStatus(r.connectionId, 'REJECTED')} disabled={updatingId === r.connectionId}> {updatingId === r.connectionId ? <CircularProgress size={14} /> : 'Decline'}</Button>
                      </Stack>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default EntrepreneurMentorRequests;

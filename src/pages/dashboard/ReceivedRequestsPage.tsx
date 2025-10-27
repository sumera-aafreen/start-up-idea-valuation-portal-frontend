import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, CircularProgress, Stack, Typography, Button } from '@mui/material';
import api from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

type Request = {
  connectionId: number;
  ideaId: number;
  ideaTitle?: string;
  ideaDescription?: string;
  mentorUsername?: string;
  mentorId?: number;
  message?: string;
  status?: string;
  createdAt?: string;
};

const ReceivedRequestsPage: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    if (!token) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<Request[]>('/api/mentor/connections/received');
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load received requests', err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (connectionId: number, status: 'ACCEPTED' | 'REJECTED') => {
    try {
      await api.put(`/api/mentor/connections/${connectionId}/status?status=${status}`);
      // reload requests
      await load();
    } catch (err: any) {
      console.error('Failed to update status', err);
      if (err?.response?.status === 403) {
        alert('You are not allowed to update this request');
      }
    }
  };

  const [mentorProfiles, setMentorProfiles] = React.useState<Record<number, any>>({});

  const loadMentorProfile = async (mentorId?: number) => {
    if (!mentorId) return;
    if (mentorProfiles[mentorId]) return; // cached
    try {
      const res = await api.get(`/api/users/${mentorId}`);
      setMentorProfiles((p) => ({ ...p, [mentorId]: res.data }));
    } catch (err) {
      console.error('Failed to load mentor profile', err);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" mb={2}>Mentor Requests (Received)</Typography>
      {loading ? (
        <Box display="flex" justifyContent="center"><CircularProgress /></Box>
      ) : (
        <Stack spacing={2}>
          {requests.length === 0 && <Typography>No mentor requests received.</Typography>}
          {requests.map((r) => (
            <Card key={r.connectionId}>
              <CardContent>
                <Typography variant="subtitle1">{r.ideaTitle}</Typography>
                <Typography variant="body2" color="text.secondary">{r.ideaDescription}</Typography>
                <Typography variant="body2">From: {r.mentorUsername}</Typography>
                <Typography variant="body2">Message: {r.message}</Typography>
                <Typography variant="body2">Status: {r.status}</Typography>
                <Typography variant="caption">Sent at: {r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</Typography>

                {r.status === 'PENDING' && (
                  <Stack direction="row" spacing={1} mt={2}>
                    <Button variant="contained" color="primary" onClick={() => updateStatus(r.connectionId, 'ACCEPTED')}>Accept</Button>
                    <Button variant="outlined" color="secondary" onClick={() => updateStatus(r.connectionId, 'REJECTED')}>Decline</Button>
                  </Stack>
                )}

                {r.status === 'ACCEPTED' && r.mentorId && (
                  <Box mt={2}>
                    <Button size="small" onClick={() => loadMentorProfile(r.mentorId)}>View Mentor Profile</Button>
                    {mentorProfiles[r.mentorId] && (
                      <Box mt={1}>
                        <Typography variant="subtitle2">{mentorProfiles[r.mentorId].username}</Typography>
                        <Typography variant="body2">Email: {mentorProfiles[r.mentorId].email}</Typography>
                        <Typography variant="body2">Expertise: {mentorProfiles[r.mentorId].expertise}</Typography>
                      </Box>
                    )}
                  </Box>
                )}

              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ReceivedRequestsPage;

import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Stack, Typography, Container } from '@mui/material';
import api from '../../api/client';

const AllProgramsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/events');
      setEvents(res.data || []);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    loadEvents();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 4, fontFamily: 'Inter' }}>
        All Programs & Events
      </Typography>
      
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Box>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {events.length === 0 && (
              <Typography color="text.secondary">No programs available.</Typography>
            )}
            {events.map(ev => (
              <Card key={ev.eventId} sx={{ width: 320, m: 0.5, borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, fontFamily: 'Inter' }}>
                    {ev.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {ev.description}
                  </Typography>
                  <Typography variant="caption" color="primary" sx={{ display: 'block', mb: 1 }}>
                    📍 {ev.place}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    🗓️ {ev.dateTime ? new Date(ev.dateTime).toLocaleString() : 'TBD'}
                  </Typography>
                  {ev.registrationLink && (
                    <Button 
                      size="small" 
                      variant="contained"
                      onClick={() => window.open(ev.registrationLink, '_blank')}
                      sx={{ mt: 1 }}
                    >
                      Register Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      )}
    </Container>
  );
};

export default AllProgramsPage;
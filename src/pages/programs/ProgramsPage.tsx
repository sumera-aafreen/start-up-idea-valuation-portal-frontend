import React, { useEffect, useState } from 'react';
import { 
  Box, Button, Card, CardContent, Stack, Typography, 
  TextField, Paper, Divider, Dialog, DialogTitle, 
  DialogContent, DialogActions
} from '@mui/material';
import { useAuth } from '../../auth/AuthContext';
import api from '../../api/client';

const ProgramsPage: React.FC = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);

  const [programForm, setProgramForm] = useState({
    title: '',
    description: '',
    place: '',
    dateTime: '',
    registrationLink: ''
  });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

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

  const checkIfOrganizer = () => {
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const role = payload?.role;
      setIsOrganizer(['PROGRAM_ORGANISER', 'PROGRAM_ORGANIZER', 'ORGANIZER', 'ORGANISER'].includes(role));
    } catch (e) {
      console.error('Error parsing token:', e);
    }
  };

  useEffect(() => { 
    loadEvents();
    checkIfOrganizer();
  }, []);

  const handleFormChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgramForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/events', programForm);
      alert('Program created successfully!');
      setProgramForm({ title: '', description: '', place: '', dateTime: '', registrationLink: '' });
      loadEvents();
    } catch (err) {
      console.error('Failed to create program', err);
      alert('Failed to create program');
    }
  };

  const openEditDialog = (ev: any) => {
    setSelectedEvent(ev);
    setProgramForm({
      title: ev.title,
      description: ev.description,
      place: ev.place,
      dateTime: ev.dateTime,
      registrationLink: ev.registrationLink
    });
    setEditDialogOpen(true);
  };

  const handleUpdateProgram = async () => {
    if (!selectedEvent) return;
    try {
      await api.put(`/api/events/${selectedEvent.eventId}`, programForm);
      alert('Program updated successfully!');
      setEditDialogOpen(false);
      loadEvents();
    } catch (err) {
      console.error('Failed to update program', err);
      alert('Update failed');
    }
  };

  const handleDeleteProgram = async (id: number) => {
    if (!window.confirm("Are you sure to delete this event?")) return;
    try {
      await api.delete(`/api/events/${id}`);
      alert("Program deleted!");
      loadEvents();
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Delete failed");
    }
  };

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 700 }}>Programs & Events</Typography>
      
      {isOrganizer && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Create New Program</Typography>
          <form onSubmit={handleCreateProgram}>
            <Stack spacing={2}>
              <TextField label="Title" value={programForm.title} onChange={handleFormChange('title')} required />
              <TextField label="Description" value={programForm.description} onChange={handleFormChange('description')} required multiline rows={3} />
              <TextField label="Location" value={programForm.place} onChange={handleFormChange('place')} required />
              <TextField label="Date & Time" type="datetime-local" value={programForm.dateTime} onChange={handleFormChange('dateTime')} required InputLabelProps={{ shrink: true }} />
              <TextField label="Registration Link" value={programForm.registrationLink} onChange={handleFormChange('registrationLink')} />
              <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>
                Create Program
              </Button>
            </Stack>
          </form>
        </Paper>
      )}

      <Divider />

      <Typography variant="h6" sx={{ fontWeight: 600 }}>All Programs</Typography>
      {loading ? <Typography>Loading...</Typography> : (
        <Stack direction="row" flexWrap="wrap" spacing={2}>
          {events.length === 0 && <Typography>No events available.</Typography>}
          {events.map(ev => (
            <Card key={ev.eventId} sx={{ width: 320 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{ev.title}</Typography>
                <Typography variant="body2">{ev.description}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {ev.place} • {new Date(ev.dateTime).toLocaleString()}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                  <Button size="small" variant="outlined" onClick={() => window.open(ev.registrationLink, "_blank")}>Register</Button>

                  {isOrganizer && (
                    <>
                      <Button size="small" variant="contained" onClick={() => openEditDialog(ev)}>Edit</Button>
                      <Button size="small" color="error" variant="contained" onClick={() => handleDeleteProgram(ev.eventId)}>Delete</Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit Program</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={programForm.title} onChange={handleFormChange('title')} required />
            <TextField label="Description" value={programForm.description} onChange={handleFormChange('description')} required multiline rows={3} />
            <TextField label="Location" value={programForm.place} onChange={handleFormChange('place')} required />
            <TextField label="Date & Time" type="datetime-local" value={programForm.dateTime} onChange={handleFormChange('dateTime')} required InputLabelProps={{ shrink: true }} />
            <TextField label="Registration Link" value={programForm.registrationLink} onChange={handleFormChange('registrationLink')} />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateProgram} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>

    </Stack>
  );
};

export default ProgramsPage;

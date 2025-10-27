import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography, MenuItem } from '@mui/material';
import api from '../../api/client';

type Project = {
  validationId: number;
  validationPlan: string;
  status: string;
  progressMetrics: string;
};

const ValidationPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [validationPlan, setValidationPlan] = useState('');
  const [ideas, setIdeas] = useState<any[]>([]);

  const load = async () => {
    const res = await api.get('/api/validation/projects');
    setProjects(res.data);
  };

  const loadIdeas = async () => {
    try {
      const res = await api.get('/api/ideas/me');
      setIdeas(res.data || []);
    } catch (err) {
      console.error('Failed to load ideas', err);
      setIdeas([]);
    }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { loadIdeas(); }, []);

  const [selectedIdeaId, setSelectedIdeaId] = useState<number | ''>('');

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIdeaId) {
      alert('Please select an idea to create a validation project for.');
      return;
    }
    await api.post('/api/validation/projects', { idea: { ideaId: Number(selectedIdeaId) }, validationPlan });
    setValidationPlan('');
    setSelectedIdeaId('');
    await load();
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Validation Projects</Typography>
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>Create Project</Typography>
          <Box component="form" onSubmit={create}>
            <Stack spacing={2}>
                <TextField select label="Select Idea" value={selectedIdeaId} onChange={(e)=>setSelectedIdeaId(e.target.value ? Number(e.target.value) : '')}>
                  <MenuItem value="">None</MenuItem>
                  {ideas.map((i:any) => <MenuItem key={i.ideaId} value={i.ideaId}>{i.title}</MenuItem>)}
                </TextField>
                <TextField label="Validation Plan" value={validationPlan} onChange={(e)=>setValidationPlan(e.target.value)} />
              <Button type="submit" variant="contained">Create</Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>Projects</Typography>
          <Stack spacing={1}>
            {projects.map(p => (
              <Box key={p.validationId} p={1} bgcolor="#f5f7ff" borderRadius={1}>
                <Typography variant="subtitle2">{p.validationPlan}</Typography>
                <Typography variant="body2" color="text.secondary">{p.status}</Typography>
                <Typography variant="caption">{p.progressMetrics}</Typography>
              </Box>
            ))}
            {projects.length === 0 && <Typography>No projects</Typography>}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default ValidationPage;



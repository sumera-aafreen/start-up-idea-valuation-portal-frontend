import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import api from '../../api/client';

type Feedback = {
  feedbackId: number;
  comments: string;
};

const FeedbackPage: React.FC = () => {
  const [comments, setComments] = useState('');
  const [projectId, setProjectId] = useState('');
  const [items, setItems] = useState<Feedback[]>([]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/api/feedback/expert', { comments });
    setComments('');
  };

  const load = async () => {
    if (!projectId) return;
    const res = await api.get(`/api/feedback/project/${projectId}`);
    setItems(res.data);
  };

  return (
    <Stack spacing={3}>
      <Typography variant="h5">Feedback</Typography>
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>Submit Expert Feedback</Typography>
          <Box component="form" onSubmit={submit}>
            <Stack spacing={2}>
              <TextField label="Comments" value={comments} onChange={(e)=>setComments(e.target.value)} multiline minRows={3} />
              <Button type="submit" variant="contained">Submit</Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>Project Feedback</Typography>
          <Stack direction="row" spacing={2} mb={2}>
            <TextField label="Project ID" value={projectId} onChange={(e)=>setProjectId(e.target.value)} />
            <Button variant="outlined" onClick={load}>Load</Button>
          </Stack>
          <Stack spacing={1}>
            {items.map(f => (
              <Box key={f.feedbackId} p={1} bgcolor="#f5f7ff" borderRadius={1}>
                <Typography variant="body2">{f.comments}</Typography>
              </Box>
            ))}
            {items.length === 0 && <Typography>No feedback</Typography>}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};

export default FeedbackPage;



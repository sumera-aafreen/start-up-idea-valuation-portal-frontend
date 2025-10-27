import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, Typography, Avatar, Paper } from '@mui/material';
import { motion } from 'framer-motion';
import api from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { keyframes } from '@emotion/react';

type Idea = { ideaId: number; title: string; description?: string; owner?: { username?: string, userId?: number } };

const ExpertDashboard: React.FC = () => {
  const { token } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Idea | null>(null);
  const [form, setForm] = useState({ novelty: 5, societalImpact: 5, marketPotential: 5, feasibility: 5, scalability: 5 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [alreadyEvaluated, setAlreadyEvaluated] = useState(false);

  const loadIdeas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/ideas');
      setIdeas(res.data || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadIdeas(); }, [token]);

  // keep CSS keyframes for very small fallback uses, but prefer Framer Motion variants
  const pop = keyframes`
    from { opacity: 0; transform: translateY(10px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  `;

  const motionVariants = {
    hidden: { opacity: 0, y: 14, scale: 0.985 },
    visible: (i: number) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: i * 0.12, duration: 0.6 } }),
    hover: { scale: 1.03, y: -6, transition: { duration: 0.25 } },
  };

  const openEval = async (idea: Idea) => {
    setSelected(idea);
    setForm({ novelty:5, societalImpact:5, marketPotential:5, feasibility:5, scalability:5 });
    setAlreadyEvaluated(false);
    setDialogOpen(true);
    // check if current user already evaluated this idea
    try {
      setChecking(true);
      const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
      const username = payload?.sub ?? null;
      const res = await api.get(`/api/evaluations/${idea.ideaId}`);
      const list = res.data || [];
      if (username && Array.isArray(list)) {
        const found = list.find((ev: any) => ev.expert && (ev.expert.username === username || ev.expert?.user?.username === username || ev.expert?.userName === username));
        if (found) setAlreadyEvaluated(true);
      }
    } catch (err) {
      console.warn('Failed to check existing evaluations', err);
    } finally { setChecking(false); }
  };

  const submitEval = async () => {
    if (!selected) return;
    // basic validation
    for (const k of ['novelty','societalImpact','marketPotential','feasibility','scalability'] as const) {
      const v = (form as any)[k];
      if (v == null || isNaN(v) || v < 0 || v > 10) return alert(`${k} must be a number between 0 and 10`);
    }
    try {
      await api.post('/api/evaluations', { ideaId: selected.ideaId, ...form });
      alert('Evaluation submitted');
      setDialogOpen(false);
      setSelected(null);
    } catch (err:any) {
      alert(err?.response?.data?.message || err?.response?.data || err.message || 'Error');
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, background: (theme) => theme.palette.mode === 'light' ? '#f7fafc' : '#0b1220', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
  {/* top header removed per UX request - we keep the welcome card below */}

        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <>
            <Paper sx={{ p: 3, mb: 3, borderRadius: 3, background: (theme) => theme.palette.mode === 'light' ? '#fff' : '#071124' }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Avatar sx={{ width: 64, height: 64, bgcolor: (theme) => theme.palette.primary.main }}>E</Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>Welcome, Expert</Typography>
                  <Typography variant="body2" color="text.secondary">Browse ideas and submit your expert evaluations. Your input helps entrepreneurs grow.</Typography>
                </Box>
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: { xs: 'stretch', sm: 'flex-end' } }}>
                <Button variant="outlined" onClick={() => { (window as any).location.pathname = '/expert/evaluations'; }}>My Evaluations</Button>
              </Box>
            </Paper>

            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
              {ideas.map((i, idx) => (
                <motion.div key={i.ideaId} custom={idx} initial="hidden" animate="visible" whileHover="hover" variants={motionVariants} style={{ width: '100%' }}>
                  <Card sx={{ borderRadius: 2, overflow: 'hidden', transition: 'box-shadow 200ms ease', boxShadow: '0 6px 18px rgba(2,6,23,0.06)' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>{i.title}</Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>{i.description}</Typography>
                          <Typography variant="caption" color="text.secondary">By: {i.owner?.username ?? 'unknown'}</Typography>
                        </Box>
                        <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                          <Button variant="contained" color="primary" size="small" onClick={() => openEval(i)} sx={{ fontWeight: 700 }}>Evaluate</Button>
                          <Typography variant="caption" color="text.secondary">ID: {i.ideaId}</Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </Box>
          </>
        )}
      </Box>
      
      <Dialog open={dialogOpen} onClose={() => { setDialogOpen(false); setSelected(null); }} fullWidth maxWidth="sm">
        <DialogTitle>Evaluate: {selected?.title}</DialogTitle>
        <DialogContent dividers>
          {checking ? <Typography>Checking previous evaluations...</Typography> : (
            alreadyEvaluated ? (
              <Typography color="text.secondary">You have already evaluated this idea.</Typography>
            ) : (
              <Stack spacing={2} sx={{ mt: 1 }}>
                {(['novelty','societalImpact','marketPotential','feasibility','scalability'] as const).map((k) => (
                  <TextField key={k} label={k} type="number" inputProps={{ min:0, max:10 }} value={(form as any)[k]} onChange={(e) => setForm({...form, [k]: Number(e.target.value)})} fullWidth />
                ))}
              </Stack>
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setDialogOpen(false); setSelected(null); }}>Close</Button>
          <Button variant="contained" onClick={submitEval} disabled={checking || alreadyEvaluated}>Submit</Button>
        </DialogActions>
      </Dialog>
  </Box>
  );
};

export default ExpertDashboard;

import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress, Stack, Button, Chip } from '@mui/material';
import api from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

type Eval = {
  evaluationId: number;
  ideaId: number;
  expertId: number;
  expertUsername: string;
  novelty: number;
  societalImpact: number;
  marketPotential: number;
  feasibility: number;
  scalability: number;
  averageScore: number;
  evaluatedAt: string;
};

type Idea = { ideaId: number; title: string; description?: string };

const ExpertEvaluationsPage: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<Array<Eval & { ideaTitle?: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
        const username = payload?.sub ?? payload?.username ?? null;

        // fetch all ideas (we'll query evaluations per idea)
        const ideasRes = await api.get('/api/ideas');
        const ideas: Idea[] = ideasRes.data || [];

        // fetch evaluations for each idea and filter by current expert
        const promises = ideas.map(async (idea) => {
          try {
            const evRes = await api.get(`/api/evaluations/${idea.ideaId}`);
            const list: Eval[] = evRes.data || [];
            const mine = list.filter((e) => e.expertUsername === username || e.expertUsername === payload?.sub);
            return mine.map((m) => ({ ...m, ideaTitle: idea.title }));
          } catch (err) {
            return [] as Array<Eval & { ideaTitle?: string }>;
          }
        });

        const nested = await Promise.all(promises);
        const flat = nested.flat();
        if (!mounted) return;
        setEvaluations(flat.sort((a, b) => new Date(b.evaluatedAt).getTime() - new Date(a.evaluatedAt).getTime()));
      } catch (err: any) {
        console.error(err);
        if (!mounted) return;
        setError(err?.message || 'Failed to load evaluations');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [token]);

  if (loading) return <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ py: 6, textAlign: 'center' }}><Typography color="error">{error}</Typography></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>My Evaluations</Typography>
      {evaluations.length === 0 ? (
        <Typography color="text.secondary">You haven't evaluated any ideas yet.</Typography>
      ) : (
        <Stack spacing={2}>
          {evaluations.map((ev) => (
            <Card key={ev.evaluationId} sx={{ borderRadius: 2 }}>
              <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>{ev.ideaTitle ?? `Idea ${ev.ideaId}`}</Typography>
                  <Typography variant="body2" color="text.secondary">Average score: <strong>{ev.averageScore?.toFixed?.(2) ?? ev.averageScore}</strong></Typography>
                  <Typography variant="caption" color="text.secondary">Evaluated at: {new Date(ev.evaluatedAt).toLocaleString()}</Typography>
                  <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={`novelty: ${ev.novelty}`} size="small" />
                    <Chip label={`societalImpact: ${ev.societalImpact}`} size="small" />
                    <Chip label={`marketPotential: ${ev.marketPotential}`} size="small" />
                    <Chip label={`feasibility: ${ev.feasibility}`} size="small" />
                    <Chip label={`scalability: ${ev.scalability}`} size="small" />
                  </Box>
                </Box>
                <Box>
                  <Button variant="outlined" size="small" href={`/idea-evaluation/${ev.ideaId}`}>View all</Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default ExpertEvaluationsPage;

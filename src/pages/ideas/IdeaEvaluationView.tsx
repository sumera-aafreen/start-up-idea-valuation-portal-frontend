import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardContent, Grid, Stack, Typography, Paper } from '@mui/material';
import api from '../../api/client';
import { useParams } from 'react-router-dom';

import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { Radar, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, ArcElement, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

type Eval = { evaluationId: number; novelty:number; societalImpact:number; marketPotential:number; feasibility:number; scalability:number; averageScore:number; expertUsername?: string };

const colorFor = (i:number) => ['#6C5CE7','#00B894','#0984E3','#FD79A8','#FFB142'][i % 5];

const IdeaEvaluationView: React.FC = () => {
  const { ideaId } = useParams();
  const [evals, setEvals] = useState<Eval[]>([]);

  useEffect(() => {
    if (!ideaId) return;
    (async () => {
      try {
        const res = await api.get(`/api/evaluations/${ideaId}`);
        setEvals(res.data || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [ideaId]);

  const metrics = ['novelty','societalImpact','marketPotential','feasibility','scalability'] as const;

  const summary = useMemo(() => {
    const count = evals.length;
    const totals = { novelty:0, societalImpact:0, marketPotential:0, feasibility:0, scalability:0 } as any;
    let avgTotal = 0;
    evals.forEach(e => {
      totals.novelty += e.novelty || 0;
      totals.societalImpact += e.societalImpact || 0;
      totals.marketPotential += e.marketPotential || 0;
      totals.feasibility += e.feasibility || 0;
      totals.scalability += e.scalability || 0;
      avgTotal += e.averageScore || 0;
    });
    const averages = count ? metrics.map((m) => Math.round((totals[m] / count) * 10) / 10) : metrics.map(() => 0);
    const overallAvg = count ? Math.round((avgTotal / count) * 100) / 100 : 0;
    return { count, averages, overallAvg };
  }, [evals]);

  const radarData = {
    labels: ['Novelty', 'Societal Impact', 'Market Potential', 'Feasibility', 'Scalability'],
    datasets: [
      {
        label: 'Average (out of 10)',
        data: summary.averages,
        backgroundColor: 'rgba(99,102,241,0.25)',
        borderColor: '#6366F1',
        pointBackgroundColor: '#6366F1',
      },
    ],
  };

  const barData = {
    labels: evals.map(e => e.expertUsername || 'expert'),
    datasets: metrics.map((m,i) => ({
      label: m,
      data: evals.map(e => (e as any)[m] ?? 0),
      backgroundColor: colorFor(i),
    }))
  };

  const pieBuckets = useMemo(() => {
    const buckets = { '9-10':0, '7-8':0, '5-6':0, '0-4':0 } as any;
    evals.forEach(e => {
      const v = e.averageScore ?? 0;
      if (v >= 9) buckets['9-10']++;
      else if (v >= 7) buckets['7-8']++;
      else if (v >= 5) buckets['5-6']++;
      else buckets['0-4']++;
    });
    return buckets;
  }, [evals]);

  const pieData = {
    labels: Object.keys(pieBuckets),
    datasets: [{ data: Object.values(pieBuckets), backgroundColor: ['#00B894','#0984E3','#FD79A8','#FF7675'] }]
  };

  if (!ideaId) return <Typography>No idea selected</Typography>;

  return (
    <Stack spacing={3} sx={{ p:3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>Expert Evaluations</Typography>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: '0 0 320px' }}>
          <Paper sx={{ p:2 }} elevation={3}>
            <Typography variant="h6">Summary</Typography>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight:700 }}>{summary.overallAvg?.toFixed(2)}</Typography>
            <Typography color="text.secondary">Average score across {summary.count} evaluation(s)</Typography>
            <Stack spacing={1} sx={{ mt:2 }}>
              {metrics.map((m,i) => (
                <Box key={m}>
                  <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>{m.replace(/([A-Z])/g, ' $1')}</Typography>
                  <Box sx={{ height: 10, bgcolor: '#f1f5f9', borderRadius: 1, overflow: 'hidden' }}>
                    <Box sx={{ height: '100%', width: `${(summary.averages[i]||0)/10*100}%`, bgcolor: colorFor(i) }} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p:2 }} elevation={3}>
            <Radar redraw data={radarData} options={{
              scales: { r: { suggestedMin: 0, suggestedMax: 10 } },
            }} />
          </Paper>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: 2 }}>
          <Paper sx={{ p:2 }} elevation={3}>
            <Typography variant="h6">Per-expert breakdown</Typography>
            <Bar redraw data={barData} options={{ responsive: true, scales: { y: { suggestedMin: 0, suggestedMax: 10 } } }} />
          </Paper>
        </Box>

        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p:2 }} elevation={3}>
            <Typography variant="h6">Distribution</Typography>
            <Pie redraw data={pieData} />
          </Paper>
        </Box>
      </Box>

      <Stack spacing={1}>
        <Typography variant="h6">Raw evaluations</Typography>
        {evals.length === 0 ? (
          <Typography color="text.secondary">No evaluations yet.</Typography>
        ) : (
          evals.map(ev => (
            <Card key={ev.evaluationId} sx={{ mb:1 }}>
              <CardContent>
                <Typography sx={{ fontWeight:700 }}>{ev.expertUsername}</Typography>
                <Typography color="text.secondary">Average: {ev.averageScore?.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Stack>
  );
};

export default IdeaEvaluationView;

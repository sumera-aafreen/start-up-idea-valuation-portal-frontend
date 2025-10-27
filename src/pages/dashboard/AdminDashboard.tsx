import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  TableSortLabel,
  TextField,
} from '@mui/material';
import UsersPage from '../users/UsersPage';
import IdeasPage from '../ideas/IdeasPage';
import { Bar, Pie, Line, Radar } from 'react-chartjs-2';
import api from '../../api/client';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import Avatar from '@mui/material/Avatar';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
  LineElement,
  PointElement,
  RadialLinearScale,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, ChartTooltip, Legend, LineElement, PointElement, RadialLinearScale);

const AdminDashboard: React.FC = () => {
  const [usersStats, setUsersStats] = useState<any>({});
  const [ideaCounts, setIdeaCounts] = useState<any>({});
  const [analyticsMock, setAnalyticsMock] = useState<any | null>(null);
  const [range, setRange] = useState<'7d'|'30d'|'90d'>('30d');
  // removed unused loading state
  const [activeTab, setActiveTab] = useState('analytics');
  const [logs, setLogs] = useState<any[]>([]);
  const [logsPage, setLogsPage] = useState(0);
  const [logsRowsPerPage, setLogsRowsPerPage] = useState(6);

  const exportAnalytics = () => {
    try {
      const a = analyticsMock || {
        totalUsers: 0,
        newUsersMonth: 0,
        totalIdeas: 0,
      };
      const rows = [
        ['metric', 'value'],
        ['totalUsers', a.totalUsers],
        ['newUsersMonth', a.newUsersMonth],
        ['totalIdeas', a.totalIdeas],
      ];
      const csv = rows.map(r => r.map(String).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const aEl = document.createElement('a');
      aEl.href = url;
      aEl.download = 'analytics.csv';
      aEl.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const u = await api.get('/api/admin/stats/users');
        const i = await api.get('/api/admin/stats/ideas');
        setUsersStats(u.data || {});
        setIdeaCounts(i.data || {});
      } catch (err) {
        console.error('Failed to load admin stats', err);
      }
    };
    load();

    // initial mock generation
    generateMock(range);
  }, []);

  // regenerate when range changes
  useEffect(() => {
    generateMock(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  function sampleInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateMock(which: typeof range) {
    // scale factors by range
    const scale = which === '7d' ? 0.25 : which === '30d' ? 1 : 3;
    const totalUsers = sampleInt(800, 2200);
    const newUsersMonth = Math.max(5, Math.floor(totalUsers * 0.03 * scale));
    const totalIdeas = sampleInt(400, 1400);
    const ideasThisMonth = Math.max(2, Math.floor(totalIdeas * 0.02 * scale));

    const dup = {
      totalUsers,
      newUsersMonth,
      totalIdeas,
      ideasThisMonth,
      ideasByStage: { Idea: sampleInt(100, 600), Prototype: sampleInt(80, 400), Validation: sampleInt(30, 200), Launched: sampleInt(10, 80) },
      usersByRole: { ADMIN: sampleInt(4, 12), ENTREPRENEUR: sampleInt(500, 1200), INVESTOR: sampleInt(80, 220), MENTOR: sampleInt(180, 520) },
      topIdeas: Array.from({ length: 6 }).map((_, i) => ({
        id: i + 1,
        title: `Idea ${i + 1}`,
        stage: ['Idea', 'Prototype', 'Validation', 'Launched'][i % 4],
        interests: sampleInt(2, 85),
      })),
      recentSignups: Array.from({ length: 6 }).map((_, i) => ({
        id: i + 1,
        username: ['alice','bob','carol','dan','eva','frank'][i % 6],
        joinedAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24).toISOString(),
      })),
    };
    setAnalyticsMock(dup);

    const now = Date.now();
    const sampleLogs: any[] = Array.from({ length: 28 }).map((_, i) => ({
      id: i + 1,
      time: new Date(now - i * 1000 * 60 * 60).toISOString(),
      user: ['alice', 'bob', 'carol', 'dan'][i % 4],
      action: ['Created idea', 'Updated user', 'Deleted program', 'Reviewed request'][i % 4],
      details: `Sample detail entry #${i + 1}`,
    }));
    setLogs(sampleLogs);
  }

  const usersData = {
    labels: Object.keys(usersStats && Object.keys(usersStats).length ? usersStats : { 'No data': 0 }),
    datasets: [
      {
        label: 'Users',
        backgroundColor: ['#6C5CE7', '#00B894', '#0984E3', '#FD79A8'],
        data: Object.values(usersStats && Object.keys(usersStats).length ? usersStats : { 'No data': 0 }),
      },
    ],
  };

  const ideasData = {
    labels: Object.keys(ideaCounts && Object.keys(ideaCounts).length ? ideaCounts : { 'No data': 0 }),
    datasets: [
      {
        label: 'Ideas by Stage',
        backgroundColor: ['#6C5CE7', '#00B894', '#0984E3', '#FD79A8'],
        data: Object.values(ideaCounts && Object.keys(ideaCounts).length ? ideaCounts : { 'No data': 0 }),
      },
    ],
  };

  // if analyticsMock present, build chart-friendly data
  const analyticsUsersData = analyticsMock
    ? { labels: Object.keys(analyticsMock.usersByRole), datasets: [{ label: 'Users', data: Object.values(analyticsMock.usersByRole), backgroundColor: ['#6C5CE7', '#00B894', '#0984E3', '#FD79A8'] }] }
    : usersData;

  const analyticsIdeasData = analyticsMock
    ? { labels: Object.keys(analyticsMock.ideasByStage), datasets: [{ label: 'Ideas', data: Object.values(analyticsMock.ideasByStage), backgroundColor: ['#6C5CE7', '#00B894', '#0984E3', '#FD79A8'] }] }
    : ideasData;

  // growth line data (mock)
  const growthLineData = analyticsMock
    ? {
        labels: Array.from({ length: 8 }).map((_, i) => `W-${7 - i}`),
        datasets: [
          { label: 'Website Visits', data: Array.from({ length: 8 }).map((_, i) => 2000 + i * 450 + (i % 2 ? 200 : -150)), borderColor: '#4F46E5', tension: 0.3, fill: false },
          { label: 'Signups', data: Array.from({ length: 8 }).map((_, i) => 120 + i * 20 + (i % 3 === 0 ? 30 : 0)), borderColor: '#00B894', tension: 0.3, fill: false },
        ],
      }
    : { labels: [], datasets: [] };

  // security concerns radar data (mock)
  const securityRadarData = {
    labels: ['Input Validation', 'Auth Strength', 'Data Encryption', 'Dependency Risk', 'Third-party Integrations'],
    datasets: [
      { label: 'Risk Score (0-10)', data: [6, 8, 7, 4, 5], backgroundColor: 'rgba(208, 67, 255, 0.12)', borderColor: '#D043FF', pointBackgroundColor: '#D043FF' },
    ],
  };

  return (
    <Box display="flex" gap={3} sx={{ p: 2 }}>
      <Box sx={{ width: 260, minHeight: '70vh', borderRadius: 2 }}>
        <Card sx={{ position: 'sticky', top: 16 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>Admin</Typography>
            <Divider sx={{ mb: 1 }} />
            <List dense>
              <ListItemButton selected={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')}>
                <ListItemText primary="Analytics" />
              </ListItemButton>
              <ListItemButton selected={activeTab === 'users'} onClick={() => setActiveTab('users')}>
                <ListItemText primary="Users" />
              </ListItemButton>
              <ListItemButton selected={activeTab === 'programs'} onClick={() => setActiveTab('programs')}>
                <ListItemText primary="Programs" />
              </ListItemButton>
              {/* Ideas intentionally omitted from admin left menu per request */}
              <ListItemButton selected={activeTab === 'logs'} onClick={() => setActiveTab('logs')}>
                <ListItemText primary="Recent Logs" />
              </ListItemButton>
              <ListItemButton selected={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </List>
          </CardContent>
        </Card>
      </Box>

      <Box flex={1}>
        {activeTab === 'analytics' && (
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" sx={{ fontWeight: 800 }}>Analytics</Typography>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Button startIcon={<FilterListIcon />} variant="outlined" size="small" onClick={() => setRange(r => r === '7d' ? '30d' : r === '30d' ? '90d' : '7d')}>{range}</Button>
                <Button startIcon={<RefreshIcon />} variant="outlined" onClick={() => generateMock(range)} sx={{ mr: 1 }}>Regenerate</Button>
                <Button variant="outlined" onClick={() => exportAnalytics()} sx={{ mr: 1 }}>Export</Button>
              </Box>
            </Box>

            {/* Top metrics cards */}
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' } }}>
              <Card sx={{ background: 'linear-gradient(90deg,#6B7280,#9CA3AF)', color: '#fff' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Customers</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{analyticsMock?.totalUsers ?? '—'}</Typography>
                  <Typography sx={{ opacity: 0.9 }}>Active customers this month: {analyticsMock?.newUsersMonth ?? '—'}</Typography>
                </CardContent>
              </Card>

              <Card sx={{ background: 'linear-gradient(90deg,#60A5FA,#7DD3FC)', color: '#042A2B', boxShadow: 'none' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Growth</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>+{((analyticsMock?.newUsersMonth ?? 0) / Math.max(1, (analyticsMock?.totalUsers ?? 1)) * 100).toFixed(1)}%</Typography>
                  <Typography sx={{ opacity: 0.9 }}>Website growth (4w)</Typography>
                </CardContent>
              </Card>

              <Card sx={{ background: 'linear-gradient(90deg,#FBCFE8,#FDE68A)', color: '#042A2B' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Active Users</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>{Math.floor((analyticsMock?.totalUsers ?? 0) * 0.62)}</Typography>
                  <Typography sx={{ opacity: 0.9 }}>Currently online</Typography>
                </CardContent>
              </Card>

              <Card sx={{ background: 'linear-gradient(90deg,#F3E8FF,#FEE2E2)', color: '#042A2B' }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ opacity: 0.9 }}>Revenue (est.)</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>${(Math.floor((analyticsMock?.totalUsers ?? 0) * 2.4)).toLocaleString()}</Typography>
                  <Typography sx={{ opacity: 0.9 }}>Monthly estimate</Typography>
                </CardContent>
              </Card>
            </Box>

            {/* charts */}
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Website Traffic & Signups (mock)</Typography>
                  <Box sx={{ height: 260 }}>
                    <Line data={growthLineData} />
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Security Concerns (Radar)</Typography>
                  <Box sx={{ height: 260 }}>
                    <Radar data={securityRadarData} />
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Top lists: top ideas and recent signups */}
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Top Ideas (by interest)</Typography>
                  <List>
                    {(analyticsMock?.topIdeas || []).sort((a:any,b:any)=>b.interests-a.interests).slice(0,5).map((t:any)=> (
                      <ListItemButton key={t.id} sx={{ borderRadius: 1, mb: 1 }}>
                        <ListItemText primary={t.title} secondary={`${t.stage} • ${t.interests} interests`} />
                      </ListItemButton>
                    ))}
                  </List>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Recent Signups</Typography>
                  <List>
                    {(analyticsMock?.recentSignups || []).slice(0,6).map((s:any)=> (
                      <ListItemButton key={s.id} sx={{ borderRadius: 1, mb: 1 }}>
                        <Avatar sx={{ width: 36, height: 36, mr: 1 }}>{s.username?.charAt(0)?.toUpperCase()}</Avatar>
                        <ListItemText primary={s.username} secondary={new Date(s.joinedAt).toLocaleString()} />
                      </ListItemButton>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        )}

        {activeTab === 'analytics' && (
          <Stack spacing={2}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Analytics</Typography>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Users by Role (sample)</Typography>
                  <Box sx={{ height: 260 }}>
                    <Pie data={analyticsUsersData} />
                  </Box>
                  <Typography sx={{ mt: 1 }}>Total users: {analyticsMock?.totalUsers ?? usersStats.totalUsers ?? '—'}</Typography>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Ideas by Stage (sample)</Typography>
                  <Box sx={{ height: 260 }}>
                    <Bar data={analyticsIdeasData} />
                  </Box>
                  <Typography sx={{ mt: 1 }}>Total ideas: {analyticsMock?.totalIdeas ?? ideaCounts.total ?? '—'}</Typography>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        )}

        {activeTab === 'logs' && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Recent Activity Logs</Typography>
            <Card>
              <CardContent>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Time</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {logs.slice(logsPage * logsRowsPerPage, logsPage * logsRowsPerPage + logsRowsPerPage).map(l => (
                      <TableRow key={l.id} hover>
                        <TableCell>{new Date(l.time).toLocaleString()}</TableCell>
                        <TableCell>{l.user}</TableCell>
                        <TableCell>{l.action}</TableCell>
                        <TableCell>{l.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <TablePagination
                  component="div"
                  count={logs.length}
                  page={logsPage}
                  onPageChange={(_, p) => setLogsPage(p)}
                  rowsPerPage={logsRowsPerPage}
                  onRowsPerPageChange={(e)=>{ setLogsRowsPerPage(parseInt(e.target.value)); setLogsPage(0); }}
                  rowsPerPageOptions={[6,12,24]}
                />
              </CardContent>
            </Card>
          </Box>
        )}

        {activeTab === 'users' && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Users Management</Typography>
            {/* render UsersPage directly here for full management */}
            <UsersPage />
          </Box>
        )}

        {activeTab === 'ideas' && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Ideas Management</Typography>
            <IdeasPage />
          </Box>
        )}

        {activeTab === 'programs' && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Programs</Typography>
            <ProgramsTable />
          </Box>
        )}
        {activeTab === 'settings' && (
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>Settings</Typography>
            <Card sx={{ p: 2, mt: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Site Appearance</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>Primary palette and global look-and-feel options.</Typography>
              <Box display="flex" gap={2} sx={{ mt: 2 }}>
                <Button variant="contained" sx={{ background: 'linear-gradient(90deg,#6D28D9,#A855F7)' }}>Apply Royal Theme</Button>
                <Button variant="outlined">Reset Colors</Button>
              </Box>
            </Card>

            <Card sx={{ p: 2, mt: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Admin Controls</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>Configure admin email, notifications and operational actions.</Typography>
              <Box sx={{ mt: 2 }}>
                <TextField placeholder="Admin email" fullWidth sx={{ mb: 1 }} />
                <Box display="flex" gap={1} sx={{ mb: 1 }}>
                  <Button variant="contained">Save</Button>
                  <Button variant="outlined">Test Email</Button>
                </Box>

                <Box display="flex" alignItems="center" gap={1} sx={{ mt: 1 }}>
                  <Typography>Enable email notifications</Typography>
                  <TextField select defaultValue="daily" size="small" sx={{ width: 160 }}>
                    <option value="none">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </TextField>
                </Box>

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2">Operational</Typography>
                <Box display="flex" gap={1} sx={{ mt: 1 }}>
                  <Button variant="outlined">Export Users CSV</Button>
                  <Button variant="outlined">Backup Database</Button>
                </Box>
              </Box>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;

// Small Programs table component with client-side sorting + pagination
const ProgramsTable: React.FC = () => {
  const [programs, setPrograms] = React.useState<any[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [orderBy, setOrderBy] = React.useState<string>('title');
  const [orderDir, setOrderDir] = React.useState<'asc'|'desc'>('asc');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await api.get('/api/events');
      setPrograms(res.data || []);
    } catch (err) { console.error(err); }
  };

  const handleRequestSort = (prop: string) => {
    const isAsc = orderBy === prop && orderDir === 'asc';
    setOrderDir(isAsc ? 'desc' : 'asc');
    setOrderBy(prop);
  };

  const sorted = React.useMemo(() => {
    return [...programs].sort((a,b) => {
      const av = a[orderBy] ?? '';
      const bv = b[orderBy] ?? '';
      if (av === bv) return 0;
      if (orderDir === 'asc') return av > bv ? 1 : -1;
      return av < bv ? 1 : -1;
    });
  }, [programs, orderBy, orderDir]);

  const displayed = sorted.slice(page*rowsPerPage, page*rowsPerPage + rowsPerPage);

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <TableSortLabel active={orderBy==='title'} direction={orderDir} onClick={()=>handleRequestSort('title')}>Title</TableSortLabel>
            </TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Place</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {displayed.map(p => (
            <TableRow key={p.eventId} hover>
              <TableCell>{p.title}</TableCell>
              <TableCell>{p.description}</TableCell>
              <TableCell>{p.place}</TableCell>
              <TableCell>{p.dateTime ? new Date(p.dateTime).toLocaleString() : ''}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={programs.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e)=>{ setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
        rowsPerPageOptions={[5,10,20]}
      />
    </>
  );
};

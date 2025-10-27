import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Paper,
} from '@mui/material';
import api from '../../api/client';

type User = {
  userId: number;
  username: string;
  email: string;
  role: string;
  isActive: boolean;
};

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(5);
  const [totalElements, setTotalElements] = useState(0);
  const [sortBy, setSortBy] = useState('userId');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showAll, setShowAll] = useState(false);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ENTREPRENEUR');
  const [filterRole, setFilterRole] = useState<'ALL'|'ENTREPRENEUR'|'INVESTOR'|'MENTOR'|'ADMIN'>('ALL');
  const [filterActive, setFilterActive] = useState<'ALL'|'ACTIVE'|'INACTIVE'>('ALL');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [searchNameDebounced, setSearchNameDebounced] = useState(username);
  const [searchEmailDebounced, setSearchEmailDebounced] = useState(email);

  const loadUsers = async () => {
    try {
      if (showAll) {
        const res = await api.get('/api/users/all');
        let data = res.data as any[];
        const getField = (u: any, key: string) => (u ? u[key] : undefined);
        data = data.sort((a: any, b: any) => {
          const av = getField(a, sortBy);
          const bv = getField(b, sortBy);
          if (av == null && bv == null) return 0;
          if (av == null) return -1;
          if (bv == null) return 1;
          if (typeof av === 'number' && typeof bv === 'number') {
            return sortDir === 'asc' ? av - bv : bv - av;
          }
          return sortDir === 'asc'
            ? String(av).localeCompare(String(bv))
            : String(bv).localeCompare(String(av));
        });
        // apply client-side filters when in showAll mode
        const filtered = data.filter((u: any) => {
          const matchesName = !searchNameDebounced || String(u.username || '').toLowerCase().includes(searchNameDebounced.toLowerCase());
          const matchesEmail = !searchEmailDebounced || String(u.email || '').toLowerCase().includes(searchEmailDebounced.toLowerCase());
          const matchesRole = filterRole === 'ALL' || u.role === filterRole;
          const matchesActive = filterActive === 'ALL' || (filterActive === 'ACTIVE' ? !!u.isActive : !u.isActive);
          return matchesName && matchesEmail && matchesRole && matchesActive;
        });
        setUsers(filtered || []);
        setTotalElements(filtered.length || 0);
      } else {
        // server-side paged request: include filters if provided (backend may accept these)
        const params: any = { page, size, sortBy, sortDir };
        if (username) params.username = username;
        if (email) params.email = email;
        if (filterRole && filterRole !== 'ALL') params.role = filterRole;
        if (filterActive && filterActive !== 'ALL') params.isActive = filterActive === 'ACTIVE';
        const res = await api.get('/api/users', { params });
        const data = res.data;
        setUsers(data.content || []);
        setTotalElements(data.totalElements || 0);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, size, sortBy, sortDir, showAll]);

  // debounce username/email search inputs (300ms)
  useEffect(() => {
    const t = setTimeout(() => setSearchNameDebounced(username), 300);
    return () => clearTimeout(t);
  }, [username]);

  useEffect(() => {
    const t = setTimeout(() => setSearchEmailDebounced(email), 300);
    return () => clearTimeout(t);
  }, [email]);

  // reload when debounced values or other filters change
  useEffect(() => {
    // when using showAll, loadUsers will apply client-side filters; when paged, params will be passed
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchNameDebounced, searchEmailDebounced, filterRole, filterActive, showAll]);

  // Reset page when toggling showAll to keep pagination in range
  useEffect(() => {
    setPage(0);
  }, [showAll]);

  // When in showAll mode, ensure page is within bounds if users length changes
  useEffect(() => {
    if (showAll) {
      const maxPages = Math.max(0, Math.ceil(users.length / size) - 1);
      if (page > maxPages) {
        setPage(0);
      }
    }
  }, [users, size, showAll, page]);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/api/users', {
        username,
        email,
        role,
        passwordHash: password,
      });
      setUsername('');
      setEmail('');
      setPassword('');
      await loadUsers();
    } catch (err: any) {
      console.error(err);
      setError('Create failed');
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSize(parseInt(event.target.value, 10));
    setPage(0);
  };
  const toggleSortDir = () => setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));

  return (
    <Box
      sx={{
        backgroundColor: '#F9F4EF',
        minHeight: '100vh',
        padding: 4,
      }}
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 'bold',
          color: '#6246EA',
          mb: 3,
        }}
      >
        Admin Dashboard
      </Typography>

      {/* Create User Form */}
      <Card
        sx={{
          backgroundColor: '#FFFFFF',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          borderRadius: 3,
          mb: 4,
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: '#2B2C34', mb: 2 }}>
            Create New User
          </Typography>
          <Box component="form" onSubmit={createUser}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ sm: 'center' }}
            >
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>Role</InputLabel>
                <Select value={role} onChange={(e) => setRole(e.target.value)}>
                  <MenuItem value="ENTREPRENEUR">ENTREPRENEUR</MenuItem>
                  <MenuItem value="INVESTOR">INVESTOR</MenuItem>
                  <MenuItem value="MENTOR">MENTOR</MenuItem>
                  <MenuItem value="ADMIN">ADMIN</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: '#6246EA',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#533CCF',
                  },
                }}
              >
                Create
              </Button>
            </Stack>
            {error && (
              <Typography color="error" sx={{ mt: 1 }}>
                {error}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Paper
        sx={{
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          borderRadius: 3,
          backgroundColor: '#FFFFFF',
          p: 2,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ color: '#2B2C34' }}>
            All Users
          </Typography>
          <Box display="flex" gap={2} alignItems="center">
            <FormControlLabel
              control={
                <Switch
                  checked={showAll}
                  onChange={(e) => setShowAll(e.target.checked)}
                  color="primary"
                />
              }
              label="Show All"
            />
            {/* Filters: username, email, role, active */}
            <TextField
              size="small"
              placeholder="Search username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ minWidth: 180 }}
            />
            <TextField
              size="small"
              placeholder="Search email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Role</InputLabel>
              <Select value={filterRole} label="Role" onChange={(e) => setFilterRole(e.target.value as any)}>
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="ENTREPRENEUR">ENTREPRENEUR</MenuItem>
                <MenuItem value="INVESTOR">INVESTOR</MenuItem>
                <MenuItem value="MENTOR">MENTOR</MenuItem>
                <MenuItem value="ADMIN">ADMIN</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Active</InputLabel>
              <Select value={filterActive} label="Active" onChange={(e) => setFilterActive(e.target.value as any)}>
                <MenuItem value="ALL">All</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" size="small" onClick={() => { setUsername(''); setEmail(''); setFilterRole('ALL'); setFilterActive('ALL'); setShowAll(false); }}>
              Clear
            </Button>
            <FormControl size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="userId">User ID</MenuItem>
                <MenuItem value="username">Username</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="role">Role</MenuItem>
              </Select>
            </FormControl>
            <Button
              onClick={toggleSortDir}
              variant="outlined"
              size="small"
              sx={{
                color: '#6246EA',
                borderColor: '#6246EA',
                '&:hover': { backgroundColor: '#E3DFFD' },
              }}
            >
              
              {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
            </Button>
          </Box>
        </Stack>

        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#E3DFFD' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
              {(() => {
                const displayed = showAll ? users.slice(page * size, page * size + size) : users;
                return displayed.map((u) => (
              <TableRow
                key={u.userId}
                sx={{
                  '&:hover': { backgroundColor: '#F2EEFB' },
                }}
              >
                <TableCell>{u.userId}</TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.isActive ? 'Yes' : 'No'}</TableCell>
              </TableRow>
                ));
              })()}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={size}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 20, 50]}
            sx={{ mt: 1 }}
          />
      </Paper>
    </Box>
  );
};

export default UsersPage;

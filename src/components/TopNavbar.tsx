import React from 'react';
import { AppBar, Toolbar, Box, Button, IconButton, Menu, MenuItem, Avatar, Tooltip, Typography, useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useThemeMode } from '../theme/ThemeModeProvider';
import { useAuth } from '../auth/AuthContext';

const TopNavbar: React.FC = () => {
  const { mode, toggle } = useThemeMode();
  const { isAuthenticated, token, logout } = useAuth();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleLogout = () => { logout(); handleClose(); navigate('/'); };

  let username = '';
  try { if (token) { const payload = JSON.parse(atob(token.split('.')[1])); username = payload?.username || payload?.sub || ''; } } catch {}

  const scrollTo = (id: string) => {
    if (window.location.pathname === '/') {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    // navigate to home then scroll shortly after
    navigate('/');
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 220);
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(6px)', background: theme.palette.mode === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(6,10,20,0.5)' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', color: theme.palette.text.primary }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography component={RouterLink} to="/" sx={{ textDecoration: 'none', color: 'inherit', fontWeight: 800, fontSize: '1.1rem' }}>StartUp Portal</Typography>
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
            <Button onClick={() => scrollTo('home-hero')} color="inherit">Home</Button>
            <Button onClick={() => scrollTo('explore-roles')} color="inherit">Explore</Button>
            <Button component={RouterLink} to="/feedback" color="inherit">Contact</Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton color="inherit" onClick={toggle} aria-label="toggle theme">
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </IconButton>

          {!isAuthenticated ? (
            <>
              <Button component={RouterLink} to="/login" variant="outlined" size="small">Login</Button>
              <Button component={RouterLink} to="/register" variant="contained" size="small">Register</Button>
            </>
          ) : (
            <>
              <Tooltip title={username || 'Account'}>
                <IconButton onClick={handleOpen} size="small" sx={{ ml: 2 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    <AccountCircleIcon />
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu anchorEl={anchorEl} open={open} onClose={handleClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
                <MenuItem disabled>{username}</MenuItem>
                <MenuItem onClick={() => { handleClose(); navigate('/settings'); }}>Settings</MenuItem>
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopNavbar;

import React from 'react';
import { Box, IconButton, Menu, MenuItem, Avatar, Tooltip, Button } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useThemeMode } from '../theme/ThemeModeProvider';
import { useAuth } from '../auth/AuthContext';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

const HeaderControls: React.FC = () => {
  const { mode, toggle } = useThemeMode();
  const { isAuthenticated, token, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  let username = '';
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      username = payload?.username || payload?.sub || '';
    }
  } catch {}

  return (
    <Box sx={{ position: 'fixed', right: 12, top: 12, zIndex: (theme) => theme.zIndex.appBar + 10, display: 'flex', gap: 1 }}>
      <IconButton color="inherit" onClick={toggle} aria-label="toggle theme">
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>

      {!isAuthenticated ? (
        <>
          <Button component={RouterLink} to="/login" variant="outlined" color="primary" size="small">Login</Button>
          <Button component={RouterLink} to="/register" variant="contained" color="primary" size="small">Register</Button>
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
  );
};

export default HeaderControls;

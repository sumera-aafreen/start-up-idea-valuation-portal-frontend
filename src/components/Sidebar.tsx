import React from 'react';
import { Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import RequestPageIcon from '@mui/icons-material/ReceiptLong';
import BusinessIcon from '@mui/icons-material/Business';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const Sidebar: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const { token, isAuthenticated } = useAuth();

  let roles: string[] = [];
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload?.roles) roles = Array.isArray(payload.roles) ? payload.roles : [payload.roles];
      else if (payload?.role) roles = [payload.role];
    }
  } catch {}

  const isAdmin = roles.includes('ADMIN');
  const isEntrepreneur = roles.includes('ENTREPRENEUR');
  const isValidator = roles.includes('VALIDATOR');

  const commonItems = [
    { label: 'Home', to: '/', icon: <HomeIcon /> },
    { label: 'Dashboard', to: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Ideas', to: '/ideas', icon: <LightbulbIcon /> },
    { label: 'Programs', to: '/programs', icon: <BusinessIcon /> },
    { label: 'Requests', to: '/requests', icon: <RequestPageIcon /> },
    { label: 'Investors', to: '/investors', icon: <PeopleIcon /> },
  ];

  const adminItems = [
    { label: 'Users', to: '/users', icon: <PeopleIcon /> },
    { label: 'Admin Settings', to: '/settings', icon: <SettingsIcon /> },
  ];

  const items = React.useMemo(() => {
    let out = [...commonItems];
    if (isAdmin) out = out.concat(adminItems);
    // entrepreneur-specific quick links removed from global nav per request
    return out;
  }, [isAdmin, isEntrepreneur]);

  return (
    <>
      <Box sx={{ position: 'fixed', left: 12, top: 12, zIndex: (theme) => theme.zIndex.drawer + 5 }}>
        <Tooltip title="Open menu">
          <IconButton color="primary" onClick={() => setOpen(true)} aria-label="open navigation">
            <MenuIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Drawer open={open} onClose={() => setOpen(false)} anchor="left">
        <Box sx={{ width: 260 }} role="presentation" onClick={() => setOpen(false)} onKeyDown={() => setOpen(false)}>
          <List>
            {items.map((it) => (
              <ListItemButton key={it.to} component={RouterLink} to={it.to}>
                <ListItemIcon>{it.icon}</ListItemIcon>
                <ListItemText primary={it.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
          <List>
            {isAuthenticated && (
              <ListItemButton component={RouterLink} to="/settings">
                <ListItemIcon><SettingsIcon /></ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;

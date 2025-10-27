import React from 'react';
import { Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, Divider, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link as RouterLink } from 'react-router-dom';

const OrganizerSidebar: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();

  const organizerItems = [
    { label: 'Dashboard', to: '/program-organizer-dashboard', icon: <DashboardIcon /> },
    { label: 'All Programs', to: '/all-programs', icon: <BusinessIcon /> },
    { label: 'Settings', to: '/settings', icon: <SettingsIcon /> },
  ];

  return (
    <>
      <Box sx={{ position: 'fixed', left: 12, top: 12, zIndex: (theme) => theme.zIndex.drawer + 5 }}>
        <Tooltip title="Open organizer menu">
          <IconButton 
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.error.main} 100%)`,
              color: 'white',
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.warning.dark} 0%, ${theme.palette.error.dark} 100%)`,
              }
            }}
            onClick={() => setOpen(true)} 
            aria-label="open organizer navigation"
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Drawer open={open} onClose={() => setOpen(false)} anchor="left">
        <Box sx={{ width: 280 }} role="presentation" onClick={() => setOpen(false)} onKeyDown={() => setOpen(false)}>
          {/* Header */}
          <Box sx={{
            background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.error.main} 100%)`,
            p: 3,
            color: 'white'
          }}>
            <BusinessIcon sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
            }}>
              Organizer Portal
            </Typography>
            <Typography variant="body2" sx={{ 
              opacity: 0.9,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
            }}>
              Program Management
            </Typography>
          </Box>

          <List sx={{ pt: 2 }}>
            {organizerItems.map((item) => (
              <ListItemButton 
                key={item.to} 
                component={RouterLink} 
                to={item.to}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    background: alpha(theme.palette.warning.main, 0.08)
                  }
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.warning.main }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                    fontWeight: 500
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default OrganizerSidebar;
import React from 'react';
import { Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, Divider, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import AssessmentIcon from '@mui/icons-material/Assessment';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link as RouterLink } from 'react-router-dom';

const EntrepreneurSidebar: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();

  const entrepreneurItems = [
    { label: 'Dashboard', to: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Create Ideas', to: '/ideas', icon: <LightbulbIcon /> },
    { label: 'Programs', to: '/programs', icon: <BusinessIcon /> },
    { label: 'Investors', to: '/investors', icon: <PeopleIcon /> },
    { label: 'Mentor Requests', to: '/dashboard/mentor-requests', icon: <PeopleIcon /> },
  ];

  return (
    <>
      <Box sx={{ position: 'fixed', left: 12, top: 12, zIndex: (theme) => theme.zIndex.drawer + 5 }}>
        <Tooltip title="Open entrepreneur menu">
          <IconButton 
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: 'white',
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
              }
            }}
            onClick={() => setOpen(true)} 
            aria-label="open entrepreneur navigation"
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Drawer open={open} onClose={() => setOpen(false)} anchor="left">
        <Box sx={{ width: 280 }} role="presentation" onClick={() => setOpen(false)} onKeyDown={() => setOpen(false)}>
          {/* Header */}
          <Box sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            p: 3,
            color: 'white'
          }}>
            <RocketLaunchIcon sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
            }}>
              Entrepreneur Portal
            </Typography>
            <Typography variant="body2" sx={{ 
              opacity: 0.9,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
            }}>
              Innovation Hub
            </Typography>
          </Box>

          <List sx={{ pt: 2 }}>
            {entrepreneurItems.map((item) => (
              <ListItemButton 
                key={item.to} 
                component={RouterLink} 
                to={item.to}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.08)
                  }
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.primary.main }}>
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
          
          <Divider sx={{ mx: 2, my: 1 }} />
          
          <List>
            <ListItemButton 
              component={RouterLink} 
              to="/settings"
              sx={{
                mx: 1,
                borderRadius: 2,
                '&:hover': {
                  background: alpha(theme.palette.text.secondary, 0.08)
                }
              }}
            >
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText 
                primary="Settings"
                primaryTypographyProps={{
                  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                  fontWeight: 500
                }}
              />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default EntrepreneurSidebar;
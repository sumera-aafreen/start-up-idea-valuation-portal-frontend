import React from 'react';
import { Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Tooltip, Divider, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import InterestsIcon from '@mui/icons-material/Interests';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SettingsIcon from '@mui/icons-material/Settings';
import { Link as RouterLink } from 'react-router-dom';

const InvestorSidebar: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const theme = useTheme();

  const investorItems = [
    { label: 'Dashboard', to: '/investor-dashboard', icon: <DashboardIcon /> },
    { label: 'Investment Opportunities', to: '/investment-opportunities', icon: <BusinessCenterIcon /> },
    { label: 'My Interests', to: '/my-investor-interests', icon: <InterestsIcon /> },
  ];

  return (
    <>
      <Box sx={{ position: 'fixed', left: 12, top: 12, zIndex: (theme) => theme.zIndex.drawer + 5 }}>
        <Tooltip title="Open investor menu">
          <IconButton 
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.info.main} 100%)`,
              color: 'white',
              '&:hover': {
                background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.info.dark} 100%)`,
              }
            }}
            onClick={() => setOpen(true)} 
            aria-label="open investor navigation"
          >
            <MenuIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Drawer open={open} onClose={() => setOpen(false)} anchor="left">
        <Box sx={{ width: 280 }} role="presentation" onClick={() => setOpen(false)} onKeyDown={() => setOpen(false)}>
          {/* Header */}
          <Box sx={{
            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.info.main} 100%)`,
            p: 3,
            color: 'white'
          }}>
            <TrendingUpIcon sx={{ fontSize: 32, mb: 1 }} />
            <Typography variant="h6" sx={{ 
              fontWeight: 700,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
            }}>
              Investor Portal
            </Typography>
            <Typography variant="body2" sx={{ 
              opacity: 0.9,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
            }}>
              Investment Management
            </Typography>
          </Box>

          <List sx={{ pt: 2 }}>
            {investorItems.map((item) => (
              <ListItemButton 
                key={item.to} 
                component={RouterLink} 
                to={item.to}
                sx={{
                  mx: 1,
                  borderRadius: 2,
                  mb: 0.5,
                  '&:hover': {
                    background: alpha(theme.palette.success.main, 0.08)
                  }
                }}
              >
                <ListItemIcon sx={{ color: theme.palette.success.main }}>
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

export default InvestorSidebar;
import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Avatar, Fade, Paper, Card, CardContent, Grid } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import InterestsIcon from '@mui/icons-material/Interests';
import VisibilityIcon from '@mui/icons-material/Visibility';
import api from '../../api/client';

const InvestorDashboard: React.FC = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalIdeas: 0,
    myInterests: 0,
    activeOpportunities: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [ideasRes, interestsRes] = await Promise.all([
        api.get('/api/ideas/investor-accessible'),
        api.get('/api/stakeholders/mine')
      ]);
      
      setStats({
        totalIdeas: ideasRes.data?.length || 0,
        myInterests: interestsRes.data?.length || 0,
        activeOpportunities: ideasRes.data?.length || 0
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const StatCard = ({ icon, value, label, color }: { icon: React.ReactElement; value: number; label: string; color: 'primary' | 'success' | 'info' }) => (
    <Card sx={{
      p: 3,
      textAlign: 'center',
      borderRadius: 3,
      background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.05)} 100%)`,
      border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`,
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
      }
    }}>
      <Box sx={{ mb: 2 }}>
        {React.cloneElement(icon, { 
          sx: { fontSize: 40, color: theme.palette[color].main } 
        })}
      </Box>
      <Typography variant="h3" sx={{ 
        fontWeight: 700, 
        mb: 1, 
        color: theme.palette[color].main,
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
      }}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ 
        fontWeight: 500,
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
      }}>
        {label}
      </Typography>
    </Card>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.02)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
      py: 4
    }}>
      <Container maxWidth="lg">
        <Fade in={true} timeout={600}>
          <Box>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 2,
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.info.main} 100%)`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.success.main, 0.3)}`
              }}>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'white' }} />
              </Avatar>
              <Typography variant="h3" sx={{ 
                fontWeight: 700, 
                color: theme.palette.text.primary,
                mb: 1,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
              }}>
                Investor Dashboard
              </Typography>
              <Typography variant="h6" sx={{ 
                color: theme.palette.text.secondary,
                fontWeight: 400,
                maxWidth: 600,
                mx: 'auto',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
              }}>
                Track your investment opportunities and portfolio
              </Typography>
            </Box>

            {/* Stats Grid */}
            <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, mb: 6 }}>
              <StatCard
                icon={<BusinessCenterIcon />}
                value={stats.totalIdeas}
                label="Available Ideas"
                color="primary"
              />
              <StatCard
                icon={<InterestsIcon />}
                value={stats.myInterests}
                label="My Interests"
                color="success"
              />
              <StatCard
                icon={<VisibilityIcon />}
                value={stats.activeOpportunities}
                label="Active Opportunities"
                color="info"
              />
            </Box>

            {/* Welcome Message */}
            <Paper sx={{
              p: 4,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              textAlign: 'center'
            }}>
              <Typography variant="h5" sx={{ 
                fontWeight: 600, 
                mb: 2,
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
              }}>
                Welcome to Your Investment Hub
              </Typography>
              <Typography variant="body1" sx={{ 
                color: theme.palette.text.secondary,
                maxWidth: 600,
                mx: 'auto',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
              }}>
                Explore innovative ideas, track your interests, and connect with entrepreneurs. 
                Use the navigation menu to browse opportunities and manage your investment portfolio.
              </Typography>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default InvestorDashboard;
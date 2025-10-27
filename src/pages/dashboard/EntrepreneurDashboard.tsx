import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Stack, 
  Typography, 
  TextField, 
  MenuItem, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  IconButton,
  Chip,
  Fade,
  Grow,
  Slide,
  Zoom,
  Paper,
  Divider,
  Container,
  Avatar,
  LinearProgress,
  Grid,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import InterestsIcon from '@mui/icons-material/Interests';
import ContactMailIcon from '@mui/icons-material/ContactMail';
import AddIcon from '@mui/icons-material/Add';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import ScheduleIcon from '@mui/icons-material/Schedule';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import api from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import { Link } from 'react-router-dom';
import entrepreneurImg from '../analytics/entrepreneur.png';

type Idea = {
  ideaId: number;
  title: string;
  description: string;
  confidentialityLevel: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
};

type InvestorInterest = {
  stakeholderId: number;
  username: string;
  email?: string;
  contactInfo?: string;
  message?: string;
  createdAt: string;
  user?: {
    username: string;
    email: string;
  };
};

// Enhanced Animations
const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 20px ${alpha('#1976d2', 0.3)}; }
  50% { box-shadow: 0 0 30px ${alpha('#1976d2', 0.6)}; }
  100% { box-shadow: 0 0 20px ${alpha('#1976d2', 0.3)}; }
`;

const shimmerAnimation = keyframes`
  0% { background-position: -468px 0; }
  100% { background-position: 468px 0; }
`;

const EntrepreneurDashboard: React.FC = () => {
  const { token } = useAuth();
  const theme = useTheme();
  const [username, setUsername] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [editingIdeaId, setEditingIdeaId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editConfidentiality, setEditConfidentiality] = useState('PUBLIC');
  const [openInterestsFor, setOpenInterestsFor] = useState<number | null>(null);
  const [interestsMap, setInterestsMap] = useState<Record<number, InvestorInterest[]>>({});
  const [loadingInterests, setLoadingInterests] = useState<Record<number, boolean>>({});
  const [interestsError, setInterestsError] = useState<Record<number, string | null>>({});
  const [contactDialog, setContactDialog] = useState<{ open: boolean; contact?: string | null; name?: string | null }>({ open: false });
  const [savingIdea, setSavingIdea] = useState<number | null>(null);
  const [deletingIdea, setDeletingIdea] = useState<number | null>(null);
  const navigate = useNavigate();

  // Stats for dashboard
  const [stats, setStats] = useState({
    totalIdeas: 0,
    activeEvaluations: 0,
    investorInterests: 0,
    successRate: 0
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUsername(payload?.sub || payload?.username || 'Innovator');
    } catch (e) {
      console.error('Error parsing token:', e);
      setUsername('Innovator');
    }
  }, [token, navigate]);

  const loadIdeas = async () => {
    setLoadingIdeas(true);
    try {
      const response = await api.get('/api/ideas/me');
      const ideasData = response.data || [];
      setIdeas(ideasData);
      
      // Calculate stats
      const totalInterests = Object.values(interestsMap).reduce((acc, curr) => acc + curr.length, 0);
      const successRate = ideasData.length > 0 
        ? Math.min(85, Math.round((totalInterests / ideasData.length) * 100))
        : 0;

      setStats({
        totalIdeas: ideasData.length,
        activeEvaluations: (ideasData as Idea[]).filter((idea: Idea) => idea.status === 'ACTIVE').length,
        investorInterests: totalInterests,
        successRate: successRate
      });
    } catch (err) {
      console.error('Failed to load ideas', err);
      setIdeas([]);
    } finally {
      setLoadingIdeas(false);
    }
  };

  useEffect(() => { 
    if (token) {
      loadIdeas();
    }
  }, [token]);

  const startEdit = (idea: Idea) => {
    setEditingIdeaId(idea.ideaId);
    setEditTitle(idea.title);
    setEditDescription(idea.description);
    setEditConfidentiality(idea.confidentialityLevel || 'PUBLIC');
  };

  const cancelEdit = () => {
    setEditingIdeaId(null);
    setEditTitle('');
    setEditDescription('');
    setEditConfidentiality('PUBLIC');
  };

  const saveEdit = async () => {
    if (editingIdeaId == null) return;
    
    setSavingIdea(editingIdeaId);
    try {
      await api.put(`/api/ideas/${editingIdeaId}`, { 
        title: editTitle.trim(), 
        description: editDescription.trim(), 
        confidentialityLevel: editConfidentiality 
      });
      await loadIdeas();
      cancelEdit();
    } catch (err: any) {
      console.error('Failed to update idea', err);
      alert(err.response?.data?.message || 'Error updating idea');
    } finally {
      setSavingIdea(null);
    }
  };

  const deleteIdea = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this idea? This action cannot be undone.')) return;
    
    setDeletingIdea(id);
    try {
      await api.delete(`/api/ideas/${id}`);
      await loadIdeas();
    } catch (err: any) { 
      console.error('Failed to delete idea', err);
      alert(err.response?.data?.message || 'Error deleting idea');
    } finally {
      setDeletingIdea(null);
    }
  };

  const loadInterests = async (ideaId: number) => {
    if (openInterestsFor === ideaId) {
      setOpenInterestsFor(null);
      return;
    }

    setOpenInterestsFor(ideaId);
    
    // If already loaded, don't reload
    if (interestsMap[ideaId] && interestsMap[ideaId].length > 0) return;

  setLoadingInterests((prev: Record<number, boolean>) => ({ ...prev, [ideaId]: true }));
  setInterestsError((prev: Record<number, string | null>) => ({ ...prev, [ideaId]: null }));
    
    try {
      const response = await api.get(`/api/stakeholders/by-idea/${ideaId}`);
      const interestsData = response.data || [];
  setInterestsMap(prev => ({ ...prev, [ideaId]: interestsData }));
      
      // Update stats with new interests count
      const totalInterests = Object.values({ ...interestsMap, [ideaId]: interestsData })
        .reduce((acc, curr) => acc + curr.length, 0);
      
      setStats(prev => ({
        ...prev,
        investorInterests: totalInterests,
        successRate: ideas.length > 0 ? Math.min(85, Math.round((totalInterests / ideas.length) * 100)) : 0
      }));
    } catch (err: any) {
      console.error('Failed to load interests for idea', ideaId, err);
      setInterestsError((prev: Record<number, string | null>) => ({ 
        ...prev, 
        [ideaId]: err?.response?.data?.message || err.message || 'Failed to load investor interests' 
      }));
    } finally {
      setLoadingInterests(prev => ({ ...prev, [ideaId]: false }));
    }
  };

  const getConfidentialityColor = (level: string) => {
    const colors = {
      'PUBLIC': 'success',
      'PRIVATE': 'error',
      'EXPERT_ONLY': 'warning',
      'INVESTOR_ACCESSIBLE': 'info'
    };
    return colors[level as keyof typeof colors] || 'default';
  };

  const getConfidentialityLabel = (level: string) => {
    const labels = {
      'PUBLIC': 'Public',
      'PRIVATE': 'Private',
      'EXPERT_ONLY': 'Experts Only',
      'INVESTOR_ACCESSIBLE': 'Investors Only'
    };
    return labels[level as keyof typeof labels] || level;
  };

  const StatCard = ({ icon, value, label, color = 'primary', loading = false }: any) => (
    <Paper
      sx={{
        p: 3,
        textAlign: 'center',
        borderRadius: 3,
        background: theme.palette.mode === 'light'
          ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.7)} 100%)`
          : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
        },
      }}
    >
      {loading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.background.paper, 0.4)}, transparent)`,
            animation: `${shimmerAnimation} 1.5s infinite linear`,
          }}
        />
      )}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        mb: 2,
        opacity: loading ? 0.6 : 1
      }}>
        {React.cloneElement(icon, { 
          sx: { 
            fontSize: 40, 
            color: loading ? theme.palette.text.disabled : (theme.palette as any)[color]?.main 
          } 
        })}
      </Box>
      <Typography 
        variant="h3" 
        sx={{ 
          fontWeight: 700, 
          mb: 1, 
          color: loading ? theme.palette.text.disabled : (theme.palette as any)[color]?.main,
          fontSize: { xs: '1.8rem', md: '2.2rem' },
          opacity: loading ? 0.6 : 1,
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
        }}
      >
        {loading ? '...' : value}
      </Typography>
      <Typography 
        variant="body2" 
        color={loading ? 'text.disabled' : 'text.secondary'} 
        sx={{ 
          fontWeight: 500,
          opacity: loading ? 0.6 : 1,
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
        }}
      >
        {label}
      </Typography>
    </Paper>
  );

  const LoadingSkeleton = () => (
    <Stack spacing={3}>
      {[1, 2, 3].map((item) => (
        <Card key={item} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ animation: `${shimmerAnimation} 1.5s infinite linear` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ width: 40, height: 40, bgcolor: 'grey.300', borderRadius: 1 }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ width: '60%', height: 24, bgcolor: 'grey.300', borderRadius: 1, mb: 1 }} />
                  <Box sx={{ width: '40%', height: 16, bgcolor: 'grey.300', borderRadius: 1 }} />
                </Box>
              </Box>
              <Box sx={{ width: '100%', height: 60, bgcolor: 'grey.200', borderRadius: 1, mb: 2 }} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[1, 2, 3, 4].map((btn) => (
                  <Box key={btn} sx={{ width: 100, height: 36, bgcolor: 'grey.300', borderRadius: 2 }} />
                ))}
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: theme.palette.mode === 'light'
        ? 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)'
        : 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      position: 'relative',
    }}>
      {/* Enhanced Welcome Section */}
      <Box
        sx={{
          minHeight: { xs: '60vh', md: '55vh' },
          background: theme.palette.mode === 'light'
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.dark, 0.2)} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          position: 'relative',
          overflow: 'hidden',
          py: { xs: 6, md: 8 },
          mb: { xs: 2, md: 4 }
        }}
      >
        {/* Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: theme.palette.mode === 'light'
              ? `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                 radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%)`
              : `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
                 radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)`,
          }}
        />
        
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, alignItems: 'center', height: '100%' }}>
            <Box sx={{ width: { xs: '100%', md: '60%' } }}>
              <Fade in={true} timeout={800}>
                <Box>
                  <Chip 
                    label="ENTREPRENEUR DASHBOARD" 
                    sx={{ 
                      mb: 2, 
                      background: alpha(theme.palette.primary.main, 0.06),
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      letterSpacing: 1,
                      fontSize: '0.75rem',
                      height: 32,
                      '& .MuiChip-label': { px: 2 }
                    }} 
                  />
                  <Typography variant="h3" sx={{ 
                    fontWeight: 600, 
                    fontSize: { xs: '1.4rem', md: '1.8rem' }, 
                    mb: 1,
                    lineHeight: 1.3,
                    color: theme.palette.text.primary,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                  }}>
                    Welcome back,
                  </Typography>
                  <Typography variant="h2" sx={{ 
                    fontWeight: 700, 
                    fontSize: { xs: '1.8rem', md: '2.2rem' }, 
                    mb: 2,
                    background: theme.palette.mode === 'light'
                      ? 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)'
                      : 'linear-gradient(45deg, #64b5f6 30%, #90caf9 90%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    color: 'transparent',
                    lineHeight: 1.2,
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                  }}>
                    {username}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    fontWeight: 400, 
                    mb: 3, 
                    color: theme.palette.text.secondary,
                    maxWidth: 520,
                    lineHeight: 1.7,
                    fontSize: '1rem',
                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                  }}>
                    Transform your visionary ideas into successful ventures with our comprehensive innovation platform.
                  </Typography>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                    <Button 
                      variant="contained" 
                      size="large"
                      onClick={() => navigate('/ideas')}
                      startIcon={<AddIcon />}
                      sx={{ 
                        px: 4, 
                        py: 1.25, 
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: '0.975rem',
                        background: theme.palette.mode === 'light'
                          ? 'linear-gradient(45deg, #2563eb 0%, #3b82f6 100%)'
                          : 'linear-gradient(45deg, #3b82f6 0%, #60a5fa 100%)',
                        boxShadow: '0 6px 18px rgba(37, 99, 235, 0.18)',
                      }}
                    >
                      Create New Idea
                    </Button>
                    <Button 
                      variant="outlined"
                      size="large"
                      onClick={() => navigate('/programs')}
                      sx={{ 
                        px: 4, 
                        py: 1.25, 
                        borderRadius: 2,
                        fontWeight: 600,
                        borderWidth: 2,
                        '&:hover': { background: alpha(theme.palette.primary.main, 0.04) }
                      }}
                    >
                      Explore Programs
                    </Button>
                  </Stack>
                </Box>
              </Fade>
            </Box>

            <Box sx={{ width: { xs: '100%', md: '40%' }, display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ position: 'relative', width: { xs: 180, md: 260 }, height: { xs: 180, md: 260 } }}>
                <Box sx={{ position: 'absolute', inset: 0, borderRadius: '50%', background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`, animation: `${floatAnimation} 6s ease-in-out infinite` }} />
                <Box component="img" src={entrepreneurImg} alt="Entrepreneur" sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2, boxShadow: '0 12px 30px rgba(2,6,23,0.12)', border: `2px solid ${alpha(theme.palette.primary.main, 0.06)}`, position: 'relative', zIndex: 2 }} />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 6 }, position: 'relative', zIndex: 3, mb: 8 }}>
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: 'repeat(2,1fr)', md: 'repeat(4,1fr)' } }}>
          <Box sx={{ px: 1 }}>
            <StatCard
              icon={<LightbulbIcon />}
              value={stats.totalIdeas}
              label="Total Ideas"
              color="primary"
              loading={loadingIdeas}
            />
          </Box>
          <Box sx={{ px: 1 }}>
            <StatCard
              icon={<AssessmentIcon />}
              value={stats.activeEvaluations}
              label="Active Evaluations"
              color="secondary"
              loading={loadingIdeas}
            />
          </Box>
          <Box sx={{ px: 1 }}>
            <StatCard
              icon={<GroupIcon />}
              value={stats.investorInterests}
              label="Investor Interests"
              color="success"
              loading={loadingIdeas}
            />
          </Box>
          <Box sx={{ px: 1 }}>
            <StatCard
              icon={<TrendingUpIcon />}
              value={`${stats.successRate}%`}
              label="Success Rate"
              color="warning"
              loading={loadingIdeas}
            />
          </Box>
        </Box>
      </Container>

      {/* Enhanced Ideas Section */}
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" sx={{ 
            fontWeight: 600, 
            mb: 2,
            fontSize: { xs: '1.8rem', md: '2.2rem' },
            color: theme.palette.text.primary,
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
          }}>
            Your Innovation Portfolio
          </Typography>
          <Typography variant="h6" sx={{ 
            color: 'text.secondary', 
            maxWidth: 600, 
            mx: 'auto',
            fontWeight: 400,
            lineHeight: 1.7,
            fontSize: '1.1rem',
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
          }}>
            Manage, track, and grow your innovative ideas with comprehensive tools and investor connections
          </Typography>
        </Box>

        {loadingIdeas ? (
          <LoadingSkeleton />
        ) : (
          <Stack spacing={2}>
            {ideas.length === 0 ? (
              <Fade in={true} timeout={500}>
                <Paper 
                  sx={{ 
                    p: { xs: 4, md: 8 }, 
                    textAlign: 'center', 
                    borderRadius: 3,
                    background: theme.palette.mode === 'light'
                      ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
                      : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                    border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <LightbulbIcon sx={{ 
                    fontSize: { xs: 60, md: 80 }, 
                    color: alpha(theme.palette.primary.main, 0.3), 
                    mb: 3
                  }} />
                  <Typography variant="h5" sx={{ 
                    mb: 2, 
                    fontWeight: 600,
                    color: theme.palette.text.primary
                  }}>
                    No Ideas Yet
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    mb: 4, 
                    maxWidth: 400, 
                    mx: 'auto',
                    color: theme.palette.text.secondary,
                    lineHeight: 1.6
                  }}>
                    Start your entrepreneurial journey by creating your first innovative idea and unlock opportunities for growth and investment
                  </Typography>
                  <Button 
                    variant="contained" 
                    onClick={() => navigate('/ideas')}
                    startIcon={<AddIcon />}
                    size="large"
                    sx={{ 
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      background: theme.palette.mode === 'light'
                        ? 'linear-gradient(45deg, #2563eb 0%, #3b82f6 100%)'
                        : 'linear-gradient(45deg, #3b82f6 0%, #60a5fa 100%)',
                      '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 6px 20px rgba(37, 99, 235, 0.3)',
                      }
                    }}
                  >
                    Create Your First Idea
                  </Button>
                </Paper>
              </Fade>
            ) : (
              ideas.map((idea, index) => (
                <Grow in={true} timeout={index * 200} key={idea.ideaId}>
                  <Card 
                    sx={{ 
                      borderRadius: 4,
                      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                      background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.01)} 100%)`,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      overflow: 'visible',
                      position: 'relative',
                      backdropFilter: 'blur(10px)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '3px',
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        opacity: 0,
                        transition: 'opacity 0.3s ease'
                      },
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                        '&::before': { opacity: 1 }
                      },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                      {editingIdeaId === idea.ideaId ? (
                        <Stack spacing={2.5}>
                          <TextField 
                            label="Idea Title" 
                            value={editTitle} 
                            onChange={(e) => setEditTitle(e.target.value)} 
                            size="medium" 
                            fullWidth 
                            variant="outlined"
                            disabled={savingIdea === idea.ideaId}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                          <TextField 
                            label="Description" 
                            value={editDescription} 
                            onChange={(e) => setEditDescription(e.target.value)} 
                            size="medium" 
                            multiline 
                            rows={4} 
                            fullWidth 
                            variant="outlined"
                            disabled={savingIdea === idea.ideaId}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          />
                          <TextField 
                            select 
                            label="Confidentiality Level" 
                            value={editConfidentiality} 
                            onChange={(e) => setEditConfidentiality(e.target.value)} 
                            size="medium" 
                            fullWidth 
                            variant="outlined"
                            disabled={savingIdea === idea.ideaId}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                              }
                            }}
                          >
                            <MenuItem value="PUBLIC">Public</MenuItem>
                            <MenuItem value="PRIVATE">Private</MenuItem>
                            <MenuItem value="EXPERT_ONLY">Experts Only</MenuItem>
                            <MenuItem value="INVESTOR_ACCESSIBLE">Investors Only</MenuItem>
                          </TextField>
                          <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button 
                              size="large" 
                              variant="outlined" 
                              onClick={cancelEdit}
                              disabled={savingIdea === idea.ideaId}
                              sx={{ borderRadius: 2, px: 4 }}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="large" 
                              variant="contained" 
                              onClick={saveEdit}
                              disabled={savingIdea === idea.ideaId || !editTitle.trim() || !editDescription.trim()}
                              startIcon={savingIdea === idea.ideaId ? <CircularProgress size={16} /> : null}
                              sx={{ 
                                borderRadius: 2, 
                                px: 4,
                                minWidth: 140
                              }}
                            >
                              {savingIdea === idea.ideaId ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </Stack>
                        </Stack>
                      ) : (
                        <>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                            <Box sx={{ flex: 1 }}>
                              <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 1.5 }}>
                                <Box sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                                }}>
                                  <BusinessCenterIcon sx={{ 
                                    color: theme.palette.primary.main, 
                                    fontSize: 24
                                  }} />
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h5" sx={{ 
                                    fontWeight: 600,
                                    color: theme.palette.text.primary,
                                    mb: 1,
                                    lineHeight: 1.4,
                                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                                  }}>
                                    {idea.title}
                                  </Typography>
                                  <Typography variant="body1" sx={{ 
                                    color: 'text.secondary', 
                                    lineHeight: 1.7,
                                    mb: 2,
                                    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif'
                                  }}>
                                    {idea.description}
                                  </Typography>
                                  <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                                    <Chip 
                                      label={getConfidentialityLabel(idea.confidentialityLevel)} 
                                      color={getConfidentialityColor(idea.confidentialityLevel) as any}
                                      variant="filled"
                                      size="small"
                                      sx={{ 
                                        fontWeight: 600,
                                        borderRadius: 1.5
                                      }}
                                    />
                                    {idea.createdAt && (
                                      <Typography variant="caption" sx={{ 
                                        color: 'text.secondary', 
                                        display: 'flex', 
                                        alignItems: 'center' 
                                      }}>
                                        <ScheduleIcon sx={{ fontSize: 14, mr: 0.5 }} />
                                        Created {new Date(idea.createdAt).toLocaleDateString()}
                                      </Typography>
                                    )}
                                  </Stack>
                                </Box>
                              </Stack>
                            </Box>
                          </Stack>
                          
                          <Divider sx={{ my: 2.5, opacity: 0.6 }} />
                          
                          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                            <Tooltip title="Edit idea details">
                              <Button 
                                size="small" 
                                startIcon={<EditIcon />}
                                onClick={() => startEdit(idea)}
                                variant="outlined"
                                sx={{ 
                                  borderRadius: 3,
                                  px: 2.5,
                                  py: 0.75,
                                  fontWeight: 500,
                                  fontSize: '0.875rem',
                                  borderColor: alpha(theme.palette.primary.main, 0.3),
                                  '&:hover': {
                                    borderColor: theme.palette.primary.main,
                                    background: alpha(theme.palette.primary.main, 0.04)
                                  }
                                }}
                              >
                                Edit
                              </Button>
                            </Tooltip>
                            
                            <Tooltip title="Delete this idea">
                              <Button 
                                size="small" 
                                startIcon={deletingIdea === idea.ideaId ? <CircularProgress size={14} /> : <DeleteIcon />}
                                color="error" 
                                onClick={() => deleteIdea(idea.ideaId)}
                                variant="outlined"
                                disabled={deletingIdea === idea.ideaId}
                                sx={{ 
                                  borderRadius: 3,
                                  px: 2.5,
                                  py: 0.75,
                                  fontWeight: 500,
                                  fontSize: '0.875rem',
                                  minWidth: 90,
                                  borderColor: alpha(theme.palette.error.main, 0.3),
                                  '&:hover': {
                                    borderColor: theme.palette.error.main,
                                    background: alpha(theme.palette.error.main, 0.04)
                                  }
                                }}
                              >
                                {deletingIdea === idea.ideaId ? 'Deleting...' : 'Delete'}
                              </Button>
                            </Tooltip>
                            
                            <Tooltip title="View evaluations and feedback">
                              <Button 
                                size="small" 
                                startIcon={<AssessmentIcon />}
                                component={Link}
                                to={`/idea-evaluation/${idea.ideaId}`}
                                variant="outlined"
                                sx={{ 
                                  borderRadius: 3,
                                  px: 2.5,
                                  py: 0.75,
                                  fontWeight: 500,
                                  fontSize: '0.875rem',
                                  borderColor: alpha(theme.palette.info.main, 0.3),
                                  color: theme.palette.info.main,
                                  '&:hover': {
                                    borderColor: theme.palette.info.main,
                                    background: alpha(theme.palette.info.main, 0.04)
                                  }
                                }}
                              >
                                View Evaluations
                              </Button>
                            </Tooltip>
                            
                            <Tooltip title="See investor interests">
                              <Button
                                size="small"
                                startIcon={<InterestsIcon />}
                                onClick={() => loadInterests(idea.ideaId)}
                                variant="contained"
                                sx={{ 
                                  borderRadius: 3,
                                  px: 2.5,
                                  py: 0.75,
                                  fontWeight: 500,
                                  fontSize: '0.875rem',
                                  background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`,
                                  boxShadow: `0 2px 8px ${alpha(theme.palette.success.main, 0.3)}`,
                                  '&:hover': {
                                    background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                                    boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.4)}`,
                                    transform: 'translateY(-1px)'
                                  }
                                }}
                              >
                                {openInterestsFor === idea.ideaId ? 'Hide Interests' : 'Show Interests'}
                                {interestsMap[idea.ideaId]?.length > 0 && (
                                  <Chip 
                                    label={interestsMap[idea.ideaId].length} 
                                    size="small" 
                                    sx={{ 
                                      ml: 1, 
                                      background: 'white', 
                                      color: 'success.main',
                                      fontWeight: 700,
                                      height: 20
                                    }} 
                                  />
                                )}
                              </Button>
                            </Tooltip>
                          </Stack>
                        </>
                      )}
                    </CardContent>

                    {/* Enhanced Interests Panel */}
                    {openInterestsFor === idea.ideaId && (
                      <Slide in={true} direction="up" timeout={300}>
                        <Box 
                          sx={{ 
                            background: theme.palette.mode === 'light'
                              ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.03)} 0%, ${alpha(theme.palette.success.main, 0.08)} 100%)`
                              : `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.1)} 100%)`,
                            p: { xs: 3, md: 4 },
                            borderTop: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                          }}
                      >
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700, 
                          mb: 3, 
                          display: 'flex', 
                          alignItems: 'center',
                          color: 'success.main'
                        }}>
                          <InterestsIcon sx={{ mr: 1.5 }} />
                          Investor Interest ({interestsMap[idea.ideaId]?.length || 0})
                        </Typography>

                        {loadingInterests[idea.ideaId] ? (
                          <Box sx={{ textAlign: 'center', py: 4 }}>
                            <CircularProgress size={32} sx={{ mb: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                              Loading investor interests...
                            </Typography>
                          </Box>
                        ) : interestsError[idea.ideaId] ? (
                          <Paper 
                            sx={{ 
                              p: 3, 
                              textAlign: 'center', 
                              background: alpha(theme.palette.error.main, 0.05),
                              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`
                            }}
                          >
                            <Typography variant="body2" color="error">
                              {interestsError[idea.ideaId]}
                            </Typography>
                          </Paper>
                        ) : (
                                          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
                            {interestsMap[idea.ideaId] && interestsMap[idea.ideaId].length > 0 ? (
                              interestsMap[idea.ideaId].map((investor, investorIndex) => {
                                const contactValue = investor?.contactInfo || investor?.email || investor?.user?.email || null;
                                const displayName = investor?.username || investor?.user?.username || 'Investor';
                                
                                return (
                                  <Box key={investor.stakeholderId} sx={{ width: '100%' }}>
                                    <Zoom in={true} timeout={(investorIndex + 1) * 150}>
                                      <Paper 
                                        sx={{ 
                                          p: 3, 
                                          borderRadius: 2,
                                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                                          background: theme.palette.background.paper,
                                          transition: 'all 0.2s ease',
                                          '&:hover': {
                                            borderColor: theme.palette.success.main,
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                          },
                                          height: '100%'
                                        }}
                                      >
                                        <Stack spacing={2} sx={{ height: '100%' }}>
                                          <Stack direction="row" alignItems="center" spacing={2}>
                                            <Avatar sx={{ 
                                              background: `linear-gradient(45deg, ${theme.palette.success.main} 0%, ${theme.palette.info.main} 100%)`,
                                              fontWeight: 700
                                            }}>
                                              {displayName.charAt(0).toUpperCase()}
                                            </Avatar>
                                            <Box sx={{ flex: 1 }}>
                                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                {displayName}
                                              </Typography>
                                              <Stack direction="row" spacing={0.5} alignItems="center">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                  <StarIcon 
                                                    key={star} 
                                                    sx={{ 
                                                      fontSize: 16, 
                                                      color: star <= 4 ? '#fbbf24' : '#d1d5db' 
                                                    }} 
                                                  />
                                                ))}
                                              </Stack>
                                            </Box>
                                          </Stack>

                                          {investor?.message && (
                                            <Typography variant="body2" sx={{ 
                                              color: 'text.secondary',
                                              fontStyle: 'italic',
                                              p: 2,
                                              background: alpha(theme.palette.success.main, 0.05),
                                              borderRadius: 1,
                                              borderLeft: `3px solid ${theme.palette.success.main}`
                                            }}>
                                              "{investor.message}"
                                            </Typography>
                                          )}

                                          <Box sx={{ flex: 1 }} />

                                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            {contactValue ? (
                                              <Button 
                                                size="small" 
                                                startIcon={<ContactMailIcon />}
                                                onClick={() => setContactDialog({ 
                                                  open: true, 
                                                  contact: contactValue, 
                                                  name: displayName 
                                                })}
                                                variant="contained"
                                                sx={{ 
                                                  borderRadius: 1.5,
                                                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
                                                  fontWeight: 600
                                                }}
                                              >
                                                Contact
                                              </Button>
                                            ) : (
                                              <Typography variant="caption" color="text.secondary">
                                                No contact provided
                                              </Typography>
                                            )}
                                            <Typography variant="caption" sx={{ 
                                              color: 'text.secondary', 
                                              display: 'flex', 
                                              alignItems: 'center' 
                                            }}>
                                              <ScheduleIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                              {new Date(investor.createdAt).toLocaleDateString()}
                                            </Typography>
                                          </Stack>
                                        </Stack>
                                      </Paper>
                                    </Zoom>
                                  </Box>
                                );
                              })
                            ) : (
                              <Box sx={{ gridColumn: '1 / -1' }}>
                                <Paper 
                                  sx={{ 
                                    p: 4, 
                                    textAlign: 'center', 
                                    background: alpha(theme.palette.text.secondary, 0.04),
                                    border: `1px dashed ${alpha(theme.palette.text.secondary, 0.2)}`
                                  }}
                                >
                                  <InterestsIcon sx={{ 
                                    fontSize: 48, 
                                    color: alpha(theme.palette.text.secondary, 0.3), 
                                    mb: 2 
                                  }} />
                                  <Typography variant="body1" sx={{ mb: 1, color: 'text.secondary' }}>
                                    No investor interests yet
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    Share your idea to attract potential investors
                                  </Typography>
                                </Paper>
                              </Box>
                            )}
                        </Box>
                        )}
                        </Box>
                      </Slide>
                    )}
                  </Card>
                </Grow>
              ))
            )}
          </Stack>
        )}
      </Container>

      {/* Enhanced Contact Dialog */}
      <Dialog 
        open={contactDialog.open} 
        onClose={() => setContactDialog({ open: false })} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: theme.palette.background.paper,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`, 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 3
        }}>
          <Typography variant="h5" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center' }}>
            <ContactMailIcon sx={{ mr: 1.5 }} />
            Contact Investor
          </Typography>
          <IconButton 
            aria-label="close" 
            onClick={() => setContactDialog({ open: false })} 
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Avatar sx={{ 
                width: 80, 
                height: 80, 
                mx: 'auto', 
                mb: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
                fontSize: '2rem',
                fontWeight: 700
              }}>
                {contactDialog.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {contactDialog.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Potential Investor
              </Typography>
            </Box>

            {contactDialog.contact ? (
              <Button
                variant="contained"
                startIcon={<EmailIcon />}
                href={`mailto:${contactDialog.contact}`}
                sx={{ 
                  py: 2,
                  borderRadius: 2,
                  background: `linear-gradient(45deg, ${theme.palette.success.main} 0%, ${theme.palette.info.main} 100%)`,
                  fontSize: '1rem',
                  fontWeight: 600,
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)',
                  }
                }}
                fullWidth
              >
                Send Email: {contactDialog.contact}
              </Button>
            ) : (
              <Paper sx={{ 
                p: 3, 
                textAlign: 'center', 
                background: alpha(theme.palette.warning.main, 0.1),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
              }}>
                <Typography variant="body2" color="text.secondary">
                  No contact information provided by this investor.
                </Typography>
              </Paper>
            )}
            
            <Paper sx={{ 
              p: 3, 
              background: alpha(theme.palette.primary.main, 0.05), 
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}>
              <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                💡 <strong>Pro Tip:</strong> When contacting investors, be prepared with your pitch deck and a clear value proposition.
              </Typography>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setContactDialog({ open: false })}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 4,
              fontWeight: 600
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EntrepreneurDashboard;
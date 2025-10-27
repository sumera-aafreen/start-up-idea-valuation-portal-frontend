import React from 'react';
import IdeasPage from '../ideas/IdeasPage';
import EntrepreneurDashboard from './EntrepreneurDashboard';
import UsersPage from '../users/UsersPage';
import FeedbackPage from '../feedback/FeedbackPage';

import InvestorPage from './InvestorPage';
import MentorDashboard from './MentorDashboard';
import ProgramOrganizerDashboard from './ProgramOrganizerDashboard';
import ExpertDashboard from '../expert/ExpertDashboard';
import AdminDashboard from './AdminDashboard';
import ProgramsPage from '../programs/ProgramsPage';
import { Box, Stack, Typography } from '@mui/material';
import api from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

const DashboardRouter: React.FC = () => {
  const { token } = useAuth();
  const [role, setRole] = React.useState<string | null>(null);
  const [loadingRole, setLoadingRole] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    const resolveRole = async () => {
      if (!token) {
        if (mounted) setRole(null);
        return;
      }
      setLoadingRole(true);
      try {
        const parsed = JSON.parse(atob(token.split('.')[1]));
        if (parsed?.role) {
          if (mounted) setRole(parsed.role);
          return;
        }
        if (parsed?.sub) {
          try {
            const res = await api.get(`/api/users/username/${encodeURIComponent(parsed.sub)}`);
            if (mounted) setRole(res.data?.role ?? null);
            return;
          } catch (e) {
            // ignore and fallthrough to null role
          }
        }
      } catch (e) {
        // token parse failed — leave role null
      } finally {
        if (mounted) setLoadingRole(false);
      }
      if (mounted) setRole(null);
    };
    resolveRole();
    return () => { mounted = false; };
  }, [token]);

  if (!role) {
    return (
      <Box>
        <Typography variant="h6">Welcome</Typography>
        <Typography variant="body2" color="text.secondary">No role found in token.</Typography>
      </Box>
    );
  }

  switch (role) {
    case 'PROGRAM_ORGANISER':
    case 'PROGRAM_ORGANIZER':
    case 'ORGANIZER':
    case 'ORGANISER':
      return <ProgramsPage />;
    case 'EXPERT':
      return <ExpertDashboard />;
    case 'MENTOR':
      return <MentorDashboard />;
    case 'ENTREPRENEUR':
      return <EntrepreneurDashboard />;
    case 'INVESTOR':
      return <InvestorPage />;
    case 'VALIDATOR':
      return <FeedbackPage />;
    case 'ADMIN':
      return <AdminDashboard />;
    default:
      return <Typography>Unknown role: {role}</Typography>;
  }
};

export default DashboardRouter;

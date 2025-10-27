import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Box, Button, IconButton, Menu, MenuItem, Toolbar, Typography, Avatar, Tooltip } from '@mui/material';
import { useLocation } from 'react-router-dom';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useThemeMode } from './theme/ThemeModeProvider';
import Footer from './components/Footer';
import RoleBasedSidebar from './components/RoleBasedSidebar';
import HomeBackgroundDecor from './components/HomeBackgroundDecor';
import HeaderControls from './components/HeaderControls';
import TopNavbar from './components/TopNavbar';
import { ThemeModeProvider } from './theme/ThemeModeProvider';
import HomePage from './pages/home/HomePage';
import DashboardRouter from './pages/dashboard/DashboardRouter';
import ReceivedRequestsPage from './pages/dashboard/ReceivedRequestsPage';
import InvestorInterestsPage from './pages/dashboard/InvestorInterestsPage';
import InvestorDashboard from './pages/dashboard/InvestorDashboard';
import MyInvestorInterests from './pages/dashboard/MyInvestorInterests';
import InvestmentOpportunities from './pages/dashboard/InvestmentOpportunities';
import ProgramOrganizerDashboard from './pages/dashboard/ProgramOrganizerDashboard';
import EntrepreneurMentorRequests from './pages/dashboard/EntrepreneurMentorRequests';
import MentorDashboard from './pages/dashboard/MentorDashboard';
import MentorPage from './pages/mentor/MentorPage';
import CreateProgramPage from './pages/programs/CreateProgramPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import UsersPage from './pages/users/UsersPage';
import IdeasPage from './pages/ideas/IdeasPage';
import ValidationPage from './pages/validation/ValidationPage';
import FeedbackPage from './pages/feedback/FeedbackPage';
import ProgramsPage from './pages/programs/ProgramsPage';
import AllProgramsPage from './pages/programs/AllProgramsPage';
import ExpertDashboard from './pages/expert/ExpertDashboard';
import ExpertEvaluationsPage from './pages/expert/ExpertEvaluationsPage';
import IdeaEvaluationView from './pages/ideas/IdeaEvaluationView';
import { useAuth, AuthProvider } from './auth/AuthContext';
import SettingsPage from './pages/settings/SettingsPage';
// Validator page removed

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Sidebar moved to left; keep header-less layout
  const { isAuthenticated } = useAuth();
  // show top navbar on landing page (home) and remove left sidebar there
  const location = useLocation();
  const showTopNav = location.pathname === '/';
  // detect roles from token (may be a single `role` or an array `roles`)
  const { token } = useAuth();
  let roles: string[] = [];
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload?.roles) roles = Array.isArray(payload.roles) ? payload.roles : [payload.roles];
      else if (payload?.role) roles = [payload.role];
    }
  } catch {}

  // detect admin dashboard: when at /dashboard and the logged-in user role is ADMIN
  const isAdminDashboard = location.pathname === '/dashboard' && roles.includes('ADMIN');
  const isEntrepreneur = roles.includes('ENTREPRENEUR');
  const showEntrepreneurDecor = isEntrepreneur && location.pathname.startsWith('/dashboard');
  return (
    <>
      {showTopNav ? <TopNavbar /> : <HeaderControls />}
      {/* render the home/background decor for entrepreneur dashboard pages */}
      {showEntrepreneurDecor && <HomeBackgroundDecor />}
      {/* hide global sidebar for admin dashboard to give admin a clean full-width view */}
      {!showTopNav && !isAdminDashboard && <RoleBasedSidebar />}
      <Box component="main" sx={{ display: 'flex', justifyContent: 'center', py: { xs: 2, sm: 3, md: 4 }, zIndex: 1, position: 'relative' }}>
        <Box sx={{ width: '100%', maxWidth: 1200, px: { xs: 2, sm: 3, md: 4 } }}>
          {children}
        </Box>
      </Box>
      {/* do not show footer on admin dashboard pages */}
      {!isAdminDashboard && <Footer />}
    </>
  );
};

const Protected: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <ThemeModeProvider>
        <BrowserRouter>
          <AppShell>
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<Protected><DashboardRouter /></Protected>} />
            <Route path="/ideas" element={<Protected><IdeasPage /></Protected>} />
            <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
            <Route path="/programs" element={<Protected><ProgramsPage /></Protected>} />
            <Route path="/expert-dashboard" element={<Protected><ExpertDashboard /></Protected>} />
            <Route path="/expert/evaluations" element={<Protected><ExpertEvaluationsPage /></Protected>} />
            <Route path="/idea-evaluation/:ideaId" element={<Protected><IdeaEvaluationView /></Protected>} />
            <Route path="/requests" element={<Protected><ReceivedRequestsPage /></Protected>} />
            <Route path="/investors" element={<Protected><InvestorInterestsPage /></Protected>} />
            <Route path="/investor-dashboard" element={<Protected><InvestorDashboard /></Protected>} />
            <Route path="/my-investor-interests" element={<Protected><MyInvestorInterests /></Protected>} />
            <Route path="/investment-opportunities" element={<Protected><InvestmentOpportunities /></Protected>} />
            <Route path="/program-organizer-dashboard" element={<Protected><ProgramOrganizerDashboard /></Protected>} />
            <Route path="/dashboard/mentor-requests" element={<Protected><EntrepreneurMentorRequests /></Protected>} />
            <Route path="/mentor" element={<Protected><MentorPage /></Protected>} />
            <Route path="/create-program" element={<Protected><CreateProgramPage /></Protected>} />
            <Route path="/all-programs" element={<Protected><AllProgramsPage /></Protected>} />
            <Route path="/validation" element={<Protected><ValidationPage /></Protected>} />
            {/* validator route removed */}
            <Route path="/feedback" element={<Protected><FeedbackPage /></Protected>} />
            <Route path="/users" element={<Protected><UsersPage /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </AppShell>
        </BrowserRouter>
      </ThemeModeProvider>
    </AuthProvider>
  );
}

export default App;

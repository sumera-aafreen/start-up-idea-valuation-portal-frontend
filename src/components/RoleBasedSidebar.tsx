import React from 'react';
import { useAuth } from '../auth/AuthContext';
import EntrepreneurSidebar from './EntrepreneurSidebar';
import InvestorSidebar from './InvestorSidebar';
import MentorSidebar from './MentorSidebar';
import OrganizerSidebar from './OrganizerSidebar';
import Sidebar from './Sidebar'; // Default sidebar for other roles

const RoleBasedSidebar: React.FC = () => {
  const { token } = useAuth();

  let roles: string[] = [];
  try {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload?.roles) roles = Array.isArray(payload.roles) ? payload.roles : [payload.roles];
      else if (payload?.role) roles = [payload.role];
      console.log('Detected roles:', roles); // Debug log
    }
  } catch {}

  // Priority order: Admin > Entrepreneur > Investor > Mentor > Organizer
  if (roles.includes('ADMIN')) {
    return <Sidebar />; // Keep existing sidebar for admin
  } else if (roles.includes('EXPERT')) {
    // Experts don't need a sidebar in this app
    return null;
  } else if (roles.includes('ENTREPRENEUR')) {
    return <EntrepreneurSidebar />;
  } else if (roles.includes('INVESTOR')) {
    return <InvestorSidebar />;
  } else if (roles.includes('MENTOR')) {
    return <MentorSidebar />;
  } else if (roles.includes('PROGRAM_ORGANIZER') || roles.includes('ORGANIZER') || roles.includes('PROGRAMME_ORGANIZER')) {
    // Program organisers don't need the sidebar
    return null;
  } else {
    return <Sidebar />; // Default sidebar for other roles
  }
};

export default RoleBasedSidebar;
import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Stack, TextField, Typography, Switch, FormControlLabel, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import { useAuth } from '../../auth/AuthContext';
import api from '../../api/client';

const SettingsPage: React.FC = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState<{ fullName?: string; email?: string; phone?: string; organization?: string; bio?: string; linkedin?: string }>({});
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [expertise, setExpertise] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        // prefer current user endpoint
        const res = await api.get('/api/users/me');
        const data = res.data || {};
        setUserId(data.userId ?? null);
        setRole(data.role ?? null);
        setExpertise(data.expertise ?? null);

        // profileData may be a JSON string stored by the backend
        let pd: any = {};
        try {
          pd = data.profileData ? JSON.parse(data.profileData) : {};
        } catch (e) {
          pd = {};
        }

        setProfile({
          fullName: pd.fullName || pd.name || '',
          email: data.email || '',
          phone: pd.phone || '',
          organization: pd.organization || '',
          bio: pd.bio || '',
          linkedin: pd.linkedin || ''
        });
      } catch (err) {
        console.error('Failed to load profile via /me, falling back to username lookup', err);
        try {
          const parsed = JSON.parse(atob(token.split('.')[1]));
          const username = parsed?.sub;
          if (username) {
            const res2 = await api.get(`/api/users/username/${encodeURIComponent(username)}`);
            const data = res2.data || {};
            setUserId(data.userId ?? null);
            setRole(data.role ?? null);
            setExpertise(data.expertise ?? null);
            let pd: any = {};
            try { pd = data.profileData ? JSON.parse(data.profileData) : {}; } catch (e) { pd = {}; }
            setProfile({
              fullName: pd.fullName || pd.name || '',
              email: data.email || '',
              phone: pd.phone || '',
              organization: pd.organization || '',
              bio: pd.bio || '',
              linkedin: pd.linkedin || ''
            });
          }
        } catch (e) {
          console.error('Fallback username lookup failed', e);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const saveProfile = async () => {
    try {
      const profileData = JSON.stringify({
        fullName: profile.fullName,
        phone: profile.phone,
        organization: profile.organization,
        bio: profile.bio,
        linkedin: profile.linkedin
      });

      // optimistic: first try PUT /api/users/me if backend supports it
      try {
        await api.put('/api/users/me', { email: profile.email, profileData, expertise });
        alert('Profile updated');
        return;
      } catch (e) {
        // fallback to PUT /api/users/{id}
      }

      if (!userId) throw new Error('User id not known');

      // GET existing user to merge fields
      const existingRes = await api.get(`/api/users/${userId}`);
      const existing = existingRes.data || {};
      const merged = {
        userId: existing.userId ?? userId,
        username: existing.username ?? existing.userName ?? existing.email,
        email: profile.email || existing.email,
        role: existing.role ?? role,
        expertise: expertise ?? existing.expertise,
        verificationStatus: existing.verificationStatus ?? false,
        profileData: profileData,
        isActive: existing.isActive ?? true
      };

      await api.put(`/api/users/${userId}`, merged);
      alert('Profile updated');
    } catch (err: any) {
      console.error(err);
      alert('Failed to update profile: ' + (err?.response?.data || err.message));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {loading && <Typography variant="body2" color="text.secondary">Loading profile...</Typography>}
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>Settings</Typography>
      <Stack spacing={2} maxWidth={720}>
        <Card sx={{ p: 2 }}>
          <Typography variant="h6">Profile</Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            <TextField label="Full name" value={profile.fullName || ''} onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))} />
            <TextField label="Email" value={profile.email || ''} onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))} />
            <TextField label="Phone" value={profile.phone || ''} onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))} />
            <TextField label="Organization" value={profile.organization || ''} onChange={(e) => setProfile(prev => ({ ...prev, organization: e.target.value }))} />
            <TextField label="Short bio" value={profile.bio || ''} onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))} multiline rows={3} />
            <TextField label="LinkedIn" value={profile.linkedin || ''} onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))} />

            <FormControl fullWidth>
              <InputLabel id="expertise-label">Expertise (optional)</InputLabel>
              <Select labelId="expertise-label" value={expertise || ''} label="Expertise (optional)" onChange={(e) => setExpertise(e.target.value)}>
                <MenuItem value="">None</MenuItem>
                <MenuItem value="software">Software</MenuItem>
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="marketing">Marketing</MenuItem>
                <MenuItem value="finance">Finance</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <Button variant="contained" onClick={saveProfile} sx={{ mr: 1 }}>Save</Button>
              <Button variant="outlined" onClick={() => window.location.reload()}>Reload</Button>
            </Box>
          </Stack>
        </Card>

        <Card sx={{ p: 2 }}>
          <Typography variant="h6">Preferences</Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            <FormControlLabel
              control={<Switch checked={notificationsEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)} />}
              label="Email notifications"
            />
            <Typography variant="body2" color="text.secondary">Notification preferences can be customized here. This controls email digests.</Typography>
          </Stack>
        </Card>

        <Card sx={{ p: 2 }}>
          <Typography variant="h6">Security</Typography>
          <Stack spacing={1} sx={{ mt: 1 }}>
            <TextField label="New password" type="password" />
            <TextField label="Confirm new password" type="password" />
            <Button variant="contained">Change password</Button>
            <Typography variant="body2" color="text.secondary">Password change will call backend endpoint if implemented.</Typography>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
};

export default SettingsPage;

import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, CircularProgress, Stack, Typography, Chip, Divider } from '@mui/material';
import api from '../../api/client';
import { useAuth } from '../../auth/AuthContext';
import EmailIcon from '@mui/icons-material/Email';
import InfoIcon from '@mui/icons-material/Info';

type Interest = {
  stakeholderId: number;
  userId?: number;
  username?: string;
  email?: string;
  contactInfo?: string;
  message?: string;
  ideaId?: number;
};

const InvestorInterestsPage: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [interests, setInterests] = useState<Interest[]>([]);

  useEffect(() => {
    if (!token) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get<Interest[]>('/api/stakeholders/received');
      setInterests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load investor interests', err);
      setInterests([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" mb={4} sx={{ fontWeight: 600, textAlign: 'center' }}>
        Investor Interests
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={6}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={3}>
          {interests.length === 0 && (
            <Typography variant="body1" color="text.secondary" textAlign="center">
              No investor interests yet.
            </Typography>
          )}

          {interests.map((i) => (
            <Card
              key={i.stakeholderId}
              elevation={6}
              sx={{
                borderRadius: 3,
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: 12 },
                p: 2,
              }}
            >
              <CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                  <Stack spacing={0.5}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {i.username ?? 'Unknown Investor'}
                    </Typography>
                    {i.ideaId && (
                      <Chip
                        icon={<InfoIcon />}
                        label={`Idea ID: ${i.ideaId}`}
                        size="small"
                        color="primary"
                      />
                    )}
                  </Stack>

                  {(i.email || i.contactInfo) && (
                    <Chip
                      icon={<EmailIcon />}
                      label={
                        <a href={`mailto:${i.email ?? i.contactInfo}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          Contact
                        </a>
                      }
                      color="secondary"
                      variant="outlined"
                      size="small"
                    />
                  )}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography variant="body2" color="text.secondary">
                  Message: {i.message ?? 'No message provided'}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default InvestorInterestsPage;

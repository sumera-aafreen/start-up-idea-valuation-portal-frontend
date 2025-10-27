import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  LinearProgress,
} from '@mui/material';
import api from '../../api/client';
import { useAuth } from '../../auth/AuthContext';

type Idea = {
  ideaId: number;
  title: string;
  description: string;
  confidentialityLevel: string;
  owner?: {
    username: string;
  };
};

type FeedbackDialogProps = {
  open: boolean;
  onClose: () => void;
  ideaId: number;
  ideaTitle: string;
  role: string;
};

const FeedbackDialog: React.FC<FeedbackDialogProps> = ({ open, onClose, ideaId, ideaTitle, role }) => {
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');
  const [nextSteps, setNextSteps] = useState('');

  const handleSubmit = async () => {
    try {
      if (role === 'INVESTOR') {
        await api.post('/api/stakeholders/interest', { ideaId, contactInfo, message: comments });
      } else if (role === 'VALIDATOR') {
        await api.post('/api/validation/submit', {
          projectId: ideaId,
          validationType: 'Community Validation',
          responses: 'Manual validation',
          rating,
          feedback: comments,
          demographics: 'Validator feedback',
        });
      } else if (role === 'MENTOR') {
        await api.post('/api/mentor/feedback', {
          ideaId,
          feedbackType: 'Mentor Guidance',
          rating,
          comments,
          recommendations,
          strengths,
          weaknesses,
          nextSteps,
        });
      }
      alert('Feedback submitted successfully!');
      onClose();
    } catch (err: any) {
      console.error(err);
      alert('Error submitting feedback: ' + (err?.response?.data?.message || err.message));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ background: 'linear-gradient(90deg, #667eea, #764ba2)', color: '#fff' }}>
        Provide {role.toLowerCase()} feedback for: {ideaTitle}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {role === 'INVESTOR' && (
            <TextField
              label="Contact Information"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              fullWidth
              placeholder="Email, phone, company, etc."
            />
          )}

          <TextField
            label="Rating (1-10)"
            type="number"
            value={rating}
            onChange={(e) => setRating(parseInt(e.target.value) || 5)}
            inputProps={{ min: 1, max: 10 }}
            fullWidth
          />

          <TextField
            label="Comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            multiline
            rows={3}
            fullWidth
            placeholder="Share your thoughts about this idea..."
          />

          {role === 'MENTOR' && (
            <>
              <TextField
                label="Recommendations"
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                multiline
                rows={2}
                fullWidth
                placeholder="What would you recommend to improve this idea?"
              />
              <TextField
                label="Strengths"
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                multiline
                rows={2}
                fullWidth
                placeholder="What are the main strengths of this idea?"
              />
              <TextField
                label="Weaknesses"
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
                multiline
                rows={2}
                fullWidth
                placeholder="What are the potential weaknesses or challenges?"
              />
              <TextField
                label="Next Steps"
                value={nextSteps}
                onChange={(e) => setNextSteps(e.target.value)}
                multiline
                rows={2}
                fullWidth
                placeholder="What should be the next steps for this idea?"
              />
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{ color: '#764ba2' }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ background: '#667eea', '&:hover': { background: '#5a67d8' } }}>
          Submit Feedback
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AllIdeasPage: React.FC = () => {
  const { token } = useAuth();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedbackDialog, setFeedbackDialog] = useState<{ open: boolean; ideaId: number; ideaTitle: string }>({
    open: false,
    ideaId: 0,
    ideaTitle: '',
  });

  useEffect(() => {
    const resolveRole = async () => {
      if (!token) return;
      try {
        const parsed = JSON.parse(atob(token.split('.')[1]));
        if (parsed?.role) {
          setRole(parsed.role);
          return;
        }
        if (parsed?.sub) {
          const res = await api.get(`/api/users/username/${encodeURIComponent(parsed.sub)}`);
          setRole(res.data?.role ?? null);
        }
      } catch (e) {
        console.error('Failed to resolve role:', e);
      }
    };
    resolveRole();
  }, [token]);

  const loadIdeas = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/ideas');
      setIdeas(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load ideas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role && ['INVESTOR', 'VALIDATOR', 'MENTOR'].includes(role)) {
      loadIdeas();
    }
  }, [role]);

  const openFeedbackDialog = (ideaId: number, ideaTitle: string) => {
    setFeedbackDialog({ open: true, ideaId, ideaTitle });
  };

  const closeFeedbackDialog = () => {
    setFeedbackDialog({ open: false, ideaId: 0, ideaTitle: '' });
  };

  if (!role || !['INVESTOR', 'VALIDATOR', 'MENTOR'].includes(role)) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="#e53e3e">
          Access Denied
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This page is only available for Investors, Validators, and Mentors.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3} sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, background: 'linear-gradient(90deg, #667eea, #764ba2)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
        All Ideas - {role} Dashboard
      </Typography>

      <Typography variant="body1" color="text.secondary">
        Review ideas and provide your {role.toLowerCase()} feedback to help entrepreneurs improve their concepts.
      </Typography>

      <Card sx={{ p: 2, bgcolor: '#f7f9ff', boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Available Ideas ({ideas.length})
          </Typography>

          {loading && <LinearProgress sx={{ mb: 2 }} />}
          {!loading && ideas.length === 0 && (
            <Typography color="text.secondary">No ideas available for review.</Typography>
          )}

          <Stack spacing={2} mt={2}>
            {ideas.map((idea) => (
              <Card
                key={idea.ideaId}
                sx={{
                  p: 2,
                  bgcolor: '#ffffff',
                  borderRadius: 2,
                  boxShadow: 2,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': { transform: 'translateY(-3px)', boxShadow: 6 },
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {idea.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {idea.description}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Owner: {idea.owner?.username || 'Unknown'} | Level: {idea.confidentialityLevel}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      background: role === 'INVESTOR' ? '#48bb78' : role === 'VALIDATOR' ? '#ed8936' : '#667eea',
                      '&:hover': {
                        background: role === 'INVESTOR' ? '#38a169' : role === 'VALIDATOR' ? '#dd6b20' : '#5a67d8',
                      },
                    }}
                    onClick={() => openFeedbackDialog(idea.ideaId, idea.title)}
                  >
                    {role === 'INVESTOR' ? 'Express Interest' : role === 'VALIDATOR' ? 'Validate' : 'Mentor'}
                  </Button>
                </Box>
              </Card>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <FeedbackDialog
        open={feedbackDialog.open}
        onClose={closeFeedbackDialog}
        ideaId={feedbackDialog.ideaId}
        ideaTitle={feedbackDialog.ideaTitle}
        role={role}
      />
    </Stack>
  );
};

export default AllIdeasPage;

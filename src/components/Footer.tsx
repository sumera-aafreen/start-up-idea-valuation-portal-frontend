import React from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  Link,
  IconButton,
  Divider,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import EmailIcon from '@mui/icons-material/Email';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        py: 5,
        borderTop: '1px solid',
        borderColor: 'divider',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light' ? '#fafafa' : 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        {/* Top section */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={4}
        >
          {/* Left section */}
          <Stack spacing={1}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Startup Idea Validation Portal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
              Empowering entrepreneurs to validate and grow their startup ideas through collaboration, mentorship, and expert insights.
            </Typography>
          </Stack>

          {/* Quick links */}
          <Stack spacing={0.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Quick Links
            </Typography>
            <Stack direction="row" flexWrap="wrap" spacing={2}>
              <Link href="/" color="text.secondary" underline="hover" sx={{ '&:hover': { color: 'primary.main' } }}>
                Home
              </Link>
              <Link href="/ideas" color="text.secondary" underline="hover" sx={{ '&:hover': { color: 'primary.main' } }}>
                My Ideas
              </Link>
              <Link href="/dashboard" color="text.secondary" underline="hover" sx={{ '&:hover': { color: 'primary.main' } }}>
                Dashboard
              </Link>
              <Link href="/feedback" color="text.secondary" underline="hover" sx={{ '&:hover': { color: 'primary.main' } }}>
                Feedback
              </Link>
              <Link href="/contact" color="text.secondary" underline="hover" sx={{ '&:hover': { color: 'primary.main' } }}>
                Contact
              </Link>
            </Stack>
          </Stack>

          {/* Social media */}
          <Stack spacing={0.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Connect with Us
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                size="small"
                aria-label="GitHub"
                href="https://github.com/"
                target="_blank"
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                <GitHubIcon />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Twitter"
                href="https://twitter.com/"
                target="_blank"
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                <TwitterIcon />
              </IconButton>
              <IconButton
                size="small"
                aria-label="LinkedIn"
                href="https://linkedin.com/"
                target="_blank"
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton
                size="small"
                aria-label="Email"
                href="mailto:contact@startupportal.com"
                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
              >
                <EmailIcon />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>

        {/* Divider line */}
        <Divider sx={{ my: 3 }} />

        {/* Bottom section */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Startup Idea Validation Portal. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={2}>
            <Link href="/privacy" color="text.secondary" underline="hover" sx={{ '&:hover': { color: 'primary.main' } }}>
              Privacy Policy
            </Link>
            <Link href="/terms" color="text.secondary" underline="hover" sx={{ '&:hover': { color: 'primary.main' } }}>
              Terms of Service
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;

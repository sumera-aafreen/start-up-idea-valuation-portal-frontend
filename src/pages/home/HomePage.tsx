import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  Container,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { motion } from 'framer-motion';
import { useTheme, alpha } from '@mui/material/styles';
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EmojiObjectsIcon from "@mui/icons-material/EmojiObjects";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ShieldIcon from "@mui/icons-material/Security";
import { useNavigate } from "react-router-dom";
import heroImage from "../analytics/charlesdeluvio-Lks7vei-eAg-unsplash.jpg";
import ThreeDCarousel from "../../components/ThreeDCarousel";
import HomeBackgroundDecor from '../../components/HomeBackgroundDecor';

const globalStyles = {
  "@keyframes fadeInUp": {
    "0%": { opacity: 0, transform: "translateY(30px)" },
    "100%": { opacity: 1, transform: "translateY(0)" },
  },
  "@keyframes slideInFromBottom": {
    "0%": { opacity: 0, transform: "translateY(50px) scale(0.9)" },
    "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
  },
  "@keyframes pulseGlow": {
    "0%": { boxShadow: "0 0 0 0 rgba(124, 58, 237, 0.4)" },
    "70%": { boxShadow: "0 0 0 10px rgba(124, 58, 237, 0)" },
    "100%": { boxShadow: "0 0 0 0 rgba(124, 58, 237, 0)" },
  },
} as const;

type RoleCard = {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  icon: React.ReactNode;
  actionText: string;
  onActionPath?: string;
};

const rolesData = (navigate: (path: string) => void): RoleCard[] => [
  {
    id: "entrepreneur",
    title: "Entrepreneur",
    subtitle: "Submit • Manage • Grow",
    description:
      "Submit and track ideas, manage events, connect with investors and mentors, and visualize growth insights in one place.",
    icon: <EmojiObjectsIcon sx={{ fontSize: 40 }} />,
    actionText: "Manage Ideas",
    onActionPath: "/ideas",
  },
  {
    id: "investor",
    title: "Investor",
    subtitle: "Discover • Connect",
    description:
      "Discover innovative ideas, express investment interest, and connect directly with entrepreneurs.",
    icon: <AttachMoneyIcon sx={{ fontSize: 40 }} />,
    actionText: "Explore Deals",
    onActionPath: "/investors",
  },
  {
    id: "mentor",
    title: "Mentor",
    subtitle: "Guide • Inspire",
    description:
      "Review and guide idea submissions, offer valuable mentorship, and help startups refine their strategies.",
    icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    actionText: "Mentor Dashboard",
    onActionPath: "/dashboard",
  },
  {
    id: "program",
    title: "Program Organiser",
    subtitle: "Announce • Manage",
    description:
      "Create and manage events, handle registrations, and engage participants efficiently.",
    icon: <EventAvailableIcon sx={{ fontSize: 40 }} />,
    actionText: "Post Events",
    onActionPath: "/programs",
  },
  {
    id: "expert",
    title: "Expert / Evaluator",
    subtitle: "Assess • Score",
    description:
      "Evaluate startup ideas on innovation, market reach, and feasibility — deliver actionable insights.",
    icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
    actionText: "Evaluate Ideas",
    onActionPath: "/expert-dashboard",
  },
];

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [active, setActive] = useState<number>(0);
  const [isHovering, setIsHovering] = useState<number | null>(null);
  const cards = rolesData((p: string) => navigate(p));
  const carouselItems = cards.map((c) => ({ id: c.id, title: c.title, body: c.description }));
  const carouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const activeCard = el.querySelectorAll("[data-3d-card]")[active] as
      | HTMLElement
      | undefined;
    if (activeCard) {
      const left =
        activeCard.offsetLeft - (el.clientWidth - activeCard.clientWidth) / 2;
      el.scrollTo({ left, behavior: "smooth" });
    }
  }, [active]);

  const goPrev = () => setActive((s) => Math.max(s - 1, 0));
  const goNext = () => setActive((s) => Math.min(s + 1, cards.length - 1));

  return (
    <Box component="div" sx={{ ...globalStyles, position: 'relative' }}>
      <HomeBackgroundDecor />
      <Container
        maxWidth="lg"
        sx={{
          py: 6,
          fontFamily: "Poppins, Inter, Roboto, sans-serif",
          color: theme.palette.text.primary,
          position: 'relative',
          zIndex: 1,
        }}
      >
  {/* HERO SECTION */}
  <Box id="home-hero" sx={{ position: "relative", borderRadius: 4, overflow: "hidden", mb: 10 }}>
          <Box
            component="img"
            src={heroImage}
            alt="Startup"
            sx={{
              width: "100%",
              height: { xs: 260, sm: 380, md: 460 },
              objectFit: "cover",
              filter: "brightness(0.65)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(120deg, rgba(30,27,75,0.8), rgba(67,56,202,0.8), rgba(147,51,234,0.65))",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: "#fff",
              px: 3,
            }}
          >
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
                Empower. Validate. Grow.
              </Typography>
              <Typography
                variant="h6"
                sx={{ maxWidth: 760, mx: "auto", mb: 3, opacity: 0.9 }}
              >
                A complete ecosystem for entrepreneurs, investors, mentors, and experts —
                united to accelerate startup innovation.
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    px: 5,
                    py: 1.25,
                    fontWeight: 700,
                    background: "linear-gradient(90deg, #7C3AED, #A855F7)",
                    "&:hover": {
                      background: "linear-gradient(90deg, #6D28D9, #9333EA)",
                    },
                  }}
                  onClick={() => navigate("/register")}
                >
                  Start Your Journey
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    px: 5,
                    py: 1.25,
                    borderColor: "rgba(255,255,255,0.7)",
                    color: "#fff",
                    "&:hover": { borderColor: "#fff" },
                  }}
                  onClick={() => navigate("/programs")}
                >
                  Explore Events
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>

  {/* ROLE CARDS SECTION - COMPLETELY REDESIGNED */}
  <Box id="explore-roles" sx={{ mb: 10 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, textAlign: "center" }}>
            Explore Key Roles
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 6, textAlign: "center" }}>
            Dynamic roles designed for collaboration, innovation, and impactful growth.
          </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <ThreeDCarousel items={carouselItems} />
            </Box>
        </Box>

        {/* WHY CHOOSE US SECTION */}
        <Box id="about-us"
          sx={{
            py: 10,
            textAlign: "center",
            background: "linear-gradient(90deg, #1E1B4B, #312E81)",
            color: "#fff",
            borderRadius: 4,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
            Why Choose Our Platform?
          </Typography>
          <Typography sx={{ mb: 6, opacity: 0.85 }}>
            A secure, data-driven, and collaborative space that turns ideas into impact.
          </Typography>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            justifyContent="center"
            alignItems="stretch"
          >
            {[
              {
                icon: <ShieldIcon sx={{ fontSize: 44 }} />,
                title: "Secure Ecosystem",
                text: "Your intellectual property is protected — always encrypted and confidential.",
              },
              {
                icon: <AnalyticsIcon sx={{ fontSize: 44 }} />,
                title: "Real Insights",
                text: "Track your startup's progress and make informed decisions with visual analytics.",
              },
              {
                icon: <PeopleIcon sx={{ fontSize: 44 }} />,
                title: "Expert Collaboration",
                text: "Work directly with mentors, investors, and peers across the innovation journey.",
              },
            ].map((item, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.12, duration: 0.6 }} style={{ flex: '1 1 320px' }}>
                <Card
                  sx={{
                    flex: "1 1 320px",
                    p: 4,
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: 3,
                    color: "#fff",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(255,255,255,0.18)",
                      transform: "translateY(-8px)",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                    },
                  }}
                >
                  <Box sx={{ mb: 2, color: "#C084FC" }}>{item.icon}</Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    {item.text}
                  </Typography>
                </Card>
              </motion.div>
            ))}
          </Stack>
        </Box>

        {/* FINAL CTA */}
        <Box
          sx={{
            py: 8,
            mt: 10,
            textAlign: "center",
            borderRadius: 4,
            background: "linear-gradient(90deg, #7C3AED, #A855F7, #C084FC)",
            color: "#fff",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            Ready to Validate Your Idea?
          </Typography>
          <Typography sx={{ mt: 1, opacity: 0.9 }}>
            Join a thriving ecosystem of innovators, investors, and mentors today.
          </Typography>
          <Stack direction="row" justifyContent="center" spacing={2} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              sx={{
                px: 4,
                py: 1,
                background: "#fff",
                color: "#6D28D9",
                fontWeight: 700,
                "&:hover": { background: "#F3E8FF" },
              }}
              onClick={() => navigate("/register")}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              sx={{
                px: 4,
                py: 1,
                borderColor: "#fff",
                color: "#fff",
                "&:hover": { background: "rgba(255,255,255,0.15)" },
              }}
              onClick={() => navigate("/programs")}
            >
              Learn More
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;
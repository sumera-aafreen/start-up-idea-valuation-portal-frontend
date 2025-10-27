import React, { useMemo } from 'react';
import { Box, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import './HomeBackgroundDecor.css';

type ShapeDef = {
  key: string;
  left: string;
  top: string;
  size: number;
  bg: string;
  x1: string;
  y1: string;
  x2: string;
  y2: string;
  r1: string;
  r2: string;
  duration: number;
  delay: number;
  kind: 'circle' | 'diamond';
};

const makeRandom = (min: number, max: number) => Math.random() * (max - min) + min;

const HomeBackgroundDecor: React.FC = () => {
  const theme = useTheme();

  // generate a small set of shapes with randomized parameters (stable per render)
  const shapes = useMemo<ShapeDef[]>(() => {
    const palette = [
      'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(99,102,241,0.9))',
      'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(79,70,229,0.9))',
      'linear-gradient(135deg, rgba(236,72,153,0.9), rgba(234,88,12,0.9))',
      'linear-gradient(135deg, rgba(20,184,166,0.9), rgba(56,189,248,0.9))',
    ];

    const out: ShapeDef[] = [];
    const count = 9;
    for (let i = 0; i < count; i++) {
      // allow shapes to extend slightly beyond viewport so they appear on left/right edges
      const left = `${Math.floor(makeRandom(-10, 110))}%`;
      const top = `${Math.floor(makeRandom(-10, 110))}%`;
      const size = Math.floor(makeRandom(80, 260));
      const bg = palette[i % palette.length];
      const x1 = `${Math.floor(makeRandom(-30, 30))}px`;
      const y1 = `${Math.floor(makeRandom(-20, 20))}px`;
      const x2 = `${Math.floor(makeRandom(-120, 120))}px`;
      const y2 = `${Math.floor(makeRandom(-80, 80))}px`;
      const r1 = `${Math.floor(makeRandom(-20, 20))}deg`;
      const r2 = `${Math.floor(makeRandom(-60, 60))}deg`;
      const duration = Number((makeRandom(18, 38)).toFixed(2));
      const delay = Number((makeRandom(0, 6)).toFixed(2));
      const kind: 'circle' | 'diamond' = i % 3 === 0 ? 'diamond' : 'circle';

      out.push({
        key: `shape-${i}`,
        left,
        top,
        size,
        bg,
        x1,
        y1,
        x2,
        y2,
        r1,
        r2,
        duration,
        delay,
        kind,
      });
    }
    return out;
  }, []);

  // Only render in dark mode (after hooks have been declared)
//   if (theme.palette.mode !== 'dark') return null;

  return (
    // render as a fixed full-viewport layer so shapes appear at left/right edges of the app
    <Box className="home-bg-decor" sx={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      {shapes.map((s) => {
        const x1 = parseFloat(s.x1) || 0;
        const y1 = parseFloat(s.y1) || 0;
        const x2 = parseFloat(s.x2) || 0;
        const y2 = parseFloat(s.y2) || 0;
        const r1 = parseFloat(s.r1) || 0;
        const r2 = parseFloat(s.r2) || 0;

  const baseRotate = s.kind === 'diamond' ? 45 : 0;
        const fromR = r1 + baseRotate;
        const toR = r2 + baseRotate;

        // random mid points for more organic motion
        const mx1 = x1 + makeRandom(-60, 60);
        const my1 = y1 + makeRandom(-40, 40);
        const mx2 = x2 + makeRandom(-40, 40);
        const my2 = y2 + makeRandom(-30, 30);
        const midR = (r1 + r2) / 2 + makeRandom(-12, 12);

        const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        return (
          <Box
            key={s.key}
            component={motion.div}
            className={`shape ${s.kind}`}
            sx={{
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              background: s.bg,
              position: 'absolute',
              opacity: 0.32,
              pointerEvents: 'none',
              borderRadius: s.kind === 'circle' ? '50%' : 6,
            }}
            // disable CSS keyframe animation for this element (we'll animate with framer-motion)
            style={{
              animation: 'none',
            }}
            initial={{ x: x1, y: y1, rotate: fromR, opacity: 0.14, scale: 0.98 }}
            {...(!prefersReducedMotion ? {
              animate: { x: [x1, mx1, x2, mx2, x1], y: [y1, my1, y2, my2, y1], rotate: [fromR, midR, toR, midR, fromR], opacity: [0.14, 0.28, 0.20, 0.24, 0.14], scale: [0.96, 1.04, 1.0, 0.98, 0.96] },
              transition: { duration: s.duration, delay: s.delay, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
            } : {})}
          />
        );
      })}
    </Box>
  );
};

export default HomeBackgroundDecor;

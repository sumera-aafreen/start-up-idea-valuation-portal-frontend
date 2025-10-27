import React, { useMemo, useState } from 'react';
import { Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './ThreeDCarousel.css';

export interface CarouselItem {
  id: string | number;
  title: string;
  body?: string;
}

interface Props {
  items: CarouselItem[];
  initialIndex?: number;
  autoPlay?: boolean; // default true
  autoPlayInterval?: number; // ms, default 4000
  pauseOnHover?: boolean; // default true
}

export default function ThreeDCarousel({ items, initialIndex = 0 }: Props) {
  const [active, setActive] = useState<number>(initialIndex);
  const count = items.length;
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);

  // default prop values
  const autoPlay = (typeof (arguments[0] as any)?.autoPlay !== 'undefined') ? (arguments[0] as any).autoPlay : true;
  const autoPlayInterval = (typeof (arguments[0] as any)?.autoPlayInterval !== 'undefined') ? (arguments[0] as any).autoPlayInterval : 4000;
  const pauseOnHover = (typeof (arguments[0] as any)?.pauseOnHover !== 'undefined') ? (arguments[0] as any).pauseOnHover : true;

  // respect user reduced motion preference
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cards = useMemo(() => {
    return items.map((item, i) => {
      // compute circular offset so values are in range [-floor(count/2), floor(count/2)]
      let raw = i - active;
      const half = Math.floor(count / 2);
      if (raw > half) raw -= count;
      if (raw < -half) raw += count;
      const offset = raw; // can be negative
      const abs = Math.abs(offset);
      const dir = offset === 0 ? 0 : offset / abs;

      return { item, i, offset, abs, dir };
    });
  }, [items, active, count]);

  const go = (delta: number) => {
    setActive((s) => (s + delta + count) % count);
  };

  // autoplay effect
  React.useEffect(() => {
    if (!autoPlay || prefersReduced || count <= 1) return;
    if (isPaused) return;

    const id = window.setInterval(() => {
      setActive((s) => (s + 1) % count);
    }, autoPlayInterval);

    return () => window.clearInterval(id);
  }, [autoPlay, autoPlayInterval, count, isPaused, prefersReduced]);

  return (
    <div className="carousel-wrapper">
      <button
        className="nav left"
        onClick={() => go(-1)}
        aria-label="Previous"
        title="Previous"
      >
        ‹
      </button>

        <div className="carousel" role="list">
        {cards.map(({ item, i, offset, abs, dir }) => (
          <div
            key={item.id}
            className="card-container"
            data-3d-card
            style={{
              // set CSS variables used by CSS to layout/transform
              ['--offset' as any]: offset,
              ['--abs-offset' as any]: abs,
              ['--direction' as any]: dir,
              ['--active' as any]: offset === 0 ? 1 : 0.6,
            }}
            onClick={() => setActive(i)}
            role="listitem"
            aria-hidden={offset !== 0}
            onMouseEnter={() => { if (pauseOnHover) setIsPaused(true); }}
            onMouseLeave={() => { if (pauseOnHover) setIsPaused(false); }}
          >
            <div className="card">
              <h2>{item.title}</h2>
              <p>{item.body}</p>
              <Box sx={{ mt: 3 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/login');
                  }}
                >
                  Login
                </Button>
              </Box>
            </div>
          </div>
        ))}
      </div>

      <button
        className="nav right"
        onClick={() => go(1)}
        aria-label="Next"
        title="Next"
      >
        ›
      </button>
    </div>
  );
}

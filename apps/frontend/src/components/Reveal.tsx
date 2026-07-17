import { Box, type BoxProps } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

type RevealDirection = 'up' | 'down' | 'left' | 'right';

interface IRevealProps extends BoxProps {
  /** Delay before the animation starts, in ms (use for staggering). */
  delay?: number;
  /** Travel distance in px before settling. */
  distance?: number;
  direction?: RevealDirection;
}

/**
 * Reveals its children with a fade + slide when scrolled into view.
 * Uses IntersectionObserver (no dependency) and honours prefers-reduced-motion.
 */
export function Reveal({
  children,
  delay = 0,
  distance = 28,
  direction = 'up',
  sx,
  ...rest
}: IRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const hiddenOffset: Record<RevealDirection, string> = {
    up: `translateY(${distance}px)`,
    down: `translateY(-${distance}px)`,
    left: `translateX(${distance}px)`,
    right: `translateX(-${distance}px)`,
  };

  return (
    <Box
      ref={ref}
      sx={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : hiddenOffset[direction],
        transition: `opacity 640ms ease ${delay}ms, transform 640ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
        willChange: 'opacity, transform',
        ...sx,
      }}
      {...rest}
    >
      {children}
    </Box>
  );
}

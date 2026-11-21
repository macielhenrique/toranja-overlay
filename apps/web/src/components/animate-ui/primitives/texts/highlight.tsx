'use client';

import * as React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';

import {
  useIsInView,
  type UseIsInViewOptions,
} from '@/hooks/use-is-in-view';

type HighlightTextProps = Omit<HTMLMotionProps<'span'>, 'children'> & {
  text: string;
  delay?: number;
} & UseIsInViewOptions;

function HighlightText({
  ref,
  text,
  style,
  inView = false,
  inViewMargin = '0px',
  inViewAmount,
  inViewOnce = true,
  transition = { duration: 2, ease: 'easeInOut' },
  delay = 0,
  ...props
}: HighlightTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const { ref: localRef, isInView } = useIsInView(
    ref as React.Ref<HTMLElement>,
    {
      inView,
      inViewOnce,
      inViewMargin,
      inViewAmount,
    },
  );

  return (
    <motion.span
      ref={localRef}
      data-slot="highlight-text"
      initial={
        prefersReducedMotion
          ? { backgroundSize: '100% 100%' }
          : { backgroundSize: '0% 100%' }
      }
      animate={
        prefersReducedMotion || isInView
          ? { backgroundSize: '100% 100%' }
          : undefined
      }
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              ...transition,
              delay: (transition?.delay ?? 0) + delay / 1000,
            }
      }
      style={{
        position: 'relative',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'left center',
        display: 'inline-block',
        ...style,
      }}
      {...props}
    >
      {text}
    </motion.span>
  );
}

export { HighlightText, type HighlightTextProps };

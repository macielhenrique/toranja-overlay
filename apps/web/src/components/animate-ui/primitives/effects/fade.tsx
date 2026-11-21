'use client';

import * as React from 'react';
import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react';

import {
  useIsInView,
  type UseIsInViewOptions,
} from '@/hooks/use-is-in-view';
import { Slot, type WithAsChild } from '@/components/animate-ui/primitives/animate/slot';

type FadeProps = WithAsChild<
  {
    children?: React.ReactNode;
    delay?: number;
    initialOpacity?: number;
    opacity?: number;
    ref?: React.Ref<HTMLElement>;
  } & UseIsInViewOptions &
    HTMLMotionProps<'div'>
>;

function Fade({
  ref,
  transition = { type: 'spring', stiffness: 200, damping: 20 },
  delay = 0,
  inView = false,
  inViewMargin = '0px',
  inViewAmount,
  inViewOnce = true,
  initialOpacity = 0,
  opacity = 1,
  asChild = false,
  variants,
  initial = 'hidden',
  ...props
}: FadeProps) {
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

  const Component = asChild ? Slot : motion.div;
  const resolvedVariants = prefersReducedMotion
    ? {
        hidden: { opacity },
        visible: { opacity },
      }
    : (variants ?? {
        hidden: { opacity: initialOpacity },
        visible: { opacity },
      });

  return (
    <Component
      ref={localRef as React.Ref<HTMLDivElement>}
      initial={prefersReducedMotion ? false : initial}
      animate={prefersReducedMotion || isInView ? 'visible' : 'hidden'}
      exit="hidden"
      variants={resolvedVariants}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              ...transition,
              delay: (transition?.delay ?? 0) + delay / 1000,
            }
      }
      {...props}
    />
  );
}

type FadeListProps = Omit<FadeProps, 'children'> & {
  children: React.ReactElement | React.ReactElement[];
  holdDelay?: number;
};

function Fades({
  children,
  delay = 0,
  holdDelay = 0,
  ...props
}: FadeListProps) {
  const array = React.Children.toArray(children) as React.ReactElement[];

  return (
    <>
      {array.map((child, index) => (
        <Fade
          key={child.key ?? index}
          delay={delay + index * holdDelay}
          {...props}
        >
          {child}
        </Fade>
      ))}
    </>
  );
}

export { Fade, Fades, type FadeProps, type FadeListProps };

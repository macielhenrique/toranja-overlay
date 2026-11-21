"use client";

import * as React from "react";
import { MotionConfig, motion, useReducedMotion, type UseInViewOptions } from "motion/react";
import { Fade } from "@/components/animate-ui/primitives/effects/fade";
import { HighlightText } from "@/components/animate-ui/primitives/texts/highlight";
import { cn } from "@/lib/utils";

const TORANJA_EASE = [0.22, 1, 0.36, 1] as const;

export function ToranjaMotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

interface HeroRevealProps {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}

export function HeroReveal({
  children,
  delay = 0,
  y = 12,
  className,
}: HeroRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : {
              duration: 0.4,
              delay: delay / 1000,
              ease: TORANJA_EASE,
            }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface HeroHighlightProps {
  text: string;
  delay?: number;
  className?: string;
}

export function HeroHighlight({
  text,
  delay = 240,
  className,
}: HeroHighlightProps) {
  return (
    <HighlightText
      text={text}
      delay={delay}
      transition={{ duration: 0.65, ease: TORANJA_EASE }}
      style={{
        backgroundImage:
          "linear-gradient(to top, rgba(243, 138, 15, 0.85) 0%, rgba(243, 138, 15, 0.85) 9%, rgba(243, 138, 15, 0.16) 9%, rgba(255, 205, 4, 0.08) 100%)",
      }}
      className={cn(
        "rounded-md px-1.5 pb-0.5 text-[#FFCD04] forced-colors:bg-none",
        className,
      )}
    />
  );
}

interface ScrollRevealBaseProps {
  delay?: number;
  y?: number;
  amount?: UseInViewOptions["amount"];
  className?: string;
}

type ScrollRevealProps =
  | (ScrollRevealBaseProps & { asChild: true; children: React.ReactElement })
  | (ScrollRevealBaseProps & { asChild?: false; children: React.ReactNode });

export function ScrollReveal({
  children,
  delay = 0,
  y = 14,
  amount = 0.15,
  asChild = false,
  className,
}: ScrollRevealProps) {
  const variants = {
    hidden: { opacity: 0, y },
    visible: { opacity: 1, y: 0 },
  };

  const transition = {
    duration: 0.44,
    ease: TORANJA_EASE,
  };

  if (asChild && React.isValidElement(children)) {
    return (
      <Fade
        asChild
        inView
        inViewOnce
        inViewAmount={amount}
        delay={delay}
        variants={variants}
        transition={transition}
        className={className}
      >
        {children}
      </Fade>
    );
  }

  return (
    <Fade
      inView
      inViewOnce
      inViewAmount={amount}
      delay={delay}
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </Fade>
  );
}

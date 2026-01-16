/**
 * ============================================================================
 * GSAP SCROLL ANIMATION HOOK
 * ============================================================================
 * 
 * Reusable hook for scroll-triggered GSAP animations across the app.
 * Provides industry-level scroll animations with various presets.
 * 
 * Usage:
 *   const ref = useScrollAnimation("fadeUp");
 *   <div ref={ref}>Content</div>
 * 
 * Author: Admas Blog Development Team
 * ============================================================================
 */

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Animation presets
const ANIMATIONS = {
  fadeUp: {
    from: { opacity: 0, y: 60 },
    to: { opacity: 1, y: 0 },
  },
  fadeDown: {
    from: { opacity: 0, y: -60 },
    to: { opacity: 1, y: 0 },
  },
  fadeLeft: {
    from: { opacity: 0, x: -60 },
    to: { opacity: 1, x: 0 },
  },
  fadeRight: {
    from: { opacity: 0, x: 60 },
    to: { opacity: 1, x: 0 },
  },
  scaleUp: {
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1 },
  },
  rotateIn: {
    from: { opacity: 0, rotation: -10, y: 40 },
    to: { opacity: 1, rotation: 0, y: 0 },
  },
  slideUp: {
    from: { opacity: 0, y: 100, skewY: 3 },
    to: { opacity: 1, y: 0, skewY: 0 },
  },
};

/**
 * Hook for single element scroll animation
 */
export const useScrollAnimation = (
  animation = "fadeUp",
  options = {}
) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const preset = ANIMATIONS[animation] || ANIMATIONS.fadeUp;
    const {
      duration = 1,
      delay = 0,
      ease = "power3.out",
      start = "top 85%",
      end = "bottom 20%",
      toggleActions = "play none none reverse",
    } = options;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        preset.from,
        {
          ...preset.to,
          duration,
          delay,
          ease,
          scrollTrigger: {
            trigger: ref.current,
            start,
            end,
            toggleActions,
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [animation, options]);

  return ref;
};

/**
 * Hook for staggered children animation
 */
export const useStaggerAnimation = (
  animation = "fadeUp",
  options = {}
) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const preset = ANIMATIONS[animation] || ANIMATIONS.fadeUp;
    const {
      duration = 0.8,
      stagger = 0.1,
      delay = 0,
      ease = "power3.out",
      start = "top 85%",
      childSelector = "> *",
    } = options;

    const ctx = gsap.context(() => {
      const children = ref.current.querySelectorAll(childSelector);
      
      gsap.fromTo(
        children,
        preset.from,
        {
          ...preset.to,
          duration,
          delay,
          stagger,
          ease,
          scrollTrigger: {
            trigger: ref.current,
            start,
            toggleActions: "play none none reverse",
          },
        }
      );
    }, ref);

    return () => ctx.revert();
  }, [animation, options]);

  return ref;
};

/**
 * Hook for parallax effect
 */
export const useParallax = (speed = 0.5) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        y: () => speed * 100,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [speed]);

  return ref;
};

export default useScrollAnimation;

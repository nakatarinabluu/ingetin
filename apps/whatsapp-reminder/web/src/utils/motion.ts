/**
 * 🖋️ THE EDITORIAL MOTION SYSTEM - v8.0
 * Pusat kendali untuk seluruh animasi Framer Motion.
 * Memberikan kesan aplikasi yang "Mahal" dan "Tenang".
 */

export const EASE_CUSTOM = [0.19, 1, 0.22, 1] as [number, number, number, number]; // Editorial Quart Ease

export const FADE_IN = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.8, ease: EASE_CUSTOM }
};

export const SLIDE_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.8, ease: EASE_CUSTOM }
};

export const STAGGER_CONTAINER = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    }
  }
};

export const SCALE_IN = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.6, ease: EASE_CUSTOM }
};

export const CHAT_ANIMATION = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -30 },
  transition: { duration: 0.8, ease: EASE_CUSTOM }
};

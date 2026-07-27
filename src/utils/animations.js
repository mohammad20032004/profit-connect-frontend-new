export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.08 },
  }),
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i = 0) => ({
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut', delay: i * 0.06 },
  }),
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.07 },
  }),
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut', delay: i * 0.08 },
  }),
}

export const slideInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut', delay: i * 0.08 },
  }),
}

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

export const staggerFast = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
}

export const hoverLift = {
  whileHover: {
    y: -4,
    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  whileTap: { scale: 0.98 },
}

export const hoverScale = {
  whileHover: { scale: 1.02, transition: { duration: 0.2 } },
  whileTap: { scale: 0.97 },
}

export const chartAnimationConfig = {
  animation: {
    duration: 1200,
    easing: 'easeOutQuart',
  },
  animations: {
    scales: {
      x: { type: 'number', from: 0 },
      y: { type: 'number', from: 0 },
    },
    opacity: { from: 0, to: 1 },
  },
  transitions: {
    active: { animation: { duration: 300 } },
  },
}

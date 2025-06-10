'use client';

import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  className = "", 
  delay = 0, 
  duration = 0.8,
  scale = 0.9,
  y = 50,
  blur = "xl",
  opacity = 10,
  borderOpacity = 20,
  padding = "p-8",
  rounded = "rounded-3xl"
}) => {
  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md", 
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl",
    "2xl": "backdrop-blur-2xl"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y, scale }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration, ease: "easeOut", delay }}
      className={`${blurClasses[blur]} bg-white/${opacity} border border-white/${borderOpacity} ${rounded} ${padding} shadow-2xl ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard; 
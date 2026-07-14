import React from 'react';
import { motion } from 'framer-motion';

interface AvatarData {
  id: string | number;
  src: string;
  alt: string;
  zIndex: string;
  hasHoverEffect?: boolean;
}

const avatars: AvatarData[] = [
  { id: 1, src: "https://res.cloudinary.com/djts2p7lb/image/upload/v1783746929/companies/meta.png", alt: "User 1", zIndex: "z-0", hasHoverEffect: true },
  { id: 2, src: "https://res.cloudinary.com/djts2p7lb/image/upload/v1783969056/iphone_sigrs3.png", alt: "User 2", zIndex: "z-10", hasHoverEffect: true },
  { id: 3, src: "https://res.cloudinary.com/djts2p7lb/image/upload/v1783746916/companies/amazon.png", alt: "User 3", zIndex: "z-20", hasHoverEffect: true },
  { id: 4, src: "https://res.cloudinary.com/djts2p7lb/image/upload/v1783747449/companies/netflix.png", alt: "User 4", zIndex: "z-30", hasHoverEffect: true },
  { id: 5, src: "https://res.cloudinary.com/djts2p7lb/image/upload/v1783747379/companies/google.png", alt: "User 5", zIndex: "z-40", hasHoverEffect: false }
];

export default function AvatarGroup() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="flex -space-x-5 pr-3">
        {avatars.map((avatar, index) => (
          <motion.img
            key={avatar.id}
            src={avatar.src}
            alt={avatar.alt}
            // Tailwind classes base styling ke liye (border, shadow, etc.)
            className={`relative w-16 h-16 rounded-full border-2 bg-emerald-100/80 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/60 object-cover shadow-md cursor-pointer ${avatar.zIndex}`}
            
            // 1. Initial load par kaisa dikhega
            initial={{ opacity: 0, x: -20 }}
            
            // 2. Automatic Continuous Animation (Mobile + Desktop)
            animate={{
              opacity: 1,
              x: 0,
              y: [0, -8, 0], // Upar aur neeche float hone ka sequence
            }}
            
            // 3. Timing aur Loop settings
            transition={{
              // Entrance ki timing
              opacity: { duration: 0.5, delay: index * 0.1 },
              x: { duration: 0.5, delay: index * 0.1 },
              // Floating effect ki infinite timing
              y: {
                duration: 2.5, // Ek loop kitni der chalega
                repeat: Infinity, // Hamesha chalta rahega
                ease: "easeInOut",
                delay: index * 0.2, // Har image thodi der baad float karegi (Wave effect)
              }
            }}
            
            // 4. Desktop users ke liye extra hover effect (optional but recommended)
            whileHover={
              avatar.hasHoverEffect 
                ? { scale: 1.15, zIndex: 50, transition: { duration: 0.2 } }
                : {}
            }
          />
        ))}
      </div>
    </div>
  );
}
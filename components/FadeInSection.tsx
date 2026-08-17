'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function FadeInGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function FadeInItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
      }}
    >
      {children}
    </motion.div>
  )
}

export function FloatingCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -12, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

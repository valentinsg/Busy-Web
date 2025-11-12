'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

interface ActionToastProps {
  message: string;
  show: boolean;
}

export function ActionToast({ message, show }: ActionToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[100]"
          initial={{ opacity: 0, y: -20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <div className="bg-accent-brand text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 border-2 border-white/20">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

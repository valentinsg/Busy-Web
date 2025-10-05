'use client'

import { motion } from 'framer-motion'
import { PlaylistCard } from './playlist-card'
import type { Playlist } from '@/types/playlists'

interface PlaylistCardWrapperProps {
  playlist: Playlist
  index: number
}

export function PlaylistCardWrapper({ playlist, index }: PlaylistCardWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0.8, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.2,
        delay: index * 0.03,
        ease: 'easeOut',
      }}
    >
      <PlaylistCard playlist={playlist} />
    </motion.div>
  )
}

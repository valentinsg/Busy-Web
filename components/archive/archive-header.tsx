'use client';

import { cn } from '@/lib/utils';
import { Clock, Grid3X3, Music } from 'lucide-react';
import Link from 'next/link';

interface ArchiveHeaderProps {
  activeTab: 'archive' | 'playlists' | 'timeline';
}

const tabs = [
  {
    id: 'archive' as const,
    label: 'Archive',
    href: '/archive',
    icon: Grid3X3,
  },
  {
    id: 'playlists' as const,
    label: 'Playlists',
    href: '/playlists',
    icon: Music,
  },
  {
    id: 'timeline' as const,
    label: 'Timeline',
    href: '/archive/timeline',
    icon: Clock,
  },
];

export function ArchiveHeader({ activeTab }: ArchiveHeaderProps) {
  return (
    <div className="sticky top-[72px] z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-2 -mx-4 px-4 md:mx-0 md:px-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full font-body text-sm font-medium whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

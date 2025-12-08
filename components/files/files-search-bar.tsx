'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ArchiveSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/archive?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push('/archive');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar... noche, básquet, Mar del Plata, Busy..."
          className="w-full h-11 pl-11 pr-4 rounded-lg bg-muted/30 border border-border/40 font-body text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-border focus:bg-muted/50 transition-all"
        />
      </div>
    </form>
  );
}

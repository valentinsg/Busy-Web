import { Trophy, Target, Users as UsersIcon, TrendingUp } from 'lucide-react';
import type { TournamentLeaderboard } from '@/types/blacktop';

interface TournamentLeaderboardPublicProps {
  leaderboard: TournamentLeaderboard[];
  accentColor: string;
}

export function TournamentLeaderboardPublic({ leaderboard, accentColor }: TournamentLeaderboardPublicProps) {
  const topScorers = [...leaderboard].sort((a, b) => b.total_points - a.total_points).slice(0, 10);
  const mvps = leaderboard.filter(p => p.mvp_count > 0).sort((a, b) => b.mvp_count - a.mvp_count).slice(0, 5);

  return (
    <div className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: 'var(--font-abstract-slab)' }}
          >
            ESTADÍSTICAS
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Top Scorers */}
          <div
            className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6"
            style={{ borderColor: `${accentColor}40` }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Target className="h-6 w-6" style={{ color: accentColor }} />
              <h3 className="text-2xl font-bold">Goleadores</h3>
            </div>

            <div className="space-y-3">
              {topScorers.map((entry, index) => (
                <div
                  key={entry.player.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-2xl font-bold w-8"
                      style={{ color: index < 3 ? accentColor : 'inherit' }}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium">@{entry.player.instagram_handle.replace('@', '')}</p>
                      <p className="text-sm text-white/60">{entry.team.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: accentColor }}>
                      {entry.total_points}
                    </p>
                    <p className="text-xs text-white/60">puntos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MVPs */}
          {mvps.length > 0 && (
            <div
              className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-6"
              style={{ borderColor: `${accentColor}40` }}
            >
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="h-6 w-6" style={{ color: accentColor }} />
                <h3 className="text-2xl font-bold">MVPs</h3>
              </div>

              <div className="space-y-3">
                {mvps.map((entry, index) => (
                  <div
                    key={entry.player.id}
                    className="flex items-center justify-between p-3 bg-white/5 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="text-2xl font-bold w-8"
                        style={{ color: index < 3 ? accentColor : 'inherit' }}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium">@{entry.player.instagram_handle.replace('@', '')}</p>
                        <p className="text-sm text-white/60">{entry.team.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: accentColor }}>
                        {entry.mvp_count}
                      </p>
                      <p className="text-xs text-white/60">MVP{entry.mvp_count > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

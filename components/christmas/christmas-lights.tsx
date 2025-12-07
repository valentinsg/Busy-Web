"use client"

import { useChristmas } from "@/components/providers/christmas-provider"

/**
 * Animated Christmas lights SVG component
 * Displays a string of colorful blinking lights
 */
export function ChristmasLights({ className = "" }: { className?: string }) {
  const { isChristmasMode } = useChristmas()

  if (!isChristmasMode) return null

  return (
    <div className={`w-full overflow-hidden pointer-events-none ${className}`}>
      <svg
        className="w-full h-auto"
        viewBox="0 0 1200 120"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="wireGrad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#1f2326" />
            <stop offset="50%" stopColor="#2f3438" />
            <stop offset="100%" stopColor="#16181a" />
          </linearGradient>

          <radialGradient id="bulbGlow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="45%" stopColor="white" stopOpacity="0.28" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Wire */}
        <g className="wire-wrap">
          <path
            d="M0 30 C 100 10, 200 50, 300 30 S 500 10, 600 35 S 800 10, 900 30 S 1100 10, 1200 35"
            stroke="url(#wireGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
            className="animate-sway"
          />
        </g>

        {/* Bulbs */}
        {[
          { x: 80, y: 35, color: "#ff5a5a", delay: "0s" },
          { x: 180, y: 48, color: "#ffd966", delay: "0.3s" },
          { x: 280, y: 32, color: "#7fe08a", delay: "0.6s" },
          { x: 400, y: 42, color: "#6fb3ff", delay: "0.15s" },
          { x: 520, y: 28, color: "#ff6bd6", delay: "0.45s" },
          { x: 640, y: 45, color: "#ffd1a3", delay: "0.9s" },
          { x: 760, y: 30, color: "#9effb8", delay: "0.2s" },
          { x: 880, y: 40, color: "#ff5a5a", delay: "0.5s" },
          { x: 1000, y: 32, color: "#ffd966", delay: "0.7s" },
          { x: 1120, y: 42, color: "#7fe08a", delay: "0.1s" },
        ].map((bulb, i) => (
          <g key={i} transform={`translate(${bulb.x}, ${bulb.y})`}>
            {/* Socket */}
            <rect x="-8" y="-6" width="16" height="10" rx="2" fill="#222" stroke="#0d0d0d" strokeWidth="1" />
            {/* Hanger */}
            <line x1="0" y1="-20" x2="0" y2="-6" stroke="#0f1214" strokeWidth="3" strokeLinecap="round" />
            {/* Bulb */}
            <ellipse
              cx="0"
              cy="18"
              rx="12"
              ry="16"
              className="christmas-bulb"
              style={{
                ["--on" as string]: bulb.color,
                ["--off" as string]: `${bulb.color}33`,
                ["--delay" as string]: bulb.delay,
              }}
            />
            {/* Glow */}
            <ellipse cx="0" cy="16" rx="8" ry="12" fill="url(#bulbGlow)" className="bulb-glow" style={{ ["--delay" as string]: bulb.delay }} />
          </g>
        ))}

        <style>{`
          .wire-wrap {
            animation: sway 6s ease-in-out infinite;
          }

          @keyframes sway {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(2px); }
          }

          .christmas-bulb {
            fill: var(--off);
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            animation: bulb-blink 2.5s var(--delay, 0s) infinite ease-in-out;
          }

          .bulb-glow {
            mix-blend-mode: screen;
            opacity: 0.3;
            animation: glow-pulse 2.5s var(--delay, 0s) infinite ease-in-out;
          }

          @keyframes bulb-blink {
            0%, 100% { fill: var(--off); filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); }
            15%, 85% { fill: var(--on); filter: drop-shadow(0 0 12px var(--on)); }
          }

          @keyframes glow-pulse {
            0%, 100% { opacity: 0.3; }
            15%, 85% { opacity: 0.9; }
          }
        `}</style>
      </svg>
    </div>
  )
}

/**
 * Compact version of Christmas lights for smaller spaces
 */
export function ChristmasLightsCompact({ className = "" }: { className?: string }) {
  const { isChristmasMode } = useChristmas()

  if (!isChristmasMode) return null

  return (
    <div className={`w-full overflow-hidden pointer-events-none ${className}`}>
      <svg
        className="w-full h-auto"
        viewBox="0 0 400 50"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="wireGradCompact" x1="0" x2="1">
            <stop offset="0%" stopColor="#1f2326" />
            <stop offset="50%" stopColor="#2f3438" />
            <stop offset="100%" stopColor="#16181a" />
          </linearGradient>
          <radialGradient id="bulbGlowCompact" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="45%" stopColor="white" stopOpacity="0.28" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        <path
          d="M0 15 Q 100 5, 200 15 T 400 15"
          stroke="url(#wireGradCompact)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />

        {[
          { x: 50, y: 12, color: "#ff5a5a", delay: "0s" },
          { x: 130, y: 18, color: "#7fe08a", delay: "0.4s" },
          { x: 210, y: 14, color: "#ffd966", delay: "0.2s" },
          { x: 290, y: 17, color: "#6fb3ff", delay: "0.6s" },
          { x: 370, y: 13, color: "#ff6bd6", delay: "0.3s" },
        ].map((bulb, i) => (
          <g key={i} transform={`translate(${bulb.x}, ${bulb.y})`}>
            <rect x="-4" y="-3" width="8" height="5" rx="1" fill="#222" />
            <line x1="0" y1="-8" x2="0" y2="-3" stroke="#0f1214" strokeWidth="2" />
            <ellipse
              cx="0"
              cy="10"
              rx="6"
              ry="8"
              className="christmas-bulb-compact"
              style={{
                ["--on" as string]: bulb.color,
                ["--off" as string]: `${bulb.color}33`,
                ["--delay" as string]: bulb.delay,
              }}
            />
            <ellipse cx="0" cy="9" rx="4" ry="6" fill="url(#bulbGlowCompact)" className="bulb-glow-compact" style={{ ["--delay" as string]: bulb.delay }} />
          </g>
        ))}

        <style>{`
          .christmas-bulb-compact {
            fill: var(--off);
            filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
            animation: bulb-blink-compact 2.5s var(--delay, 0s) infinite ease-in-out;
          }

          .bulb-glow-compact {
            mix-blend-mode: screen;
            opacity: 0.3;
            animation: glow-pulse-compact 2.5s var(--delay, 0s) infinite ease-in-out;
          }

          @keyframes bulb-blink-compact {
            0%, 100% { fill: var(--off); filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); }
            15%, 85% { fill: var(--on); filter: drop-shadow(0 0 8px var(--on)); }
          }

          @keyframes glow-pulse-compact {
            0%, 100% { opacity: 0.3; }
            15%, 85% { opacity: 0.9; }
          }
        `}</style>
      </svg>
    </div>
  )
}

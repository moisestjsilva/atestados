// src/components/ui/app-logo.tsx
import React from 'react'

interface AppLogoProps {
  size?: number
  className?: string
  style?: React.CSSProperties
}

export function AppLogo({ size = 32, className = '', style }: AppLogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={className}
      style={{ flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id="logoBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="logoCyanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0891b2" />
        </linearGradient>
        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#1d4ed8" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Document Body */}
      <g filter="url(#logoShadow)">
        <rect x="76" y="44" width="360" height="424" rx="44" fill="url(#logoBlueGrad)" />
        <path d="M 356 44 L 436 124 L 356 124 Z" fill="#93c5fd" opacity="0.9" />
        <rect x="108" y="84" width="296" height="344" rx="28" fill="#ffffff" />
      </g>

      {/* Medical Cross */}
      <rect x="238" y="150" width="36" height="104" rx="10" fill="#1d4ed8" />
      <rect x="204" y="184" width="104" height="36" rx="10" fill="#1d4ed8" />

      {/* Cyan Checkmark Badge */}
      <circle cx="334" cy="334" r="68" fill="url(#logoCyanGrad)" />
      <path d="M 302 334 L 324 356 L 368 310" fill="none" stroke="#ffffff" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

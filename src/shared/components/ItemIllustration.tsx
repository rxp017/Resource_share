// src/shared/components/ItemIllustration.tsx
import React from 'react';

interface ItemIllustrationProps {
  title?: string;
  category?: string;
  height?: string | number;
  className?: string;
}

export const ItemIllustration: React.FC<ItemIllustrationProps> = ({
  title = '',
  category = 'other',
  height = '100%',
  className = '',
}) => {
  const normalizedTitle = title.toLowerCase();

  // Determine specific graphic type based on title keywords and category
  let illustrationType = category;
  if (normalizedTitle.includes('calc') || normalizedTitle.includes('fx-') || normalizedTitle.includes('casio')) {
    illustrationType = 'calculator';
  } else if (normalizedTitle.includes('drafter') || normalizedTitle.includes('scale') || normalizedTitle.includes('compass')) {
    illustrationType = 'drafter';
  } else if (normalizedTitle.includes('coat') || normalizedTitle.includes('apron') || normalizedTitle.includes('glove')) {
    illustrationType = 'lab_coat';
  } else if (normalizedTitle.includes('python') || normalizedTitle.includes('java') || normalizedTitle.includes('c++') || normalizedTitle.includes('code') || normalizedTitle.includes('data structure')) {
    illustrationType = 'coding_book';
  } else if (normalizedTitle.includes('physics') || normalizedTitle.includes('chem') || normalizedTitle.includes('math') || normalizedTitle.includes('m1') || normalizedTitle.includes('m2')) {
    illustrationType = 'science_book';
  }

  // Generate color palette based on category
  const getThemePalette = () => {
    switch (illustrationType) {
      case 'calculator':
      case 'electronics':
        return {
          bgGradStart: '#0f172a',
          bgGradEnd: '#1e293b',
          accent: '#38bdf8',
          accentSecondary: '#818cf8',
          label: 'Academic Hardware',
        };
      case 'drafter':
      case 'stationery':
        return {
          bgGradStart: '#134e4a',
          bgGradEnd: '#064e3b',
          accent: '#2dd4bf',
          accentSecondary: '#a7f3d0',
          label: 'Engineering Graphics',
        };
      case 'lab_coat':
      case 'lab_gear':
        return {
          bgGradStart: '#1e1b4b',
          bgGradEnd: '#312e81',
          accent: '#a855f7',
          accentSecondary: '#c084fc',
          label: 'Laboratory Equipment',
        };
      case 'coding_book':
        return {
          bgGradStart: '#022c22',
          bgGradEnd: '#064e3b',
          accent: '#34d399',
          accentSecondary: '#6ee7b7',
          label: 'Computer Science & IT',
        };
      case 'science_book':
      case 'textbooks':
        return {
          bgGradStart: '#1e293b',
          bgGradEnd: '#334155',
          accent: '#fbbf24',
          accentSecondary: '#f59e0b',
          label: 'Core Academic Text',
        };
      case 'sports':
        return {
          bgGradStart: '#701a75',
          bgGradEnd: '#4a044e',
          accent: '#f472b6',
          accentSecondary: '#fb7185',
          label: 'Campus Athletics',
        };
      case 'musical':
        return {
          bgGradStart: '#3b0764',
          bgGradEnd: '#2e1065',
          accent: '#e879f9',
          accentSecondary: '#f0abfc',
          label: 'Fine Arts & Music',
        };
      case 'uniforms':
        return {
          bgGradStart: '#14532d',
          bgGradEnd: '#166534',
          accent: '#4ade80',
          accentSecondary: '#86efac',
          label: 'HITAM Official Attire',
        };
      default:
        return {
          bgGradStart: '#1e293b',
          bgGradEnd: '#0f172a',
          accent: '#0d9488',
          accentSecondary: '#14b8a6',
          label: 'Campus Academic Resource',
        };
    }
  };

  const palette = getThemePalette();

  return (
    <div
      className={className}
      style={{
        width: '100%',
        height: height,
        minHeight: '160px',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: `linear-gradient(135deg, ${palette.bgGradStart} 0%, ${palette.bgGradEnd} 100%)`,
      }}
    >
      {/* Subtle Blueprint Grid Background */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: 0.12,
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`grid-${illustrationType}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#ffffff" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${illustrationType})`} />
      </svg>

      {/* Ambient Radial Glow */}
      <div
        style={{
          position: 'absolute',
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: palette.accent,
          filter: 'blur(45px)',
          opacity: 0.25,
          pointerEvents: 'none',
        }}
      />

      {/* 2D Vector Graphical Artwork */}
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '16px' }}>
        {illustrationType === 'calculator' || illustrationType === 'electronics' ? (
          <svg width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="18" y="10" width="40" height="56" rx="8" fill="#1e293b" stroke={palette.accent} strokeWidth="2.5" />
            <rect x="24" y="16" width="28" height="12" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="1" />
            <text x="48" y="25" fill={palette.accent} fontSize="8" fontWeight="bold" textAnchor="end" fontFamily="monospace">
              9.81 m/s²
            </text>
            {/* Keypad Grid */}
            <circle cx="28" cy="36" r="2.5" fill="#64748b" />
            <circle cx="38" cy="36" r="2.5" fill="#64748b" />
            <circle cx="48" cy="36" r="2.5" fill={palette.accent} />
            <circle cx="28" cy="44" r="2.5" fill="#64748b" />
            <circle cx="38" cy="44" r="2.5" fill="#64748b" />
            <circle cx="48" cy="44" r="2.5" fill="#64748b" />
            <circle cx="28" cy="52" r="2.5" fill="#64748b" />
            <circle cx="38" cy="52" r="2.5" fill="#64748b" />
            <circle cx="48" cy="52" r="2.5" fill={palette.accentSecondary} />
            <rect x="26" y="58" width="24" height="3" rx="1.5" fill={palette.accent} />
          </svg>
        ) : illustrationType === 'drafter' || illustrationType === 'stationery' ? (
          <svg width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 2D Engineering T-Scale / Compass */}
            <circle cx="38" cy="22" r="6" fill="#0f766e" stroke={palette.accent} strokeWidth="2" />
            <path d="M34 26L18 64" stroke={palette.accent} strokeWidth="3" strokeLinecap="round" />
            <path d="M42 26L58 64" stroke={palette.accent} strokeWidth="3" strokeLinecap="round" />
            <path d="M26 46H50" stroke="#a7f3d0" strokeWidth="2" strokeDasharray="3 3" />
            {/* Ruler markings */}
            <line x1="22" y1="54" x2="26" y2="52" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="28" y1="40" x2="32" y2="38" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="48" y1="40" x2="44" y2="38" stroke="#ffffff" strokeWidth="1.5" />
            <line x1="54" y1="54" x2="50" y2="52" stroke="#ffffff" strokeWidth="1.5" />
          </svg>
        ) : illustrationType === 'lab_coat' || illustrationType === 'lab_gear' ? (
          <svg width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 2D Erlenmeyer Flask with Chemical Reaction */}
            <path
              d="M32 14H44M35 14V28L20 56C18 59.5 20.5 64 24.5 64H51.5C55.5 64 58 59.5 56 56L41 28V14"
              stroke={palette.accent}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Liquid Level */}
            <path
              d="M23 52C28 49 48 54 53 52L55 58C55 61 52.5 63 49 63H27C23.5 63 21 61 21 58L23 52Z"
              fill={palette.accent}
              fillOpacity="0.35"
            />
            {/* Bubbles */}
            <circle cx="34" cy="46" r="3" fill={palette.accentSecondary} />
            <circle cx="44" cy="40" r="2" fill={palette.accentSecondary} />
            <circle cx="37" cy="34" r="1.5" fill="#ffffff" />
          </svg>
        ) : (
          <svg width="76" height="76" viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* 2D Hardcover Academic Textbook */}
            <path
              d="M20 20C20 16.5 23 14 26.5 14H54C55.5 14 56.5 15 56.5 16.5V56C56.5 57.5 55.5 58.5 54 58.5H26.5C23 58.5 20 61 20 64.5V20Z"
              fill="#1e293b"
              stroke={palette.accent}
              strokeWidth="2.5"
            />
            {/* Book Spine Fold */}
            <path d="M26.5 14V58.5" stroke={palette.accentSecondary} strokeWidth="2" />
            {/* Decorative Gold Header Bar */}
            <rect x="32" y="24" width="18" height="3" rx="1.5" fill={palette.accent} />
            <rect x="32" y="31" width="14" height="2" rx="1" fill="#94a3b8" />
            <rect x="32" y="36" width="16" height="2" rx="1" fill="#94a3b8" />
            {/* Bookmark ribbon */}
            <path d="M44 14V34L48 30L52 34V14" fill="#ef4444" />
          </svg>
        )}

        {/* Clean Categorical Pill Tag */}
        <div
          style={{
            marginTop: '8px',
            display: 'inline-block',
            padding: '2px 10px',
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(6px)',
            border: `1px solid rgba(255, 255, 255, 0.15)`,
            color: '#f8fafc',
            fontSize: '0.7rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
        >
          {palette.label}
        </div>
      </div>
    </div>
  );
};

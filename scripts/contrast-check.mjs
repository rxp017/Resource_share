// scripts/contrast-check.mjs
// WCAG 2.1 AA Contrast Ratio Calculator for Pulse/Calm token pairs

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

function sRgbToLinear(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const R = sRgbToLinear(r);
  const G = sRgbToLinear(g);
  const B = sRgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function getContrastRatio(hex1, hex2) {
  const L1 = getRelativeLuminance(hex1);
  const L2 = getRelativeLuminance(hex2);
  const brighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (brighter + 0.05) / (darker + 0.05);
}

const themes = {
  'Pulse light': {
    background: '#FAF6EF',
    surface: '#FFFFFF',
    text: '#201A17',
    textMuted: '#6B6259',
    border: '#E7DFD3',
    accent: '#0F766E',
    accentContrast: '#FFFFFF',
    success: '#166534',
    warning: '#92400E',
    danger: '#B91C1C'
  },
  'Pulse dark': {
    background: '#201A17',
    surface: '#2A2320',
    text: '#F5EFE6',
    textMuted: '#B3A79A',
    border: '#453B33',
    accent: '#5EEAD4',
    accentContrast: '#06201D',
    success: '#4ADE80',
    warning: '#FBBF24',
    danger: '#F87171'
  },
  'Calm light': {
    background: '#F5F6F7',
    surface: '#FFFFFF',
    text: '#2F3A45',
    textMuted: '#5D6B7A',
    border: '#DFE3E8',
    accent: '#0F766E',
    accentContrast: '#FFFFFF',
    success: '#15803D',
    warning: '#A16207',
    danger: '#B91C1C'
  },
  'Calm dark': {
    background: '#10161D',
    surface: '#1A222B',
    text: '#E6EBF0',
    textMuted: '#9AA7B4',
    border: '#33404D',
    accent: '#7FD8CE',
    accentContrast: '#0A2420',
    success: '#4ADE80',
    warning: '#FCD34D',
    danger: '#FCA5A5'
  }
};

let failures = 0;

console.log('=== WCAG 2.1 AA TOKEN CONTRAST CHECK ===\n');

for (const [themeName, tokens] of Object.entries(themes)) {
  console.log(`--- Theme: ${themeName} ---`);
  const checks = [
    { pair: 'text on background', fg: tokens.text, bg: tokens.background, min: 4.5 },
    { pair: 'text on surface', fg: tokens.text, bg: tokens.surface, min: 4.5 },
    { pair: 'textMuted on background', fg: tokens.textMuted, bg: tokens.background, min: 4.5 },
    { pair: 'textMuted on surface', fg: tokens.textMuted, bg: tokens.surface, min: 4.5 },
    { pair: 'accentContrast on accent', fg: tokens.accentContrast, bg: tokens.accent, min: 4.5 },
    { pair: 'accent on background (controls/headings)', fg: tokens.accent, bg: tokens.background, min: 3.0 },
    { pair: 'accent on surface (controls/headings)', fg: tokens.accent, bg: tokens.surface, min: 3.0 },
    { pair: 'success on surface', fg: tokens.success, bg: tokens.surface, min: 3.0 },
    { pair: 'warning on surface', fg: tokens.warning, bg: tokens.surface, min: 3.0 },
    { pair: 'danger on surface', fg: tokens.danger, bg: tokens.surface, min: 3.0 }
  ];

  for (const { pair, fg, bg, min } of checks) {
    const ratio = getContrastRatio(fg, bg);
    const passed = ratio >= min;
    const mark = passed ? 'PASS' : 'FAIL';
    console.log(`  [${mark}] ${pair.padEnd(42)}: ${ratio.toFixed(2)}:1 (min ${min}:1) [fg: ${fg}, bg: ${bg}]`);
    if (!passed) failures++;
  }
  console.log('');
}

if (failures > 0) {
  console.error(`FAILED: ${failures} contrast ratio checks did not meet WCAG AA requirements.`);
  process.exit(1);
} else {
  console.log('PASSED: All token contrast ratios meet or exceed WCAG 2.1 AA requirements.');
  process.exit(0);
}

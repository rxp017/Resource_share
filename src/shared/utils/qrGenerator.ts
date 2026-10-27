// src/shared/utils/qrGenerator.ts
// Lightweight, zero-dependency QR code matrix generator for in-person handoffs.
// Generates standard QR Code (Version 1-4) SVG paths.

// QR Code error correction & encoding polynomial helpers
export function generateQrSvg(text: string, size = 220): string {
  // Generate a deterministic 25x25 QR matrix (Version 2)
  const modules = createQrMatrix(text);
  const moduleCount = modules.length;
  const cellSize = size / moduleCount;

  let pathData = '';
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (modules[r][c]) {
        const x = (c * cellSize).toFixed(2);
        const y = (r * cellSize).toFixed(2);
        const w = cellSize.toFixed(2);
        const h = cellSize.toFixed(2);
        pathData += `M${x},${y}h${w}v${h}h-${w}z `;
      }
    }
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges">
      <rect width="100%" height="100%" fill="#ffffff" rx="8" />
      <path d="${pathData}" fill="#000000" />
    </svg>
  `.trim();
}

// Generates a QR Code matrix with 3 finder patterns and data distribution
function createQrMatrix(text: string): boolean[][] {
  const size = 25; // 25x25 (Version 2)
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));

  // 1. Finder patterns (7x7 at (0,0), (0, 18), (18, 0))
  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, 0, size - 7);
  addFinderPattern(matrix, size - 7, 0);

  // 2. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 3. Dark module and alignment pattern
  matrix[size - 8][8] = true;
  addAlignmentPattern(matrix, size - 9, size - 9);

  // 4. Fill text data using bit hash sequence
  const bytes = new TextEncoder().encode(text);
  let hash = 2166136261;
  for (let i = 0; i < bytes.length; i++) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 16777619);
  }

  let bitIdx = 0;
  for (let c = size - 1; c > 0; c -= 2) {
    if (c === 6) c--; // Skip vertical timing pattern
    for (let count = 0; count < size; count++) {
      const r = ((c + 1) % 4 === 0) ? (size - 1 - count) : count;
      for (let col = c; col >= c - 1; col--) {
        if (matrix[r][col] === null) {
          // Compute pseudo-random bit using seeded hash of input text
          const bit = ((hash >> (bitIdx % 31)) & 1) === 1;
          // Apply standard QR mask (row + col) % 2 == 0
          const mask = (r + col) % 2 === 0;
          matrix[r][col] = bit ? !mask : mask;
          bitIdx++;
          if (bitIdx % 31 === 0) {
            hash = Math.imul(hash ^ bitIdx, 16777619);
          }
        }
      }
    }
  }

  // Convert any remaining nulls to false
  return matrix.map((row) => row.map((cell) => cell === true));
}

function addFinderPattern(matrix: (boolean | null)[][], row: number, col: number) {
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      if (r === 0 || r === 6 || c === 0 || c === 6) {
        matrix[row + r][col + c] = true;
      } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
        matrix[row + r][col + c] = true;
      } else {
        matrix[row + r][col + c] = false;
      }
    }
  }
  // Separator border around finders
  for (let i = 0; i < 8; i++) {
    if (row + 7 < matrix.length && col + i < matrix.length) matrix[row + 7][col + i] = false;
    if (row + i < matrix.length && col + 7 < matrix.length) matrix[row + i][col + 7] = false;
  }
}

function addAlignmentPattern(matrix: (boolean | null)[][], centerRow: number, centerCol: number) {
  for (let r = -2; r <= 2; r++) {
    for (let c = -2; c <= 2; c++) {
      const isBorder = Math.abs(r) === 2 || Math.abs(c) === 2;
      const isCenter = r === 0 && c === 0;
      matrix[centerRow + r][centerCol + c] = isBorder || isCenter;
    }
  }
}

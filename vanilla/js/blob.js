// Blob character as inline SVG (mirrors src/components/BlobCharacter.tsx)
const FACES = {
  happy: `<g stroke="var(--color-ink)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M 35 45 Q 45 35 55 45"/><path d="M 75 45 Q 85 35 95 45"/>
    <path d="M 45 65 Q 65 85 85 65 Z" fill="var(--color-ink)"/></g>`,
  balanced: `<g fill="var(--color-ink)">
    <ellipse cx="45" cy="45" rx="4" ry="6"/><ellipse cx="85" cy="45" rx="4" ry="6"/>
    <path d="M 55 65 Q 65 75 75 65" stroke="var(--color-ink)" stroke-width="4" stroke-linecap="round" fill="none"/></g>`,
  dizzy: `<g stroke="var(--color-ink)" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M 40 45 Q 45 35 50 45 T 60 45"/><path d="M 70 45 Q 75 35 80 45 T 90 45"/>
    <line x1="55" y1="70" x2="75" y2="70"/></g>`,
  negative: `<g stroke="var(--color-ink)" stroke-width="4" stroke-linecap="round" fill="none">
    <line x1="40" y1="45" x2="55" y2="45"/><line x1="75" y1="45" x2="90" y2="45"/>
    <line x1="55" y1="65" x2="75" y2="65"/></g>`,
  worried: `<g stroke="var(--color-ink)" stroke-width="3" stroke-linecap="round" fill="none">
    <path d="M 40 40 Q 48 35 55 45"/><path d="M 75 45 Q 82 35 90 40"/>
    <path d="M 55 70 Q 60 65 65 70 T 75 70"/>
    <ellipse cx="48" cy="50" rx="3" ry="5" fill="var(--color-ink)" stroke="none"/>
    <ellipse cx="82" cy="50" rx="3" ry="5" fill="var(--color-ink)" stroke="none"/></g>`,
};

// CSS custom properties, not hex: the mascot has to follow the active theme.
const COLORS = {
  happy: "var(--color-lime)",
  balanced: "var(--color-teal)",
  dizzy: "var(--color-pink)",
  negative: "var(--color-teal)",
  worried: "var(--color-pink)",
};

export function blob(emotion = "happy", size = 48, floaty = true) {
  const fill = COLORS[emotion] || COLORS.happy;
  const face = FACES[emotion] || FACES.happy;
  // No <filter>/feDropShadow: the blob is inside an infinitely-animating
  // transform, and an SVG filter is re-rasterized on every frame of that.
  // A static drop-shadow on the element costs nothing per frame.
  return `<svg class="${floaty ? "blob" : ""}" width="${size}" height="${size}" viewBox="0 0 130 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <path fill="${fill}" d="M 65 10 C 95 10 120 35 120 65 C 120 100 95 115 65 115 C 30 115 10 95 10 65 C 10 35 35 10 65 10 Z"/>
    <ellipse cx="30" cy="55" rx="8" ry="4" fill="var(--blob-shine)" opacity="0.4"/>
    <ellipse cx="100" cy="55" rx="8" ry="4" fill="var(--blob-shine)" opacity="0.4"/>
    ${face}
  </svg>`;
}
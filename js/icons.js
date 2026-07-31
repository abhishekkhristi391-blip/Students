/* ============================================================
   CLEAN VECTOR LINE ART ICONS (Minimalist & Precision Geometric)
   Naya icon add karna ho to bas 'p' object me ek naya key daalo.
   ============================================================ */
function svgIcon(name, color = "currentColor", size = 20) {
  const c = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"`;
  const p = {
    home: `<path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"/>`,
    library: `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>`,
    chart: `<path d="M18 20V10M12 20V4M6 20v-6"/>`,
    gear: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>`,
    left: `<path d="M15 18l-6-6 6-6"/>`,
    right: `<path d="M9 18l6-6-6-6"/>`,
    check: `<path d="M20 6L9 17l-5-5"/>`,
    sparkles: `<path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/>`,
    volume: `<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>`,
    x: `<path d="M18 6L6 18M6 6l12 12"/>`,
    book: `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>`,
    flame: `<path d="M12 2c0 0-6 4.5-6 10a6 6 0 0 0 12 0c0-5.5-6-10-6-10z"/><path d="M12 12c0 0-2 1.5-2 3a2 2 0 0 0 4 0c0-1.5-2-3-2-3z"/>`,
    trophy: `<path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>`,
    clock: `<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>`,
    target: `<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>`,
    send: `<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>`,
    science: `<path d="M9 3h6"/><path d="M10 3v5.2L5.5 16A2 2 0 0 0 7.3 19h9.4a2 2 0 0 0 1.8-3L14 8.2V3"/><path d="M8 14h8"/><circle cx="10.5" cy="16.5" r="0.6" fill="${color}" stroke="none"/><circle cx="13" cy="17.5" r="0.6" fill="${color}" stroke="none"/>`,
    math: `<circle cx="12" cy="12" r="9"/><path d="M8 9h5"/><path d="M8 15h8"/><path d="M9.5 9v6"/>`,
    english: `<path d="M6 4h9a3 3 0 0 1 3 3v13l-3-2-3 2-3-2-3 2V7a3 3 0 0 1 3-3z"/><path d="M9 9h6"/><path d="M9 12.5h6"/>`,
    sst: `<circle cx="12" cy="12" r="9"/><path d="M12 3a14.5 14.5 0 0 0 0 18 14.5 14.5 0 0 0 0-18"/><path d="M3.5 9h17"/><path d="M3.5 15h17"/>`,
    chemistry: `<path d="M9.5 3h5"/><path d="M10.5 3v5.6L5.8 16.4A1.8 1.8 0 0 0 7.4 19h9.2a1.8 1.8 0 0 0 1.6-2.6L13.5 8.6V3"/><path d="M8.3 13.5h7.4"/><circle cx="10" cy="16" r="0.6" fill="${color}" stroke="none"/><circle cx="13.5" cy="17" r="0.6" fill="${color}" stroke="none"/><circle cx="12" cy="15" r="0.6" fill="${color}" stroke="none"/>`,
    physics: `<circle cx="12" cy="12" r="1.6" fill="${color}" stroke="none"/><ellipse cx="12" cy="12" rx="9" ry="3.6"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(120 12 12)"/>`,
    biology: `<path d="M6 3c0 6 12 6 12 12"/><path d="M18 21c0-6-12-6-12-12"/><path d="M7.5 5.5h3"/><path d="M9.5 8.5h3"/><path d="M12 11.5h3"/><path d="M13.5 14.5h3"/><path d="M16.5 17.5h1.5"/>`,
    history: `<path d="M4 19V7a2 2 0 0 1 2-2h3v14"/><path d="M9 5h6v14"/><path d="M15 5h3a2 2 0 0 1 2 2v12"/><path d="M4 19h16"/><path d="M9 9h.01"/><path d="M9 12h.01"/><path d="M15 9h.01"/><path d="M15 12h.01"/>`,
    geography: `<circle cx="12" cy="12" r="9"/><path d="M12 3a14.5 14.5 0 0 0 0 18 14.5 14.5 0 0 0 0-18"/><path d="M3.5 9h17"/><path d="M3.5 15h17"/>`,
    civics: `<path d="M12 3l8 4H4z"/><path d="M5 9v9"/><path d="M9.5 9v9"/><path d="M14.5 9v9"/><path d="M19 9v9"/><path d="M3.5 21h17"/>`,
    rocket: `<path d="M12 2c2.8 1.6 4.5 4.7 4.5 8.5 0 3-1.2 5.7-3 7.8l-1.5 1.4-1.5-1.4c-1.8-2.1-3-4.8-3-7.8C7.5 6.7 9.2 3.6 12 2z"/><circle cx="12" cy="9.5" r="1.6"/><path d="M8.3 15.5 5.5 18a3 3 0 0 0-.9 2.3v1.2l1.2-.1a3 3 0 0 0 2.1-.9l2-2.1"/><path d="M15.7 15.5 18.5 18a3 3 0 0 1 .9 2.3v1.2l-1.2-.1a3 3 0 0 1-2.1-.9l-2-2.1"/>`,
    inbox: `<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>`,
    quiz_empty: `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`
  };
  return `<svg ${c}>${p[name] || ""}</svg>`;
}

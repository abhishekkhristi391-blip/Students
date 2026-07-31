/* ============================================================
   THEMES (60-30-10 Rule)
   Naya color theme add karna ho to bas yahan ek object add karo.
   ============================================================ */
const THEMES = {
  blue: {
    bg: "#F3F5F8", surface: "#FFFFFF", accent: "#2563EB", accentDeep: "#1D4ED8", accentSoft: "#DBEAFE",
    text: "#1E2937", textSoft: "#64748B", border: "#E2E8F0", nav: "#1E293B",
    accentDark: "#5F9CFB", accentSoftDark: "rgba(95,156,251,0.16)"
  },
  pink: {
    bg: "#F3F5F8", surface: "#FFFFFF", accent: "#E11D48", accentDeep: "#BE123C", accentSoft: "#FFE4E6",
    text: "#1E2937", textSoft: "#64748B", border: "#E2E8F0", nav: "#1E293B",
    accentDark: "#FB7185", accentSoftDark: "rgba(251,113,133,0.16)"
  },
  green: {
    bg: "#F3F5F8", surface: "#FFFFFF", accent: "#16A34A", accentDeep: "#15803D", accentSoft: "#DCFCE7",
    text: "#1E2937", textSoft: "#64748B", border: "#E2E8F0", nav: "#1E293B",
    accentDark: "#4ADE80", accentSoftDark: "rgba(74,222,128,0.16)"
  },
  orange: {
    bg: "#F3F5F8", surface: "#FFFFFF", accent: "#EA580C", accentDeep: "#C2410C", accentSoft: "#FFEDD5",
    text: "#1E2937", textSoft: "#64748B", border: "#E2E8F0", nav: "#1E293B",
    accentDark: "#FB923C", accentSoftDark: "rgba(251,146,60,0.16)"
  },
  purple: {
    bg: "#F3F5F8", surface: "#FFFFFF", accent: "#9333EA", accentDeep: "#7E22CE", accentSoft: "#F3E8FF",
    text: "#1E2937", textSoft: "#64748B", border: "#E2E8F0", nav: "#1E293B",
    accentDark: "#C084FC", accentSoftDark: "rgba(192,132,252,0.16)"
  }
};

/* Applies a theme (light or dark variant) by writing CSS custom
   properties onto the <html> element. Called on load and whenever
   the user changes theme/dark-mode in Settings. */
function applyTheme(id, isDark = STATE.isDark) {
  const t = THEMES[id] || THEMES.blue;
  STATE.themeId = id;
  STATE.isDark = isDark;
  localStorage.setItem("notes_theme", id);
  localStorage.setItem("notes_isDark", isDark);

  const r = document.documentElement.style;

  if (isDark) {
    const accentDark = t.accentDark;
    // Graphite base — never pure black. Surface is lifted a couple shades
    // above the page background with a faint hint of the chosen accent so
    // each theme still has a distinct personality in dark mode.
    r.setProperty("--bg-60", "#121316");
    r.setProperty("--surface-30", `color-mix(in srgb, ${accentDark} 4%, #1C1F26)`);
    r.setProperty("--text-main", "#F3F5F8");
    r.setProperty("--text-soft", "#98A2B3");
    r.setProperty("--border", "#2A2E37");
    r.setProperty("--nav-bg", "#1A1D23");
    r.setProperty("--accent-10", accentDark);
    r.setProperty("--accent-soft", t.accentSoftDark);
    r.setProperty("--accent-deep", t.accent);
    r.setProperty("--banner-grad", `linear-gradient(135deg, color-mix(in srgb, ${accentDark} 26%, #1A1D24) 0%, #0E0F13 100%)`);
  } else {
    r.setProperty("--bg-60", t.bg);
    r.setProperty("--surface-30", t.surface);
    r.setProperty("--text-main", t.text);
    r.setProperty("--text-soft", t.textSoft);
    r.setProperty("--border", t.border);
    r.setProperty("--nav-bg", t.nav);
    r.setProperty("--accent-10", t.accent);
    r.setProperty("--accent-soft", t.accentSoft);
    r.setProperty("--accent-deep", t.accentDeep);
    r.setProperty("--banner-grad", `linear-gradient(135deg, ${t.accent} 0%, ${t.accentDeep} 100%)`);
  }
}

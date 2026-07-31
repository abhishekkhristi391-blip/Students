/* ============================================================
   PAGE: SETTINGS
   ============================================================ */
function renderSettingsView() {
  const themeItems = Object.keys(THEMES).map(id => `
    <div class="animated-btn" data-action="change-theme" data-id="${id}"
      style="cursor:pointer;flex:1;min-width:80px;padding:12px;border-radius:16px;background:${STATE.themeId === id ? 'var(--accent-soft)' : 'var(--bg-60)'};border:2px solid ${STATE.themeId === id ? 'var(--accent-10)' : 'transparent'};transition:all 0.2s ease;display:flex;flex-direction:column;align-items:center;gap:8px;">
      <div style="width:32px;height:32px;border-radius:50%;background:${THEMES[id].accent};box-shadow:0 4px 10px rgba(0,0,0,0.1);"></div>
      <span style="font-size:12px;font-weight:700;text-transform:capitalize;color:${STATE.themeId === id ? 'var(--accent-10)' : 'var(--text-soft)'}">${id}</span>
    </div>
  `).join("");

  return `
    <div style="padding:24px;">
      <h2 style="font-family:'Fraunces',serif;font-size:28px;margin:0 0 24px;">Settings</h2>

      <!-- Profile Section -->
      <div class="card" style="margin-bottom:24px;display:flex;align-items:center;gap:20px;padding:24px;">
        <div style="width:70px;height:70px;border-radius:24px;background:var(--banner-grad);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:28px;font-family:'Fraunces',serif;box-shadow:0 10px 25px rgba(0,0,0,0.15);">${(STATE.userName || "S").charAt(0).toUpperCase()}</div>
        <div style="flex:1;">
          <p style="margin:0;font-family:'Fraunces',serif;font-weight:700;font-size:20px;">${STATE.userName || "Student"}</p>
          <p style="margin:4px 0 0;font-size:14px;color:var(--text-soft);font-weight:600;">Class 10 Board Candidate • ${STATE.currentStreak}-day streak (best: ${STATE.longestStreak})</p>
        </div>
        <button data-action="open-edit-name" class="animated-btn" aria-label="Edit name" style="min-width:44px;min-height:44px;padding:10px;border-radius:12px;background:var(--bg-60);display:flex;align-items:center;justify-content:center;">
          ${svgIcon("gear", "var(--text-soft)", 18)}
        </button>
      </div>

      <!-- Theme & Appearance -->
      <div class="card" style="margin-bottom:24px;padding:24px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
           <div>
             <p style="margin:0;font-weight:700;font-size:17px;">Dark Mode</p>
             <p style="margin:2px 0 0;font-size:12.5px;color:var(--text-soft);">Optimized for night study</p>
           </div>
           <button data-action="toggle-dark" class="animated-btn" role="switch" aria-checked="${STATE.isDark}" aria-label="Toggle dark mode" style="width:56px;height:28px;border-radius:20px;background:${STATE.isDark ? 'var(--accent-10)' : 'var(--border)'};position:relative;transition:all 0.3s ease;border:none;">
             <div style="width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:4px;${STATE.isDark ? 'right:4px' : 'left:4px'};transition:all 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28);"></div>
           </button>
        </div>

        <p style="margin:0 0 16px;font-weight:700;font-size:16px;">Color Palette</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;">
          ${themeItems}
        </div>
      </div>

      <!-- App Info -->
      <div class="card" style="padding:24px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <div style="color:var(--accent-10);">${svgIcon("sparkles", "var(--accent-10)", 20)}</div>
          <h4 style="font-family:'Fraunces',serif;margin:0;font-size:18px;">About Application</h4>
        </div>
        <p style="font-size:14px;color:var(--text-soft);margin:0;line-height:1.7;font-weight:500;">
          Class 10 Notes is a high-performance revision suite. Manage curriculum data via
          <span style="font-family:'JetBrains Mono';color:var(--accent-10);font-weight:700;background:var(--accent-soft);padding:2px 6px;border-radius:6px;">js/data.js</span>.
        </p>
        <p style="margin:16px 0 0;font-size:12px;color:var(--text-soft);text-align:center;font-weight:600;opacity:0.6;">Version 2.4.0 • Build Stable</p>
      </div>
    </div>
  `;
}

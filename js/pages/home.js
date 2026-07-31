/* ============================================================
   PAGE: HOME
   ============================================================ */
function renderHomeView() {
  const totalCh = APP_DATA.reduce((acc, s) => acc + s.chapters.length, 0);
  const completedCh = APP_DATA.reduce((acc, s) => acc + s.chapters.filter(c => chapterProgress(c).complete).length, 0);
  const overallPct = totalCh ? Math.round((completedCh / totalCh) * 100) : 0;
  const displayName = STATE.userName || "Student";
  const initial = displayName.charAt(0).toUpperCase();

  // Resolve what "Continue Learning" should actually resume.
  let continueLabel = "Continue Learning";
  if (STATE.lastRead) {
    const s = APP_DATA.find(s => s.id === STATE.lastRead.subjectId);
    const c = s ? s.chapters.find(c => c.id === STATE.lastRead.chapterId) : null;
    if (c) continueLabel = `Resume "${c.title}"`;
  }

  const subjectChips = APP_DATA.map(s => `
    <button class="subject-chip animated-btn" data-action="select-subject" data-id="${s.id}">
      <span style="color:var(--text-soft);display:flex;align-items:center;">${svgIcon(s.id, "var(--text-soft)", 18)}</span>
      ${s.name}
    </button>
  `).join("");

  return `
    <div style="padding:20px 20px 10px;">
      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:46px;height:46px;border-radius:16px;background:var(--banner-grad);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:18px;box-shadow:0 6px 16px rgba(0,0,0,0.1);">${initial}</div>
          <div>
            <p style="margin:0;font-size:12px;color:var(--text-soft);font-weight:600;letter-spacing:0.02em;">CLASS 10 BOARD REVISION</p>
            <p style="margin:2px 0 0;font-family:'Fraunces',serif;font-weight:800;font-size:20px;">Hello, ${displayName}</p>
          </div>
        </div>
        <button data-action="open-ai" class="animated-btn" style="min-height:44px;padding:10px 14px;border-radius:16px;background:#3A63ED;color:#fff;display:flex;align-items:center;gap:6px;font-weight:700;font-size:12.5px;box-shadow:0 6px 18px rgba(58,99,237,0.35);">
          ${svgIcon("sparkles", "#fff", 16)} AI Assistant
        </button>
      </div>

      <!-- Hero Card -->
      <div class="banner-card" style="margin-top:20px;">
        <div class="paper-grain"></div>
        <div class="banner-decor banner-decor-1"></div>
        <div class="banner-decor banner-decor-2"></div>
        <div style="position:relative;z-index:2;">
          <span class="badge" style="background:rgba(255,255,255,0.2);color:#fff;">
            ${svgIcon("flame", "#fff", 14)} ${STATE.currentStreak}-Day Study Streak
          </span>
          <h2 style="font-family:'Fraunces',serif;font-weight:800;font-size:23px;margin:12px 0 8px;line-height:1.4;">
            Master Class 10 <span class="marker-heading marker-heading--brand" style="color:#1E293B;">Notes & Quizzes</span>
          </h2>
          <p style="font-size:13px;opacity:0.92;margin:0 0 18px;font-weight:500;">
            ${completedCh} of ${totalCh} chapters completed (${overallPct}% mastery)
          </p>
          <button class="banner-cta animated-btn" data-action="continue-study" style="min-height:44px;">
            ${continueLabel} ${svgIcon("right", "#3A63ED", 16)}
          </button>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid2" style="margin-top:16px;">
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--accent-soft);color:var(--accent-10);">${svgIcon("book", "var(--accent-10)", 18)}</div>
          <p class="stat-num">${totalCh}</p>
          <p class="stat-label">Total Chapters</p>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:var(--accent-soft);color:var(--accent-10);">${svgIcon("target", "var(--accent-10)", 18)}</div>
          <p class="stat-num">${overallPct}%</p>
          <p class="stat-label">Mastery Level</p>
        </div>
      </div>

      <!-- Overall Progress (circular mastery ring) -->
      <div class="card" style="margin-top:16px;display:flex;align-items:center;gap:20px;">
        <div class="ring-wrap">
          <svg width="96" height="96" viewBox="0 0 96 96">
            <circle class="ring-track" cx="48" cy="48" r="40"></circle>
            <circle class="ring-fill" cx="48" cy="48" r="40"
              stroke-dasharray="${2 * Math.PI * 40}"
              stroke-dashoffset="${2 * Math.PI * 40 * (1 - overallPct / 100)}"></circle>
          </svg>
          <div class="ring-center">
            <span style="font-family:'Fraunces',serif;font-weight:800;font-size:19px;color:var(--text-main);">${overallPct}%</span>
          </div>
        </div>
        <div>
          <span style="font-weight:700;font-size:14px;display:block;margin-bottom:4px;">Overall Syllabus Progress</span>
          <span style="font-size:12.5px;color:var(--text-soft);font-weight:500;">${completedCh} of ${totalCh} chapters mastered. Keep the streak going!</span>
        </div>
      </div>

      <!-- Quick Subjects -->
      <p class="marker-heading" style="font-family:'Fraunces',serif;font-weight:700;font-size:18px;margin:24px 0 12px;display:inline-block;">Explore Subjects</p>
      <div class="chip-row">${subjectChips}</div>
    </div>
  `;
}

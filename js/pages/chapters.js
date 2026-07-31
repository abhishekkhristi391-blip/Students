/* ============================================================
   PAGE: CHAPTERS LIST (with sub-section filter + search)
   ============================================================ */
function renderChaptersView() {
  const subject = APP_DATA.find(s => s.id === STATE.subjectId);
  if (!subject) {
    return `
      <div class="topbar">
        <button data-action="close-flow" class="animated-btn" style="display:flex;align-items:center;gap:4px;font-weight:700;font-size:14px;min-height:44px;">
          ${svgIcon("left", "var(--text-main)", 20)} Back
        </button>
        <span style="font-family:'Fraunces',serif;font-weight:700;font-size:18px;">Subject</span>
        <div style="width:40px;"></div>
      </div>
      <div class="empty-state">
        <div class="empty-icon-wrap">${svgIcon("inbox", "var(--accent-10)", 32)}</div>
        <p class="empty-title">Subject not found</p>
        <p class="empty-sub">This subject may have been removed or renamed. Head back and pick another one to continue revising.</p>
        <button data-action="go-tab" data-id="library" class="animated-btn empty-cta">Browse Subjects</button>
      </div>
    `;
  }

  let subSectionFilterHtml = "";
  if (subject.subSections && subject.subSections.length > 0) {
    const allActive = STATE.subSectionId === null;
    const subButtons = subject.subSections.map(sub => {
      const active = STATE.subSectionId === sub.id;
      return `
        <button class="subject-chip animated-btn" data-action="filter-subsection" data-id="${sub.id}"
          style="background:${active ? 'var(--accent-10)' : 'var(--surface-30)'};color:${active ? '#FFFFFF' : 'var(--text-main)'};border-color:${active ? 'var(--accent-10)' : 'var(--border)'};">
          ${svgIcon(sub.id === "chem" ? "chemistry" : sub.id === "phy" ? "physics" : sub.id === "bio" ? "biology" : sub.id === "hist" ? "history" : sub.id === "geo" ? "geography" : sub.id === "pol" ? "civics" : "book", active ? '#FFFFFF' : 'var(--text-soft)', 16)}
          ${sub.title}
        </button>
      `;
    }).join("");

    subSectionFilterHtml = `
      <div class="chip-row" style="margin-bottom:18px;">
        <button class="subject-chip animated-btn" data-action="filter-subsection" data-id="ALL"
          style="background:${allActive ? 'var(--accent-10)' : 'var(--surface-30)'};color:${allActive ? '#FFFFFF' : 'var(--text-main)'};border-color:${allActive ? 'var(--accent-10)' : 'var(--border)'};">
          All Streams
        </button>
        ${subButtons}
      </div>
    `;
  }

  const q = STATE.chapterSearch.trim().toLowerCase();
  const filteredChapters = subject.chapters.filter(ch => {
    if (STATE.subSectionId && ch.subSectionId !== STATE.subSectionId) return false;
    if (q && !ch.title.toLowerCase().includes(q)) return false;
    return true;
  });

  const searchBarHtml = `
    <div style="position:relative;margin-bottom:16px;">
      <label for="chapter-search-input" class="visually-hidden">Search chapters</label>
      <input type="text" id="chapter-search-input" placeholder="Search chapters..."
        style="width:100%;min-height:44px;padding:12px 40px 12px 16px;border-radius:14px;border:1.5px solid var(--border);font-size:14px;background:var(--surface-30);color:var(--text-main);"
        value="${STATE.chapterSearch.replace(/"/g, '&quot;')}" />
      ${STATE.chapterSearch ? `
        <button data-action="clear-chapter-search" class="animated-btn" aria-label="Clear search" style="position:absolute;right:6px;top:50%;transform:translateY(-50%);min-width:32px;min-height:32px;display:flex;align-items:center;justify-content:center;">
          ${svgIcon("x", "var(--text-soft)", 16)}
        </button>
      ` : ""}
    </div>
  `;

  const chapterList = filteredChapters.map((ch, idx) => {
    const prog = chapterProgress(ch);
    const badgeHtml = prog.complete
      ? `<span class="badge" style="background:var(--accent-soft);color:var(--accent-10);display:inline-flex;align-items:center;gap:4px;">${svgIcon("check", "var(--accent-10)", 12)} Completed</span>`
      : prog.done > 0
        ? `<span class="badge" style="background:var(--bg-60);color:var(--text-soft);">${prog.done}/${prog.total} topics done</span>`
        : "";
    return `
    <div class="card chapter-card" style="margin-bottom:14px;padding:18px;margin-top:9px;">
      <div class="chapter-tab">CH ${idx + 1}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
        ${badgeHtml}
        <span style="font-size:12px;color:var(--text-soft);display:flex;align-items:center;gap:4px;font-weight:600;margin-left:auto;">
          ${svgIcon("clock", "var(--text-soft)", 13)} ${ch.studyTime}
        </span>
      </div>
      <h3 style="font-family:'Fraunces',serif;font-size:17px;margin:0 0 10px;line-height:1.35;">${ch.title}</h3>
      <p style="font-size:12.5px;color:var(--text-soft);margin:0 0 16px;font-weight:500;">${ch.topics.length} Detailed Topics • ${ch.quiz ? ch.quiz.length : 0} Practice Questions</p>

      <div style="display:flex;gap:10px;">
        <button data-action="open-topic" data-id="${ch.id}" class="animated-btn" style="flex:1;min-height:44px;padding:11px;border-radius:14px;background:var(--accent-10);color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 4px 14px rgba(0,0,0,0.1);">
          ${svgIcon("book", "#fff", 15)} Read Notes
        </button>
        ${ch.quiz && ch.quiz.length > 0 ? `
          <button data-action="open-quiz" data-id="${ch.id}" class="animated-btn" style="min-height:44px;padding:11px 16px;border-radius:14px;background:var(--accent-soft);color:var(--accent-10);font-weight:700;font-size:13px;display:flex;align-items:center;gap:6px;">
            ${svgIcon("check", "var(--accent-10)", 15)} Quiz
          </button>
        ` : ""}
      </div>
    </div>
  `;
  }).join("");

  const emptyChaptersHtml = q ? `
    <div class="empty-state">
      <div class="empty-icon-wrap">${svgIcon("quiz_empty", "var(--accent-10)", 32)}</div>
      <p class="empty-title">No chapters match "${STATE.chapterSearch}"</p>
      <p class="empty-sub">Try a different keyword, or clear the search to see everything.</p>
      <button data-action="clear-chapter-search" class="animated-btn empty-cta">Clear Search</button>
    </div>
  ` : `
    <div class="empty-state">
      <div class="empty-icon-wrap">${svgIcon("inbox", "var(--accent-10)", 32)}</div>
      <p class="empty-title">No chapters here yet</p>
      <p class="empty-sub">This section doesn't have any chapters added yet. Try a different stream or check back after the next update.</p>
      <button data-action="filter-subsection" data-id="ALL" class="animated-btn empty-cta">Show All Streams</button>
    </div>
  `;

  return `
    <div class="topbar">
      <button data-action="close-flow" class="animated-btn" style="display:flex;align-items:center;gap:4px;font-weight:700;font-size:14px;min-height:44px;">
        ${svgIcon("left", "var(--text-main)", 20)} Back
      </button>
      <span style="font-family:'Fraunces',serif;font-weight:700;font-size:18px;">${subject.name}</span>
      <div style="width:40px;"></div>
    </div>

    <div style="padding:18px;">
      ${subSectionFilterHtml}
      ${searchBarHtml}
      ${filteredChapters.length ? chapterList : emptyChaptersHtml}
    </div>
  `;
}

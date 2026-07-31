/* ============================================================
   PAGE: TOPIC READER (Detailed Notes + Points + Photos)
   ============================================================ */
function renderTopicReaderView() {
  const subject = APP_DATA.find(s => s.id === STATE.subjectId);
  const chapter = subject ? subject.chapters.find(c => c.id === STATE.chapterId) : null;
  if (!chapter || !chapter.topics.length) {
    return `
      <div class="topbar">
        <button data-action="back-to-chapters" class="animated-btn" style="display:flex;align-items:center;gap:4px;font-weight:700;font-size:14px;min-height:44px;">
          ${svgIcon("left", "var(--text-main)", 20)} Chapters
        </button>
        <span style="font-family:'Fraunces',serif;font-weight:700;font-size:16px;">Notes</span>
        <div style="width:40px;"></div>
      </div>
      <div class="empty-state">
        <div class="empty-icon-wrap">${svgIcon("book", "var(--accent-10)", 32)}</div>
        <p class="empty-title">No notes in this chapter yet</p>
        <p class="empty-sub">Content for this chapter is still being prepared. Check another chapter in the meantime.</p>
        <button data-action="back-to-chapters" class="animated-btn empty-cta">Back to Chapters</button>
      </div>
    `;
  }

  const topic = chapter.topics[STATE.activeTopicIndex] || chapter.topics[0];
  const fullTextToRead = `${topic.title}. ${topic.bulletPoints.join(". ")}. Summary: ${topic.summary}`;

  const bullets = topic.bulletPoints.map(pt => `
    <li class="note-text" style="margin-bottom:12px;font-size:14.5px;line-height:1.65;color:#1A2332;">${pt}</li>
  `).join("");

  return `
    <div class="topbar">
      <button data-action="back-to-chapters" class="animated-btn" style="display:flex;align-items:center;gap:4px;font-weight:700;font-size:14px;min-height:44px;">
        ${svgIcon("left", "var(--text-main)", 20)} Chapters
      </button>
      <span style="font-family:'Fraunces',serif;font-weight:700;font-size:16px;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${chapter.title}</span>
      <button data-action="speak-topic" data-text="${encodeURIComponent(fullTextToRead)}" class="animated-btn" style="min-height:44px;padding:8px 12px;border-radius:12px;background:${STATE.isSpeaking ? '#E0522F' : 'var(--accent-10)'};color:#fff;display:flex;align-items:center;gap:6px;font-weight:700;font-size:12px;">
        ${svgIcon("volume", "#fff", 16)} ${STATE.isSpeaking ? 'Stop' : 'Read'}
      </button>
    </div>

    <div style="padding:18px;">
      <!-- Topic Tabs -->
      <div class="chip-row" style="margin-bottom:18px;">
        ${chapter.topics.map((t, idx) => `
          <button class="subject-chip animated-btn" data-action="switch-topic-tab" data-index="${idx}"
            style="background:${idx === STATE.activeTopicIndex ? 'var(--accent-10)' : 'var(--surface-30)'};color:${idx === STATE.activeTopicIndex ? '#FFFFFF' : 'var(--text-main)'};border-color:${idx === STATE.activeTopicIndex ? 'var(--accent-10)' : 'var(--border)'};">
            Topic ${idx + 1}
          </button>
        `).join("")}
      </div>

      <!-- Main Topic Content -->
      <div class="card">
        <h2 style="font-family:'Fraunces',serif;font-size:20px;margin:0 0 16px;color:var(--accent-10);line-height:1.35;">${topic.title}</h2>

        ${topic.imageUrl ? `
          <div style="width:100%;height:190px;border-radius:18px;overflow:hidden;margin-bottom:18px;background:var(--bg-60);">
            <img src="${topic.imageUrl}" alt="Visual reference for ${topic.title.replace(/^\d+\.\s*/, '')}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" />
          </div>
        ` : ""}

        <p style="font-weight:700;font-size:13px;margin:0 0 12px;color:var(--text-soft);letter-spacing:0.04em;">KEY CONCEPTS & ANALYSIS:</p>
        <ul style="padding-left:18px;margin:0 0 20px;">
          ${bullets}
        </ul>

        <div style="padding:16px;border-radius:16px;background:var(--accent-soft);border-left:4px solid var(--accent-10);">
          <p style="font-weight:700;font-size:13px;margin:0 0 4px;color:var(--accent-deep);">Summary Takeaway</p>
          <p class="note-text" style="font-size:13.5px;margin:0;line-height:1.55;color:var(--text-main);">${topic.summary}</p>
        </div>

        <button data-action="toggle-topic-complete" data-id="${topic.id}" class="animated-btn" style="width:100%;margin-top:16px;min-height:44px;padding:12px;border-radius:14px;background:${isTopicDone(topic.id) ? 'var(--accent-10)' : 'var(--bg-60)'};color:${isTopicDone(topic.id) ? '#fff' : 'var(--text-main)'};font-weight:700;font-size:13.5px;display:flex;align-items:center;justify-content:center;gap:8px;border:1.5px solid ${isTopicDone(topic.id) ? 'var(--accent-10)' : 'var(--border)'};">
          ${svgIcon("check", isTopicDone(topic.id) ? '#fff' : 'var(--text-soft)', 16)}
          ${isTopicDone(topic.id) ? "Marked as Complete" : "Mark Topic as Complete"}
        </button>
      </div>

      <!-- Navigation buttons -->
      <div style="display:flex;gap:12px;margin-top:18px;">
        ${STATE.activeTopicIndex > 0 ? `
          <button data-action="prev-topic" class="animated-btn" style="flex:1;min-height:44px;padding:12px;border-radius:16px;background:#FFFFFF;border:1px solid #E1ECF7;font-weight:700;font-size:14px;color:#1A2332;">
            ← Previous Topic
          </button>
        ` : ""}
        ${STATE.activeTopicIndex < chapter.topics.length - 1 ? `
          <button data-action="next-topic" class="animated-btn" style="flex:1;min-height:44px;padding:12px;border-radius:16px;background:var(--accent-10);color:#fff;font-weight:700;font-size:14px;box-shadow:0 6px 18px rgba(0,0,0,0.1);">
            Next Topic →
          </button>
        ` : `
          ${chapter.quiz && chapter.quiz.length > 0 ? `
            <button data-action="open-quiz" data-id="${chapter.id}" class="animated-btn" style="flex:1;min-height:44px;padding:12px;border-radius:16px;background:var(--accent-10);color:#fff;font-weight:700;font-size:14px;box-shadow:0 6px 18px rgba(0,0,0,0.1);">
              Take Chapter Quiz
            </button>
          ` : ""}
        `}
      </div>
    </div>
  `;
}

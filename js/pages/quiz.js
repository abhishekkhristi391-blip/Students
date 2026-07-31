/* ============================================================
   PAGE: INTERACTIVE QUIZ
   ============================================================ */
function renderQuizView() {
  const subject = APP_DATA.find(s => s.id === STATE.subjectId);
  const chapter = subject ? subject.chapters.find(c => c.id === STATE.chapterId) : null;
  if (!chapter || !chapter.quiz || !chapter.quiz.length) {
    return `
      <div class="topbar">
        <button data-action="back-to-chapters" class="animated-btn" style="display:flex;align-items:center;gap:4px;font-weight:700;font-size:14px;min-height:44px;">
          ${svgIcon("left", "var(--text-main)", 20)} Exit Quiz
        </button>
        <span style="font-family:'Fraunces',serif;font-weight:700;font-size:18px;">Chapter Quiz</span>
        <div style="width:40px;"></div>
      </div>
      <div class="empty-state">
        <div class="empty-icon-wrap">${svgIcon("quiz_empty", "var(--accent-10)", 32)}</div>
        <p class="empty-title">No quiz available</p>
        <p class="empty-sub">This chapter doesn't have practice questions yet. Read the notes for now — quiz questions are on the way.</p>
        <button data-action="back-to-chapters" class="animated-btn empty-cta">Back to Chapters</button>
      </div>
    `;
  }

  let score = 0;
  if (STATE.quizSubmitted) {
    chapter.quiz.forEach((q, idx) => {
      if (STATE.quizAnswers[idx] === q.correct) score++;
    });
  }

  const questionsHtml = chapter.quiz.map((q, idx) => {
    const selected = STATE.quizAnswers[idx];

    return `
      <div class="card" style="margin-bottom:16px;">
        <p style="font-weight:700;font-size:15px;margin:0 0 14px;line-height:1.45;">Q${idx + 1}. ${q.q}</p>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${q.options.map((opt, oIdx) => {
            let bg = "#FFFFFF";
            let border = "#E1ECF7";
            let color = "#1A2332";

            if (selected === oIdx) {
              bg = "#EBF3FE"; border = "#3A63ED"; color = "#1D5FC4";
            }
            if (STATE.quizSubmitted) {
              if (oIdx === q.correct) {
                bg = "#E1F5EC"; border = "#2E9E72"; color = "#173328";
              } else if (selected === oIdx && oIdx !== q.correct) {
                bg = "#FDEAE0"; border = "#E0763F"; color = "#3A2416";
              }
            }

            return `
              <button data-action="select-quiz-option" data-qidx="${idx}" data-oidx="${oIdx}" class="animated-btn"
                style="min-height:44px;padding:13px 16px;border-radius:14px;background:${bg};border:1.5px solid ${border};color:${color};text-align:left;font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:space-between;">
                <span>${String.fromCharCode(65 + oIdx)}. ${opt}</span>
                ${STATE.quizSubmitted && oIdx === q.correct ? svgIcon("check", "#2E9E72", 18) : ""}
              </button>
            `;
          }).join("")}
        </div>

        ${STATE.quizSubmitted ? `
          <div style="margin-top:14px;padding:12px;border-radius:12px;background:#F8FAFC;font-size:13px;color:#64748B;line-height:1.5;">
            <strong style="color:#1A2332;">Explanation:</strong> ${q.exp}
          </div>
        ` : ""}
      </div>
    `;
  }).join("");

  return `
    <div class="topbar">
      <button data-action="back-to-chapters" class="animated-btn" style="display:flex;align-items:center;gap:4px;font-weight:700;font-size:14px;min-height:44px;">
        ${svgIcon("left", "#1A2332", 20)} Exit Quiz
      </button>
      <span style="font-family:'Fraunces',serif;font-weight:700;font-size:18px;">Chapter Quiz</span>
      <div style="width:40px;"></div>
    </div>

    <div style="padding:18px;">
      ${STATE.quizSubmitted ? `
        <div class="card" style="margin-bottom:18px;background:linear-gradient(135deg,#3A63ED,#1D5FC4);color:#fff;text-align:center;padding:26px;box-shadow:0 12px 30px rgba(58,99,237,0.35);">
          <h2 style="font-family:'Fraunces',serif;font-size:28px;margin:0 0 6px;">Score: ${score} / ${chapter.quiz.length}</h2>
          <p style="margin:0;font-size:14px;opacity:0.95;font-weight:500;">
            ${score === chapter.quiz.length ? "Perfect score! You mastered this chapter!" : "Great effort! Review the notes to strengthen key concepts."}
          </p>
        </div>
      ` : ""}

      ${questionsHtml}

      <div style="margin-top:22px;">
        ${!STATE.quizSubmitted ? `
          <button data-action="submit-quiz" class="animated-btn" style="width:100%;min-height:44px;padding:15px;border-radius:18px;background:#3A63ED;color:#fff;font-weight:700;font-size:15px;box-shadow:0 8px 24px rgba(58,99,237,0.35);">
            Submit Quiz
          </button>
        ` : `
          <button data-action="retry-quiz" class="animated-btn" style="width:100%;min-height:44px;padding:15px;border-radius:18px;background:#111827;color:#fff;font-weight:700;font-size:15px;">
            Retry Quiz
          </button>
        `}
      </div>
    </div>
  `;
}

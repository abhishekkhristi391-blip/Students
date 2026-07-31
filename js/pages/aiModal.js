/* ============================================================
   MODAL: AI TUTOR
   ============================================================ */
function renderAIModal() {
  return `
    <div class="sheet-backdrop">
      <div class="sheet">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;border-radius:12px;background:var(--accent-10);color:#fff;display:flex;align-items:center;justify-content:center;">
              ${svgIcon("sparkles", "#fff", 18)}
            </div>
            <span style="font-family:'Fraunces',serif;font-weight:800;font-size:19px;">AI Tutor</span>
          </div>
          <button data-action="close-ai" class="animated-btn" aria-label="Close AI Tutor" style="padding:10px;min-width:44px;min-height:44px;">
            ${svgIcon("x", "var(--text-soft)", 20)}
          </button>
        </div>

        <div style="text-align:center;padding:28px 12px;">
          <div style="width:64px;height:64px;margin:0 auto 16px;border-radius:20px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;">
            ${svgIcon("sparkles", "var(--accent-10)", 28)}
          </div>
          <h3 style="font-family:'Fraunces',serif;font-weight:800;font-size:18px;margin:0 0 8px;">Coming Soon</h3>
          <p style="font-size:13.5px;color:var(--text-soft);margin:0;line-height:1.6;font-weight:500;">
            AI Tutor is being built with a real backend so answers are actually reliable for board exams. Until then, we didn't want to show you fake explanations — check the chapter notes and quizzes for now.
          </p>
        </div>
      </div>
    </div>
  `;
}

/* ============================================================
   MODAL: ONBOARDING — first-launch name capture
   ============================================================ */
function renderOnboardingModal() {
  return `
    <div class="sheet-backdrop">
      <div class="sheet">
        <div style="text-align:center;margin-bottom:8px;">
          <div style="width:56px;height:56px;margin:0 auto 14px;border-radius:18px;background:var(--banner-grad);display:flex;align-items:center;justify-content:center;">
            ${svgIcon("sparkles", "#fff", 26)}
          </div>
          <h2 style="font-family:'Fraunces',serif;font-weight:800;font-size:21px;margin:0 0 6px;">${STATE.userName ? "Edit Name" : "Welcome!"}</h2>
          <p style="font-size:13.5px;color:var(--text-soft);margin:0 0 20px;font-weight:500;">What should we call you?</p>
        </div>
        <label for="onboarding-name-input" class="visually-hidden">Your name</label>
        <input type="text" id="onboarding-name-input" placeholder="Enter your name"
          style="width:100%;min-height:48px;padding:13px 16px;border-radius:14px;border:1.5px solid var(--border);font-size:15px;background:var(--bg-60);color:var(--text-main);margin-bottom:14px;"
          value="${STATE.onboardingNameDraft}" maxlength="40" />
        <button data-action="save-onboarding-name" class="animated-btn" style="width:100%;min-height:48px;border-radius:14px;background:var(--accent-10);color:#fff;font-weight:700;font-size:15px;">
          Continue
        </button>
      </div>
    </div>
  `;
}

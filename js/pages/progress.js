/* ============================================================
   PAGE: PROGRESS / ANALYTICS
   ============================================================ */
function renderProgressView() {
  const weekly = [
    { day: "Mon", min: 45 },
    { day: "Tue", min: 30 },
    { day: "Wed", min: 75 },
    { day: "Thu", min: 50 },
    { day: "Fri", min: 60 },
    { day: "Sat", min: 90 },
    { day: "Sun", min: 40 }
  ];
  const maxMin = Math.max(...weekly.map(w => w.min));

  const bars = weekly.map(w => {
    const h = Math.round((w.min / maxMin) * 100);
    return `
      <div class="bar-col">
        <span class="bar-value">${w.min}m</span>
        <div class="bar-fill" style="height:${h}px;background:${w.min === maxMin ? 'linear-gradient(180deg,#3A63ED,#1D5FC4)' : '#EBF3FE'};"></div>
        <span class="bar-day">${w.day}</span>
      </div>
    `;
  }).join("");

  return `
    <div style="padding:20px 20px 10px;">
      <h2 style="font-family:'Fraunces',serif;font-size:23px;margin:0 0 18px;">Study Analytics</h2>

      <div class="card" style="margin-bottom:18px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
          <span style="font-weight:700;font-size:15px;">Weekly Revision Time</span>
          <span style="font-size:12px;color:#64748B;font-weight:600;">Minutes / Day</span>
        </div>
        <div class="bar-chart">${bars}</div>
      </div>

      <div class="card">
        <h3 style="font-family:'Fraunces',serif;font-size:18px;margin:0 0 14px;">Subject Completion Breakdown</h3>
        ${APP_DATA.map(s => `
          <div style="margin-bottom:14px;">
            <div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:6px;font-weight:600;">
              <span>${s.name}</span>
              <span style="color:#3A63ED;font-family:'JetBrains Mono',monospace;">${s.studyTime}</span>
            </div>
            <div class="prog-track" style="height:7px;">
              <div style="width:70%;height:100%;background:#3A63ED;border-radius:999px;"></div>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

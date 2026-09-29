import { collection, query, orderBy, limit as limitN, getDocs, getCountFromServer, db } from "../firebase.js";
import { QUESTIONS } from "../mockdata.js";
import { icon } from "../icons.js";
import { esc } from "../api.js";

function sparkline(data, color = "var(--accent)", height = 80, width = 400) {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const padding = 4, usable = height - padding * 2;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - padding - ((v - min) / range) * usable}`).join(" L ");
  return `<svg style="display:block;width:100%;overflow:visible" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><path d="M ${pts}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function bars(data, height = 120) {
  const max = Math.max(...data, 1);
  const colors = ["var(--brand-coral)", "var(--brand-yellow)", "var(--brand-teal)", "var(--brand-purple)"];
  return `<div class="bars" style="height:${height}px">${data.map((v, i) => `<div class="bar" style="height:${Math.max((v / max) * 100, 10)}%;background:${colors[i % colors.length]}"></div>`).join("")}</div>`;
}

// ---------- Dashboard ----------
export const adminDashboard = {
  render: async () => {
    // Never show invented numbers as if they were real. If the read fails the
    // panel says so instead of quietly displaying a plausible-looking 1,248.
    let total = null, avgAcc = null, failed = false;
    try {
      const [countSnap, usersSnap] = await Promise.all([
        getCountFromServer(query(collection(db, "users"))),
        getDocs(query(collection(db, "users"), orderBy("totalPoints", "desc"), limitN(300))),
      ]);
      total = countSnap.data().count ?? 0;
      const accs = usersSnap.docs.map((d) => d.data().accuracy).filter((a) => typeof a === "number" && a > 0);
      avgAcc = accs.length ? Math.round(accs.reduce((s, a) => s + a, 0) / accs.length) : 0;
    } catch (e) {
      console.error("admin dashboard: stats unavailable", e);
      failed = true;
    }

    const num = (v) => (failed ? "—" : v.toLocaleString());
    // "Active Tests" and "Question Bank" used to be hardcoded placeholders
    // (42 / 3,850) that read as live data. There is no Firestore collection
    // for them, so derive what is derivable and say "—" for the rest rather
    // than invent a number.
    const active = failed ? "—" : String(usersSnap.docs.filter((d) => d.data().status === "active").length);
    const questionBank = "—";
    const stats = [
      { title: "Total Students", value: num(total), icon: "users", color: "var(--teal-ink)", bg: "var(--tint-teal)" },
      { title: "Active Accounts", value: active, icon: "target", color: "var(--lime-ink)", bg: "var(--tint-lime)" },
      { title: "Question Bank", value: questionBank, icon: "fileQuestion", color: "var(--teal-ink)", bg: "var(--tint-teal)" },
      { title: "Avg Accuracy", value: failed ? "—" : `${avgAcc}%`, icon: "activity", color: "var(--pink-ink)", bg: "var(--tint-pink)" },
    ];

    return `
      <div style="max-width:1152px;margin:0 auto;display:flex;flex-direction:column;gap:1.5rem">
        ${failed ? `<div class="empty-state" role="alert" style="padding:1rem;border:1px solid var(--border-strong)">
          <span style="color:var(--pink-ink)">${icon("alertCircle", 28)}</span>
          <h3 class="h3-sm mt-2 mb-1">Stats unavailable</h3>
          <p class="sm muted" style="text-align:center;max-width:32rem">Couldn&rsquo;t read the users collection. Check that your Firestore rules allow this account to read <code>users</code>, then reload.</p>
        </div>` : ""}
        <div class="grid grid-cols-4" style="gap:1.5rem">
          ${stats.map((s) => `
            <div class="card" style="padding:1.5rem;display:flex;flex-direction:column">
              <div class="circle-icon-sm" style="background:${s.bg};margin-bottom:1rem"><span style="color:${s.color}">${icon(s.icon, 20)}</span></div>
              <p style="font-size:24px;font-weight:600">${s.value}</p>
              <p class="sm semibold muted mt-1">${s.title}</p>
            </div>`).join("")}
        </div>

        <div class="grid grid-cols-2" style="gap:1.5rem">
          <div class="card" style="padding:1.5rem">
            <h3 class="h3-sm mb-6">Student Activity (Weekly)</h3>
            ${bars([40, 60, 45, 80, 75, 90, 85])}
          </div>
          <div class="card" style="padding:1.5rem">
            <h3 class="h3-sm mb-6">Average Score Trends</h3>
            <div style="margin-top:1.5rem">${sparkline([55, 58, 62, 60, 65, 68, 70])}</div>
          </div>
        </div>

        <div class="card" style="padding:1.5rem">
          <h3 class="h3-sm mb-4">Recent Reports &amp; Alerts</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between" style="padding:1rem;background:var(--surface-muted);border-radius:var(--radius-md)">
              <div class="flex items-center gap-3"><span style="width:8px;height:8px;border-radius:50%;background:var(--brand-coral)"></span><p class="sm semibold">Question Q-842 reported for wrong answer</p></div>
              <button class="text-btn sm">Review</button>
            </div>
            <div class="flex items-center justify-between" style="padding:1rem;background:var(--surface-muted);border-radius:var(--radius-md)">
              <div class="flex items-center gap-3"><span style="width:8px;height:8px;border-radius:50%;background:var(--brand-yellow)"></span><p class="sm semibold">Suspicious points velocity detected for User#492</p></div>
              <button class="text-btn sm">Investigate</button>
            </div>
          </div>
        </div>
      </div>`;
  },
};

// ---------- Students (real users from Firestore) ----------
export const adminStudents = {
  render: () => `
    <div style="max-width:1152px;margin:0 auto;display:flex;flex-direction:column;gap:1.5rem">
      <div class="flex justify-between items-center" style="background:var(--surface);padding:1rem;border-radius:var(--radius-lg);box-shadow:var(--shadow)">
        <div class="searchchip" style="width:360px">
          <label for="stu-search" class="sr-only">Search students by name or email</label>
          ${icon("search", 18)}
          <input type="search" id="stu-search" placeholder="Search by name or email..." />
        </div>
        <button class="searchchip" style="font-weight:700;font-size:14px">${icon("filter", 16)} Filters</button>
      </div>
      <div id="stu-table"></div>
    </div>`,
  mount: async (el) => {
    const tbody = el.querySelector("#stu-table");
    let rows = [];

    const draw = (q) => {
      const list = rows.filter((r) => (r.name + r.email).toLowerCase().includes(q));
      if (!rows.length) {
        tbody.innerHTML = `<div class="empty-state"><h3>No students found</h3></div>`;
        return;
      }
      if (!list.length) {
        tbody.innerHTML = `<div class="empty-state" role="status"><h3>No match for &ldquo;${esc(q)}&rdquo;</h3></div>`;
        return;
      }
      tbody.innerHTML = `
      <div class="table-shell">
        <table>
          <thead><tr>
            <th scope="col">Name</th><th scope="col">Email</th><th scope="col">Class</th>
            <th scope="col">Points</th><th scope="col">Status</th><th scope="col" style="text-align:right">Actions</th>
          </tr></thead>
          <tbody>${list.map((r) => `
            <tr>
              <td class="bold">${esc(r.name)}</td>
              <td class="muted semibold">${esc(r.email)}</td>
              <td class="bold">${esc(r.class)}</td>
              <td class="bold" style="color:var(--accent)">${Number(r.points) || 0}</td>
              <td><span class="chip ${r.status === "Active" ? "chip-green" : "chip-red"}">${esc(r.status)}</span></td>
              <td style="text-align:right">${icon("moreVertical", 18)}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
    };

    const subscribe = async () => {
      tbody.innerHTML = `<div class="skeleton" style="height:280px" aria-hidden="true"></div>
        <p class="sr-only" role="status">Loading students</p>`;
      try {
        const snap = await getDocs(query(collection(db, "users"), orderBy("totalPoints", "desc"), limitN(200)));
        rows = snap.docs.map((d) => {
          const u = d.data();
          return {
            id: d.id,
            name: u.name || "Student",
            email: u.email || "",
            class: u.class || "—",
            points: u.totalPoints || 0,
            status: (u.status === "suspended" || u.status === "blocked") ? "Suspended" : "Active",
          };
        });
        draw(el.querySelector("#stu-search").value.toLowerCase().trim());
      } catch (e) {
        console.error("admin students: read failed", e);
        tbody.innerHTML = `<div class="empty-state" role="alert">
          <span style="color:var(--pink-ink)">${icon("alertCircle", 40)}</span>
          <h3 class="h3-sm mt-4 mb-1">Couldn't load students</h3>
          <p class="sm muted" style="text-align:center;max-width:32rem">This account can't read the <code>users</code> collection, or you're offline. Check your Firestore rules.</p>
          <button class="btn btn-dark mt-5" data-retry>${icon("refreshCw", 16)} Try Again</button>
        </div>`;
      }
    };

    await subscribe();
    tbody.addEventListener("click", (e) => {
      if (e.target.closest("[data-retry]")) subscribe();
    });
    el.querySelector("#stu-search").addEventListener("input", (e) => draw(e.target.value.toLowerCase().trim()));
  },
};

// ---------- MCQ Bank (mock data table) ----------
export const adminMcq = {
  render: () => `
    <div style="max-width:1152px;margin:0 auto;display:flex;flex-direction:column;gap:1.5rem">
      <div class="flex justify-between items-center">
        <h3 class="h3-sm">Question Bank</h3>
        <div class="flex gap-3">
          <button class="searchchip" style="background:var(--surface);border:1px solid var(--border-strong)">Bulk Upload CSV</button>
          <button class="btn btn-sm" style="background:var(--dark);color:var(--on-primary);display:flex;align-items:center;gap:.5rem;padding:.75rem 1.25rem">${icon("plus", 18)} Add Question</button>
        </div>
      </div>
      <div id="mcq-table"></div>
    </div>`,
  mount: (el) => {
    el.querySelector("#mcq-table").innerHTML = `
      <div class="table-shell">
        <table>
          <thead><tr>
            <th scope="col" style="width:50%">Question</th><th scope="col">Subject / Topic</th><th scope="col">Difficulty</th><th scope="col">Status</th><th scope="col" style="text-align:right">Actions</th>
          </tr></thead>
          <tbody>${QUESTIONS.map((q) => `
            <tr>
              <td><p class="sm semibold">${esc(q.text)}</p></td>
              <td><p class="sm bold">Physics</p><p class="xs faint">Optics</p></td>
              <td><span class="chip chip-purple">Medium</span></td>
              <td><span class="chip chip-green">Published</span></td>
              <td style="text-align:right">${icon("moreVertical", 18)}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>`;
  },
};
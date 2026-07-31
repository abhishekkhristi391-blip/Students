/* ============================================================
   PAGE: LIBRARY / COURSES
   ============================================================ */
function renderLibraryView() {
  const bentoItems = [
    { label: "Mathematics", icon: "math", color: "#E4643A", blob: "rgba(63,174,134,0.55)", subjectId: "math", subSectionId: null },
    { label: "English", icon: "english", color: "#4C63B6", blob: "rgba(242,163,64,0.55)", subjectId: "english", subSectionId: null },
    { label: "Chemistry", icon: "chemistry", color: "#F2A340", blob: "rgba(76,99,182,0.5)", subjectId: "science", subSectionId: "chem" },
    { label: "Biology", icon: "biology", color: "#3FAE86", blob: "rgba(242,163,64,0.55)", subjectId: "science", subSectionId: "bio" },
    { label: "Physics", icon: "physics", color: "#7B85E0", blob: "rgba(228,100,58,0.55)", subjectId: "science", subSectionId: "phy" },
    { label: "Social Studies", icon: "geography", color: "#242833", blob: "rgba(63,174,134,0.55)", subjectId: "sst", subSectionId: null }
  ];

  const cards = bentoItems.map(item => `
    <div class="bento-card animated-btn" data-action="select-subject" data-id="${item.subjectId}" data-sub="${item.subSectionId || ''}" style="background:${item.color};cursor:pointer;box-shadow:0 14px 30px -10px ${item.color}66;">
      <div class="bento-blob" style="width:70px;height:70px;top:-24px;right:-24px;background:${item.blob};"></div>
      <div class="bento-blob" style="width:44px;height:44px;bottom:-16px;left:-14px;background:${item.blob};"></div>
      <div class="bento-icon-wrap">${svgIcon(item.icon, "#FFFFFF", 26)}</div>
      <p class="bento-label">${item.label}</p>
    </div>
  `).join("");

  return `
    <div style="padding:20px 20px 10px;">
      <div class="banner-card" style="background:linear-gradient(135deg, #E9884A 0%, #EFA95C 100%);min-height:120px;margin-bottom:22px;box-shadow:0 16px 36px -12px rgba(233,136,74,0.4);">
        <div class="banner-decor banner-decor-1"></div>
        <div style="position:relative;z-index:2;">
          <h2 style="font-family:'Fraunces',serif;font-weight:800;font-size:24px;margin:0 0 10px;">Curriculum Library</h2>
          <div style="display:flex;gap:8px;">
            <span class="badge" style="background:rgba(255,255,255,0.25);color:#fff;">
              ${svgIcon("book", "#fff", 14)} ${APP_DATA.length} Major Subjects
            </span>
          </div>
        </div>
      </div>

      <p style="font-family:'Fraunces',serif;font-weight:700;font-size:18px;margin:0 0 14px;">Select Subject</p>
      <div class="bento-grid">${cards}</div>
    </div>
  `;
}

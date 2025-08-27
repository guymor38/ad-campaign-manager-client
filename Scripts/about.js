// about.js — SPA page module (Guy + Adi: hero blocks + separate GitHub sections)
import { loadStyle } from "./utils.js";
import { renderHeader } from "./header.js";
import { renderFooter } from "./footer.js";
import { renderDashboard } from "./dashboard.js";
import { renderBannerEditor } from "./bannerEditor.js";
import { renderMarketingPage } from "./marketing.js";
import { renderLandingPage } from "./landingPage.js";
import {
  clearLoggedInUser,
  setCurrentPage,
  clearCurrentPage,
} from "./storage.js";

const GH_KEY = "githubUsername";
const GH_KEY_PARTNER = "githubUsername_partner";

function toast(msg, warn = false) {
  const t = document.createElement("div");
  t.className = "toast" + (warn ? " warn" : "");
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1600);
}

export function renderAbout(username) {
  loadStyle("./styles/main.css");

  const app = document.getElementById("app");
  app.innerHTML = "";

  // Header + ניווט
  const header = renderHeader(
    username,
    (key) => {
      setCurrentPage(key);
      switch (key) {
        case "dashboard":
          renderDashboard(username);
          break;
        case "banners":
          renderBannerEditor(username);
          break;
        case "marketing":
          renderMarketingPage(username);
          break;
        case "landing":
          renderLandingPage(username);
          break;
        case "about":
          renderAbout(username);
          break;
        default:
          renderDashboard(username);
      }
    },
    () => {
      clearLoggedInUser();
      clearCurrentPage();
      location.reload();
    },
    "about"
  );

  const container = document.createElement("div");
  container.className = "page about-container";

  // ===== Hero (Guy) =====
  const hero = document.createElement("section");
  hero.className = "about-hero";
  hero.innerHTML = `
    <img class="about-pic" src="./assets/img/guy.jpeg" alt="Guy portrait" />
    <div>
      <h1 class="about-title">About — Guy Mor</h1>
      <p class="about-sub">
        סטודנט להנדסאי תוכנה בשנקר, חובב JS ו‑C#. אוהב לבנות ממשקים נקיים,
        רספונסיביים ופשוטים לתפעול. מחפש תפקידי סטודנט/ג׳וניור בצד‑לקוח/QA.
      </p>
      <div class="about-actions">
        <button class="btn primary" id="scrollToProjects">צפה בחלק א׳ — פרויקטי GitHub</button>
      </div>
    </div>
  `;

  // ===== Hero (Adi) =====
  const hero2 = document.createElement("section");
  hero2.className = "about-hero";
  hero2.innerHTML = `
    <img class="about-pic" src="./assets/img/adi.jpeg" alt="Adi portrait" />
    <div>
      <h1 class="about-title">About — Adi</h1>
      <p class="about-sub">
        עדי — שותפה לפרויקט. אוהבת חוויית משתמש נקייה ועבודה מסודרת בקוד,
        ומתעניינת בבניית ממשקים מודרניים ונגישים.
      </p>
      <div class="about-actions">
        <button class="btn primary" id="scrollToPartner">צפה בחלק א׳ — פרויקטי GitHub של Adi</button>
      </div>
    </div>
  `;

  // ===== Projects — Guy =====
  const me = document.createElement("section");
  me.id = "projects";
  me.innerHTML = `
    <h2 class="section-title">חלק א׳ — פרויקטים שלי מ‑GitHub</h2>
    <p class="helper">הזן שם משתמש GitHub (נשמר ל‑LocalStorage) ונטען פרויקטים דינמית.</p>
    <div class="gh-controls">
      <input id="ghUser" type="text" placeholder="שם משתמש GitHub (למשל: octocat)"/>
      <button class="btn" id="saveAndLoad">שמור והטען</button>
      <button class="btn" id="refresh">רענן</button>
    </div>
    <div class="repo-grid" id="repoGrid"></div>
    <div class="helper" id="status">לא נטענו פרויקטים עדיין.</div>
  `;

  // ===== Projects — Adi =====
  const partner = document.createElement("section");
  partner.id = "partner-projects";
  partner.innerHTML = `
    <h2 class="section-title">חלק א׳ — פרויקטים של Adi מ‑GitHub</h2>
    <p class="helper">הזן שם משתמש GitHub (נשמר ל‑LocalStorage) ונטען פרויקטים דינמית.</p>
    <div class="gh-controls">
      <input id="ghPartner" type="text" placeholder="שם משתמש GitHub של Adi"/>
      <button class="btn" id="saveAndLoad2">שמור והטען</button>
      <button class="btn" id="refresh2">רענן</button>
    </div>
    <div class="repo-grid" id="repoGrid2"></div>
    <div class="helper" id="status2">לא נטענו פרויקטים עדיין.</div>
  `;

  container.append(hero, hero2, me, partner);
  app.append(header, container, renderFooter());

  // Scroll buttons
  hero.querySelector("#scrollToProjects").addEventListener("click", () => {
    me.scrollIntoView({ behavior: "smooth" });
  });
  hero2.querySelector("#scrollToPartner").addEventListener("click", () => {
    partner.scrollIntoView({ behavior: "smooth" });
  });

  // Shared helper: render repos into a grid
  async function loadReposInto(username, gridEl, statusEl) {
    gridEl.innerHTML = "";
    statusEl.textContent = "טוען…";
    if (!username) {
      statusEl.textContent = "אנא הזן שם משתמש.";
      return;
    }
    try {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(
          username
        )}/repos?per_page=100&sort=updated`
      );
      if (!res.ok) throw new Error(`GitHub API error (${res.status})`);
      const repos = await res.json();

      const filtered = repos
        .filter((r) => !r.fork)
        .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0));

      if (!filtered.length) {
        statusEl.textContent = "לא נמצאו רפוזיטוריז להצגה.";
        return;
      }

      for (const r of filtered) {
        const card = document.createElement("article");
        card.className = "repo-card";

        const name = document.createElement("h3");
        name.className = "repo-name";
        name.textContent = r.name;

        const desc = document.createElement("p");
        desc.className = "repo-desc";
        desc.textContent = r.description || "No description.";

        const meta = document.createElement("div");
        meta.className = "repo-meta";
        const lang = r.language ? `🌐 ${r.language}` : null;
        const stars = `⭐ ${r.stargazers_count ?? 0}`;
        const updated = new Date(r.updated_at).toLocaleDateString();
        meta.textContent = [lang, stars, `Updated: ${updated}`]
          .filter(Boolean)
          .join(" · ");

        const link = document.createElement("a");
        link.className = "repo-link";
        link.href = r.html_url;
        link.target = "_blank";
        link.rel = "noopener";
        link.textContent = "פתח ב‑GitHub →";

        card.append(name, desc, meta, link);
        gridEl.appendChild(card);
      }

      statusEl.textContent = "";
    } catch (err) {
      console.error(err);
      statusEl.textContent =
        "שגיאה בטעינת פרויקטים מ‑GitHub. בדוק/י את שם המשתמש או נסה/י שוב.";
    }
  }

  // Guy section
  const repoGrid = me.querySelector("#repoGrid");
  const status = me.querySelector("#status");
  const inp = me.querySelector("#ghUser");
  const btnSave = me.querySelector("#saveAndLoad");
  const btnRefresh = me.querySelector("#refresh");
  inp.value = localStorage.getItem(GH_KEY) || "";

  function doSaveAndLoad() {
    const u = (inp.value || "").trim();
    if (!u) {
      status.textContent = "אנא הזן שם משתמש.";
      return;
    }
    localStorage.setItem(GH_KEY, u);
    toast("Saved");
    loadReposInto(u, repoGrid, status);
  }
  btnSave.addEventListener("click", doSaveAndLoad);
  btnRefresh.addEventListener("click", () => {
    const u = (inp.value || "").trim() || localStorage.getItem(GH_KEY);
    if (u) loadReposInto(u, repoGrid, status);
  });
  const initial = localStorage.getItem(GH_KEY);
  if (initial) loadReposInto(initial, repoGrid, status);

  // Adi section
  const repoGrid2 = partner.querySelector("#repoGrid2");
  const status2 = partner.querySelector("#status2");
  const inp2 = partner.querySelector("#ghPartner");
  const btnSave2 = partner.querySelector("#saveAndLoad2");
  const btnRefresh2 = partner.querySelector("#refresh2");
  inp2.value = localStorage.getItem(GH_KEY_PARTNER) || "";

  function doSaveAndLoad2() {
    const u = (inp2.value || "").trim();
    if (!u) {
      status2.textContent = "אנא הזן שם משתמש.";
      return;
    }
    localStorage.setItem(GH_KEY_PARTNER, u);
    toast("Saved");
    loadReposInto(u, repoGrid2, status2);
  }
  btnSave2.addEventListener("click", doSaveAndLoad2);
  btnRefresh2.addEventListener("click", () => {
    const u = (inp2.value || "").trim() || localStorage.getItem(GH_KEY_PARTNER);
    if (u) loadReposInto(u, repoGrid2, status2);
  });
  const initialPartner = localStorage.getItem(GH_KEY_PARTNER);
  if (initialPartner) loadReposInto(initialPartner, repoGrid2, status2);
}

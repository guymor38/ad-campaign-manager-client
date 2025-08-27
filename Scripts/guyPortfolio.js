// portfolio.js — Guy's portfolio (clean light theme, colored language badges)
// Always loads repos for user: guymor38

import { loadStyle } from "./utils.js";
import { renderHeader } from "./header.js";
import { renderFooter } from "./footer.js";
import { renderDashboard } from "./dashboard.js";
import { renderBannerEditor } from "./bannerEditor.js";
import { renderMarketingPage } from "./marketing.js";
import { renderLandingPage } from "./landingPage.js";
import { renderAbout } from "./about.js";
import {
  setCurrentPage,
  clearCurrentPage,
  clearLoggedInUser,
} from "./storage.js";

const USER = "guymor38";

// ---------- Helpers ----------
function ogImage(owner, repo) {
  return `https://opengraph.githubassets.com/1/${owner}/${repo}`;
}
function friendlyDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
    });
  } catch {
    return iso || "";
  }
}

// GitHub API
async function fetchRepos(user) {
  const url = `https://api.github.com/users/${encodeURIComponent(
    user
  )}/repos?sort=updated&per_page=30`;
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub API error ${res.status}`);
  const data = await res.json();
  return data
    .filter((r) => !r.fork)
    .sort(
      (a, b) =>
        (b.stargazers_count || 0) - (a.stargazers_count || 0) ||
        new Date(b.pushed_at) - new Date(a.pushed_at)
    );
}
async function fetchLanguages(fullName) {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${fullName}/languages`,
      {
        headers: { Accept: "application/vnd.github+json" },
      }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return Object.entries(json)
      .sort((a, b) => b[1] - a[1])
      .map(([lang]) => lang)
      .slice(0, 4);
  } catch {
    return [];
  }
}

// language badge helper
function langBadge(label) {
  if (!label) return "";
  const key = label.toLowerCase();
  const map = {
    javascript: "js",
    typescript: "ts",
    html: "html",
    css: "css",
    python: "py",
    json: "json",
    shell: "sh",
    bash: "sh",
    markdown: "md",
    md: "md",
  };
  const cls = map[key] || "neutral";
  return `<span class="badge lang ${cls}">${label}</span>`;
}
function topicBadge(t) {
  return `<span class="badge tag">${t}</span>`;
}

// ---------- UI ----------
export async function renderPortfolio(username) {
  loadStyle("./styles/main.css");
  loadStyle("./styles/guyPortfolio.css");

  const app = document.getElementById("app");
  app.innerHTML = "";

  const header = renderHeader(
    username,
    (key) => {
      setCurrentPage(key);
      switch (key) {
        case "dashboard":
          return renderDashboard(username);
        case "banners":
          return renderBannerEditor(username);
        case "marketing":
          return renderMarketingPage(username);
        case "landing":
          return renderLandingPage(username);
        case "about":
          return renderAbout(username);
        case "portfolio":
          return renderPortfolio(username);
        default:
          return renderDashboard(username);
      }
    },
    () => {
      clearLoggedInUser();
      clearCurrentPage();
      location.reload();
    },
    "portfolio"
  );

  // Hero
  const hero = document.createElement("section");
  hero.className = "portfolio-hero";
  hero.innerHTML = `
    <div class="hero-inner">
      <img src="./assets/img/guy.jpeg" alt="Guy portrait" class="hero-pic" />
      <div>
        <h1 class="hero-title">Hey, I'm Guy Mor.</h1>
        <p class="hero-sub">Software student & frontend developer. Clean UI, small details, practical projects.</p>
      </div>
    </div>
  `;

  // Projects
  const projects = document.createElement("section");
  projects.className = "portfolio-projects";
  projects.innerHTML = `
    <h2 class="section-title">Projects</h2>
    <div id="cards" class="projects-stack">
      ${Array.from({ length: 3 })
        .map(
          () => `
        <article class="project-skeleton">
          <div class="sk-left">
            <div class="sk-line"></div>
            <div class="sk-line w60"></div>
            <div class="sk-badges"></div>
            <div class="sk-line w40"></div>
            <div class="sk-buttons"></div>
          </div>
          <div class="sk-right"></div>
        </article>
      `
        )
        .join("")}
    </div>
  `;

  // Contact
  const contact = document.createElement("section");
  contact.className = "portfolio-contact";
  contact.innerHTML = `
    <h2 class="section-title">Contact</h2>
    <div class="contact-cards">
      <a class="contact-card" href="mailto:guymor@gmail.com">
        <span class="icon">${mailSvg()}</span>
        <span>Guymor38@gmail.com</span>
      </a>
      <a class="contact-card" href="https://github.com/${USER}" target="_blank" rel="noopener">
        <span class="icon">${ghSvg()}</span>
        <span>GitHub</span>
      </a>
      <a class="contact-card" href="https://www.linkedin.com/in/guy-mor-25682a210/" target="_blank" rel="noopener">
        <span class="icon">${inSvg()}</span>
        
      </a>
    </div>
  `;

  const container = document.createElement("div");
  container.className = "page portfolio";
  container.append(hero, projects, contact);

  app.append(header, container, renderFooter());

  const cards = projects.querySelector("#cards");

  // Fetch & render
  try {
    const repos = await fetchRepos(USER);
    const langPromises = repos.map(
      (r, idx) =>
        new Promise((resolve) =>
          setTimeout(
            async () => resolve(await fetchLanguages(r.full_name)),
            30 * idx
          )
        )
    );
    const langsPerRepo = await Promise.all(langPromises);

    const html = repos
      .map((r, i) => {
        const pushed = friendlyDate(r.pushed_at);
        const topLangs = langsPerRepo[i] || [];
        const topics = Array.isArray(r.topics) ? r.topics.slice(0, 3) : [];

        const badges =
          (topLangs.map(langBadge).join("") || "") +
          (topics.length ? topics.map(topicBadge).join("") : "");

        const homepageBtn =
          r.homepage && r.homepage.trim()
            ? `<a href="${r.homepage}" target="_blank" rel="noopener" class="btn solid">Live</a>`
            : "";
        const repoBtn = `<a href="${r.html_url}" target="_blank" rel="noopener" class="btn ghost">Repository</a>`;

        return `
        <article class="project-card">
          <div class="card-left">
            <h3 class="card-title">${r.name}</h3>
            <p class="card-desc">${r.description || ""}</p>
            <div class="badges">${badges}</div>
            <div class="meta">★ ${
              r.stargazers_count || 0
            } · Updated: ${pushed}</div>
            <div class="actions">${homepageBtn}${repoBtn}</div>
          </div>
          <div class="card-right">
            <img src="${ogImage(USER, r.name)}" alt="${
          r.name
        } preview" loading="lazy" />
          </div>
        </article>
      `;
      })
      .join("");

    cards.innerHTML = html || `<p class="empty">No projects found.</p>`;
  } catch (e) {
    console.error(e);
    cards.innerHTML = `<p class="error">Failed to load projects: ${e.message}</p>`;
  }
}

// --- tiny inline icons ---
function mailSvg() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm0 0 8 6 8-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}
function ghSvg() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.42c.58.1.8-.26.8-.58v-2.02c-3.26.71-3.95-1.4-3.95-1.4-.53-1.35-1.3-1.71-1.3-1.71-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.21 1.79 1.21 1.04 1.78 2.74 1.27 3.41.97.11-.76.4-1.27.72-1.56-2.6-.3-5.33-1.3-5.33-5.79 0-1.28.46-2.33 1.21-3.15-.12-.3-.52-1.52.12-3.16 0 0 .98-.31 3.2 1.2a11.03 11.03 0 0 1 5.82 0c2.22-1.51 3.2-1.2 3.2-1.2.64 1.64.24 2.86.12 3.16.76.82 1.21 1.87 1.21 3.15 0 4.5-2.73 5.49-5.34 5.78.41.35.77 1.03.77 2.07v3.06c0 .32.21.69.81.57A11.5 11.5 0 0 0 12 .5z"/></svg>`;
}
function inSvg() {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.56c0-1.33-.02-3.03-1.85-3.03-1.86 0-2.15 1.45-2.15 2.93v5.66H9.33V9h3.41v1.56h.05c.47-.88 1.62-1.8 3.33-1.8 3.56 0 4.22 2.34 4.22 5.39v6.3zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z"/></svg>`;
}

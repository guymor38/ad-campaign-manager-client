// dashboard.js
import { loadStyle } from "./utils.js";
import { renderLogin } from "./login.js";
import { renderHeader } from "./header.js";
import { renderBannerEditor } from "./bannerEditor.js";
import { renderMarketingPage } from "./marketing.js";
import { renderLandingPage } from "./landingPage.js";
import {
  clearLoggedInUser,

  // banners
  getActiveBanners,
  setBannerActive,

  // marketing email
  isMarketingActive,
  getMarketingPage,
  setMarketingActive,

  // landing page
  isLandingActive,
  getLandingPage,
  setLandingActive,
} from "./storage.js";

/* -------- helpers (לוקאליים כדי שלא נהיה תלויים בכלי עזר חיצוניים) -------- */
function el(tag, className, text) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (text !== undefined) n.textContent = text;
  return n;
}
function parseSize(size) {
  const [w, h] = size.split("x").map((n) => parseInt(n, 10));
  return { w: w || 250, h: h || 250 };
}

// fallback קטן אם אין showToast ב-utils
function showToastLocal(msg, type) {
  if (window.showToast) {
    window.showToast(msg, type);
    return;
  }
  const t = el("div", "toast");
  if (type === "warn") t.classList.add("warn");
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}

/* -------------- ממוזערת עם scale – קובעים גובה סופי רק אחרי התוכן -------------- */
function makeScaledBox(baseW, baseH) {
  const wrapper = el("div", "snapshot"); // המסגרת החיצונית
  const thumbW = 300; // רוחב ממוזערת
  const scale = thumbW / baseW;

  wrapper.style.width = thumbW + "px"; // את הגובה נשלים אחרי התוכן

  const inner = el("div", "scale-inner"); // הקנבס הפנימי לפני scale
  inner.style.width = baseW + "px";
  inner.style.height = baseH + "px";
  inner.style.transform = `scale(${scale})`;
  inner.style.transformOrigin = "top left";

  wrapper.appendChild(inner);

  function finalizeHeight() {
    // מדידה אחרי שהכנסנו תוכן (כולל scale)
    const r = inner.getBoundingClientRect();
    wrapper.style.height = r.height + "px"; // לא מכפילים שוב
  }

  return { wrapper, inner, finalizeHeight };
}

/* --------------------- רינדור תוכן לממוזערות (פשוט/ייצוגי) --------------------- */
function renderBannerInner(root, data, w, h) {
  root.innerHTML = "";
  root.style.cssText = `
    background: ${
      data?.bg ||
      "repeating-linear-gradient(45deg,#eee,#eee 10px,#f7f7f7 10px,#f7f7f7 20px)"
    };
    color: ${data?.color || "#333"};
    width:${w}px; height:${h}px;
    display:grid; place-items:center; text-align:center; padding:10px; box-sizing:border-box;
    font-family: Georgia, serif;
  `;
  const title = el("div", "snap-title", data?.title || "Headline");
  title.style.fontWeight = "700";
  const sub = el("div", "snap-sub", data?.subtitle || "Subtitle");
  sub.style.opacity = ".85";
  const body = el("div", "snap-body", data?.body || "Body");
  body.style.fontSize = "12px";
  root.append(title, sub, body);
}

function renderEmailInner(root, s) {
  root.innerHTML = `
    <div style="
      width:650px; box-sizing:border-box; padding:18px;
      background:${s.bg || "#fff"}; color:${s.color || "#333"};
      font-family:${s.font || "system-ui,-apple-system,Segoe UI,Roboto"};
      line-height:1.5;">
      <h1 style="margin:0 0 8px">${s.title || "Your great headline"}</h1>
      <h3 style="margin:0 0 12px;opacity:.85">${
        s.subtitle || "Sub headline goes here"
      }</h3>
      <p style="margin:0 0 16px">${
        s.body || "Body copy for your email. Keep it short and clear."
      }</p>
      <a href="${s.ctaUrl || "#"}"
         style="display:inline-block;padding:10px 16px;border-radius:8px;text-decoration:none;
                background:${s.accent || "#2d89ef"};color:#fff;font-weight:600">
        ${s.ctaText || "Learn more"}
      </a>
    </div>
  `;
}

function renderLandingInner(root, s) {
  root.innerHTML = `
    <div style="
      width:650px; box-sizing:border-box; padding:18px;
      background:${s.bg || "#fff"}; color:${s.color || "#333"};
      font-family:${s.font || "system-ui,-apple-system,Segoe UI,Roboto"};
      line-height:1.5;">
      <h1 style="margin:0 0 8px">${
        s.title || "Bannerist helps you launch faster"
      }</h1>
      <h3 style="margin:0 0 12px;opacity:.85">${
        s.subtitle || "Create and manage ads, emails & landings in minutes."
      }</h3>
      <p style="margin:0 0 16px">${
        s.body ||
        "Design quickly, preview instantly, and save your work locally."
      }</p>
      <a href="${s.ctaUrl || "#"}"
         style="display:inline-block;padding:12px 18px;border-radius:10px;text-decoration:none;
                background:${
                  s.accent || "#2d89ef"
                };color:#fff;font-weight:700"> ${s.ctaText || "Start free"} </a>
      <form onsubmit="return false" style="margin-top:18px;display:grid;gap:10px">
        <h3 style="margin:0 0 6px">${s.leadTitle || "Stay updated"}</h3>
        <input placeholder="Full name" style="padding:10px 12px;border-radius:10px;border:2px solid #645774"/>
        <input type="email" placeholder="Email" style="padding:10px 12px;border-radius:10px;border:2px solid #645774"/>
        <button type="submit"
         style="padding:10px 14px;border:none;border-radius:10px;background:${
           s.accent || "#2d89ef"
         };color:#fff;font-weight:700;cursor:pointer">
          ${s.leadBtn || "Sign Up"}
        </button>
      </form>
    </div>
  `;
}

/* --------------------------------- Main render -------------------------------- */
export function renderDashboard(username) {
  loadStyle("./styles/main.css");

  const app = document.getElementById("app");
  app.innerHTML = "";

  const header = renderHeader(
    username,
    (key) => {
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
      }
    },
    () => {
      clearLoggedInUser();
      renderLogin();
    }
  );

  const container = el("div", "dashboard-container");

  // Overview
  const overview = el("div", "dashboard-card");
  const h1 = el("h1", "", `Welcome, ${username}!`);
  const live = getActiveBanners();
  const liveCount =
    Object.keys(live).length +
    (isMarketingActive() ? 1 : 0) +
    (isLandingActive() ? 1 : 0);

  const p = el("p", "", `You have ${liveCount} live items.`);
  const btn = el("button", "", "Create New Campaign");
  btn.addEventListener("click", () => renderBannerEditor(username));
  overview.append(h1, p, btn);

  // Section: Live campaigns
  const section = el("section", "live-section");
  const title = el("h2", "", "Live campaigns");
  const grid = el("div", "dashboard-grid");
  section.append(title, grid);

  container.append(overview, section);
  app.append(header, container);

  /* --------- BANNERS --------- */
  const activeBanners = getActiveBanners();
  Object.entries(activeBanners).forEach(([size, data]) => {
    const { w, h } = parseSize(size);
    const { wrapper, inner, finalizeHeight } = makeScaledBox(w, h);
    renderBannerInner(inner, data, w, h);
    finalizeHeight();

    const card = el("div", "live-card");
    const h3 = el("h3", "", `Banner ${size} • LIVE`);
    const close = el("button", "card-close", "×");
    close.title = "Unpublish";
    close.addEventListener("click", () => {
      setBannerActive(size, false);
      showToastLocal("Banner unpublished", "warn");
      renderDashboard(username);
    });

    card.append(close, h3, wrapper);
    grid.appendChild(card);
  });

  /* --------- MARKETING EMAIL --------- */
  if (isMarketingActive()) {
    const s = getMarketingPage() || {};
    const { wrapper, inner, finalizeHeight } = makeScaledBox(650, 300);
    renderEmailInner(inner, s);
    finalizeHeight();

    const card = el("div", "live-card");
    const h3 = el("h3", "", "Marketing Email • LIVE");
    const close = el("button", "card-close", "×");
    close.title = "Unpublish";
    close.addEventListener("click", () => {
      setMarketingActive(false);
      showToastLocal("Email unpublished", "warn");
      renderDashboard(username);
    });

    card.append(close, h3, wrapper);
    grid.appendChild(card);
  }

  /* --------- LANDING PAGE --------- */
  if (isLandingActive()) {
    const s = getLandingPage() || {};
    const { wrapper, inner, finalizeHeight } = makeScaledBox(650, 420);
    renderLandingInner(inner, s);
    finalizeHeight();

    const card = el("div", "live-card");
    const h3 = el("h3", "", "Landing Page • LIVE");
    const close = el("button", "card-close", "×");
    close.title = "Unpublish";
    close.addEventListener("click", () => {
      setLandingActive(false);
      showToastLocal("Landing unpublished", "warn");
      renderDashboard(username);
    });

    card.append(close, h3, wrapper);
    grid.appendChild(card);
  }
}

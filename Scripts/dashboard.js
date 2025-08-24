// dashboard.js
import { loadStyle } from "./utils.js";
import { renderLogin } from "./login.js";
import { renderHeader } from "./header.js";
import { renderBannerEditor } from "./bannerEditor.js";
import { renderMarketingPage } from "./marketing.js";
import { renderLandingPage } from "./landingPage.js";
import { renderFooter } from "./footer.js";
import {
  clearLoggedInUser,
  getBanners,
  getMarketingPage,
  getLandingPage,
  setBannerActive,
  setMarketingActive,
  setLandingActive,
} from "./storage.js";

function toast(msg, warn = false) {
  const t = document.createElement("div");
  t.className = "toast" + (warn ? " warn" : "");
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1600);
}

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
    },
    "dashboard" // ← קישור פעיל
  );

  const container = document.createElement("div");
  container.className = "dashboard-container";

  // Overview
  const overviewCard = document.createElement("div");
  overviewCard.className = "dashboard-card";

  const title = document.createElement("h1");
  title.textContent = `Welcome, ${username}!`;

  const liveCount = (() => {
    let n = 0;
    const b = getBanners();
    if (b["250x250"]?.active) n++;
    if (b["300x600"]?.active) n++;
    if (getMarketingPage()?.active) n++;
    if (getLandingPage()?.active) n++;
    return n;
  })();

  const desc = document.createElement("p");
  desc.textContent = `You have ${liveCount} live item${
    liveCount === 1 ? "" : "s"
  }.`;

  const createBtn = document.createElement("button");
  createBtn.textContent = "Create New Campaign";
  createBtn.addEventListener("click", () => renderBannerEditor(username));
  overviewCard.append(title, desc, createBtn);

  const sectionTitle = document.createElement("h2");
  sectionTitle.style.margin = "0 0 8px";
  sectionTitle.textContent = "Live campaigns";

  const grid = document.createElement("div");
  grid.className = "dashboard-grid";

  container.append(overviewCard, sectionTitle, grid);

  // Card shell
  const cardShell = (label, onClose) => {
    const card = document.createElement("div");
    card.className = "dashboard-card";
    const h3 = document.createElement("h3");
    h3.textContent = label;
    const close = document.createElement("button");
    close.textContent = "×";
    close.className = "dash-close";
    close.addEventListener("click", onClose);
    h3.prepend(close);
    card.appendChild(h3);
    return card;
  };

  // Thumbs
  const bannerThumbHTML = (s, size) => {
    const [w, h] = size === "300x600" ? [300, 600] : [250, 250];
    const ph = !s.bg ? 'class="placeholder-surface"' : "";
    const title = s.title
      ? `<div style="font-weight:700">${s.title}</div>`
      : "";
    const subtitle = s.subtitle
      ? `<div style="opacity:.9">${s.subtitle}</div>`
      : "";
    const body = s.body ? `<div style="opacity:.95">${s.body}</div>` : "";
    return `
      <div ${ph} style="
        width:${w}px;height:${h}px;background:${s.bg || "transparent"};
        color:${s.color || "#333"};
        display:grid;place-items:center;text-align:center;
        border:2px dashed #645774;border-radius:10px;padding:10px;
        font-size:${s.fontSize || 22}px; overflow:hidden;">
        <div style="max-width:90%;max-height:90%;overflow:hidden">${title}${subtitle}${body}</div>
      </div>`;
  };

  const emailThumbHTML = (s) => {
    const base = `
      background:${s.bg || "transparent"}; color:${s.color || "#333"};
      font-family:${s.font}; width:650px; line-height:1.5; padding:18px;`;
    const img = s.imgUrl
      ? `<img src="${s.imgUrl}" alt="" style="max-width:100%;display:block;margin:0 auto 12px;border-radius:8px"/>`
      : "";
    const btn = (text, url) =>
      `<a href="${
        url || "#"
      }" style="display:inline-block;padding:10px 16px;border-radius:8px;text-decoration:none;background:${
        s.accent || "#2d89ef"
      };color:#fff;font-weight:600">${text || "Button"}</a>`;

    let inner = `<div style="${base}">
      <h1 style="margin:0 0 8px">${s.title || ""}</h1>
      <h3 style="margin:0 0 14px;opacity:.85">${s.subtitle || ""}</h3>
      ${img}
      <p style="margin:0 0 16px">${s.body || ""}</p>
      ${btn(s.ctaText, s.ctaUrl)}
    </div>`;
    return `<div style="transform:scale(.6); transform-origin: top left; width:650px; border:2px dashed #645774; border-radius:12px; background:#fff; overflow:hidden; padding:8px">${inner}</div>`;
  };

  const landingThumbHTML = (s) => {
    const shell = `background:${s.bg || "transparent"}; color:${
      s.color || "#333"
    }; font-family:${s.font}; width:1000px; padding:18px; line-height:1.5;`;
    const img = s.imgUrl
      ? `<img src="${s.imgUrl}" alt="" style="max-width:100%;display:block;margin:0 auto 14px;border-radius:12px"/>`
      : "";
    const btn = (text, url) =>
      `<a href="${
        url || "#"
      }" style="display:inline-block;padding:12px 18px;border-radius:10px;background:${
        s.accent || "#2d89ef"
      };color:#fff;text-decoration:none;font-weight:700">${text || "CTA"}</a>`;
    const leadForm = (title, btnText, accent) => `
      <form onsubmit="return false" style="margin-top:16px; display:grid; gap:10px">
        <h3 style="margin:0 0 6px">${title || ""}</h3>
        <input placeholder="Full name" style="padding:10px 12px;border-radius:10px;border:2px solid #645774"/>
        <input type="email" placeholder="Email" style="padding:10px 12px;border-radius:10px;border:2px solid #645774"/>
        <button type="submit" style="padding:10px 14px;border:none;border-radius:10px;background:${
          accent || "#2d89ef"
        };color:#fff;font-weight:700;cursor:pointer">${
      btnText || "Submit"
    }</button>
      </form>`;
    const inner = `<div style="${shell}">
      <h1 style="margin:0 0 8px">${s.title || ""}</h1>
      <h3 style="margin:0 0 14px;opacity:.85">${s.subtitle || ""}</h3>
      ${img}
      <p style="margin:0 0 16px">${s.body || ""}</p>
      ${btn(s.ctaText, s.ctaUrl)}
      ${leadForm(s.leadTitle, s.leadBtn, s.accent)}
    </div>`;
    return `<div style="transform:scale(.45); transform-origin: top left; width:1000px; border:2px dashed #645774; border-radius:12px; background:#fff; overflow:hidden; padding:8px">${inner}</div>`;
  };

  // Add live items
  const allB = getBanners();
  ["250x250", "300x600"].forEach((sz) => {
    const s = allB[sz];
    if (s && s.active) {
      const card = cardShell(`Banner ${sz} • LIVE`, () => {
        setBannerActive(sz, false);
        toast("Removed from LIVE");
        renderDashboard(username);
      });
      const wrap = document.createElement("div");
      wrap.innerHTML = bannerThumbHTML(s, sz);
      card.appendChild(wrap.firstElementChild);
      grid.appendChild(card);
    }
  });

  const M = getMarketingPage();
  if (M && M.active) {
    const card = cardShell("Marketing Email • LIVE", () => {
      setMarketingActive(false);
      toast("Removed from LIVE");
      renderDashboard(username);
    });
    const wrap = document.createElement("div");
    wrap.innerHTML = emailThumbHTML(M);
    card.appendChild(wrap.firstElementChild);
    grid.appendChild(card);
  }

  const L = getLandingPage();
  if (L && L.active) {
    const card = cardShell("Landing Page • LIVE", () => {
      setLandingActive(false);
      toast("Removed from LIVE");
      renderDashboard(username);
    });
    const wrap = document.createElement("div");
    wrap.innerHTML = landingThumbHTML(L);
    card.appendChild(wrap.firstElementChild);
    grid.appendChild(card);
  }

  // הוספת הכל ל־app
  app.append(header, container, renderFooter());
}

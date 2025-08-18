import { loadStyle } from "./utils.js";
import { renderLogin } from "./login.js";
import { renderHeader } from "./header.js";
import { renderBannerEditor } from "./bannerEditor.js";
import { renderMarketingPage } from "./marketing.js";
import { renderLandingPage } from "./landingPage.js";
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
    }
  );

  const container = document.createElement("div");
  container.className = "dashboard-container";

  // ===== HERO =====
  const hero = document.createElement("section");
  hero.className = "dash-hero";
  hero.innerHTML = `
    <h1 class="dash-logo">Bannerist</h1>
    <p class="dash-tagline">
      “Creating a great campaign doesn’t have to be so hard,<br/>
      At Bannerist, we make it easy.”
    </p>
    <button class="dash-cta" id="cta-start">Start Now</button>
  `;
  hero.querySelector("#cta-start").addEventListener("click", () => {
    renderBannerEditor(username);
  });

  // ===== LIVE SECTION =====
  const liveSection = document.createElement("section");
  liveSection.className = "live-section";
  liveSection.innerHTML = `
    <h2>Active Campaigns</h2>
    <div class="live-grid" id="live-grid"></div>
  `;

  container.append(hero, liveSection);

  const grid = liveSection.querySelector("#live-grid");

  // ===== THUMB HELPERS =====
  function makeTile(label, innerHTML, onRemove) {
    const tile = document.createElement("div");
    tile.className = "live-tile";
    tile.innerHTML = `
      <button class="tile-close" title="Remove from LIVE">×</button>
      <div class="tile-thumb">${innerHTML}</div>
      <div class="tile-caption">${label}</div>
    `;
    tile.querySelector(".tile-close").addEventListener("click", onRemove);
    return tile;
  }

  function bannerThumbHTML(s, size) {
    const [w, h] = size === "300x600" ? [300, 600] : [250, 250];
    const bg = s.bg || "transparent";
    const color = s.color || "#333";
    const fs = (s.fontSize || 22) + "px";
    const title = s.title
      ? `<div style="font-weight:700">${s.title}</div>`
      : "";
    const subtitle = s.subtitle
      ? `<div style="opacity:.9">${s.subtitle}</div>`
      : "";
    const body = s.body ? `<div style="opacity:.95">${s.body}</div>` : "";
    const ph = !s.bg ? 'class="placeholder-surface"' : "";

    return `
      <div ${ph}
           style="width:${w}px;height:${h}px;background:${bg};color:${color};
                  display:grid;place-items:center;text-align:center;
                  border:2px dashed #645774;border-radius:10px;padding:10px;
                  font-size:${fs};line-height:1.25;
                  word-break:break-word;overflow-wrap:anywhere;max-width:100%;">
        <div>${title}${subtitle}${body}</div>
      </div>`;
  }

  function emailThumbHTML(s) {
    // 650px רוחב מקורי — סקל כדי להיכנס לריבוע 260px
    const scale = 0.36;
    const base = `
      background:${s.bg || "transparent"}; color:${s.color || "#333"};
      font-family:${s.font};
      width:650px; line-height:1.5; padding:18px; background-clip:padding-box;
      word-break:break-word; overflow-wrap:anywhere;
    `;
    const img = s.imgUrl
      ? `<img src="${s.imgUrl}" alt=""
           style="max-width:100%;display:block;margin:0 auto 12px;border-radius:8px"/>`
      : "";
    const btn = (text, url) => `<a href="${url || "#"}"
      style="display:inline-block;padding:10px 16px;border-radius:8px;text-decoration:none;
             background:${s.accent || "#2d89ef"};color:#fff;font-weight:600">${
      text || "Button"
    }</a>`;

    let inner;
    if (s.tpl === "t2") {
      inner = `<div style="${base}">
        <div style="padding:0 0 14px; text-align:center; background:rgba(0,0,0,.03); border-radius:8px;">
          ${
            img ||
            `<div style="height:180px; display:grid; place-items:center; color:#888">Hero</div>`
          }
        </div>
        <h1 style="margin:0 0 8px">${s.title || ""}</h1>
        <p style="margin:0 0 16px">${s.body || ""}</p>
        ${btn(s.ctaText, s.ctaUrl)}
      </div>`;
    } else if (s.tpl === "t3") {
      inner = `<div style="${base}">
        <div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.08)">
          ${img}
          <h2 style="margin:0 0 8px">${s.title || ""}</h2>
          <p style="margin:0 0 14px;opacity:.9">${s.subtitle || ""}</p>
          <p style="margin:0 0 16px">${s.body || ""}</p>
          ${btn(s.ctaText, s.ctaUrl)}
        </div>
      </div>`;
    } else {
      inner = `<div style="${base}">
        <h1 style="margin:0 0 8px">${s.title || ""}</h1>
        <h3 style="margin:0 0 14px;opacity:.85">${s.subtitle || ""}</h3>
        ${img}
        <p style="margin:0 0 16px">${s.body || ""}</p>
        ${btn(s.ctaText, s.ctaUrl)}
      </div>`;
    }

    return `<div style="transform:scale(${scale}); transform-origin: top left;
                       width:650px; border:2px dashed #645774; border-radius:12px;
                       background:#fff; overflow:hidden; padding:8px">
              ${inner}
            </div>`;
  }

  function landingThumbHTML(s) {
    // 1000px רוחב מקורי — סקל כדי להיכנס לריבוע 260px
    const scale = 0.24;
    const shell = `
      background:${s.bg || "transparent"}; color:${s.color || "#333"};
      font-family:${s.font}; width:1000px; padding:18px; line-height:1.5;
      word-break:break-word; overflow-wrap:anywhere;
    `;
    const img = s.imgUrl
      ? `<img src="${s.imgUrl}" alt=""
           style="max-width:100%;display:block;margin:0 auto 14px;border-radius:12px"/>`
      : "";
    const btn = (text, url) =>
      `<a href="${url || "#"}"
         style="display:inline-block;padding:12px 18px;border-radius:10px;background:${
           s.accent || "#2d89ef"
         };
                color:#fff;text-decoration:none;font-weight:700">${
                  text || "CTA"
                }</a>`;
    const leadForm = (title, btnText, accent) => `
      <form onsubmit="return false" style="margin-top:16px; display:grid; gap:10px">
        <h3 style="margin:0 0 6px">${title || ""}</h3>
        <input placeholder="Full name" style="padding:10px 12px;border-radius:10px;border:2px solid #645774"/>
        <input type="email" placeholder="Email" style="padding:10px 12px;border-radius:10px;border:2px solid #645774"/>
        <button type="submit" style="padding:10px 14px;border:none;border-radius:10px;background:${
          accent || "#2d89ef"
        };
                color:#fff;font-weight:700;cursor:pointer">${
                  btnText || "Submit"
                }</button>
      </form>`;

    let inner;
    if (s.tpl === "t2") {
      inner = `<div style="${shell}">
        <div style="background:rgba(0,0,0,.05);border-radius:12px;padding:16px;text-align:center;margin-bottom:14px">
          ${
            img ||
            `<div style="height:220px;display:grid;place-items:center;color:#888">Hero image</div>`
          }
        </div>
        <h1 style="margin:0 0 8px">${s.title || ""}</h1>
        <p style="margin:0 0 16px">${s.body || ""}</p>
        ${btn(s.ctaText, s.ctaUrl)}
        ${leadForm(s.leadTitle, s.leadBtn, s.accent)}
      </div>`;
    } else if (s.tpl === "t3") {
      inner = `<div style="${shell}">
        <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:18px">
          <div>
            <h1 style="margin:0 0 8px">${s.title || ""}</h1>
            <h3 style="margin:0 0 12px;opacity:.85">${s.subtitle || ""}</h3>
            <p style="margin:0 0 16px">${s.body || ""}</p>
            ${btn(s.ctaText, s.ctaUrl)}
            ${leadForm(s.leadTitle, s.leadBtn, s.accent)}
          </div>
          <div>
            ${
              img ||
              `<div style="height:260px;display:grid;place-items:center;color:#888;background:rgba(0,0,0,.05);border-radius:12px">Image</div>`
            }
          </div>
        </div>
      </div>`;
    } else {
      inner = `<div style="${shell}">
        <h1 style="margin:0 0 8px">${s.title || ""}</h1>
        <h3 style="margin:0 0 14px;opacity:.85">${s.subtitle || ""}</h3>
        ${img}
        <p style="margin:0 0 16px">${s.body || ""}</p>
        ${btn(s.ctaText, s.ctaUrl)}
        ${leadForm(s.leadTitle, s.leadBtn, s.accent)}
      </div>`;
    }

    return `<div style="transform:scale(${scale}); transform-origin: top left;
                       width:1000px; border:2px dashed #645774; border-radius:12px;
                       background:#fff; overflow:hidden; padding:8px">
              ${inner}
            </div>`;
  }

  // ===== ADD LIVE TILES =====
  const allB = getBanners();
  ["250x250", "300x600"].forEach((sz) => {
    const s = allB[sz];
    if (s && s.active) {
      const tile = makeTile(`Banner ${sz}`, bannerThumbHTML(s, sz), () => {
        setBannerActive(sz, false);
        toast("Removed from LIVE");
        renderDashboard(username);
      });
      grid.appendChild(tile);
    }
  });

  const M = getMarketingPage();
  if (M && M.active) {
    const tile = makeTile("Marketing Email", emailThumbHTML(M), () => {
      setMarketingActive(false);
      toast("Removed from LIVE");
      renderDashboard(username);
    });
    grid.appendChild(tile);
  }

  const L = getLandingPage();
  if (L && L.active) {
    const tile = makeTile("Landing Page", landingThumbHTML(L), () => {
      setLandingActive(false);
      toast("Removed from LIVE");
      renderDashboard(username);
    });
    grid.appendChild(tile);
  }

  // אין קמפיינים חיים?
  if (!grid.children.length) {
    const empty = document.createElement("p");
    empty.className = "live-empty";
    empty.textContent =
      "No active campaigns yet. Click “Start Now” to create one.";
    liveSection.appendChild(empty);
  }

  app.append(header, container);
}

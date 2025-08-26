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
  setCurrentPage,
  clearCurrentPage,
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
        default:
          renderDashboard(username);
      }
    },
    () => {
      clearLoggedInUser();
      clearCurrentPage();
      renderLogin();
    },
    "dashboard"
  );

  const container = document.createElement("div");
  container.className = "page dashboard-container";

  const hero = document.createElement("section");
  hero.className = "hero";
  hero.innerHTML = `
    <h1 class="hero__title">Bannerist</h1>
    <p class="hero__subtitle">
      “Creating a great campaign doesn’t have to be so hard,<br/>
      At Bannerist, we make it easy.”
    </p>
    <button class="btn btn--cta" id="startNowBtn">Start Now</button>
  `;
  hero.querySelector("#startNowBtn").addEventListener("click", () => {
    setCurrentPage("banners");
    renderBannerEditor(username);
  });

  const campaigns = document.createElement("section");
  campaigns.className = "campaigns";
  campaigns.innerHTML = `
    <h2 class="campaigns__title">Active Campaigns</h2>
    <div class="campaigns__group">
      <h3>Banners</h3>
      <div class="campaigns__grid" id="gridBanners"></div>
    </div>
    <div class="campaigns__group">
      <h3>Marketing Emails</h3>
      <div class="campaigns__grid" id="gridEmails"></div>
    </div>
    <div class="campaigns__group">
      <h3>Landing Pages</h3>
      <div class="campaigns__grid" id="gridLandings"></div>
    </div>
  `;

  const gridBanners = campaigns.querySelector("#gridBanners");
  const gridEmails = campaigns.querySelector("#gridEmails");
  const gridLandings = campaigns.querySelector("#gridLandings");

  // helper: wrap any HTML inside a fixed square and center+scale it
  function squareBox(innerHTML, scale = 1) {
    const box = document.createElement("div");
    box.className = "thumb-box";
    const inner = document.createElement("div");
    inner.className = "thumb-inner";
    inner.style.transform = `translate(-50%, -50%) scale(${scale})`;
    inner.innerHTML = innerHTML;
    box.appendChild(inner.firstElementChild || inner);
    return box;
  }

  // Banner thumbnails (fit into 260×260 box)
  const BOX = 260;
  const bannerThumbHTML = (s, size) => {
    const [w, h] = size === "300x600" ? [300, 600] : [250, 250];
    const fs = s.fontSize || 22;
    const title = s.title
      ? `<div style="font-weight:700">${s.title}</div>`
      : "";
    const subtitle = s.subtitle
      ? `<div style="opacity:.9">${s.subtitle}</div>`
      : "";
    const body = s.body ? `<div style="opacity:.95">${s.body}</div>` : "";

    const shell = `
      width:${w}px;height:${h}px;
      display:grid;place-items:center;text-align:center;
      border:2px dashed #645774;border-radius:10px;padding:10px;
      overflow:hidden;background:${s.bg || "transparent"};
      color:${s.color || "#333"};font-size:${fs}px;`;

    let content;
    if (s.template === "t2") {
      const dotColor = s.dotColor || "#4ade80";
      const dotSize = Number(s.dotSize || 3);
      const pattern = `radial-gradient(${dotColor} ${Math.max(
        1,
        dotSize
      )}px, transparent ${Math.max(2, dotSize + 1)}px)`;
      const patternSize = `${dotSize * 8}px ${dotSize * 8}px`;
      content = `<div style="${shell};background-image:${pattern};background-size:${patternSize}">
        <div style="max-width:85%;background:#ffe4d6;border-radius:14px;padding:10px 12px;line-height:1.2">${title}${subtitle}${body}</div>
      </div>`;
    } else if (s.template === "t3") {
      content = `<div style="${shell}">
        <div style="width:90%;height:90%;display:flex;flex-direction:column;gap:10px;justify-content:center;align-items:center">
          <div style="width:100%;height:14px;background:${
            s.color || "#222"
          };border-radius:8px;opacity:.25"></div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:center">${title}${subtitle}${body}</div>
        </div>
      </div>`;
    } else {
      content = `<div style="${shell}">
        <div style="max-width:90%;max-height:90%;overflow:hidden">${title}${subtitle}${body}</div>
      </div>`;
    }

    const scale = Math.min(BOX / Math.max(w, h), 1);
    return squareBox(content, scale).outerHTML;
  };

  // Email thumbnail -> scaled into square
  const emailThumbHTML = (s) => {
    const base = `background:${s.bg || "transparent"}; color:${
      s.color || "#333"
    }; font-family:${s.font}; width:650px; line-height:1.5; padding:18px;`;
    const img = s.imgUrl
      ? `<img src="${s.imgUrl}" alt="" style="max-width:100%;display:block;margin:0 auto 12px;border-radius:8px"/>`
      : "";
    const btn = (text, url) =>
      `<a href="${
        url || "#"
      }" style="display:inline-block;padding:10px 16px;border-radius:8px;text-decoration:none;background:${
        s.accent || "#2d89ef"
      };color:#fff;font-weight:600">${text || "Button"}</a>`;
    const inner = `<div style="${base}">
      <h1 style="margin:0 0 8px">${s.title || ""}</h1>
      <h3 style="margin:0 0 14px;opacity:.85">${s.subtitle || ""}</h3>
      ${img}
      <p style="margin:0 0 16px">${s.body || ""}</p>
      ${btn(s.ctaText, s.ctaUrl)}
    </div>`;
    const scaled = `<div style="width:650px;border:2px dashed #645774;border-radius:12px;background:#fff;overflow:hidden;padding:8px">${inner}</div>`;
    const scale = BOX / 650;
    return squareBox(scaled, scale).outerHTML;
  };

  // Landing page thumbnail -> scaled into square
  const landingThumbHTML = (s) => {
    const wrap = `background:${s.bg || "transparent"}; color:${
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
    const inner = `<div style="${wrap}">
      <h1 style="margin:0 0 8px">${s.title || ""}</h1>
      <h3 style="margin:0 0 14px;opacity:.85">${s.subtitle || ""}</h3>
      ${img}
      <p style="margin:0 0 16px">${s.body || ""}</p>
      ${btn(s.ctaText, s.ctaUrl)}
      ${leadForm(s.leadTitle, s.leadBtn, s.accent)}
    </div>`;
    const scaled = `<div style="width:1000px;border:2px dashed #645774;border-radius:12px;background:#fff;overflow:hidden;padding:8px">${inner}</div>`;
    const scale = BOX / 1000;
    return squareBox(scaled, scale).outerHTML;
  };

  // card wrapper with close
  function makeCard(html, onClose) {
    const card = document.createElement("div");
    card.className = "campaign-card";

    const cell = document.createElement("div");
    cell.className = "thumb-box";
    cell.innerHTML = html; // html is already thumb-box OR content – normalize below
    const contentEl = cell.querySelector(".thumb-box")
      ? cell.querySelector(".thumb-box")
      : cell;

    const btn = document.createElement("button");
    btn.className = "card-close";
    btn.type = "button";
    btn.textContent = "×";
    btn.title = "Delete";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      onClose();
    });

    // If html already produced a thumb-box, use it; else wrap it.
    const host = document.createElement("div");
    host.className = "thumb-box";
    const inner = document.createElement("div");
    inner.className = "thumb-inner";
    inner.appendChild(contentEl.firstElementChild || contentEl);
    host.append(btn, inner);

    card.appendChild(host);
    return card;
  }

  // Banners (up to 3)
  const banners = getBanners() || {};
  const bannerEntries = Object.entries(banners).sort((a, b) => {
    const A = (a[1] && a[1].updatedAt) || 0;
    const B = (b[1] && b[1].updatedAt) || 0;
    return B - A; // newest first
  });

  let bannerCount = 0;
  for (const [key, data] of bannerEntries) {
    if (data && data.active && bannerCount < 3) {
      const html = bannerThumbHTML(data, key);
      gridBanners.appendChild(
        makeCard(html, () => {
          setBannerActive(key, false);
          toast("Removed from LIVE");
          renderDashboard(username);
        })
      );
      bannerCount++;
    }
  }
  while (bannerCount < 3) {
    const ph = document.createElement("div");
    ph.className = "thumb-box placeholder-surface";
    gridBanners.appendChild(ph);
    bannerCount++;
  }

  // Marketing (up to 3)
  const M = getMarketingPage();
  const marketingList = Array.isArray(M) ? M : M ? [M] : [];
  let emailCount = 0;
  marketingList
    .filter((m) => m && m.active)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 3)
    .forEach((m) => {
      gridEmails.appendChild(
        makeCard(emailThumbHTML(m), () => {
          setMarketingActive(false);
          toast("Removed from LIVE");
          renderDashboard(username);
        })
      );
      emailCount++;
    });
  while (emailCount < 3) {
    const ph = document.createElement("div");
    ph.className = "thumb-box placeholder-surface";
    gridEmails.appendChild(ph);
    emailCount++;
  }

  // Landing pages (up to 3)
  const L = getLandingPage();
  const landingList = Array.isArray(L) ? L : L ? [L] : [];
  let landCount = 0;
  landingList
    .filter((l) => l && l.active)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
    .slice(0, 3)
    .forEach((l) => {
      gridLandings.appendChild(
        makeCard(landingThumbHTML(l), () => {
          setLandingActive(false);
          toast("Removed from LIVE");
          renderDashboard(username);
        })
      );
      landCount++;
    });
  while (landCount < 3) {
    const ph = document.createElement("div");
    ph.className = "thumb-box placeholder-surface";
    gridLandings.appendChild(ph);
    landCount++;
  }

  container.append(hero, campaigns);
  app.append(header, container, renderFooter());
}

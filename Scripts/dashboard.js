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
      // onNavigate
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
      // onLogout
      clearLoggedInUser();
      clearCurrentPage();
      renderLogin();
    },
    "dashboard"
  );

  // ----- Container -----
  const container = document.createElement("div");
  container.className = "page dashboard-container";

  // ===== HERO (per mockup) =====
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

  // ===== Active Campaigns =====
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

  // Helper thumb renderers (scaled previews like in existing file)
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

    // בסיס משותף למסגרת המוקטנת
    const shell = `
    width:${w}px;height:${h}px;
    display:grid;place-items:center;text-align:center;
    border:2px dashed #645774;border-radius:10px;padding:10px;
    overflow:hidden;`;

    // === תבניות ===
    if (s.template === "t2") {
      // Template 2 – רקע עם נקודות וכרטיס אמצעי
      const dotColor = s.dotColor || "#4ade80"; // ירוק כברירת מחדל
      const dotSize = Number(s.dotSize || 3); // px
      const pattern = `
      radial-gradient(${dotColor} ${Math.max(
        1,
        dotSize
      )}px, transparent ${Math.max(2, dotSize + 1)}px)
    `;
      const patternSize = `${dotSize * 8}px ${dotSize * 8}px`;

      return `
      <div style="${shell}
                  background:${s.bg || "#a61e4d"};
                  color:${s.color || "#222"};
                  font-size:${fs}px;
                  background-image:${pattern};
                  background-size:${patternSize};">
        <div style="max-width:85%;background:#ffe4d6;border-radius:14px;padding:10px 12px;line-height:1.2">
          ${title}${subtitle}${body}
        </div>
      </div>`;
    }

    if (s.template === "t3") {
      // Template 3 – פס עליון וסטאק טקסט
      return `
      <div style="${shell}
                  background:${s.bg || "#f0f0f0"};
                  color:${s.color || "#222"};
                  font-size:${fs}px;">
        <div style="width:90%;height:90%;display:flex;flex-direction:column;gap:10px;justify-content:center;align-items:center">
          <div style="width:100%;height:14px;background:${
            s.color || "#222"
          };border-radius:8px;opacity:.25"></div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:center">
            ${title}${subtitle}${body}
          </div>
        </div>
      </div>`;
    }

    // Template 1 (ברירת מחדל) – טקסט פשוט על רקע
    return `
    <div style="${shell}
                background:${s.bg || "transparent"};
                color:${s.color || "#333"};
                font-size:${fs}px;">
      <div style="max-width:90%;max-height:90%;overflow:hidden">
        ${title}${subtitle}${body}
      </div>
    </div>`;
  };
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

  // ===== helpers to create a card with a close button =====
  function makeCard(html, onClose) {
    const card = document.createElement("div");
    card.className = "campaign-card";
    card.style.position = "relative";

    const close = document.createElement("button");
    close.textContent = "×";
    close.className = "card-close";
    close.setAttribute("aria-label", "Delete");
    close.title = "Delete";
    Object.assign(close.style, {
      position: "absolute",
      top: "6px",
      right: "8px",
      width: "22px",
      height: "22px",
      border: "none",
      borderRadius: "50%",
      background: "rgba(0,0,0,.55)",
      color: "#fff",
      cursor: "pointer",
      lineHeight: "22px",
      fontSize: "16px",
      zIndex: "2",
    });
    close.addEventListener("click", (e) => {
      e.stopPropagation();
      onClose();
    });

    const wrap = document.createElement("div");
    wrap.className = "campaign-card__thumb";
    wrap.innerHTML = html;

    card.appendChild(close);
    card.appendChild(wrap.firstElementChild);
    return card;
  }

  // ===== Banners (up to 3) =====
  const banners = getBanners() || {};
  const bannerEntries = Array.isArray(banners)
    ? banners.map((b, i) => ({ key: i, data: b }))
    : Object.entries(banners).map(([key, data]) => ({ key, data }));
  let bannerCount = 0;
  bannerEntries.forEach(({ key, data }) => {
    if (data && data.active && bannerCount < 3) {
      gridBanners.appendChild(
        makeCard(bannerThumbHTML(data, data.size || key), () => {
          // best-effort: support current API (by size string)
          setBannerActive(key, false);
          toast("Removed from LIVE");
          renderDashboard(username);
        })
      );
      bannerCount++;
    }
  });
  while (bannerCount < 3) {
    const ph = document.createElement("div");
    ph.className = "ph-surface placeholder-surface";
    ph.style.width = "260px";
    ph.style.height = "260px";
    gridBanners.appendChild(ph);
    bannerCount++;
  }

  // ===== Marketing Emails (up to 3) =====
  const M = getMarketingPage();
  const marketingList = Array.isArray(M) ? M : M ? [M] : [];
  let emailCount = 0;
  marketingList.forEach((m) => {
    if (m && m.active && emailCount < 3) {
      gridEmails.appendChild(
        makeCard(emailThumbHTML(m), () => {
          setMarketingActive(false); // current API toggles single item
          toast("Removed from LIVE");
          renderDashboard(username);
        })
      );
      emailCount++;
    }
  });
  while (emailCount < 3) {
    const ph = document.createElement("div");
    ph.className = "ph-surface placeholder-surface";
    ph.style.width = "260px";
    ph.style.height = "260px";
    gridEmails.appendChild(ph);
    emailCount++;
  }

  // ===== Landing Pages (up to 3) =====
  const L = getLandingPage();
  const landingList = Array.isArray(L) ? L : L ? [L] : [];
  let landCount = 0;
  landingList.forEach((l) => {
    if (l && l.active && landCount < 3) {
      gridLandings.appendChild(
        makeCard(landingThumbHTML(l), () => {
          setLandingActive(false); // current API toggles single item
          toast("Removed from LIVE");
          renderDashboard(username);
        })
      );
      landCount++;
    }
  });
  while (landCount < 3) {
    const ph = document.createElement("div");
    ph.className = "ph-surface placeholder-surface";
    ph.style.width = "260px";
    ph.style.height = "260px";
    gridLandings.appendChild(ph);
    landCount++;
  }

  // Mount
  container.append(hero, campaigns);
  app.append(header, container, renderFooter());
}

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
    "dashboard" // active link
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
    renderBannerEditor(username);
  });

  // ===== Active Campaigns (grid of three) =====
  const campaigns = document.createElement("section");
  campaigns.className = "campaigns";
  campaigns.innerHTML = `<h2 class="campaigns__title">Active Campaigns</h2>
  <div class="campaigns__grid" id="campaignsGrid"></div>`;
  const gridEl = campaigns.querySelector("#campaignsGrid");

  // Helper thumb renderers (scaled previews like in existing file)
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

  // Collect up to three active items
  const picks = [];
  const banners = getBanners();
  if (banners["250x250"]?.active) {
    picks.push({ html: bannerThumbHTML(banners["250x250"], "250x250") });
  }
  if (banners["300x600"]?.active) {
    picks.push({ html: bannerThumbHTML(banners["300x600"], "300x600") });
  }
  const M = getMarketingPage();
  if (M?.active) {
    picks.push({ html: emailThumbHTML(M) });
  }
  const L = getLandingPage();
  if (L?.active) {
    picks.push({ html: landingThumbHTML(L) });
  }

  // If not enough, fill with placeholders to 3 cards
  while (picks.length < 3) {
    picks.push({
      html: `<div class="ph-surface placeholder-surface" style="width:260px;height:260px;"></div>`,
    });
  }

  // Render grid
  picks.slice(0, 3).forEach((p) => {
    const card = document.createElement("div");
    card.className = "campaign-card";
    const wrap = document.createElement("div");
    wrap.className = "campaign-card__thumb";
    wrap.innerHTML = p.html;
    card.appendChild(wrap.firstElementChild);
    gridEl.appendChild(card);
  });

  // (Optional) below the mockup: LIVE cards with close (keep for power users)
  const liveGrid = document.createElement("div");
  liveGrid.className = "dashboard-grid";
  const addLiveCard = (label, innerHTML, onClose) => {
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
    const wrap = document.createElement("div");
    wrap.innerHTML = innerHTML;
    card.appendChild(wrap.firstElementChild);
    return card;
  };

  if (banners["250x250"]?.active) {
    liveGrid.appendChild(
      addLiveCard(
        "Banner 250x250 • LIVE",
        bannerThumbHTML(banners["250x250"], "250x250"),
        () => {
          setBannerActive("250x250", false);
          toast("Removed from LIVE");
          renderDashboard(username);
        }
      )
    );
  }
  if (banners["300x600"]?.active) {
    liveGrid.appendChild(
      addLiveCard(
        "Banner 300x600 • LIVE",
        bannerThumbHTML(banners["300x600"], "300x600"),
        () => {
          setBannerActive("300x600", false);
          toast("Removed from LIVE");
          renderDashboard(username);
        }
      )
    );
  }
  if (M?.active) {
    liveGrid.appendChild(
      addLiveCard("Marketing Email • LIVE", emailThumbHTML(M), () => {
        setMarketingActive(false);
        toast("Removed from LIVE");
        renderDashboard(username);
      })
    );
  }
  if (L?.active) {
    liveGrid.appendChild(
      addLiveCard("Landing Page • LIVE", landingThumbHTML(L), () => {
        setLandingActive(false);
        toast("Removed from LIVE");
        renderDashboard(username);
      })
    );
  }

  // Mount
  container.append(hero, campaigns);
  app.append(header, container, renderFooter());
}

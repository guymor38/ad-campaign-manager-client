import { loadStyle } from "./utils.js";
import { renderLogin } from "./login.js";
import { renderHeader } from "./header.js";
import { renderBannerEditor } from "./bannerEditor.js";
import { renderMarketingPage } from "./marketing.js";
import { renderLandingPage } from "./landingPage.js";
import { renderAbout } from "./about.js";
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
          return renderDashboard(username);
        case "banners":
          return renderBannerEditor(username);
        case "marketing":
          return renderMarketingPage(username);
        case "landing":
          return renderLandingPage(username);
        case "about":
          return renderAbout(username);
        default:
          return renderDashboard(username);
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

  // ---------- Thumbs (raw html) ----------
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
      width:${w}px;height:${h}px;display:grid;place-items:center;text-align:center;
      border:2px dashed #645774;border-radius:10px;padding:10px;overflow:hidden;
      background:${s.bg || "transparent"}; color:${
      s.color || "#333"
    }; font-size:${fs}px;`;

    if (s.template === "t2") {
      const dotColor = s.dotColor || "#4ade80";
      const dotSize = Number(s.dotSize || 3);
      const pattern = `radial-gradient(${dotColor} ${Math.max(
        1,
        dotSize
      )}px, transparent ${Math.max(2, dotSize + 1)}px)`;
      const patternSize = `${dotSize * 8}px ${dotSize * 8}px`;
      return `<div style="${shell};background-image:${pattern};background-size:${patternSize}">
        <div style="max-width:85%;background:#ffe4d6;border-radius:14px;padding:10px 12px;line-height:1.2">${title}${subtitle}${body}</div>
      </div>`;
    }

    if (s.template === "t3") {
      return `<div style="${shell}">
        <div style="width:90%;height:90%;display:flex;flex-direction:column;gap:10px;justify-content:center;align-items:center">
          <div style="width:100%;height:14px;background:${
            s.color || "#222"
          };border-radius:8px;opacity:.25"></div>
          <div style="display:flex;flex-direction:column;gap:6px;align-items:center">${title}${subtitle}${body}</div>
        </div>
      </div>`;
    }

    return `<div style="${shell}"><div style="max-width:90%;max-height:90%;overflow:hidden">${title}${subtitle}${body}</div></div>`;
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
    return `<div class="email-thumb" style="width:650px;border:2px dashed #645774;border-radius:12px;background:#fff;overflow:hidden;padding:8px">
      <div style="${base}">
        <h1 style="margin:0 0 8px">${s.title || ""}</h1>
        <h3 style="margin:0 0 14px;opacity:.85">${s.subtitle || ""}</h3>
        ${img}
        <p style="margin:0 0 16px">${s.body || ""}</p>
        ${btn(s.ctaText, s.ctaUrl)}
      </div>
    </div>`;
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
    return `<div class="lp-thumb" style="width:1000px;border:2px dashed #645774;border-radius:12px;background:#fff;overflow:hidden;padding:8px">
      <div style="${shell}">
        <h1 style="margin:0 0 8px">${s.title || ""}</h1>
        <h3 style="margin:0 0 14px;opacity:.85">${s.subtitle || ""}</h3>
        ${img}
        <p style="margin:0 0 16px">${s.body || ""}</p>
        ${btn(s.ctaText, s.ctaUrl)}
        ${leadForm(s.leadTitle, s.leadBtn, s.accent)}
      </div>
    </div>`;
  };

  // ---------- Card factory with stable scaling ----------
  const BOX = 260,
    PAD = 10;

  function fitInto(frame, scaledEl) {
    // frame is 260x260 fixed slot; scaledEl is absolutely positioned wrapper
    const w = scaledEl.offsetWidth || 1;
    const h = scaledEl.offsetHeight || 1;
    let scale = Math.min((BOX - PAD * 2) / w, (BOX - PAD * 2) / h);
    scale = Math.max(0.1, Math.min(scale, 1.2));
    const left = (BOX - w * scale) / 2;
    const top = (BOX - h * scale) / 2;
    scaledEl.style.transform = `scale(${scale})`;
    scaledEl.style.left = `${left}px`;
    scaledEl.style.top = `${top}px`;
  }

  function makeCard(rawHtml, onClose) {
    const card = document.createElement("div");
    card.className = "campaign-card";

    const frame = document.createElement("div");
    frame.className = "slot";
    frame.style.position = "relative";
    frame.style.width = BOX + "px";
    frame.style.height = BOX + "px";
    frame.style.overflow = "hidden";

    // wrapper that will be scaled (keeps close button out of scaling)
    const scaledWrap = document.createElement("div");
    scaledWrap.style.position = "absolute";
    scaledWrap.style.transformOrigin = "top left";
    // אם אתה לא רוצה שיהיו לחיצות בתצוגה המוקטנת:
    // scaledWrap.style.pointerEvents = "none";

    const tmp = document.createElement("div");
    tmp.innerHTML = rawHtml;
    const content = tmp.firstElementChild;
    scaledWrap.appendChild(content);

    // Re-fit on images load
    content.querySelectorAll("img").forEach((img) => {
      img.addEventListener("load", () => fitInto(frame, scaledWrap), {
        once: true,
      });
    });

    // Re-fit on any size change
    const ro = new ResizeObserver(() => fitInto(frame, scaledWrap));
    ro.observe(content);

    // Close button (not scaled)
    const close = document.createElement("button");
    close.type = "button";
    close.textContent = "×";
    close.className = "card-close";
    close.title = "Remove from LIVE";
    Object.assign(close.style, {
      position: "absolute",
      top: "6px",
      right: "6px",
      width: "24px",
      height: "24px",
      lineHeight: "20px",
      borderRadius: "50%",
      background: "#111",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      zIndex: 5,
      boxShadow: "0 2px 6px rgba(0,0,0,.25)",
    });
    close.addEventListener("click", (e) => {
      e.stopPropagation();
      try {
        onClose && onClose();
      } finally {
        ro.disconnect();
      }
    });

    frame.appendChild(scaledWrap);
    frame.appendChild(close);
    card.appendChild(frame);

    // First fit
    requestAnimationFrame(() => fitInto(frame, scaledWrap));
    // Also refit on window resize
    window.addEventListener("resize", () => fitInto(frame, scaledWrap), {
      passive: true,
    });

    return card;
  }

  function makePlaceholder() {
    const card = document.createElement("div");
    card.className = "campaign-card";
    const frame = document.createElement("div");
    frame.className = "slot placeholder-surface";
    frame.style.width = BOX + "px";
    frame.style.height = BOX + "px";
    card.appendChild(frame);
    return card;
  }

  // ---------- Populate Banners (max 3) ----------
  const banners = getBanners() || {};
  const entries = Object.entries(banners); // keep insertion order
  let bannerCount = 0;
  for (const [key, data] of entries) {
    if (data && data.active && bannerCount < 3) {
      gridBanners.appendChild(
        makeCard(bannerThumbHTML(data, data.size || key), () => {
          setBannerActive(key, false); // key per banner
          toast("Removed from LIVE");
          renderDashboard(username);
        })
      );
      bannerCount++;
    }
  }
  while (bannerCount < 3) {
    gridBanners.appendChild(makePlaceholder());
    bannerCount++;
  }

  // ---------- Populate Emails (max 3) ----------
  const M = getMarketingPage();
  const marketingList = Array.isArray(M) ? M : M ? [M] : [];
  let emailCount = 0;
  marketingList.forEach((m, idx) => {
    if (m && m.active && emailCount < 3) {
      gridEmails.appendChild(
        makeCard(emailThumbHTML(m), () => {
          // אם הפונקציה שלך מקבלת רק boolean – הפרמטר הנוסף יתעלם
          setMarketingActive(idx, false);
          toast("Removed from LIVE");
          renderDashboard(username);
        })
      );
      emailCount++;
    }
  });
  while (emailCount < 3) {
    gridEmails.appendChild(makePlaceholder());
    emailCount++;
  }

  // ---------- Populate Landings (max 3) ----------
  const L = getLandingPage();
  const landingList = Array.isArray(L) ? L : L ? [L] : [];
  let landCount = 0;
  landingList.forEach((l, idx) => {
    if (l && l.active && landCount < 3) {
      gridLandings.appendChild(
        makeCard(landingThumbHTML(l), () => {
          setLandingActive(idx, false);
          toast("Removed from LIVE");
          renderDashboard(username);
        })
      );
      landCount++;
    }
  });
  while (landCount < 3) {
    gridLandings.appendChild(makePlaceholder());
    landCount++;
  }

  container.append(hero, campaigns);
  app.append(header, container, renderFooter());
}

import { loadStyle } from "./utils.js";
import { renderHeader } from "./header.js";
import { renderDashboard } from "./dashboard.js";
import { renderLogin } from "./login.js";
import { renderMarketingPage } from "./marketing.js";
import { renderBannerEditor } from "./bannerEditor.js";
import { renderFooter } from "./footer.js";

import {
  clearLoggedInUser,
  getLandingPage,
  saveLandingPage,
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

export function renderLandingPage(username) {
  loadStyle("./styles/main.css");

  const app = document.getElementById("app");
  app.innerHTML = "";

  // Header
  const header = renderHeader(
  username,
  (key) => {        // onNavigate
    setCurrentPage(key);
    switch (key) {
      case "dashboard": renderDashboard(username); break;
      case "banners":   renderBannerEditor(username); break;
      case "marketing": renderMarketingPage(username); break;
      case "landing":   renderLandingPage(username); break;
      default:          renderDashboard(username);
    }
  },
  () => {           // onLogout
    clearLoggedInUser();
    clearCurrentPage();
    renderLogin();
  },
   "landing"
);
  app.appendChild(header);

  // Layout
  const container = document.createElement("div");
  container.className = "landing-container";

  const controls = document.createElement("div");
  controls.className = "section";
  controls.innerHTML = `
    <h2 style="margin-bottom:10px">Landing Page Builder</h2>
    <p style="opacity:.85;margin:0 0 12px">תצוגה חיה ושמירה אוטומטית</p>

    <div class="form-grid">
      <div class="field"><label>Template</label>
        <select id="tpl">
          <option value="t1">Template 1 – Clean</option>
          <option value="t2">Template 2 – Hero</option>
          <option value="t3">Template 3 – Split</option>
        </select>
      </div>

      <div class="field"><label>Main title</label>
        <input id="title" placeholder="Bannerist helps you launch faster"/></div>

      <div class="field"><label>Subtitle</label>
        <input id="subtitle" placeholder="Create and manage ads, emails & landings in minutes."/></div>

      <div class="field"><label>Paragraph</label>
        <textarea id="body" placeholder="Design quickly, preview instantly, and save your work locally."></textarea></div>

      <div class="field"><label>Hero Image URL</label>
        <input id="imgUrl" placeholder="https://…"/></div>

      <div class="field"><label>CTA Text</label>
        <input id="ctaText" placeholder="Start free"/></div>

      <div class="field"><label>CTA URL</label>
        <input id="ctaUrl" placeholder="https://example.com"/></div>

      <div class="field"><label>Background</label>
        <input id="bg" type="color"/></div>

      <div class="field"><label>Text color</label>
        <input id="color" type="color"/></div>

      <div class="field"><label>Accent color (CTA)</label>
        <input id="accent" type="color"/></div>

      <div class="field"><label>Font family</label>
        <select id="font">
          <option value="system-ui, -apple-system, Segoe UI, Roboto">System</option>
          <option value="Georgia, serif">Serif</option>
          <option value="Inter, Arial, sans-serif">Sans (Inter/Arial)</option>
          <option value="'Courier New', monospace">Mono</option>
        </select>
      </div>
    </div>

    <h3 style="margin:16px 0 8px">Lead Form</h3>
    <div class="form-grid">
      <div class="field"><label>Form Title</label>
        <input id="leadTitle" placeholder="Stay updated"/></div>
      <div class="field"><label>Submit Button</label>
        <input id="leadBtn" placeholder="Sign Up"/></div>
    </div>

    <div class="actions">
      <button id="go-live" class="btn btn--primary">Go live</button>
      <button id="reset"  class="btn btn--ghost">Reset</button>
    </div>
  `;

  const preview = document.createElement("div");
  preview.className = "section landing-preview";
  preview.innerHTML = `
    <div class="lp-stage" id="lp-stage">
      <div id="canvas" class="lp-canvas placeholder-surface" style="width:1000px"></div>
    </div>
  `;

  container.append(controls, preview);
  app.append(header, container, renderFooter());

  // State
  const DEF = {
    tpl: "t1",
    title: "",
    subtitle: "",
    body: "",
    imgUrl: "",
    ctaText: "",
    ctaUrl: "",
    bg: "",
    color: "",
    accent: "",
    font: "system-ui, -apple-system, Segoe UI, Roboto",
    leadTitle: "",
    leadBtn: "",
  };
  const state = Object.assign({}, DEF, getLandingPage() || {});

  const els = {
    tpl: controls.querySelector("#tpl"),
    title: controls.querySelector("#title"),
    subtitle: controls.querySelector("#subtitle"),
    body: controls.querySelector("#body"),
    imgUrl: controls.querySelector("#imgUrl"),
    ctaText: controls.querySelector("#ctaText"),
    ctaUrl: controls.querySelector("#ctaUrl"),
    bg: controls.querySelector("#bg"),
    color: controls.querySelector("#color"),
    accent: controls.querySelector("#accent"),
    font: controls.querySelector("#font"),
    leadTitle: controls.querySelector("#leadTitle"),
    leadBtn: controls.querySelector("#leadBtn"),
    stage: preview.querySelector("#lp-stage"),
    canvas: preview.querySelector("#canvas"),
    goLive: controls.querySelector("#go-live"),
    reset: controls.querySelector("#reset"),
  };

  Object.entries(state).forEach(([k, v]) => {
    if (els[k] && v) els[k].value = v;
  });

  const btn = (text, url, accent) =>
    `<a href="${url || "#"}" style="
      display:inline-block;padding:12px 18px;border-radius:10px;
      background:${
        accent || "#2d89ef"
      };color:#fff;text-decoration:none;font-weight:700">
      ${text || "CTA"}
    </a>`;

  const leadForm = (title, btnText, accent) => `
    <form onsubmit="return false" style="margin-top:16px; display:grid; gap:10px">
      <h3 style="margin:0 0 6px">${title || ""}</h3>
      <input placeholder="Full name" style="padding:10px 12px;border-radius:10px;border:2px solid #645774"/>
      <input type="email" placeholder="Email" style="padding:10px 12px;border-radius:10px;border:2px solid #645774"/>
      <button type="submit" style="padding:10px 14px;border:none;border-radius:10px;background:${
        accent || "#2d89ef"
      };color:#fff;font-weight:700;cursor:pointer">
        ${btnText || "Submit"}
      </button>
    </form>
  `;

  function tplHTML(s) {
    const shell = `
      background:${s.bg || "transparent"}; color:${s.color || "#333"};
      font-family:${s.font}; width:100%; max-width:1000px; margin:0 auto;
      line-height:1.5; padding:18px;
    `;
    const img = s.imgUrl
      ? `<img src="${s.imgUrl}" alt="" style="max-width:100%;display:block;margin:0 auto 14px;border-radius:12px"/>`
      : "";

    if (s.bg) els.canvas.classList.remove("placeholder-surface");
    else els.canvas.classList.add("placeholder-surface");

    if (s.tpl === "t2") {
      return `
        <div style="${shell}">
          <div style="background:rgba(0,0,0,.05);border-radius:12px;padding:16px;text-align:center;margin-bottom:14px">
            ${
              img ||
              `<div style="height:220px;display:grid;place-items:center;color:#888">Hero image</div>`
            }
          </div>
          <h1 style="margin:0 0 8px">${s.title || ""}</h1>
          <p style="margin:0 0 16px">${s.body || ""}</p>
          ${btn(s.ctaText, s.ctaUrl, s.accent)}
          ${leadForm(s.leadTitle, s.leadBtn, s.accent)}
        </div>
      `;
    }

    if (s.tpl === "t3") {
      return `
        <div style="${shell}">
          <div style="display:grid;grid-template-columns:1.2fr 1fr;gap:18px">
            <div>
              <h1 style="margin:0 0 8px">${s.title || ""}</h1>
              <h3 style="margin:0 0 12px;opacity:.85">${s.subtitle || ""}</h3>
              <p style="margin:0 0 16px">${s.body || ""}</p>
              ${btn(s.ctaText, s.ctaUrl, s.accent)}
              ${leadForm(s.leadTitle, s.leadBtn, s.accent)}
            </div>
            <div>
              ${
                img ||
                `<div style="height:260px;display:grid;place-items:center;color:#888;background:rgba(0,0,0,.05);border-radius:12px">Image</div>`
              }
            </div>
          </div>
        </div>
      `;
    }

    // t1
    return `
      <div style="${shell}">
        <h1 style="margin:0 0 8px">${s.title || ""}</h1>
        <h3 style="margin:0 0 14px;opacity:.85">${s.subtitle || ""}</h3>
        ${img}
        <p style="margin:0 0 16px">${s.body || ""}</p>
        ${btn(s.ctaText, s.ctaUrl, s.accent)}
        ${leadForm(s.leadTitle, s.leadBtn, s.accent)}
      </div>
    `;
  }

  function render() {
    els.canvas.innerHTML = tplHTML(state);
    fitLanding();
  }

  function fitLanding() {
    const stage = els.stage.getBoundingClientRect();
    const inner = els.canvas.firstElementChild;
    if (!inner) return;
    els.canvas.style.transformOrigin = "top left";
    const pad = 16;
    requestAnimationFrame(() => {
      const contentH = inner.getBoundingClientRect().height;
      const scaleW = (stage.width - pad) / 1000;
      const scaleH = (stage.height - pad) / contentH;
      let scale = Math.min(scaleW, scaleH);
      if (!isFinite(scale) || scale <= 0) scale = 1;
      if (scale > 1.0) scale = 1.0;
      els.canvas.style.transform = `scale(${scale})`;
    });
  }

  function persist() {
    saveLandingPage(state);
  }

  Object.keys(state).forEach((k) => {
    if (!els[k]) return;
    els[k].addEventListener("input", () => {
      state[k] = els[k].value;
      persist();
      render();
      toast("Saved");
    });
  });

  els.reset.addEventListener("click", () => {
    Object.assign(state, { ...DEF });
    Object.keys(state).forEach((k) => {
      if (els[k]) els[k].value = state[k] || "";
    });
    persist();
    render();
    toast("Reset");
  });

  els.goLive.addEventListener("click", () => {
    state.active = true;
    saveLandingPage(state);
    setLandingActive(true);
    toast("Published");
    // איפוס שדות התוכן בלבד
    [
      "title",
      "subtitle",
      "body",
      "imgUrl",
      "ctaText",
      "ctaUrl",
      "bg",
      "color",
      "accent",
      "leadTitle",
      "leadBtn",
    ].forEach((k) => {
      state[k] = "";
      if (els[k]) els[k].value = "";
    });
    render();
  });

  window.addEventListener("resize", fitLanding);
  render();
}

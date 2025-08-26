import { loadStyle } from "./utils.js";
import { renderHeader } from "./header.js";
import { renderDashboard } from "./dashboard.js";
import { renderLogin } from "./login.js";
import { renderMarketingPage } from "./marketing.js";
import { renderBannerEditor } from "./bannerEditor.js";
import { renderFooter } from "./footer.js";

import {
  clearLoggedInUser,
  getLandingDraft,
  saveLandingDraft,
  addLandingCampaign,
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
  loadStyle("./styles/landingPage.css");

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
    "landing"
  );
  app.appendChild(header);

  // Layout
  const container = document.createElement("div");
  container.className = "landing-container";

  const form = document.createElement("div");
  form.className = "section";
  form.innerHTML = `
    <h2>Landing Page Builder</h2>

    <div class="form-grid">
      <div class="field">
        <label>Template</label>
        <select id="tpl">
          <option value="t1">Template 1 – Simple</option>
          <option value="t2">Template 2 – Hero</option>
          <option value="t3">Template 3 – Split</option>
        </select>
      </div>

      <div class="field"><label>Main title</label>
        <input id="title" placeholder="Bannerist helps you launch fast"/></div>

      <div class="field"><label>Subtitle</label>
        <input id="subtitle" placeholder="Create and manage ads, emails, and more"/></div>

      <div class="field"><label>Paragraph</label>
        <textarea id="body" placeholder="Design quickly, preview instantly, and save your work locally."></textarea></div>

      <div class="field"><label>Hero Image URL</label>
        <input id="imgUrl" placeholder="https://..."/></div>

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

      <div class="field">
        <label>Font family</label>
        <select id="font">
          <option value="system-ui, -apple-system, Segoe UI, Roboto">System</option>
          <option value="Georgia, serif">Serif</option>
          <option value="Inter, Arial, sans-serif">Sans (Inter/Arial)</option>
          <option value="'Courier New', monospace">Mono</option>
        </select>
      </div>

      <div class="field"><label>Lead Form Title</label>
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
    <h3 style="margin-bottom:10px">Live Preview</h3>
    <div class="lp-stage" id="lp-stage">
      <div id="lp-wrap">
        <div class="lp-canvas placeholder-surface" id="lp" style="width:1000px"></div>
      </div>
    </div>
  `;

  container.append(form, preview);
  app.append(header, container, renderFooter());

  // ===== State (draft) =====
  const DEF = {
    tpl: "t3",
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
  const state = Object.assign({}, DEF, getLandingDraft() || {});

  const els = {
    tpl: form.querySelector("#tpl"),
    title: form.querySelector("#title"),
    subtitle: form.querySelector("#subtitle"),
    body: form.querySelector("#body"),
    imgUrl: form.querySelector("#imgUrl"),
    ctaText: form.querySelector("#ctaText"),
    ctaUrl: form.querySelector("#ctaUrl"),
    bg: form.querySelector("#bg"),
    color: form.querySelector("#color"),
    accent: form.querySelector("#accent"),
    font: form.querySelector("#font"),
    leadTitle: form.querySelector("#leadTitle"),
    leadBtn: form.querySelector("#leadBtn"),
    stage: preview.querySelector("#lp-stage"),
    wrap: preview.querySelector("#lp-wrap"),
    lp: preview.querySelector("#lp"),
    goLive: form.querySelector("#go-live"),
    reset: form.querySelector("#reset"),
  };

  // preload inputs
  Object.entries(state).forEach(([k, v]) => {
    if (els[k] && v) els[k].value = v;
  });

  // HTML for templates
  const btn = (text, url, accent) =>
    `<a href="${url || "#"}" style="display:inline-block;padding:12px 18px;border-radius:10px;background:${accent || "#2d89ef"};color:#fff;text-decoration:none;font-weight:700">${text || "CTA"}</a>`;

  const leadForm = (title, btnText, accent) => `
    <form onsubmit="return false" style="margin-top:16px; display:grid; gap:10px">
      <h3 style="margin:0 0 6px">${title || ""}</h3>
      <input placeholder="Full name" style="padding:10px 12px;border-radius:10px;border:2px solid #645774"/>
      <input type="email" placeholder="Email" style="padding:10px 12px;border-radius:10px;border:2px solid #645774"/>
      <button type="submit" style="padding:10px 14px;border:none;border-radius:10px;background:${accent || "#2d89ef"};color:#fff;font-weight:700;cursor:pointer">${btnText || "Submit"}</button>
    </form>`;

  function lpHTML(s) {
    const shell = `background:${s.bg || "transparent"}; color:${s.color || "#333"}; font-family:${s.font}; width:1000px; padding:18px; line-height:1.5;`;
    const img = s.imgUrl
      ? `<img src="${s.imgUrl}" alt="" style="max-width:100%;display:block;margin:0 auto 14px;border-radius:12px"/>`
      : "";

    if (s.tpl === "t2") {
      return `<div style="${shell}">
        <div style="padding:0 0 14px;text-align:center;background:rgba(0,0,0,.03);border-radius:8px;">
          ${img || `<div style="height:220px;display:grid;place-items:center;color:#888">Hero</div>`}
        </div>
        <h1 style="margin:0 0 10px">${s.title || ""}</h1>
        <p style="margin:0 0 16px">${s.body || ""}</p>
        ${btn(s.ctaText, s.ctaUrl, s.accent)}
        ${leadForm(s.leadTitle, s.leadBtn, s.accent)}
      </div>`;
    }

    if (s.tpl === "t3") {
      return `<div style="${shell}">
        <div style="display:grid;grid-template-columns:1.1fr .9fr;gap:16px;align-items:center">
          <div>
            <h1 style="margin:0 0 10px">${s.title || ""}</h1>
            <p style="margin:0 0 14px;opacity:.9">${s.subtitle || ""}</p>
            <p style="margin:0 0 16px">${s.body || ""}</p>
            ${btn(s.ctaText, s.ctaUrl, s.accent)}
            ${leadForm(s.leadTitle, s.leadBtn, s.accent)}
          </div>
          <div>${img || `<div style="height:300px;border-radius:12px;background:rgba(0,0,0,.06)"></div>`}</div>
        </div>
      </div>`;
    }

    // t1
    return `<div style="${shell}">
      <h1 style="margin:0 0 10px">${s.title || ""}</h1>
      <h3 style="margin:0 0 14px;opacity:.85">${s.subtitle || ""}</h3>
      ${img}
      <p style="margin:0 0 16px">${s.body || ""}</p>
      ${btn(s.ctaText, s.ctaUrl, s.accent)}
      ${leadForm(s.leadTitle, s.leadBtn, s.accent)}
    </div>`;
  }

  function render() {
    const s = state;
    if (s.bg) els.lp.classList.remove("placeholder-surface");
    else els.lp.classList.add("placeholder-surface");
    els.lp.innerHTML = lpHTML(s);
    fitLP();
  }

  // מרכוז אמיתי בתוך הריבוע הלבן
  function fitLP() {
    const stage = els.stage.getBoundingClientRect();
    const inner = els.lp.firstElementChild;
    if (!inner) return;

    const pad = 16;
    const baseW = 1000;

    // גובה התוכן בפועל (לפני scale)
    const contentH = inner.getBoundingClientRect().height;

    // חישוב scale כך שייכנס לרוחב/גובה
    let scale = Math.min(
      (stage.width - pad) / baseW,
      (stage.height - pad) / contentH
    );
    if (!isFinite(scale) || scale <= 0) scale = 1;
    if (scale > 1) scale = 1;

    // מגדירים ל-wrap את הגודל הסופי (אחרי scale) – כדי שה-grid ימקד במדויק
    els.wrap.style.width = baseW * scale + "px";
    els.wrap.style.height = contentH * scale + "px";

    // ה-canvas נשאר בגודל המקורי ומוקטן פנימה
    els.lp.style.transformOrigin = "top left";
    els.lp.style.transform = `scale(${scale})`;
  }

  function persist() {
    saveLandingDraft(state);
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
    Object.assign(state, { ...DEF, font: state.font || DEF.font });
    Object.keys(state).forEach((k) => {
      if (els[k]) els[k].value = state[k] || "";
    });
    persist();
    render();
    toast("Reset");
  });

  els.goLive.addEventListener("click", () => {
    addLandingCampaign({ ...state, active: true });
    toast("Published");
  });

  window.addEventListener("resize", fitLP);
  render();
}

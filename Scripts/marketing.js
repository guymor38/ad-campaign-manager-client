import { loadStyle } from "./utils.js";
import { renderHeader } from "./header.js";
import { renderDashboard } from "./dashboard.js";
import { renderLogin } from "./login.js";
import { renderLandingPage } from "./landingPage.js";
import { renderBannerEditor } from "./bannerEditor.js";
import {
  clearLoggedInUser,
  getMarketingPage,
  saveMarketingPage,
  setMarketingActive,
} from "./storage.js";

function toast(msg, warn = false) {
  const t = document.createElement("div");
  t.className = "toast" + (warn ? " warn" : "");
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1600);
}

export function renderMarketingPage(username) {
  loadStyle("./styles/main.css");

  const app = document.getElementById("app");
  app.innerHTML = "";

  // Header / Nav
  const header = renderHeader(
    username,
    (key) => {
      if (key === "dashboard") renderDashboard(username);
      else if (key === "banners") renderBannerEditor(username);
      else if (key === "marketing") renderMarketingPage(username);
      else if (key === "landing") renderLandingPage(username);
    },
    () => {
      clearLoggedInUser();
      renderLogin();
    }
  );
  app.appendChild(header);

  // Layout
  const container = document.createElement("div");
  container.className = "marketing-container";

  const controls = document.createElement("div");
  controls.className = "panel";
  controls.innerHTML = `
    <h2>Email Builder</h2>
    <p style="opacity:.85;margin:6px 0 12px">רוחב פריוויו: 650px • שמירה אוטומטית</p>

    <div class="marketing-editor">
      <div class="field">
        <label>Template</label>
        <select id="tpl">
          <option value="t1">Template 1 – Clean</option>
          <option value="t2">Template 2 – Hero</option>
          <option value="t3">Template 3 – Card</option>
        </select>
      </div>

      <div class="field"><label>Title</label>
        <input id="title" placeholder="Your great headline"/></div>

      <div class="field"><label>Subtitle</label>
        <input id="subtitle" placeholder="Sub headline goes here"/></div>

      <div class="field"><label>Body</label>
        <textarea id="body" placeholder="Body copy for your email. Keep it short and clear."></textarea></div>

      <div class="field"><label>Image URL</label>
        <input id="imgUrl" placeholder="https://..."/></div>

      <div class="field"><label>Button text</label>
        <input id="ctaText" placeholder="Learn more"/></div>

      <div class="field"><label>Button URL</label>
        <input id="ctaUrl" placeholder="https://example.com"/></div>

      <div class="field"><label>Background</label>
        <input id="bg" type="color"/></div>

      <div class="field"><label>Text color</label>
        <input id="color" type="color"/></div>

      <div class="field"><label>Accent color (button)</label>
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
    </div>

    <div class="actions">
      <button id="go-live" class="btn btn--primary">Go live</button>
      <button id="reset"  class="btn btn--ghost">Reset</button>
    </div>
  `;

  const preview = document.createElement("div");
  preview.className = "panel";
  preview.innerHTML = `
    <h3 style="margin-bottom:10px">Live Preview</h3>
    <div class="email-stage" id="email-stage">
      <div class="email-canvas placeholder-surface" id="email" style="width:650px"></div>
    </div>
  `;

  container.append(controls, preview);
  app.appendChild(container);

  // ===== State =====
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
  };
  const state = Object.assign({}, DEF, getMarketingPage() || {});

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
    stage: preview.querySelector("#email-stage"),
    email: preview.querySelector("#email"),
    goLive: controls.querySelector("#go-live"),
    reset: controls.querySelector("#reset"),
  };

  // preload to inputs (only if value exists)
  Object.entries(state).forEach(([k, v]) => {
    if (els[k] && v) els[k].value = v;
  });

  // HTML for templates
  function emailHTML(s) {
    const baseWrap = `
      background:${s.bg || "transparent"}; color:${s.color || "#333"};
      font-family:${s.font}; line-height:1.5; padding:18px;
    `;
    const img = s.imgUrl
      ? `<img src="${s.imgUrl}" alt="" style="max-width:100%;display:block;margin:0 auto 12px;border-radius:8px"/>`
      : "";
    const btn = (text, url) => `
      <a href="${url || "#"}" 
         style="display:inline-block;padding:10px 16px;border-radius:8px;text-decoration:none;
                background:${s.accent || "#2d89ef"};color:#fff;font-weight:600">
        ${text || "Button"}
      </a>`;

    if (s.tpl === "t2") {
      return `
        <div style="${baseWrap}">
          <div style="padding:0 0 14px; text-align:center; background:rgba(0,0,0,.03); border-radius:8px;">
            ${
              img ||
              `<div style="height:180px; display:grid; place-items:center; color:#888">Hero</div>`
            }
          </div>
          <h1 style="margin:0 0 8px">${s.title || ""}</h1>
          <p style="margin:0 0 16px">${s.body || ""}</p>
          ${btn(s.ctaText, s.ctaUrl)}
        </div>
      `;
    }

    if (s.tpl === "t3") {
      return `
        <div style="${baseWrap}">
          <div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.08)">
            ${img}
            <h2 style="margin:0 0 8px">${s.title || ""}</h2>
            <p style="margin:0 0 14px;opacity:.9">${s.subtitle || ""}</p>
            <p style="margin:0 0 16px">${s.body || ""}</p>
            ${btn(s.ctaText, s.ctaUrl)}
          </div>
        </div>
      `;
    }

    // t1
    return `
      <div style="${baseWrap}">
        <h1 style="margin:0 0 8px">${s.title || ""}</h1>
        <h3 style="margin:0 0 14px;opacity:.85">${s.subtitle || ""}</h3>
        ${img}
        <p style="margin:0 0 16px">${s.body || ""}</p>
        ${btn(s.ctaText, s.ctaUrl)}
      </div>
    `;
  }

  function render() {
    const s = state;
    if (s.bg) els.email.classList.remove("placeholder-surface");
    else els.email.classList.add("placeholder-surface");
    els.email.innerHTML = emailHTML(s);
    fitEmail();
  }

  function fitEmail() {
    const stage = els.stage.getBoundingClientRect();
    const inner = els.email.firstElementChild;
    if (!inner) return;
    els.email.style.transformOrigin = "top left";
    const pad = 16;
    // חישוב אחרי שה־DOM עודכן
    requestAnimationFrame(() => {
      const contentH = inner.getBoundingClientRect().height;
      const scaleW = (stage.width - pad) / 650;
      const scaleH = (stage.height - pad) / contentH;
      let scale = Math.min(scaleW, scaleH);
      if (!isFinite(scale) || scale <= 0) scale = 1;
      if (scale > 1.4) scale = 1.4;
      els.email.style.transform = `scale(${scale})`;
    });
  }

  function persist() {
    saveMarketingPage(state);
  }

  // inputs
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
    state.active = true;
    saveMarketingPage(state);
    setMarketingActive(true);
    toast("Published");
    // איפוס מקומי לשדות התוכן בלבד
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
    ].forEach((k) => {
      state[k] = "";
      if (els[k]) els[k].value = "";
    });
    render();
  });

  window.addEventListener("resize", fitEmail);
  render();
}

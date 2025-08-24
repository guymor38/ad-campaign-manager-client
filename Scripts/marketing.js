import { loadStyle, showToast, el } from "./utils.js";
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

export function renderMarketingPage(username) {
  loadStyle("./styles/main.css");

  const app = document.getElementById("app");
  app.innerHTML = "";

  // Header
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
  app.appendChild(header);

  // Layout
  const container = el("div", "marketing-container");
  const controls = el("div", "panel");
  controls.innerHTML = `
    <h2>Email Builder</h2>
    <p style="opacity:.85;margin:6px 0 12px">רוחב קבוע 650px · שמירה אוטומטית</p>

    <div class="marketing-editor">
      <div class="field">
        <label>Template</label>
        <select id="tpl">
          <option value="t1">Template 1 – Clean</option>
          <option value="t2">Template 2 – Hero</option>
          <option value="t3">Template 3 – Card</option>
        </select>
      </div>

      <div class="field"><label>Title</label><input id="title" placeholder="Your great headline"/></div>
      <div class="field"><label>Subtitle</label><input id="subtitle" placeholder="Sub headline goes here"/></div>
      <div class="field"><label>Body</label><textarea id="body" placeholder="Body copy for your email. Keep it short and clear."></textarea></div>

      <div class="field"><label>Image URL</label><input id="imgUrl" placeholder="https://..."/></div>
      <div class="field"><label>Button text</label><input id="ctaText" placeholder="Learn more"/></div>
      <div class="field"><label>Button URL</label><input id="ctaUrl" placeholder="https://example.com"/></div>

      <div class="field"><label>Background</label><input id="bg" type="color"/></div>
      <div class="field"><label>Text color</label><input id="color" type="color"/></div>
      <div class="field"><label>Accent color (button)</label><input id="accent" type="color"/></div>

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

    <div class="actions form-actions">
      <button id="go" class="btn btn--primary" type="button">Go live</button>
      <button id="reset" class="btn btn--ghost" type="button">Reset</button>
    </div>
  `;

  const preview = el("div", "panel");
  preview.innerHTML = `
    <h3 style="margin-bottom:10px">Live Preview (650px)</h3>
    <div class="email-canvas placeholder-surface" id="email"></div>
  `;

  container.append(controls, preview);
  app.appendChild(container);

  // Refs
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
    email: preview.querySelector("#email"),
    go: controls.querySelector("#go"),
    reset: controls.querySelector("#reset"),
  };

  // Helpers
  const DEMO = {
    font: "system-ui, -apple-system, Segoe UI, Roboto",
  };

  const readForm = () => ({
    tpl: els.tpl.value,
    title: els.title.value.trim(),
    subtitle: els.subtitle.value.trim(),
    body: els.body.value.trim(),
    imgUrl: els.imgUrl.value.trim(),
    ctaText: els.ctaText.value.trim(),
    ctaUrl: els.ctaUrl.value.trim(),
    bg: els.bg.value || "",
    color: els.color.value || "",
    accent: els.accent.value || "",
    font: els.font.value || DEMO.font,
  });

  const emailHTML = (s) => {
    const base = `
      background:${s.bg || "transparent"}; color:${s.color || "#333"};
      font-family:${s.font};
      width:650px; margin:0 auto; line-height:1.5; padding:18px;
    `;
    const img = s.imgUrl
      ? `<img src="${s.imgUrl}" alt="" style="max-width:100%;display:block;margin:0 auto 12px;border-radius:8px"/>`
      : "";
    const btn = (text, url) => `<a href="${url || "#"}"
      style="display:inline-block;padding:10px 16px;border-radius:8px;text-decoration:none;
             background:${s.accent || "#2d89ef"};color:#fff;font-weight:600">${
      text || "Button"
    }</a>`;

    if (s.tpl === "t2") {
      return `<div style="${base}">
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
    }
    if (s.tpl === "t3") {
      return `<div style="${base}">
        <div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.08)">
          ${img}
          <h2 style="margin:0 0 8px">${s.title || ""}</h2>
          <p style="margin:0 0 14px;opacity:.9">${s.subtitle || ""}</p>
          <p style="margin:0 0 16px">${s.body || ""}</p>
          ${btn(s.ctaText, s.ctaUrl)}
        </div>
      </div>`;
    }
    return `<div style="${base}">
      <h1 style="margin:0 0 8px">${s.title || ""}</h1>
      <h3 style="margin:0 0 14px;opacity:.85">${s.subtitle || ""}</h3>
      ${img}
      <p style="margin:0 0 16px">${s.body || ""}</p>
      ${btn(s.ctaText, s.ctaUrl)}
    </div>`;
  };

  function render() {
    const s = readForm();
    const elx = els.email;
    if (s.bg) elx.classList.remove("placeholder-surface");
    else elx.classList.add("placeholder-surface");
    elx.innerHTML = emailHTML(s);
  }

  function persist(active = false) {
    const data = { ...readForm() };
    if (active) data.active = true;
    saveMarketingPage(data);
  }

  function resetForm() {
    ["title", "subtitle", "body", "imgUrl", "ctaText", "ctaUrl"].forEach(
      (id) => (els[id].value = "")
    );
    els.bg.value = "";
    els.color.value = "";
    els.accent.value = "";
    render();
  }

  // Load existing (שומר placeholder אם אין ערך)
  const saved = getMarketingPage() || {};
  els.tpl.value = saved.tpl || "t1";
  els.font.value = saved.font || DEMO.font;
  els.bg.value = saved.bg || "";
  els.color.value = saved.color || "";
  els.accent.value = saved.accent || "";
  render();

  // Events
  [
    "tpl",
    "title",
    "subtitle",
    "body",
    "imgUrl",
    "ctaText",
    "ctaUrl",
    "bg",
    "color",
    "accent",
    "font",
  ].forEach((k) =>
    els[k].addEventListener("input", () => {
      persist(false);
      render();
    })
  );

  els.go.addEventListener("click", () => {
    persist(true);
    setMarketingActive(true);
    showToast("Published email");
    resetForm();
  });

  els.reset.addEventListener("click", () => {
    resetForm();
    showToast("Reset");
  });
}

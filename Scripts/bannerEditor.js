import { loadStyle } from "./utils.js";
import { renderHeader } from "./header.js";
import { renderDashboard } from "./dashboard.js";
import { renderLogin } from "./login.js";
import { renderMarketingPage } from "./marketing.js";
import { renderLandingPage } from "./landingPage.js";
import {
  clearLoggedInUser,
  getBanner,
  saveBanner,
  resetBanner,
  resetAllBanners,
  setBannerActive,
} from "./storage.js";

function toast(msg, warn = false) {
  const t = document.createElement("div");
  t.className = "toast" + (warn ? " warn" : "");
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1600);
}

export function renderBannerEditor(username) {
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
  app.appendChild(header);

  // ===== Layout =====
  const container = document.createElement("div");
  container.className = "banner-editor-container";

  const controls = document.createElement("div");
  controls.className = "panel controls";
  controls.innerHTML = `
    <h2>Banner Editor</h2>

    <div class="field">
      <label>Size</label>
      <select id="size">
        <option value="250x250">250×250</option>
        <option value="300x600">300×600</option>
      </select>
    </div>

    <div class="field">
      <label>Template</label>
      <select id="template">
        <option value="t1">Template 1 – Pop-up Sale</option>
        <option value="t2">Template 2 – Dots Card</option>
        <option value="t3">Template 3 – Real Estate</option>
      </select>
    </div>

    <div class="field"><label>Headline</label>
      <input id="title" placeholder="POP-UP"/></div>

    <div class="field"><label>Subtitle / Date</label>
      <input id="subtitle" placeholder="sale or date"/></div>

    <div class="field"><label>Body (short)</label>
      <textarea id="body" placeholder="SUNDAY, MARCH 23 2025"></textarea></div>

    <div class="field"><label>Background</label>
      <input id="bg" type="color"/></div>

    <div class="field"><label>Text Color</label>
      <input id="color" type="color"/></div>

    <div class="field"><label>Font Size (px)</label>
      <input id="fontSize" type="number" min="12" max="64" placeholder="22"/></div>

    <div class="actions form-actions">
      <button id="go-live" class="btn btn--primary" type="button">Go live</button>
      <button id="reset" class="btn btn--ghost" type="button">Reset</button>
    </div>
  `;

  const preview = document.createElement("div");
  preview.className = "panel preview";
  preview.innerHTML = `
    <h3>Live Preview</h3>
    <div class="banner-frames">
      <div class="banner-frame">
        <div id="prev" class="banner-content tpl placeholder-surface"
             style="width:250px;height:250px"></div>
      </div>
    </div>
  `;

  container.append(controls, preview);
  app.appendChild(container);

  // ===== Refs =====
  const els = {
    size: controls.querySelector("#size"),
    template: controls.querySelector("#template"),
    title: controls.querySelector("#title"),
    subtitle: controls.querySelector("#subtitle"),
    body: controls.querySelector("#body"),
    bg: controls.querySelector("#bg"),
    color: controls.querySelector("#color"),
    fontSize: controls.querySelector("#fontSize"),
    goLive: controls.querySelector("#go-live"),
    reset: controls.querySelector("#reset"),
    prev: preview.querySelector("#prev"),
  };

  // helpers
  function collectCurrent() {
    return {
      template: els.template.value,
      title: els.title.value.trim(),
      subtitle: els.subtitle.value.trim(),
      body: els.body.value.trim(),
      bg: els.bg.value || "",
      color: els.color.value || "",
      fontSize: Number(els.fontSize.value) || 22,
      updatedAt: Date.now(),
    };
  }

  function setPrevSize(size) {
    if (size === "300x600") {
      els.prev.style.width = "300px";
      els.prev.style.height = "600px";
    } else {
      els.prev.style.width = "250px";
      els.prev.style.height = "250px";
    }
  }

  function loadFor(size) {
    setPrevSize(size);
    const s = getBanner(size) || {};
    els.template.value = s.template || "t1";
    els.title.value = s.title || "";
    els.subtitle.value = s.subtitle || "";
    els.body.value = s.body || "";
    if (s.bg) els.bg.value = s.bg; // לא דוחפים ריק
    if (s.color) els.color.value = s.color; // לא דוחפים ריק
    if (s.fontSize) els.fontSize.value = s.fontSize;
    render();
  }

  function applyToPreview(el, s) {
    if (s.bg) {
      el.classList.remove("placeholder-surface");
      el.style.background = s.bg;
    } else {
      el.classList.add("placeholder-surface");
      el.style.background = "transparent";
    }
    el.style.color = s.color || "#333";
    el.style.fontSize = (s.fontSize || 22) + "px";
    el.style.display = "grid";
    el.style.placeItems = "center";
    el.style.textAlign = "center";
    el.style.padding = "10px";

    const title = s.title
      ? `<div class="title"><strong>${s.title}</strong></div>`
      : "";
    const subtitle = s.subtitle
      ? `<div class="subtitle" style="opacity:.9">${s.subtitle}</div>`
      : "";
    const body = s.body
      ? `<div class="body" style="opacity:.95">${s.body}</div>`
      : "";

    el.innerHTML = `<div>${title}${subtitle}${body}</div>`;
  }

  function render() {
    const s = getBanner(els.size.value) || collectCurrent();
    applyToPreview(els.prev, s);
  }

  function persist() {
    saveBanner(els.size.value, collectCurrent());
  }

  // events
  [
    els.template,
    els.title,
    els.subtitle,
    els.body,
    els.bg,
    els.color,
    els.fontSize,
  ].forEach((inp) =>
    inp.addEventListener("input", () => {
      persist();
      render();
    })
  );

  els.size.addEventListener("change", () => loadFor(els.size.value));

  els.reset.addEventListener("click", () => {
    resetBanner(els.size.value);
    loadFor(els.size.value);
    toast("Reset");
  });

  els.goLive.addEventListener("click", () => {
    const size = els.size.value;
    const payload = collectCurrent();
    payload.active = true;
    saveBanner(size, payload);
    setBannerActive(size, true);
    toast("Published");

    // “איפוס” בלי לכתוב ריק לשדות צבע:
    els.title.value = "";
    els.subtitle.value = "";
    els.body.value = "";
    els.fontSize.value = "";

    // מעבר אוטומטי לגודל השני
    els.size.value = size === "250x250" ? "300x600" : "250x250";
    loadFor(els.size.value);
  });

  // init
  loadFor(els.size.value);
}

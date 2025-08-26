import { loadStyle } from "./utils.js";
import { renderHeader } from "./header.js";
import { renderDashboard } from "./dashboard.js";
import { renderLogin } from "./login.js";
import { renderMarketingPage } from "./marketing.js";
import { renderLandingPage } from "./landingPage.js";
import { renderFooter } from "./footer.js";
import {
  clearLoggedInUser,
  getBanner,
  saveBanner,
  resetBanner,
  setBannerActive,
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

export function renderBannerEditor(username) {
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
    "banners"
  );

  const container = document.createElement("div");
  container.className = "page banner-editor-container";

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

    <div class="field" id="f-dotColor" style="display:none">
      <label>Dots Color (t2)</label>
      <input id="dotColor" type="color" />
    </div>
    <div class="field" id="f-dotSize" style="display:none">
      <label>Dots Size (px, t2)</label>
      <input id="dotSize" type="number" min="1" max="12" placeholder="4" />
    </div>

    <div class="field">
      <label>Headline</label>
      <input id="title" placeholder="POP-UP"/>
    </div>

    <div class="field">
      <label>Subtitle / Date</label>
      <input id="subtitle" placeholder="SALE / DATE"/>
    </div>

    <div class="field">
      <label>Body (short)</label>
      <textarea id="body" placeholder="SUNDAY, MARCH 23 2025"></textarea>
    </div>

    <div class="field">
      <label>Background</label>
      <input id="bg" type="color" />
    </div>

    <div class="field">
      <label>Text Color</label>
      <input id="color" type="color" />
    </div>

    <div class="field">
      <label>Font Family</label>
      <select id="fontFamily">
        <option value="">System / Default</option>
        <option value="Arial, Helvetica, sans-serif">Arial</option>
        <option value="'Rubik', system-ui, sans-serif">Rubik</option>
        <option value="'Assistant', system-ui, sans-serif">Assistant (Hebrew)</option>
        <option value="'Noto Sans Hebrew', system-ui, sans-serif">Noto Sans Hebrew</option>
        <option value="'Times New Roman', Times, serif">Times New Roman</option>
        <option value="Georgia, serif">Georgia</option>
        <option value="'Courier New', monospace">Courier New</option>
      </select>
    </div>

    <div class="field">
      <label>Headline Size (px)</label>
      <input id="titleSize" type="number" min="12" max="96" placeholder="32" />
    </div>

    <div class="field">
      <label>Subtitle Size (px)</label>
      <input id="subtitleSize" type="number" min="10" max="72" placeholder="20" />
    </div>

    <div class="field">
      <label>Body Size (px)</label>
      <input id="bodySize" type="number" min="10" max="64" placeholder="16" />
    </div>

    <div class="actions">
      <button id="go-live" class="btn btn--primary" type="button">Go live</button>
      <button id="reset" class="btn btn--ghost" type="button">Reset</button>
    </div>
  `;

  const preview = document.createElement("div");
  preview.className = "panel preview";
  preview.innerHTML = `
    <h3>Live Preview</h3>
    <div class="preview-stage" id="banner-stage">
      <div id="prev" class="banner-content bn"></div>
    </div>
  `;

  container.append(controls, preview);
  app.append(header, container, renderFooter());

  // ===== Refs =====
  const els = {
    size: controls.querySelector("#size"),
    template: controls.querySelector("#template"),
    dotColorWrap: controls.querySelector("#f-dotColor"),
    dotSizeWrap: controls.querySelector("#f-dotSize"),
    dotColor: controls.querySelector("#dotColor"),
    dotSize: controls.querySelector("#dotSize"),
    title: controls.querySelector("#title"),
    subtitle: controls.querySelector("#subtitle"),
    body: controls.querySelector("#body"),
    bg: controls.querySelector("#bg"),
    color: controls.querySelector("#color"),
    // ייתכן שאין יותר input כזה – נשמור רפרנס אם קיים לתאימות לאחור
    fontSize: controls.querySelector("#fontSize") || null,
    goLive: controls.querySelector("#go-live"),
    reset: controls.querySelector("#reset"),
    stage: preview.querySelector("#banner-stage"),
    prev: preview.querySelector("#prev"),
    fontFamily: controls.querySelector("#fontFamily"),
    titleSize: controls.querySelector("#titleSize"),
    subtitleSize: controls.querySelector("#subtitleSize"),
    bodySize: controls.querySelector("#bodySize"),
  };

  // ===== Helpers =====
  function toggleDotsFields() {
    const show = els.template.value === "t2";
    els.dotColorWrap.style.display = show ? "block" : "none";
    els.dotSizeWrap.style.display = show ? "block" : "none";
  }

  function collectCurrent() {
    const obj = {
      template: els.template.value,
      title: els.title.value.trim(),
      subtitle: els.subtitle.value.trim(),
      body: els.body.value.trim(),
      bg: els.bg.value || "",
      color: els.color.value || "",
      fontFamily: els.fontFamily.value || "",
      titleSize: Number(els.titleSize.value) || undefined,
      subtitleSize: Number(els.subtitleSize.value) || undefined,
      bodySize: Number(els.bodySize.value) || undefined,
      // תאימות לאחור
      fontSize: Number(els.fontSize?.value) || undefined,
      updatedAt: Date.now(),
    };
    if (els.template.value === "t2") {
      if (els.dotColor.value) obj.dotColor = els.dotColor.value;
      if (els.dotSize.value) obj.dotSize = Number(els.dotSize.value);
    }
    return obj;
  }

  // ===== Template rendering =====
  function renderBannerInto(el, s, size) {
    // reset classes
    el.className = "banner-content bn";
    if (s.template === "t1") el.classList.add("bn--t1");
    else if (s.template === "t2") el.classList.add("bn--t2");
    else el.classList.add("bn--t3");

    // base size
    let w = 250,
      h = 250;
    if (size === "300x600") {
      w = 300;
      h = 600;
    }
    el.style.width = w + "px";
    el.style.height = h + "px";

    // colors / background
    el.style.color = s.color && s.color.trim() ? s.color : "#1c1a26";
    el.style.fontFamily =
      s.fontFamily && s.fontFamily.trim() ? s.fontFamily : "";

    if (s.template === "t2") {
      const bg = s.bg && s.bg.trim() ? s.bg : "#ffffff";
      const dots = s.dotColor && s.dotColor.trim() ? s.dotColor : "#222222";
      const r = s.dotSize && Number(s.dotSize) ? Number(s.dotSize) : 4;
      const step = Math.max(12, r * 6);
      el.style.background = bg;
      el.style.backgroundImage = `repeating-radial-gradient(${dots} 0 ${r}px, transparent ${r}px ${step}px)`;
      el.style.backgroundSize = step + "px " + step + "px";
      el.style.backgroundPosition = "0 0";
    } else {
      el.style.background = s.bg && s.bg.trim() ? s.bg : "#ffffff";
      el.style.backgroundImage = "none";
    }

    // content (בניית ה-DOM לפני שמחילים גדלים)
    const titleText = s.title || "";
    const subtitleText = s.subtitle || "";
    const bodyText = s.body || "";

    let inner = "";
    if (s.template === "t1") {
      inner = `
        <div class="bn__inner t1">
          <div class="bn__title">${titleText}</div>
          <div class="bn__subtitle">${subtitleText}</div>
          <div class="bn__body">${bodyText}</div>
        </div>`;
    } else if (s.template === "t2") {
      inner = `
        <div class="bn__inner t2">
          <div class="bn__card">
            <div class="bn__title">${titleText}</div>
            <div class="bn__subtitle">${subtitleText}</div>
            <div class="bn__body">${bodyText}</div>
          </div>
        </div>`;
    } else {
      inner = `
        <div class="bn__inner t3">
          <div class="bn__bar"></div>
          <div class="bn__stack">
            <div class="bn__title">${titleText}</div>
            <div class="bn__subtitle">${subtitleText}</div>
            <div class="bn__body">${bodyText}</div>
          </div>
        </div>`;
    }
    el.innerHTML = inner;

    // apply per-section sizes AFTER DOM exists
    const tEl = el.querySelector(".bn__title");
    const sEl = el.querySelector(".bn__subtitle");
    const bEl = el.querySelector(".bn__body");

    const fallback = s.fontSize && Number(s.fontSize) ? Number(s.fontSize) : 22;

    if (tEl)
      tEl.style.fontSize =
        ((s.titleSize && Number(s.titleSize)) || Math.max(28, fallback)) + "px";
    if (sEl)
      sEl.style.fontSize =
        ((s.subtitleSize && Number(s.subtitleSize)) ||
          Math.max(18, Math.floor(fallback * 0.9))) + "px";
    if (bEl)
      bEl.style.fontSize =
        ((s.bodySize && Number(s.bodySize)) ||
          Math.max(14, Math.floor(fallback * 0.75))) + "px";
  }

  function fitBanner() {
    const box = els.stage.getBoundingClientRect(); 
    const size = els.size.value;

    let w = 250,
      h = 250;
    if (size === "300x600") {
      w = 300;
      h = 600;
    }

    const pad = 16;
    const availW = box.width - pad;
    const availH = box.height - pad;
    let scale = Math.min(availW / w, availH / h);
    scale = Math.max(0.1, Math.min(scale, 1.6));

    els.prev.style.transformOrigin = "top left";
    els.prev.style.transform = `scale(${scale})`;

    const renderW = w * scale;
    const renderH = h * scale;
    const left = (box.width - renderW) / 2;
    const top = (box.height - renderH) / 2;

    els.prev.style.left = `${left}px`;
    els.prev.style.top = `${top}px`;
  }

  function render() {
    const size = els.size.value;
    let s = getBanner(size);
    if (!s) s = collectCurrent();
    renderBannerInto(els.prev, s, size);
    fitBanner();
  }

  function persist() {
    const payload = collectCurrent();
    saveBanner(els.size.value, payload);
  }

  function onAnyChange() {
    persist();
    render();
  }

  // ===== events =====
  const inputs = [
    els.template,
    els.dotColor,
    els.dotSize,
    els.title,
    els.subtitle,
    els.body,
    els.bg,
    els.color,
    els.fontFamily,
    els.titleSize,
    els.subtitleSize,
    els.bodySize,
  ];
  inputs.forEach((inp) => {
    if (!inp) return;
    inp.addEventListener("input", () => {
      if (inp === els.template) toggleDotsFields();
      onAnyChange();
    });
  });

  // -------- loadFor (הייתה חסרה) --------
  function loadFor(size) {
    const s = getBanner(size) || {};
    els.template.value = s.template || "t1";
    els.dotColor.value = s.dotColor || "";
    els.dotSize.value = s.dotSize || "";

    els.title.value = s.title || "";
    els.subtitle.value = s.subtitle || "";
    els.body.value = s.body || "";
    els.bg.value = s.bg || "";
    els.color.value = s.color || "";

    els.fontFamily.value = s.fontFamily || "";
    els.titleSize.value = s.titleSize ?? "";
    els.subtitleSize.value = s.subtitleSize ?? "";
    els.bodySize.value = s.bodySize ?? "";

    // תאימות לאחור
    if (!els.titleSize.value && s.fontSize) els.titleSize.value = s.fontSize;
    if (!els.subtitleSize.value && s.fontSize)
      els.subtitleSize.value = s.fontSize;
    if (!els.bodySize.value && s.fontSize) els.bodySize.value = s.fontSize;

    toggleDotsFields();
    render();
  }

  els.size.addEventListener("change", () => {
    loadFor(els.size.value);
  });

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

    // נקה טופס (בדיקת null לשדה הישן)
    els.title.value = "";
    els.subtitle.value = "";
    els.body.value = "";
    els.bg.value = "";
    els.color.value = "";
    if (els.fontSize) els.fontSize.value = "";
    els.dotColor.value = "";
    els.dotSize.value = "";
    els.fontFamily.value = "";
    els.titleSize.value = "";
    els.subtitleSize.value = "";
    els.bodySize.value = "";

    // מעבר אוטומטי לגודל השני
    els.size.value = size === "250x250" ? "300x600" : "250x250";
    loadFor(els.size.value);
  });

  window.addEventListener("resize", fitBanner);

  // init
  loadFor(els.size.value);
}

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
  loadStyle("./styles/bannerEditor.css"); // לוודא שה־CSS נטען

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

  // ===== Layout =====
  const container = document.createElement("div");
  container.className = "banner-editor-container";

  const controls = document.createElement("div");
  controls.className = "panel controls";
  controls.innerHTML = `
    <h2>Banner Editor</h2>

    <div class="field"><label>Size</label>
      <select id="size">
        <option value="250x250">250×250</option>
        <option value="300x600">300×600</option>
      </select>
    </div>

    <div class="field"><label>Template</label>
      <select id="template">
        <option value="t1">Template 1 – Pop-up Sale</option>
        <option value="t2">Template 2 – Dots Card</option>
        <option value="t3">Template 3 – Real Estate</option>
      </select>
    </div>

    <div class="field"><label>Headline</label>
      <input id="title" placeholder="POP-UP"/>
    </div>

    <div class="field"><label>Subtitle / Date</label>
      <input id="subtitle" placeholder="sale or date"/>
    </div>

    <div class="field"><label>Body (short)</label>
      <textarea id="body" placeholder="SUNDAY, MARCH 23 2025"></textarea>
    </div>

    <div class="group two-col">
      <div class="field">
        <label>Background</label>
        <input id="bg" type="color" />
      </div>

      <div class="field only-t2" id="row-dots">
        <label>Dots Color</label>
        <input id="dotsColor" type="color" />
      </div>
    </div>

    <div class="group two-col">
      <div class="field">
        <label>Text Color</label>
        <input id="color" type="color" />
      </div>

      <div class="field only-t3" id="row-img">
        <label>Image URL (Template 3)</label>
        <input id="imgUrl" placeholder="https://…"/>
      </div>
    </div>

    <h3 class="subhead">Typography</h3>
    <div class="group two-col">
      <div class="field"><label>Headline size (px)</label>
        <input id="hSize" type="number" min="12" max="72" placeholder="34"/>
      </div>
      <div class="field"><label>Subtitle size (px)</label>
        <input id="sSize" type="number" min="10" max="60" placeholder="20"/>
      </div>
    </div>
    <div class="field"><label>Body size (px)</label>
      <input id="bSize" type="number" min="10" max="56" placeholder="18"/>
    </div>

    <div class="form-actions">
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
        <div id="prev" class="banner-content tpl placeholder-surface"></div>
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
    dotsColor: controls.querySelector("#dotsColor"),
    imgUrl: controls.querySelector("#imgUrl"),
    hSize: controls.querySelector("#hSize"),
    sSize: controls.querySelector("#sSize"),
    bSize: controls.querySelector("#bSize"),
    rowDots: controls.querySelector("#row-dots"),
    rowImg: controls.querySelector("#row-img"),
    goLive: controls.querySelector("#go-live"),
    reset: controls.querySelector("#reset"),
    prev: preview.querySelector("#prev"),
  };

  // ===== Utils =====
  function wh(size) {
    return size === "300x600" ? [300, 600] : [250, 250];
  }

  function defaultsFor(size) {
    // גדלים דיפולטיביים נעימים לעין, פר־גודל
    if (size === "300x600") {
      return { hSize: 36, sSize: 22, bSize: 18 };
    }
    return { hSize: 28, sSize: 18, bSize: 16 };
  }

  function collectCurrent() {
    return {
      template: els.template.value,
      title: els.title.value.trim(),
      subtitle: els.subtitle.value.trim(),
      body: els.body.value.trim(),
      bg: els.bg.value || "",
      color: els.color.value || "",
      dotsColor: els.dotsColor.value || "",
      imgUrl: els.imgUrl?.value?.trim() || "",
      hSize: Number(els.hSize.value) || defaultsFor(els.size.value).hSize,
      sSize: Number(els.sSize.value) || defaultsFor(els.size.value).sSize,
      bSize: Number(els.bSize.value) || defaultsFor(els.size.value).bSize,
      updatedAt: Date.now(),
    };
  }

  function setVisibilities() {
    const tpl = els.template.value;
    els.rowDots.style.display = tpl === "t2" ? "" : "none";
    els.rowImg.style.display = tpl === "t3" ? "" : "none";
  }

  function loadFor(size) {
    const s = getBanner(size) || {};
    // ערכים
    els.template.value = s.template || "t1";
    els.title.value = s.title || "";
    els.subtitle.value = s.subtitle || "";
    els.body.value = s.body || "";
    if (s.bg) els.bg.value = s.bg;
    if (s.color) els.color.value = s.color;
    if (s.dotsColor) els.dotsColor.value = s.dotsColor;
    if (s.imgUrl) els.imgUrl.value = s.imgUrl;

    const d = defaultsFor(size);
    els.hSize.value = s.hSize || d.hSize;
    els.sSize.value = s.sSize || d.sSize;
    els.bSize.value = s.bSize || d.bSize;

    // קבע מימדים למסגרת
    const [w, h] = wh(size);
    els.prev.style.width = w + "px";
    els.prev.style.height = h + "px";

    setVisibilities();
    render();
  }

  // ---------- PREVIEW TEMPLATES ----------
  function htmlTpl1(s) {
    // אליפסה רכה באמצע + טקסטים
    return `
      <div style="
        position:relative; inset:0; width:100%; height:100%;
        background:${s.bg || "#d74b36"};
        color:${s.color || "#1f2937"};
        display:grid; grid-template-rows:auto 1fr auto; gap:8px;
        padding:14px; text-align:center; overflow:hidden; border-radius:10px;">
        <div style="font-weight:800; font-size:${s.hSize}px;">${
      s.title || ""
    }</div>

        <div style="
          position:absolute; left:50%; top:50%;
          transform:translate(-50%,-40%);
          width:65%; height:60%;
          border-radius:50%/55%;
          background:
            radial-gradient(ellipse at 40% 35%, rgba(255,255,255,.95), rgba(255,255,255,.55) 45%, rgba(255,255,255,.1) 80%);
          box-shadow: inset 0 0 40px rgba(0,0,0,.08);
        "></div>

        <div style="position:relative; z-index:2; font-size:${
          s.sSize
        }px; font-weight:700; opacity:.92;">
          ${s.subtitle || ""}
        </div>

        <div style="position:absolute; left:50%; bottom:10px; transform:translateX(-50%); z-index:2;
                    font-size:${s.bSize}px; font-weight:700; opacity:.95;">
          ${s.body || ""}
        </div>
      </div>
    `;
  }

  function dotsBackground(base, dot) {
    const b = base || "#ef4444";
    const d = dot || "#22c55e";
    // דפוס נקודות עם רקע בסיס
    return `
      background:
        radial-gradient(circle at 12px 12px, ${d} 6px, transparent 7px) 0 0/40px 40px,
        ${b};
    `;
  }

  function htmlTpl2(s) {
    // כרטיס לבן במרכז מעל נקודות
    return `
      <div style="
        ${dotsBackground(s.bg, s.dotsColor)}
        width:100%; height:100%; border-radius:12px; overflow:hidden;
        display:grid; place-items:center; padding:18px; text-align:center;">
        <div style="width:75%; min-height:38%; background:#fff; border-radius:18px;
                    box-shadow:0 6px 18px rgba(0,0,0,.16); padding:14px;
                    color:${s.color || "#111"};">
          <div style="font-weight:800; font-size:${s.hSize}px;">${
      s.title || ""
    }</div>
          <div style="margin-top:6px; font-size:${s.sSize}px; opacity:.9">${
      s.subtitle || ""
    }</div>
          <div style="margin-top:10px; font-size:${s.bSize}px; opacity:.95">${
      s.body || ""
    }</div>
        </div>
      </div>
    `;
  }

  function htmlTpl3(s) {
    // עמודת תמונה + טקסטים + CTA
    const stripes = `
      repeating-linear-gradient(
        45deg,
        rgba(255,255,255,.55) 0 12px,
        rgba(255,255,255,.15) 12px 28px
      )
    `;
    const imgSide = s.imgUrl
      ? `<div style="background:url('${s.imgUrl}') center/cover no-repeat;
                     border-radius:12px; width:100%; height:100%;"></div>`
      : `<div style="background:${stripes}; border-radius:12px; width:100%; height:100%;"></div>`;

    return `
      <div style="background:${s.bg || "#ef4444"}; color:${s.color || "#111"};
                  width:100%; height:100%; border-radius:12px; overflow:hidden;
                  display:grid; grid-template-columns:28% 1fr; gap:14px; padding:14px;">
        <div>${imgSide}</div>
        <div style="display:grid; grid-template-rows:auto auto 1fr auto; align-content:start; gap:8px;">
          <div style="font-weight:900; font-size:${s.hSize}px;">${
      s.title || ""
    }</div>
          <div style="font-size:${s.sSize}px; opacity:.9">${
      s.subtitle || ""
    }</div>
          <div style="font-size:${s.bSize}px; opacity:.95">${s.body || ""}</div>
          <div><span style="display:inline-block; padding:8px 14px; border-radius:10px;
                             background:#111; color:#fff; font-weight:800;">CTA</span></div>
        </div>
      </div>
    `;
  }

  function applyToPreview(el, s) {
    // גודל ומסגרת נשמרים מבחוץ; כאן רק התוכן
    el.classList.remove("placeholder-surface");
    el.style.background = "transparent";
    el.style.overflow = "hidden";
    el.innerHTML =
      s.template === "t2"
        ? htmlTpl2(s)
        : s.template === "t3"
        ? htmlTpl3(s)
        : htmlTpl1(s);
  }

  function render() {
    // אם אין שמור — משתמשים בערכי טופס נוכחיים
    const stored = getBanner(els.size.value);
    const s = stored ? stored : collectCurrent();
    applyToPreview(els.prev, s);
  }

  function persist() {
    saveBanner(els.size.value, collectCurrent());
  }

  // ===== Events =====
  [
    els.template,
    els.title,
    els.subtitle,
    els.body,
    els.bg,
    els.color,
    els.dotsColor,
    els.imgUrl,
    els.hSize,
    els.sSize,
    els.bSize,
  ].forEach((inp) => {
    if (!inp) return;
    inp.addEventListener("input", () => {
      if (inp === els.template) setVisibilities();
      persist();
      render();
      toast("Saved");
    });
  });

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

    // איפוס הטופס (מקומי) להכנת באנר חדש
    els.title.value = "";
    els.subtitle.value = "";
    els.body.value = "";
    els.bg.value = "";
    els.color.value = "";
    els.dotsColor.value = "";
    els.imgUrl.value = "";
    const d = defaultsFor(size);
    els.hSize.value = d.hSize;
    els.sSize.value = d.sSize;
    els.bSize.value = d.bSize;

    // עוברים לגודל הבא כדי לייצר מהר באנר נוסף
    els.size.value = size === "250x250" ? "300x600" : "250x250";
    loadFor(els.size.value);
  });

  // init
  loadFor(els.size.value);
}

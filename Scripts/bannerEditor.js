// bannerEditor.js
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
    },
    "banners" // ← קישור פעיל
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

    <div class="field">
      <label>Headline</label>
      <input id="title" placeholder="POP-UP"/>
    </div>

    <div class="field">
      <label>Subtitle / Date</label>
      <input id="subtitle" placeholder="sale or date"/>
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
      <label>Dots Color (T2)</label>
      <input id="dotsColor" type="color" />
    </div>

    <div class="field">
      <label>Image URL (Template 3)</label>
      <input id="imgUrl" placeholder="https://..."/>
    </div>

    <div class="field">
      <label>Text Color</label>
      <input id="color" type="color" />
    </div>

    <div class="field">
      <label>Font Size (px)</label>
      <input id="fontSize" type="number" min="12" max="64" placeholder="22" />
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
    <div class="banner-frames">
      <div class="banner-frame">
        <div id="prev" class="banner-content tpl placeholder-surface" 
             style="width:250px;height:250px"></div>
      </div>
    </div>
  `;

  container.append(controls, preview);
  app.appendChild(container);

  // ===== Refs & state handling (כמו שהיה) =====
  const els = {
    size: controls.querySelector("#size"),
    template: controls.querySelector("#template"),
    title: controls.querySelector("#title"),
    subtitle: controls.querySelector("#subtitle"),
    body: controls.querySelector("#body"),
    bg: controls.querySelector("#bg"),
    color: controls.querySelector("#color"),
    fontSize: controls.querySelector("#fontSize"),
    dotsColor: controls.querySelector("#dotsColor"),
    imgUrl: controls.querySelector("#imgUrl"),
    goLive: controls.querySelector("#go-live"),
    reset: controls.querySelector("#reset"),
    prev: preview.querySelector("#prev"),
  };

  function collectCurrent() {
    return {
      template: els.template.value,
      title: els.title.value.trim(),
      subtitle: els.subtitle.value.trim(),
      body: els.body.value.trim(),
      bg: els.bg.value || "",
      color: els.color.value || "",
      fontSize: Number(els.fontSize.value) || 22,
      dotsColor: els.dotsColor.value || "",
      imgUrl: els.imgUrl.value || "",
      updatedAt: Date.now(),
    };
  }

  function loadFor(size) {
    const s = getBanner(size) || {};
    els.template.value = s.template || "t1";
    els.title.value = s.title || "";
    els.subtitle.value = s.subtitle || "";
    els.body.value = s.body || "";
    if (s.bg) els.bg.value = s.bg;
    if (s.color) els.color.value = s.color;
    if (s.fontSize) els.fontSize.value = s.fontSize;
    if (s.dotsColor) els.dotsColor.value = s.dotsColor;
    if (s.imgUrl) els.imgUrl.value = s.imgUrl;
    render();
  }

  function tplHTML(s) {
    // T1: Pop-up – אליפסה רכה באמצע
    if (s.template === "t1") {
      return `<div style="position:relative;width:100%;height:100%;background:${
        s.bg || "#d33"
      };color:${
        s.color || "#fff"
      };display:grid;place-items:center;text-align:center;padding:10px;overflow:hidden;">
        <div style="position:absolute;inset:0;display:grid;place-items:center;">
          <div style="width:65%;height:65%;background:radial-gradient(circle at 45% 35%, rgba(255,255,255,.9), rgba(255,255,255,.35));border-radius:50%"></div>
        </div>
        <div style="position:relative;z-index:1;font-size:${
          s.fontSize || 22
        }px;max-width:90%;">
          <div style="font-weight:800">${s.title || ""}</div>
          <div style="opacity:.9">${s.subtitle || ""}</div>
          <div style="opacity:.95">${s.body || ""}</div>
        </div>
      </div>`;
    }

    // T2: Dots Card – נקודות + כרטיס לבן
    if (s.template === "t2") {
      const dots = s.dotsColor || "#1aa34a";
      return `<div style="position:relative;width:100%;height:100%;background:${
        s.bg || "#d33"
      };display:grid;place-items:center;overflow:hidden;">
        <div style="position:absolute;inset:0;background:
          radial-gradient(circle 6px, ${dots} 99%, transparent 100%) 0 0/34px 34px;"></div>
        <div style="position:relative;background:#fff;border-radius:16px;padding:14px;min-width:60%;max-width:80%;text-align:center;color:${
          s.color || "#333"
        };">
          <div style="font-weight:800;font-size:${s.fontSize || 22}px">${
        s.title || ""
      }</div>
          <div style="opacity:.9">${s.subtitle || ""}</div>
          <div style="opacity:.95">${s.body || ""}</div>
        </div>
      </div>`;
    }

    // T3: Real Estate – תמונה בצד וכותרות + CTA
    const img = s.imgUrl
      ? `<img src="${s.imgUrl}" alt="" style="width:26%;height:80%;object-fit:cover;border-radius:10px"/>`
      : `<div style="width:26%;height:80%;border-radius:10px;background:repeating-linear-gradient(45deg, rgba(255,255,255,.4) 0 12px, rgba(255,255,255,.2) 12px 24px)"></div>`;

    return `<div style="position:relative;width:100%;height:100%;background:${
      s.bg || "#d33"
    };color:${
      s.color || "#fff"
    };display:grid;grid-template-columns:28% 1fr;gap:10px;align-items:center;padding:10px;overflow:hidden;">
      <div style="display:grid;place-items:center;height:100%">${img}</div>
      <div style="display:grid;align-content:center;gap:6px;text-align:left">
        <div style="font-weight:800;font-size:${s.fontSize || 22}px">${
      s.title || ""
    }</div>
        <div style="opacity:.9">${s.subtitle || ""}</div>
        <div style="opacity:.95">${s.body || ""}</div>
        <div><span style="display:inline-block;padding:6px 12px;border-radius:10px;background:#111;color:#fff;font-weight:800">CTA</span></div>
      </div>
    </div>`;
  }

  function applyToPreview(el, s) {
    const [w, h] = els.size.value === "300x600" ? [300, 600] : [250, 250];
    el.style.width = w + "px";
    el.style.height = h + "px";
    el.classList.toggle("placeholder-surface", !s.bg);
    el.innerHTML = tplHTML(s);
  }

  function render() {
    const s = getBanner(els.size.value) || collectCurrent();
    applyToPreview(els.prev, s);
  }

  function persist() {
    saveBanner(els.size.value, collectCurrent());
  }

  [
    els.template,
    els.title,
    els.subtitle,
    els.body,
    els.bg,
    els.color,
    els.fontSize,
    els.dotsColor,
    els.imgUrl,
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

    // איפוס מקומי לטופס
    [
      "title",
      "subtitle",
      "body",
      "bg",
      "color",
      "fontSize",
      "dotsColor",
      "imgUrl",
    ].forEach((k) => {
      if (els[k]) els[k].value = "";
    });

    els.size.value = size === "250x250" ? "300x600" : "250x250";
    loadFor(els.size.value);
  });

  loadFor(els.size.value);

  // פוטר
  app.append(renderFooter());
}


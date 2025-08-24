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
      if (key === "dashboard") {
        renderDashboard(username);
      } else if (key === "banners") {
        renderBannerEditor(username);
      } else if (key === "marketing") {
        renderMarketingPage(username);
      } else if (key === "landing") {
        renderLandingPage(username);
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

    <!-- יופיע רק ב-t2 -->
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
    <div class="preview-stage" id="banner-stage">
      <div id="prev" class="banner-content bn"></div>
    </div>
  `;

  container.append(controls, preview);
  app.appendChild(container);

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
    fontSize: controls.querySelector("#fontSize"),
    goLive: controls.querySelector("#go-live"),
    reset: controls.querySelector("#reset"),
    stage: preview.querySelector("#banner-stage"),
    prev: preview.querySelector("#prev"),
  };

  // ===== State helpers =====
  function collectCurrent() {
    const obj = {
      template: els.template.value,
      title: els.title.value.trim(),
      subtitle: els.subtitle.value.trim(),
      body: els.body.value.trim(),
      bg: els.bg.value || "",
      color: els.color.value || "",
      fontSize: Number(els.fontSize.value) || 22,
      updatedAt: Date.now(),
    };
    if (els.template.value === "t2") {
      if (els.dotColor.value) obj.dotColor = els.dotColor.value;
      if (els.dotSize.value) obj.dotSize = Number(els.dotSize.value);
    }
    return obj;
  }

  function loadFor(size) {
    const s = getBanner(size) || {};
    els.template.value = s.template || "t1";

    if (s.dotColor) {
      els.dotColor.value = s.dotColor;
    } else {
      els.dotColor.value = "";
    }
    if (s.dotSize) {
      els.dotSize.value = s.dotSize;
    } else {
      els.dotSize.value = "";
    }

    if (s.title) els.title.value = s.title;
    else els.title.value = "";
    if (s.subtitle) els.subtitle.value = s.subtitle;
    else els.subtitle.value = "";
    if (s.body) els.body.value = s.body;
    else els.body.value = "";
    if (s.bg) els.bg.value = s.bg;
    else els.bg.value = "";
    if (s.color) els.color.value = s.color;
    else els.color.value = "";
    if (s.fontSize) els.fontSize.value = s.fontSize;
    else els.fontSize.value = "";

    toggleDotsFields();
    render();
  }

  function toggleDotsFields() {
    if (els.template.value === "t2") {
      els.dotColorWrap.style.display = "block";
      els.dotSizeWrap.style.display = "block";
    } else {
      els.dotColorWrap.style.display = "none";
      els.dotSizeWrap.style.display = "none";
    }
  }

  // ===== Template rendering =====
  function renderBannerInto(el, s, size) {
    // reset classes
    el.className = "banner-content bn";
    if (s.template === "t1") {
      el.classList.add("bn--t1");
    } else if (s.template === "t2") {
      el.classList.add("bn--t2");
    } else {
      el.classList.add("bn--t3");
    }

    // base size
    let w = 250,
      h = 250;
    if (size === "300x600") {
      w = 300;
      h = 600;
    }
    el.style.width = w + "px";
    el.style.height = h + "px";

    // colors / font
    let txt = "#1c1a26";
    if (s.color && s.color.trim()) {
      txt = s.color;
    }
    el.style.color = txt;

    let fpx = 22;
    if (s.fontSize && Number(s.fontSize)) {
      fpx = Number(s.fontSize);
    }
    el.style.fontSize = fpx + "px";

    // background
    if (s.template === "t2") {
      let bg = "#ffffff";
      if (s.bg && s.bg.trim()) {
        bg = s.bg;
      }
      let dots = "#222222";
      if (s.dotColor && s.dotColor.trim()) {
        dots = s.dotColor;
      }
      let r = 4;
      if (s.dotSize && Number(s.dotSize)) {
        r = Number(s.dotSize);
      }
      const step = Math.max(12, r * 6);

      el.style.background = bg;
      el.style.backgroundImage = `repeating-radial-gradient(${dots} 0 ${r}px, transparent ${r}px ${step}px)`;
      el.style.backgroundSize = step + "px " + step + "px";
      el.style.backgroundPosition = "0 0";
    } else {
      if (s.bg && s.bg.trim()) {
        el.style.background = s.bg;
      } else {
        el.style.background = "#ffffff";
      }
      el.style.backgroundImage = "none";
    }

    // content
    let titleText = "";
    if (s.title) {
      titleText = s.title;
    }
    let subtitleText = "";
    if (s.subtitle) {
      subtitleText = s.subtitle;
    }
    let bodyText = "";
    if (s.body) {
      bodyText = s.body;
    }

    let inner = "";
    if (s.template === "t1") {
      inner = `
        <div class="bn__inner t1">
          <div class="bn__title">${titleText}</div>
          <div class="bn__subtitle">${subtitleText}</div>
          <div class="bn__body">${bodyText}</div>
        </div>
      `;
    } else if (s.template === "t2") {
      inner = `
        <div class="bn__inner t2">
          <div class="bn__card">
            <div class="bn__title">${titleText}</div>
            <div class="bn__subtitle">${subtitleText}</div>
            <div class="bn__body">${bodyText}</div>
          </div>
        </div>
      `;
    } else {
      inner = `
        <div class="bn__inner t3">
          <div class="bn__bar"></div>
          <div class="bn__stack">
            <div class="bn__title">${titleText}</div>
            <div class="bn__subtitle">${subtitleText}</div>
            <div class="bn__body">${bodyText}</div>
          </div>
        </div>
      `;
    }

    el.innerHTML = inner;
  }

  // === scale to fit stage ===
  function fitBanner() {
    const box = els.stage.getBoundingClientRect();
    const size = els.size.value;
    let w = 250,
      h = 250;
    if (size === "300x600") {
      w = 300;
      h = 600;
    }

    els.prev.style.transformOrigin = "top left";
    const pad = 16;
    const scaleW = (box.width - pad) / w;
    const scaleH = (box.height - pad) / h;
    let scale = scaleW;
    if (scaleH < scale) {
      scale = scaleH;
    }
    if (scale > 1.6) {
      scale = 1.6;
    }
    if (scale < 0.1) {
      scale = 0.1;
    }
    els.prev.style.transform = "scale(" + scale + ")";
  }

  function render() {
    const size = els.size.value;
    let s = getBanner(size);
    if (!s) {
      s = collectCurrent();
    }
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

  // events
  const inputs = [
    els.template,
    els.dotColor,
    els.dotSize,
    els.title,
    els.subtitle,
    els.body,
    els.bg,
    els.color,
    els.fontSize,
  ];
  for (let i = 0; i < inputs.length; i++) {
    const inp = inputs[i];
    if (!inp) continue;
    inp.addEventListener("input", () => {
      if (inp === els.template) {
        toggleDotsFields();
      }
      onAnyChange();
    });
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

    // ניקה טופס (כדי ליצור באנר חדש)
    els.title.value = "";
    els.subtitle.value = "";
    els.body.value = "";
    els.bg.value = "";
    els.color.value = "";
    els.fontSize.value = "";
    els.dotColor.value = "";
    els.dotSize.value = "";

    // עבור אוטומטית לגודל השני
    if (size === "250x250") {
      els.size.value = "300x600";
    } else {
      els.size.value = "250x250";
    }
    loadFor(els.size.value);
  });

  window.addEventListener("resize", fitBanner);

  // init
  loadFor(els.size.value);
}

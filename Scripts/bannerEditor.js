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
  deleteBanner,
  resetBanner,
  setBannerActive,
} from "./storage.js";

export function renderBannerEditor(username) {
  loadStyle("./styles/main.css");

  const app = document.getElementById("app");
  app.innerHTML = "";

  const header = renderHeader(
    username,
    function (key) {
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
    function () {
      clearLoggedInUser();
      renderLogin();
    }
  );
  app.appendChild(header);

  // Layout
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
      <label>Image URL</label>
      <input id="imgUrl" placeholder="https://..." />
    </div>

    <div class="field">
      <label>Headline</label>
      <input id="title" placeholder="Main title" />
    </div>

    <div class="field">
      <label>Subtitle / Date</label>
      <input id="subtitle" placeholder="Subtitle or date" />
    </div>

    <div class="field">
      <label>Body (short)</label>
      <textarea id="body" placeholder="Short text..."></textarea>
    </div>

    <div class="field">
      <label>Background</label>
      <input id="bg" type="color" value="#E7C282" />
    </div>

    <div class="field">
      <label>Text Color</label>
      <input id="color" type="color" value="#2b2b2b" />
    </div>

    <div class="field">
      <label>Font Size (px)</label>
      <input id="fontSize" type="number" min="12" max="64" value="22" />
    </div>

    <div class="actions">
      <button id="go-live" type="button">Go live</button>
      <button id="unpublish" type="button">Unpublish</button>
      <button id="reset-size" type="button">Reset current</button>
      <button id="delete-size" type="button" class="danger">Delete current</button>
    </div>
  `;

  const preview = document.createElement("div");
  preview.className = "panel preview";
  preview.innerHTML = `
    <h3>Live Preview</h3>
    <div class="banner-frames">
      <div class="banner-frame frame-250x250">
        <div id="prev-250" class="banner-content tpl"></div>
      </div>
      <div class="banner-frame frame-300x600">
        <div id="prev-300" class="banner-content tpl"></div>
      </div>
    </div>
  `;

  container.append(controls, preview);
  app.appendChild(container);

  // Refs
  const els = {
    size: controls.querySelector("#size"),
    template: controls.querySelector("#template"),
    imgUrl: controls.querySelector("#imgUrl"),
    title: controls.querySelector("#title"),
    subtitle: controls.querySelector("#subtitle"),
    body: controls.querySelector("#body"),
    bg: controls.querySelector("#bg"),
    color: controls.querySelector("#color"),
    fontSize: controls.querySelector("#fontSize"),

    goLive: controls.querySelector("#go-live"),
    unpublish: controls.querySelector("#unpublish"),
    resetSize: controls.querySelector("#reset-size"),
    deleteSize: controls.querySelector("#delete-size"),

    prev250: preview.querySelector("#prev-250"),
    prev300: preview.querySelector("#prev-300"),
  };

  function collect() {
    return {
      template: els.template.value,
      imgUrl: els.imgUrl.value.trim(),
      title: els.title.value,
      subtitle: els.subtitle.value,
      body: els.body.value,
      bg: els.bg.value,
      color: els.color.value,
      fontSize: Number(els.fontSize.value) || 22,
      updatedAt: Date.now(),
    };
  }

  function loadStateFor(size) {
    const s = getBanner(size) || {};
    els.template.value = s.template ? s.template : "t1";
    els.imgUrl.value = s.imgUrl ? s.imgUrl : "";
    els.title.value = s.title ? s.title : "";
    els.subtitle.value = s.subtitle ? s.subtitle : "";
    els.body.value = s.body ? s.body : "";
    if (s.bg) {
      els.bg.value = s.bg;
    } else {
      if (els.template.value === "t1") {
        els.bg.value = "#E7C282";
      } else {
        els.bg.value = "#ffffff";
      }
    }
    els.color.value = s.color ? s.color : "#2b2b2b";
    els.fontSize.value = s.fontSize ? s.fontSize : 22;
    renderAll();
  }

  function persist(size) {
    const data = collect();
    saveBanner(size, data);
  }

  // Render (בלי CSS variables)
  function applyStateToEl(el, s) {
    if (!s) return;
    el.style.background = s.bg ? s.bg : "#ffffff";
    el.style.color = s.color ? s.color : "#2b2b2b";
    el.style.fontSize = (s.fontSize ? s.fontSize : 22) + "px";
    if (s.imgUrl) {
      el.style.backgroundImage = 'url("' + s.imgUrl + '")';
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
    } else {
      el.style.backgroundImage = "none";
    }
    el.dataset.tpl = s.template ? s.template : "t1";
    el.innerHTML =
      '<div class="title">' +
      (s.title ? s.title : "") +
      '</div><div class="subtitle">' +
      (s.subtitle ? s.subtitle : "") +
      '</div><div class="body">' +
      (s.body ? s.body : "") +
      "</div>";
  }

  function renderAll() {
    const s250 = getBanner("250x250") || collect();
    const s300 = getBanner("300x600") || collect();
    applyStateToEl(els.prev250, s250);
    applyStateToEl(els.prev300, s300);
  }

  // Events
  els.size.addEventListener("change", function () {
    loadStateFor(els.size.value);
  });

  [
    els.template,
    els.imgUrl,
    els.title,
    els.subtitle,
    els.body,
    els.bg,
    els.color,
    els.fontSize,
  ].forEach(function (inp) {
    inp.addEventListener("input", function () {
      persist(els.size.value);
      renderAll();
    });
  });

  // Actions
  els.goLive.addEventListener("click", function () {
    setBannerActive(els.size.value, true);
  });

  els.unpublish.addEventListener("click", function () {
    setBannerActive(els.size.value, false);
  });

  els.resetSize.addEventListener("click", function () {
    resetBanner(els.size.value);
    loadStateFor(els.size.value);
    renderAll();
  });

  els.deleteSize.addEventListener("click", function () {
    deleteBanner(els.size.value);
    loadStateFor(els.size.value);
    renderAll();
  });

  // init
  loadStateFor(els.size.value);
}

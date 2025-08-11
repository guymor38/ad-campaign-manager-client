import { loadStyle } from "./utils.js";
import { renderHeader } from "./header.js";
import { renderDashboard } from "./dashboard.js";
import { renderLogin } from "./login.js";
import { renderMarketingPage } from "./marketing.js";
import { renderLandingPage } from "./landingPage.js";
import { clearLoggedInUser, getBanner, saveBanner } from "./storage.js";

export function renderBannerEditor(username) {
  loadStyle("./styles/main.css");

  const app = document.getElementById("app");
  app.innerHTML = "";

  // Header + ניווט
  const header = renderHeader(
    username,
    (key) => {
      switch (key) {
        case "dashboard": renderDashboard(username); break;
        case "banners":   renderBannerEditor(username); break;
        case "marketing": renderMarketingPage(username); break;
        case "landing":   renderLandingPage(username); break;
        default: console.warn("Unknown page:", key);
      }
    },
    () => { clearLoggedInUser(); renderLogin(); }
  );
  app.appendChild(header);

  // ========= layout =========
  const container = document.createElement("div");
  container.className = "banner-editor-container";

  // פנל בקרות (שמאל)
  const controls = document.createElement("div");
  controls.className = "panel controls";

  controls.innerHTML = `
    <h2>Banner Editor</h2>
    <p style="margin:6px 0 14px;opacity:.9">בחר גודל→ערוך→התצוגה מימין תתעדכן בזמן אמת</p>

    <div class="field">
      <label>Banner Size</label>
      <select id="ctrl-size">
        <option value="250x250">250×250 (Square)</option>
        <option value="300x600">300×600 (Portrait)</option>
      </select>
    </div>

    <div class="field">
      <label>Text</label>
      <input id="ctrl-text" placeholder="Write your banner text..." />
    </div>

    <div class="field">
      <label>Background Color</label>
      <input id="ctrl-bg" type="color" value="#ffffff" />
    </div>

    <div class="field">
      <label>Text Color</label>
      <input id="ctrl-color" type="color" value="#333333" />
    </div>

    <div class="field">
      <label>Font Size (px)</label>
      <input id="ctrl-font" type="number" min="10" max="80" value="24" />
    </div>

    <div class="field">
      <label>Template</label>
      <select id="ctrl-template">
        <option value="t1">Template 1 – Centered</option>
        <option value="t2">Template 2 – Badge</option>
        <option value="t3">Template 3 – Ribbon</option>
      </select>
    </div>

    <div style="margin-top:12px;opacity:.7;font-size:.9rem">
      * נשמר אוטומטית ב-Local Storage בעת שינוי
    </div>
  `;

  // אזור תצוגה (ימין)
  const preview = document.createElement("div");
  preview.className = "panel preview";
  preview.innerHTML = `
    <h3 style="margin-bottom:10px">Live Preview</h3>

    <div class="banner-frame frame-250x250">
      <div id="prev-250" class="banner-content">250×250</div>
    </div>

    <div class="banner-frame frame-300x600">
      <div id="prev-300" class="banner-content">300×600</div>
    </div>
  `;

  container.append(controls, preview);
  app.appendChild(container);

  // ========= wiring =========
  const els = {
    size: controls.querySelector("#ctrl-size"),
    text: controls.querySelector("#ctrl-text"),
    bg: controls.querySelector("#ctrl-bg"),
    color: controls.querySelector("#ctrl-color"),
    font: controls.querySelector("#ctrl-font"),
    template: controls.querySelector("#ctrl-template"),
    prev250: preview.querySelector("#prev-250"),
    prev300: preview.querySelector("#prev-300"),
  };

  // החלת מצב שמור אם קיים
  function loadStateFor(size) {
    const saved = getBanner(size);
    if (saved) {
      els.text.value = saved.text || "";
      els.bg.value = saved.bg || "#ffffff";
      els.color.value = saved.color || "#333333";
      els.font.value = saved.fontSize || 24;
      els.template.value = saved.template || "t1";
    } else {
      // ברירת מחדל לכל גודל
      els.text.value = "";
      els.bg.value = "#ffffff";
      els.color.value = "#333333";
      els.font.value = 24;
      els.template.value = "t1";
    }
    render(size); // רענון תצוגה
  }

  // תבניות – שינוי קל ב-style של הטקסט
  function applyTemplate(el, template) {
    el.style.position = "relative";
    el.style.display = "grid";
    el.style.placeItems = "center";
    el.style.textAlign = "center";
    el.style.padding = "8px";

    // reset שמותרים
    el.style.boxShadow = "none";
    el.style.border = "none";
    el.dataset.template = template;

    // עיצוב לפי תבנית
    if (template === "t1") {
      // מרכזי נקי
    } else if (template === "t2") {
      // Badge קטן
      el.style.boxShadow = "0 0 0 3px rgba(0,0,0,.08) inset";
      el.style.borderRadius = "10px";
    } else if (template === "t3") {
      // Ribbon עליון
      el.style.borderTop = "8px solid rgba(0,0,0,.15)";
      el.style.borderRadius = "4px";
    }
  }

  // רינדור תצוגה לכל גודל
  function render(sizeJustChanged) {
    const v = {
      text: els.text.value,
      bg: els.bg.value,
      color: els.color.value,
      fontSize: Number(els.font.value) || 24,
      template: els.template.value,
    };

    // יעד לפי בחירה: מעדכנים גם את השני כדי שתמיד נראה את שניהם
    // 250x250
    const s250 = sizeJustChanged === "250x250" ? v : (getBanner("250x250") || v);
    const el250 = els.prev250;
    el250.textContent = s250.text || " ";
    el250.parentElement.style.background = s250.bg;
    el250.style.color = s250.color;
    el250.style.fontSize = s250.fontSize + "px";
    applyTemplate(el250, s250.template);

    // 300x600
    const s300 = sizeJustChanged === "300x600" ? v : (getBanner("300x600") || v);
    const el300 = els.prev300;
    el300.textContent = s300.text || " ";
    el300.parentElement.style.background = s300.bg;
    el300.style.color = s300.color;
    el300.style.fontSize = s300.fontSize + "px";
    applyTemplate(el300, s300.template);
  }

  // שמירה
  function persist(size) {
    saveBanner(size, {
      text: els.text.value,
      bg: els.bg.value,
      color: els.color.value,
      fontSize: Number(els.font.value) || 24,
      template: els.template.value,
    });
  }

  // האזנות – טעינת מצב לפי גודל
  els.size.addEventListener("change", () => {
    loadStateFor(els.size.value);
  });

  // האזנות – עדכון חי ושמירה אוטומטית
  const onChange = () => {
    const size = els.size.value;
    render(size);
    persist(size);
  };
  [els.text, els.bg, els.color, els.font, els.template].forEach((input) =>
    input.addEventListener("input", onChange)
  );

  // אתחול: נטען מצב הגודל הראשון
  loadStateFor(els.size.value);
}
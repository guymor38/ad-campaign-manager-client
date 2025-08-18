import { loadStyle, showToast, el } from "./utils.js";
import { renderHeader } from "./header.js";
import { renderDashboard } from "./dashboard.js";
import { renderLogin } from "./login.js";
import { renderMarketingPage } from "./marketing.js";
import { renderLandingPage } from "./landingPage.js";
import {
  clearLoggedInUser,
  getBanner,
  saveBanner,
  setBannerActive,
} from "./storage.js";

export function renderBannerEditor(username) {
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
  const shell = el("div", "banner-editor-container");

  const form = el("div", "panel controls");
  form.innerHTML = `
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
      <input id="subtitle" placeholder="sale"/>
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
      <input id="fontSize" type="number" min="12" max="64" placeholder="22"/>
    </div>

    <div class="form-actions">
      <button id="go"    class="btn btn--primary" type="button">Go live</button>
      <button id="reset" class="btn btn--ghost"   type="button">Reset</button>
    </div>
  `;

  const preview = el("div", "panel preview");
  preview.innerHTML = `
    <h3>Live Preview</h3>
    <div class="banner-frame" id="frame" style="width:250px;height:250px">
      <div id="canvas" class="banner-canvas"></div>
    </div>
  `;

  shell.append(form, preview);
  app.appendChild(shell);

  // ---- Refs & helpers ----
  const els = {
    size: form.querySelector("#size"),
    tpl: form.querySelector("#template"),
    title: form.querySelector("#title"),
    subtitle: form.querySelector("#subtitle"),
    body: form.querySelector("#body"),
    bg: form.querySelector("#bg"),
    color: form.querySelector("#color"),
    fontSize: form.querySelector("#fontSize"),
    go: form.querySelector("#go"),
    reset: form.querySelector("#reset"),
    frame: preview.querySelector("#frame"),
    canvas: preview.querySelector("#canvas"),
  };

  // Placeholder demo values for preview (לא נכתבים לשדות)
  const DEMO = {
    title: "POP-UP",
    subtitle: "sale",
    body: "SUNDAY, MARCH 23 2025",
    color: "#333333",
    bg: "#E7C282",
    fontSize: 22,
  };

  function readForm() {
    return {
      template: els.tpl.value,
      title: els.title.value.trim(),
      subtitle: els.subtitle.value.trim(),
      body: els.body.value.trim(),
      bg: els.bg.value, // ריק אם המשתמש לא בחר
      color: els.color.value, // ריק אם המשתמש לא בחר
      fontSize: Number(els.fontSize.value) || null,
    };
  }

  function render() {
    const s = readForm();

    // ערכים לתצוגה (נופלים ל-DEMO כשהשדה ריק)
    const v = {
      title: s.title || DEMO.title,
      subtitle: s.subtitle || DEMO.subtitle,
      body: s.body || DEMO.body,
      color: s.color || DEMO.color,
      fontSize: s.fontSize || DEMO.fontSize,
      bg: s.bg || null,
    };

    // גודל הפריים לפי הבחירה
    if (els.size.value === "250x250") {
      els.frame.style.width = "250px";
      els.frame.style.height = "250px";
    } else {
      els.frame.style.width = "300px";
      els.frame.style.height = "600px";
    }

    // רקע placeholder מפוספס אם אין טקסט בכלל
    const isEmptyText = !s.title && !s.subtitle && !s.body;
    if (isEmptyText && !s.bg) {
      els.canvas.style.background = `repeating-linear-gradient(
        135deg, rgba(0,0,0,.06) 0 8px, rgba(0,0,0,.02) 8px 16px
      )`;
    } else {
      els.canvas.style.background = v.bg ? v.bg : "#fff";
    }

    els.canvas.style.color = v.color;
    els.canvas.style.fontSize = v.fontSize + "px";
    els.canvas.innerHTML = `
      <div class="b-title">${v.title}</div>
      <div class="b-sub">${v.subtitle}</div>
      <div class="b-body">${v.body}</div>
    `;
  }

  function save(active = false) {
    const s = readForm();
    saveBanner(els.size.value, {
      ...s,
      active,
    });
  }

  function resetForm() {
    els.title.value = "";
    els.subtitle.value = "";
    els.body.value = "";
    els.bg.value = "";
    els.color.value = "";
    els.fontSize.value = "";
    render();
  }

  // טעינת שמור קיים (אם יש)
  const existing250 = getBanner("250x250");
  const existing300 = getBanner("300x600");
  function loadForCurrentSize() {
    const size = els.size.value;
    const s = getBanner(size) || {};
    els.tpl.value = s.template || "t1";
    els.title.value = s.title || "";
    els.subtitle.value = s.subtitle || "";
    els.body.value = s.body || "";
    els.bg.value = s.bg || "";
    els.color.value = s.color || "";
    els.fontSize.value = s.fontSize || "";
    render();
  }
  loadForCurrentSize();

  // events
  [
    els.size,
    els.tpl,
    els.title,
    els.subtitle,
    els.body,
    els.bg,
    els.color,
    els.fontSize,
  ].forEach((n) =>
    n.addEventListener("input", () => {
      save(false);
      render();
    })
  );

  els.size.addEventListener("change", loadForCurrentSize);

  els.go.addEventListener("click", () => {
    save(true);
    setBannerActive(els.size.value, true);
    showToast("Published banner");
    resetForm(); // איפוס הטופס אחרי פרסום
  });

  els.reset.addEventListener("click", () => {
    resetForm();
    showToast("Reset");
  });

  render();
}

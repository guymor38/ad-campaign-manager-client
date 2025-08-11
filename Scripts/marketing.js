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
} from "./storage.js";

export function renderMarketingPage(username) {
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
        default:
          console.warn("Unknown page:", key);
      }
    },
    () => {
      clearLoggedInUser();
      renderLogin();
    }
  );
  app.appendChild(header);

  // קונטיינר עם גריד (יש לך marketing.css שמגדיר grid)
  const container = document.createElement("div");
  container.className = "marketing-container";

  // שמאל: טופס בקרה
  const controls = document.createElement("div");
  controls.className = "panel";
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

      <div class="field">
        <label>Title</label>
        <input id="title" placeholder="Main headline"/>
      </div>

      <div class="field">
        <label>Subtitle</label>
        <input id="subtitle" placeholder="Sub headline"/>
      </div>

      <div class="field">
        <label>Body</label>
        <textarea id="body" placeholder="Email body..."></textarea>
      </div>

      <div class="field">
        <label>Image URL</label>
        <input id="imgUrl" placeholder="https://..."/>
      </div>

      <div class="field">
        <label>Button text</label>
        <input id="ctaText" placeholder="Shop now"/>
      </div>

      <div class="field">
        <label>Button URL</label>
        <input id="ctaUrl" placeholder="https://example.com"/>
      </div>

      <div class="field">
        <label>Background</label>
        <input id="bg" type="color" value="#ffffff"/>
      </div>

      <div class="field">
        <label>Text color</label>
        <input id="color" type="color" value="#333333"/>
      </div>

      <div class="field">
        <label>Accent color (button)</label>
        <input id="accent" type="color" value="#2d89ef"/>
      </div>

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
  `;

  // ימין: קנבס מייל ברוחב 650px
  const preview = document.createElement("div");
  preview.className = "panel";
  preview.innerHTML = `
    <h3 style="margin-bottom:10px">Live Preview (650px)</h3>
    <div class="email-canvas" id="email" aria-label="email preview"></div>
  `;

  container.append(controls, preview);
  app.appendChild(container);

  // ===== שליפת מצב שמור/ברירת מחדל =====
  const DEF = {
    tpl: "t1",
    title: "Your great headline",
    subtitle: "Sub headline goes here",
    body: "Body copy for your email. Keep it short and clear.",
    imgUrl: "",
    ctaText: "Learn more",
    ctaUrl: "https://example.com",
    bg: "#ffffff",
    color: "#333333",
    accent: "#2d89ef",
    font: "system-ui, -apple-system, Segoe UI, Roboto",
  };
  const state = Object.assign({}, DEF, getMarketingPage() || {});

  // קישורים לשדות
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
  };

  // הטענת ערכים לשדות
  Object.entries(state).forEach(([k, v]) => {
    if (els[k]) els[k].value = v;
  });

  // רנדר של 3 התבניות (בתוך 650px)
  function renderTpl(s) {
    const styleBase = `
      background:${s.bg}; color:${s.color}; font-family:${s.font};
      width:650px; margin:0 auto; line-height:1.5; 
    `;

    const btn = (text, url) => `
      <a href="${url || "#"}" 
         style="display:inline-block;padding:10px 16px;border-radius:8px;
                text-decoration:none;background:${
                  s.accent
                };color:#fff;font-weight:600">
        ${text || "Button"}
      </a>`;

    const img = s.imgUrl
      ? `<img src="${s.imgUrl}" alt="" style="max-width:100%;display:block;margin:0 auto 12px;border-radius:8px"/>`
      : "";

    if (s.tpl === "t1") {
      return `
        <div style="${styleBase} padding:18px;">
          <h1 style="margin:0 0 8px">${s.title}</h1>
          <h3 style="margin:0 0 14px;opacity:.85">${s.subtitle}</h3>
          ${img}
          <p style="margin:0 0 16px">${s.body}</p>
          ${btn(s.ctaText, s.ctaUrl)}
        </div>
      `;
    }
    if (s.tpl === "t2") {
      return `
        <div style="${styleBase}">
          <div style="padding:0 0 14px; text-align:center; background:rgba(0,0,0,.03); border-radius:8px;">
            ${
              img ||
              `<div style="height:180px; display:grid; place-items:center; color:#888">Hero</div>`
            }
          </div>
          <div style="padding:18px;">
            <h1 style="margin:0 0 8px">${s.title}</h1>
            <p style="margin:0 0 16px">${s.body}</p>
            ${btn(s.ctaText, s.ctaUrl)}
          </div>
        </div>
      `;
    }
    // t3 – Card
    return `
      <div style="${styleBase} padding:18px;">
        <div style="background:#fff;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,.08)">
          ${img}
          <h2 style="margin:0 0 8px">${s.title}</h2>
          <p style="margin:0 0 14px;opacity:.9">${s.subtitle}</p>
          <p style="margin:0 0 16px">${s.body}</p>
          ${btn(s.ctaText, s.ctaUrl)}
        </div>
      </div>
    `;
  }

  function render() {
    els.email.innerHTML = renderTpl(state);
  }

  function persist() {
    saveMarketingPage(state);
  }

  // האזנות לכל שדה – עדכון state, רנדר ושמירה
  Object.keys(state).forEach((k) => {
    if (!els[k]) return;
    els[k].addEventListener("input", () => {
      state[k] = els[k].value;
      render();
      persist();
    });
  });

  render();
}

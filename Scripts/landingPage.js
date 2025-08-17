import { loadStyle } from "./utils.js";
import { renderHeader } from "./header.js";
import { renderDashboard } from "./dashboard.js";
import { renderLogin } from "./login.js";
import { renderMarketingPage } from "./marketing.js";
import { renderBannerEditor } from "./bannerEditor.js";
import {
  clearLoggedInUser,
  getLandingPage,
  saveLandingPage,
  clearLandingPage,
} from "./storage.js";

export function renderLandingPage(username) {
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

  const container = document.createElement("div");
  container.className = "landing-container";

  const controls = document.createElement("div");
  controls.className = "section";
  controls.innerHTML = `
    <h2 style="margin-bottom:10px">Landing Page Builder</h2>
    <p style="opacity:.85;margin:0 0 12px">תצוגה חיה ושמירה אוטומטית</p>

    <div class="form-grid">
      <div class="field"><label>Template</label>
        <select id="tpl">
          <option value="t1">Template 1 – Clean</option>
          <option value="t2">Template 2 – Hero</option>
          <option value="t3">Template 3 – Split</option>
        </select>
      </div>

      <div class="field"><label>Main title</label><input id="title" placeholder="Amazing product"/></div>
      <div class="field"><label>Subtitle</label><input id="subtitle" placeholder="Short compelling subheading"/></div>
      <div class="field"><label>Paragraph</label><textarea id="body" placeholder="Tell a short story or value proposition…"></textarea></div>
      <div class="field"><label>Hero Image URL</label><input id="imgUrl" placeholder="https://…"/></div>
      <div class="field"><label>CTA Text</label><input id="ctaText" placeholder="Get Started"/></div>
      <div class="field"><label>CTA URL</label><input id="ctaUrl" placeholder="https://example.com"/></div>
      <div class="field"><label>Background</label><input id="bg" type="color" value="#ffffff"/></div>
      <div class="field"><label>Text color</label><input id="color" type="color" value="#333333"/></div>
      <div class="field"><label>Accent color (CTA)</label><input id="accent" type="color" value="#2d89ef"/></div>
      <div class="field"><label>Font family</label>
        <select id="font">
          <option value="system-ui, -apple-system, Segoe UI, Roboto">System</option>
          <option value="Georgia, serif">Serif</option>
          <option value="Inter, Arial, sans-serif">Sans (Inter/Arial)</option>
          <option value="'Courier New', monospace">Mono</option>
        </select>
      </div>
    </div>

    <h3 style="margin:16px 0 8px">Lead Form</h3>
    <div class="form-grid">
      <div class="field"><label>Form Title</label><input id="leadTitle" placeholder="Stay in the loop"/></div>
      <div class="field"><label>Submit Button</label><input id="leadBtn" placeholder="Sign Up"/></div>
    </div>

    <div class="actions" style="margin-top:12px">
      <button id="go-live" type="button">Go live</button>
      <button id="unpublish" type="button">Unpublish</button>
      <button id="reset" type="button">Reset</button>
      <button id="delete" type="button" class="danger">Delete</button>
    </div>
  `;

  const preview = document.createElement("div");
  preview.className = "section landing-preview";
  preview.innerHTML = `<div id="canvas" aria-label="landing preview"></div>`;

  container.append(controls, preview);
  app.appendChild(container);

  const DEF = {
    tpl: "t1",
    title: "Bannerist helps you launch faster",
    subtitle: "Create and manage ads, emails & landings in minutes.",
    body: "Design quickly, preview instantly, and save your work locally.",
    imgUrl: "",
    ctaText: "Start free",
    ctaUrl: "https://example.com",
    bg: "#ffffff",
    color: "#333333",
    accent: "#2d89ef",
    font: "system-ui, -apple-system, Segoe UI, Roboto",
    leadTitle: "Stay updated",
    leadBtn: "Sign Up",
  };
  const state = Object.assign({}, DEF, getLandingPage() || {});

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
    leadTitle: controls.querySelector("#leadTitle"),
    leadBtn: controls.querySelector("#leadBtn"),
    canvas: preview.querySelector("#canvas"),

    goLive: controls.querySelector("#go-live"),
    unpublish: controls.querySelector("#unpublish"),
    resetBtn: controls.querySelector("#reset"),
    deleteBtn: controls.querySelector("#delete"),
  };

  Object.entries(state).forEach(function ([k, v]) {
    if (els[k]) els[k].value = v;
  });

  const btn = function (text, url, accent) {
    const t = text ? text : "CTA";
    const u = url ? url : "#";
    const a = accent ? accent : "#2d89ef";
    return (
      '<a href="' +
      u +
      '" style="display:inline-block;padding:12px 18px;border-radius:10px;background:' +
      a +
      ';color:#fff;text-decoration:none;font-weight:700">' +
      t +
      "</a>"
    );
  };

  const leadForm = function (title, btnText, accent) {
    const t = title ? title : "Stay in touch";
    const b = btnText ? btnText : "Submit";
    const a = accent ? accent : "#2d89ef";
    return (
      "<form onsubmit='return false' style='margin-top:16px; display:grid; gap:10px'>" +
      "<h3 style='margin:0 0 6px'>" +
      t +
      "</h3>" +
      "<input placeholder='Full name' style='padding:10px 12px;border-radius:10px;border:2px solid #645774'/>" +
      "<input type='email' placeholder='Email' style='padding:10px 12px;border-radius:10px;border:2px solid #645774'/>" +
      "<button type='submit' style='padding:10px 14px;border:none;border-radius:10px;background:" +
      a +
      ";color:#fff;font-weight:700;cursor:pointer'>" +
      b +
      "</button></form>"
    );
  };

  function renderTpl(s) {
    const shell =
      "background:" +
      s.bg +
      "; color:" +
      s.color +
      "; font-family:" +
      s.font +
      "; width:100%; max-width:1000px; margin:0 auto; line-height:1.5; padding:18px;";
    let img = "";
    if (s.imgUrl) {
      img =
        '<img src="' +
        s.imgUrl +
        '" alt="" style="max-width:100%;display:block;margin:0 auto 14px;border-radius:12px"/>';
    }

    if (s.tpl === "t1") {
      return (
        '<div style="' +
        shell +
        '">' +
        "<h1 style='margin:0 0 8px'>" +
        s.title +
        "</h1>" +
        "<h3 style='margin:0 0 14px;opacity:.85'>" +
        s.subtitle +
        "</h3>" +
        img +
        "<p style='margin:0 0 16px'>" +
        s.body +
        "</p>" +
        btn(s.ctaText, s.ctaUrl, s.accent) +
        leadForm(s.leadTitle, s.leadBtn, s.accent) +
        "</div>"
      );
    }

    if (s.tpl === "t2") {
      return (
        '<div style="' +
        shell +
        '">' +
        "<div style='background:rgba(0,0,0,.05);border-radius:12px;padding:16px;text-align:center;margin-bottom:14px'>" +
        (img ||
          "<div style='height:220px;display:grid;place-items:center;color:#888'>Hero image</div>") +
        "</div>" +
        "<h1 style='margin:0 0 8px'>" +
        s.title +
        "</h1>" +
        "<p style='margin:0 0 16px'>" +
        s.body +
        "</p>" +
        btn(s.ctaText, s.ctaUrl, s.accent) +
        leadForm(s.leadTitle, s.leadBtn, s.accent) +
        "</div>"
      );
    }

    // t3 – Split
    return (
      '<div style="' +
      shell +
      '">' +
      "<div style='display:grid;grid-template-columns:1.2fr 1fr;gap:18px'>" +
      "<div>" +
      "<h1 style='margin:0 0 8px'>" +
      s.title +
      "</h1>" +
      "<h3 style='margin:0 0 12px;opacity:.85'>" +
      s.subtitle +
      "</h3>" +
      "<p style='margin:0 0 16px'>" +
      s.body +
      "</p>" +
      btn(s.ctaText, s.ctaUrl, s.accent) +
      leadForm(s.leadTitle, s.leadBtn, s.accent) +
      "</div><div>" +
      (img ||
        "<div style='height:260px;display:grid;place-items:center;color:#888;background:rgba(0,0,0,.05);border-radius:12px'>Image</div>") +
      "</div></div></div>"
    );
  }

  function render() {
    els.canvas.innerHTML = renderTpl(state);
  }

  function persist() {
    saveLandingPage(state);
  }

  Object.keys(state).forEach(function (k) {
    if (!els[k]) return;
    els[k].addEventListener("input", function () {
      state[k] = els[k].value;
      render();
      persist();
    });
  });

  // actions
  els.goLive.addEventListener("click", function () {
    const copy = { ...state };
    copy.active = true;
    saveLandingPage(copy);
  });

  els.unpublish.addEventListener("click", function () {
    const copy = { ...state };
    copy.active = false;
    saveLandingPage(copy);
  });

  els.resetBtn.addEventListener("click", function () {
    Object.keys(DEF).forEach(function (k) {
      state[k] = DEF[k];
      if (els[k]) els[k].value = DEF[k];
    });
    render();
    saveLandingPage(state);
  });

  els.deleteBtn.addEventListener("click", function () {
    clearLandingPage();
    Object.keys(DEF).forEach(function (k) {
      state[k] = DEF[k];
      if (els[k]) els[k].value = DEF[k];
    });
    render();
  });

  render();
}

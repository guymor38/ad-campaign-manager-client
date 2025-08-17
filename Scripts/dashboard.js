import { loadStyle } from "./utils.js";
import { renderLogin } from "./login.js";
import { renderHeader } from "./header.js";
import { renderBannerEditor } from "./bannerEditor.js";
import { renderMarketingPage } from "./marketing.js";
import { renderLandingPage } from "./landingPage.js";
import {
  clearLoggedInUser,
  getBanner,
  getActiveBanners,
  isMarketingActive,
  isLandingActive,
  deleteBanner,
  clearMarketingPage,
  clearLandingPage,
} from "./storage.js";

export function renderDashboard(username) {
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
      } else {
        console.warn("Unknown page:", key);
      }
    },
    function () {
      clearLoggedInUser();
      renderLogin();
    }
  );

  const container = document.createElement("div");
  container.className = "dashboard-container";

  // helper: close button
  function makeCloseButton(onClick) {
    const btn = document.createElement("button");
    btn.className = "card-close";
    btn.textContent = "×";
    btn.title = "Delete";
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      onClick();
    });
    return btn;
  }

  // Overview
  const overview = document.createElement("div");
  overview.className = "dashboard-card";

  const title = document.createElement("h1");
  title.textContent = "Welcome, " + username + "!";

  const active = getActiveBanners();
  const hasMarketing = isMarketingActive();
  const hasLanding = isLandingActive();

  const counters = document.createElement("p");
  let count = Object.keys(active).length;
  if (hasMarketing) count += 1;
  if (hasLanding) count += 1;

  if (count > 0) {
    if (count === 1) {
      counters.textContent = "You have 1 live item.";
    } else {
      counters.textContent = "You have " + count + " live items.";
    }
  } else {
    counters.textContent = "No live items yet. Create your first one:";
  }

  const createBtn = document.createElement("button");
  createBtn.textContent = "Create New Campaign";
  createBtn.addEventListener("click", function () {
    renderBannerEditor(username);
  });

  overview.append(title, counters, createBtn);
  container.appendChild(overview);

  // Grid of cards
  const grid = document.createElement("div");
  grid.className = "dashboard-grid";

  // banner 250x250
  const b250 = getBanner("250x250");
  if (b250) {
    const card = document.createElement("div");
    card.className = "dashboard-card";

    const h = document.createElement("h3");
    h.textContent = "Banner 250×250" + (b250.active ? " • LIVE" : "");

    const frame = document.createElement("div");
    frame.className = "dashboard-banner-frame";
    frame.style.width = "250px";
    frame.style.height = "250px";
    if (b250.bg) {
      frame.style.background = b250.bg;
    } else {
      frame.style.background = "#fff";
    }

    const close = makeCloseButton(function () {
      deleteBanner("250x250");
      renderDashboard(username);
    });

    card.append(close, h, frame);
    grid.appendChild(card);
  }

  // banner 300x600
  const b300 = getBanner("300x600");
  if (b300) {
    const card = document.createElement("div");
    card.className = "dashboard-card";

    const h = document.createElement("h3");
    h.textContent = "Banner 300×600" + (b300.active ? " • LIVE" : "");

    const frame = document.createElement("div");
    frame.className = "dashboard-banner-frame";
    frame.style.width = "300px";
    frame.style.height = "600px";
    if (b300.bg) {
      frame.style.background = b300.bg;
    } else {
      frame.style.background = "#fff";
    }

    const close = makeCloseButton(function () {
      deleteBanner("300x600");
      renderDashboard(username);
    });

    card.append(close, h, frame);
    grid.appendChild(card);
  }

  // marketing card
  if (hasMarketing) {
    const card = document.createElement("div");
    card.className = "dashboard-card";
    const h = document.createElement("h3");
    h.textContent = "Marketing Email • LIVE";
    const close = makeCloseButton(function () {
      clearMarketingPage();
      renderDashboard(username);
    });
    card.append(close, h);
    grid.appendChild(card);
  }

  // landing card
  if (hasLanding) {
    const card = document.createElement("div");
    card.className = "dashboard-card";
    const h = document.createElement("h3");
    h.textContent = "Landing Page • LIVE";
    const close = makeCloseButton(function () {
      clearLandingPage();
      renderDashboard(username);
    });
    card.append(close, h);
    grid.appendChild(card);
  }

  if (grid.children.length > 0) {
    container.appendChild(grid);
  }

  app.append(header, container);
}

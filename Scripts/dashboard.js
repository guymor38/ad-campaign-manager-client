import { loadStyle } from "./utils.js";
import { renderLogin } from "./login.js";
import { renderHeader } from "./header.js";
import { renderBannerEditor } from "./bannerEditor.js";
import { renderMarketingPage } from "./marketing.js";
import { renderLandingPage } from "./landingPage.js";
import { clearLoggedInUser, getBanners } from "./storage.js";

export function renderDashboard(username) {
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

  const container = document.createElement("div");
  container.className = "dashboard-container";

  // === כרטיס Overview ===
  const overviewCard = document.createElement("div");
  overviewCard.className = "dashboard-card";

  const title = document.createElement("h1");
  title.textContent = `Welcome, ${username}!`;

  const desc = document.createElement("p");
  const { b250, b300 } = getBanners();

  if (b250 || b300) {
    let bannersCount = 0;
    if (b250) bannersCount++;
    if (b300) bannersCount++;
    desc.textContent = `Active campaign: ${bannersCount} banner${
      bannersCount > 1 ? "s" : ""
    }.`;
  } else {
    desc.textContent = "No active campaign yet. Create your first one:";
  }

  const createBtn = document.createElement("button");
  createBtn.textContent = "Create New Campaign";
  createBtn.addEventListener("click", () => renderBannerEditor(username));

  overviewCard.append(title, desc, createBtn);

  container.appendChild(overviewCard);

  // === כרטיסי תצוגת באנרים (אם קיימים) ===
  if (b250 || b300) {
    const grid = document.createElement("div");
    grid.className = "dashboard-grid";

    if (b250) {
      const card = document.createElement("div");
      card.className = "dashboard-card";

      const h3 = document.createElement("h3");
      h3.textContent = "Banner 250px";

      const frame = document.createElement("div");
      frame.className = "dashboard-banner-frame";
      frame.style.width = "250px";
      frame.style.height = "250px";
      frame.style.background = b250.bgColor || "#fff";

      card.append(h3, frame);
      grid.appendChild(card);
    }

    if (b300) {
      const card = document.createElement("div");
      card.className = "dashboard-card";

      const h3 = document.createElement("h3");
      h3.textContent = "Banner 300px";

      const frame = document.createElement("div");
      frame.className = "dashboard-banner-frame";
      frame.style.width = "300px";
      frame.style.height = "250px";
      frame.style.background = b300.bgColor || "#fff";

      card.append(h3, frame);
      grid.appendChild(card);
    }

    container.appendChild(grid);
  }

  app.append(header, container);
}

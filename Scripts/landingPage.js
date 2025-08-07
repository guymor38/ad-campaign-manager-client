import { loadStyle } from "./utils.js";
import { renderHeader } from "./header.js";
import { renderDashboard } from "./dashboard.js";
import { renderLogin } from "./login.js";
import { renderMarketingPage } from "./marketing.js";
import { renderLandingPage } from "./landingPage.js";

export function renderLandingPage(username) {
  loadStyle("./styles/landingPage.css");

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
    () => renderLogin()
  );
  app.appendChild(header);

  const container = document.createElement("div");
  container.className = "landing-container";

  const title = document.createElement("h2");
  title.textContent = "Landing Page (Under Construction)";

  container.appendChild(title);
  app.appendChild(container);
}

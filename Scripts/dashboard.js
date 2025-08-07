import { loadStyle } from "./utils.js";
import { renderLogin } from "./login.js";
import { renderHeader } from "./header.js";
import { renderBannerEditor } from "./bannerEditor.js";
import { renderMarketingPage } from "./marketing.js";
import { renderLandingPage } from "./landingPage.js";
import { clearLoggedInUser } from "./storage.js";

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
      clearLoggedInUser();  // ✅ מוחק את המשתמש
      renderLogin();        // ✅ מחזיר לעמוד ההתחברות
    }
  );

  const container = document.createElement("div");
  container.className = "dashboard-container";

  const welcome = document.createElement("h1");
  welcome.textContent = `Welcome, ${username}!`;

  const createBtn = document.createElement("button");
  createBtn.textContent = "Create New Campaign";
  createBtn.addEventListener("click", () => {
    renderBannerEditor(username);
  });

  container.append(welcome, createBtn);
  app.append(header, container);
}

import {
  initDefaultUser,
  getLoggedInUser,
  getCurrentPage,
  setCurrentPage,
} from "./storage.js";
import { renderLogin } from "./login.js";
import { renderDashboard } from "./dashboard.js";
import { renderBannerEditor } from "./bannerEditor.js";
import { renderMarketingPage } from "./marketing.js";
import { renderLandingPage } from "./landingPage.js";
import { renderAbout } from "./about.js";
import { renderPortfolio } from "./guyPortfolio.js";

initDefaultUser();

const user = getLoggedInUser();
const page = (getCurrentPage() || "dashboard").toLowerCase();

function renderByPage(p, u) {
  switch (p) {
    case "dashboard":
      renderDashboard(u);
      break;
    case "banners":
      renderBannerEditor(u);
      break;
    case "marketing":
      renderMarketingPage(u);
      break;
    case "landing":
      renderLandingPage(u);
      break;
    case "about":
      renderAbout(u);
      break;
    case "portfolio":
      renderPortfolio(u);
      break;
    default:
      renderDashboard(u);
  }
}

window.addEventListener("app:navigate", (e) => {
  const next = (e.detail?.page || "dashboard").toLowerCase();
  setCurrentPage(next);
  renderByPage(next, getLoggedInUser());
});

if (user) {
  renderByPage(page, user);
} else {
  renderLogin();
}

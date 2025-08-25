import { initDefaultUser, getLoggedInUser, getCurrentPage } from "./storage.js";
import { renderLogin } from "./login.js";
import { renderDashboard } from "./dashboard.js";
import { renderBannerEditor } from "./bannerEditor.js";
import { renderMarketingPage } from "./marketing.js";
import { renderLandingPage } from "./landingPage.js";

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
    default:
      renderDashboard(u);
  }
}

if (user) {
  renderByPage(page, user);
} else {
  renderLogin();
}

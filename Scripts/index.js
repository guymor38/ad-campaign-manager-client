import { initDefaultUser, getLoggedInUser } from "./storage.js";
import { renderLogin } from "./login.js";
import { renderDashboard } from "./dashboard.js";

initDefaultUser(); // Initialize default user if none exists

const loggedInUser = getLoggedInUser();

if (loggedInUser) {
  renderDashboard(loggedInUser);
} else {
  renderLogin();
}

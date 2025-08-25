// header.js
import { loadStyle } from "./utils.js";

export function renderHeader(username, onNavigate, onLogout, activeKey) {
  loadStyle("./styles/main.css");

  const header = document.createElement("header");
  header.className = "header";

  // left cluster: logo + nav
  const left = document.createElement("div");
  left.className = "header__left";

  const logo = document.createElement("h1");
  logo.className = "logo";
  logo.textContent = "Bannerist";

  const nav = document.createElement("nav");
  nav.className = "nav";

  const links = [
    { key: "dashboard", label: "Home" },
    { key: "banners", label: "Banners" },
    { key: "marketing", label: "Marketing" },
    { key: "landing", label: "Landing Page" },
  ];

  links.forEach(({ key, label }) => {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = label;
    a.className = "nav__link" + (key === activeKey ? " nav__link--active" : "");
    a.addEventListener("click", (e) => {
      e.preventDefault();
      onNavigate(key);
    });
    nav.appendChild(a);
  });

  left.append(logo, nav);

  // right cluster: avatar + logout
  const right = document.createElement("div");
  right.className = "header__right";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = username[0]?.toUpperCase() || "A";

  const logoutBtn = document.createElement("button");
  logoutBtn.textContent = "Logout";
  logoutBtn.className = "btn btn--ghost";
  logoutBtn.addEventListener("click", onLogout);

  right.append(avatar, logoutBtn);

  header.append(left, right);

  return header;
}

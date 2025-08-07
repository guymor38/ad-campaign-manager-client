import { loadStyle } from "./utils.js";

export function renderHeader(username, onNavigate, onLogout) {
  loadStyle("./styles/header.css");

  const header = document.createElement("header");
  header.className = "main-header";

  const logo = document.createElement("img");
  logo.src = "./Assets/img/BanneriestLogo.svg";
  logo.alt = "Bannerist Logo";
  logo.className = "logo";

  const nav = document.createElement("nav");

  const navItems = [
    { key: "dashboard", text: "Home" },
    { key: "banners", text: "Banners" },
    { key: "marketing", text: "Marketing" },
    { key: "landing", text: "Landing Page" },
  ];

  navItems.forEach(({ key, text }) => {
    const btn = document.createElement("button");
    btn.textContent = text;
    btn.addEventListener("click", () => onNavigate(key));
    nav.appendChild(btn);
  });

  const logoutBtn = document.createElement("button");
  logoutBtn.textContent = "Logout";
  logoutBtn.addEventListener("click", () => onLogout());
  nav.appendChild(logoutBtn);

  header.append(logo, nav);
  return header;
}

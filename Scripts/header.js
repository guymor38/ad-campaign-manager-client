// header.js
export function renderHeader(
  username,
  onNavigate,
  onLogout,
  currentKey = "dashboard"
) {
  const header = document.createElement("header");
  header.className = "header";

  // --- Left cluster: Logo + Nav ---
  const left = document.createElement("div");
  left.className = "header__left";

  const logo = document.createElement("h2");
  logo.className = "logo";
  logo.textContent = "Bannerist";

  const nav = document.createElement("nav");
  nav.className = "nav";

  const pages = [
    { key: "dashboard", label: "Home" },
    { key: "banners", label: "Banners" },
    { key: "marketing", label: "Marketing" },
    { key: "landing", label: "Landing Page" },
  ];

  pages.forEach(({ key, label }) => {
    const a = document.createElement("a");
    a.href = "javascript:void(0)";
    a.textContent = label;
    a.className =
      "nav__link" + (key === currentKey ? " nav__link--active" : "");
    a.addEventListener("click", () => onNavigate(key));
    nav.appendChild(a);
  });

  left.append(logo, nav);

  // --- Right cluster: Avatar + Logout ---
  const right = document.createElement("div");
  right.className = "header__right";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = (username || "?").slice(0, 2).toUpperCase();

  const logoutBtn = document.createElement("button");
  logoutBtn.className = "btn btn--ghost";
  logoutBtn.textContent = "Logout";
  logoutBtn.addEventListener("click", () => onLogout());

  right.append(avatar, logoutBtn);

  // spacer באמצע כדי לדחוף את הימין לשוליים
  const spacer = document.createElement("div");

  header.append(left, spacer, right);
  return header;
}

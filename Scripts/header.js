export function renderHeader(username, onNavigate, onLogout, currentKey) {
  const header = document.createElement("header");
  header.className = "header";

  // Left cluster: logo + nav
  const left = document.createElement("div");
  left.className = "header__left";

  const logo = document.createElement("h2");
  logo.className = "logo";
  logo.textContent = "Bannerist";

  const nav = document.createElement("nav");
  nav.className = "nav";

  const pages = [
    { key: "dashboard", label: "Home" },
    { key: "banners", label: "Banner Editor" },
    { key: "marketing", label: "Marketing" },
    { key: "landing", label: "Landing Page" },
  ];

  pages.forEach(({ key, label }) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.dataset.key = key;
    if (currentKey === key) btn.classList.add("active");
    btn.addEventListener("click", () => onNavigate(key));
    nav.appendChild(btn);
  });

  left.append(logo, nav);

  // Right cluster: avatar + logout
  const right = document.createElement("div");
  right.className = "header__right";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = (username || "?").slice(0, 1).toUpperCase();

  const logoutBtn = document.createElement("button");
  logoutBtn.className = "btn btn--ghost";
  logoutBtn.textContent = "Logout";
  logoutBtn.addEventListener("click", onLogout);

  right.append(avatar, logoutBtn);

  // Assemble
  header.append(left, document.createElement("div"), right);
  return header;
}

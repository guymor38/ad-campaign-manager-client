// header.js
export function renderHeader(username, onNavigate, onLogout) {
  const header = document.createElement("header");
  header.className = "header";

  // ─── Left side: Logo + Nav ───────────────────────────────────────────────
  const left = document.createElement("div");
  left.className = "header__left";

  const logo = document.createElement("h2");
  logo.className = "logo";
  logo.textContent = "Bannerist";

  const nav = document.createElement("nav");
  nav.className = "nav";

  // תוויות כמו בדוגמה: Home / Banners / Marketing / Landing Page
  const pages = [
    { key: "dashboard", label: "Home" },
    { key: "banners", label: "Banners" },
    { key: "marketing", label: "Marketing" },
    { key: "landing", label: "Landing Page" },
  ];

  pages.forEach(({ key, label }) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = label;
    btn.dataset.key = key;
    btn.addEventListener("click", () => onNavigate(key));
    nav.appendChild(btn);
  });

  left.append(logo, nav);

  // ─── Right side: Avatar + Logout ─────────────────────────────────────────
  const right = document.createElement("div");
  right.className = "header__right";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.title = username || "";
  avatar.setAttribute("aria-label", username || "user");
  avatar.textContent = (
    username && username[0] ? username[0] : "?"
  ).toUpperCase();

  const logoutBtn = document.createElement("button");
  logoutBtn.type = "button";
  logoutBtn.className = "btn btn--ghost logout";
  logoutBtn.textContent = "Logout";
  logoutBtn.addEventListener("click", () => onLogout());

  right.append(avatar, logoutBtn);

  // ─── Mount ────────────────────────────────────────────────────────────────
  header.append(left, right);
  return header;
}

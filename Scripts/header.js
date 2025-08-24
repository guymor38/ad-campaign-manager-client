// header.js
export function renderHeader(
  username,
  onNavigate,
  onLogout,
  activeKey = "dashboard"
) {
  const header = document.createElement("header");
  header.className = "header";

  // ===== Left: logo + nav =====
  const left = document.createElement("div");
  left.className = "header__left";

  const logo = document.createElement("h2");
  logo.className = "logo";
  logo.textContent = "Bannerist";
  logo.title = "Home";
  logo.style.cursor = "pointer";
  logo.addEventListener("click", (e) => {
    e.preventDefault();
    onNavigate("dashboard");
  });

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
    a.href = "#";
    a.className = "nav__link";
    a.dataset.key = key;
    a.textContent = label;

    // מסמן אקטיבי לפי הדף שקיבלנו בפונקציה
    if (key === activeKey) a.classList.add("nav__link--active");

    a.addEventListener("click", (e) => {
      e.preventDefault();
      // פידבק מיידי לפני שהעמוד נבנה מחדש
      nav
        .querySelectorAll(".nav__link")
        .forEach((el) => el.classList.remove("nav__link--active"));
      a.classList.add("nav__link--active");
      onNavigate(key);
    });
    nav.appendChild(a);
  });

  left.append(logo, nav);

  // ===== Right: avatar + logout =====
  const right = document.createElement("div");
  right.className = "header__right";

  const avatar = document.createElement("div");
  avatar.className = "avatar";
  const initials =
    (username || "")
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";
  avatar.textContent = initials;

  const logoutBtn = document.createElement("button");
  logoutBtn.className = "btn btn--ghost";
  logoutBtn.textContent = "Logout";
  logoutBtn.addEventListener("click", () => onLogout());

  right.append(avatar, logoutBtn);

  header.append(left, document.createElement("div"), right);
  return header;
}

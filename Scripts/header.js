export function renderHeader(username, onNavigate, onLogout) {
  const header = document.createElement("header");
  header.className = "header";

  const logo = document.createElement("h2");
  logo.textContent = "Bannerist";

  const nav = document.createElement("nav");
  nav.className = "nav";

  const pages = [
    { key: "dashboard", label: "Dashboard" },
    { key: "banners", label: "Banner Editor" },
    { key: "marketing", label: "Marketing" },
    { key: "landing", label: "Landing Page" },
  ];

  pages.forEach(({ key, label }) => {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.dataset.key = key;
    btn.addEventListener("click", () => {
      onNavigate(key); // מפעיל את ה־switch בקובץ dashboard.js
    });
    nav.appendChild(btn);
  });

  const welcome = document.createElement("span");
  welcome.textContent = `Welcome, ${username} `;

  const logoutBtn = document.createElement("button");
  logoutBtn.textContent = "Logout";
  logoutBtn.addEventListener("click", () => {
    onLogout(); // ⬅️ רק מפעיל את הפונקציה שהועברה מ־dashboard
  });

  nav.append(welcome, logoutBtn);
  header.append(logo, nav);
  return header;
}

// about.js — About page with two cards (Guy / Adi) + Portfolio buttons
import { loadStyle } from "./utils.js";
import { renderHeader } from "./header.js";
import { renderFooter } from "./footer.js";
import { renderDashboard } from "./dashboard.js";
import { renderBannerEditor } from "./bannerEditor.js";
import { renderMarketingPage } from "./marketing.js";
import { renderLandingPage } from "./landingPage.js";
import {
  clearLoggedInUser,
  setCurrentPage,
  clearCurrentPage,
} from "./storage.js";

function toast(msg, warn = false) {
  const t = document.createElement("div");
  t.className = "toast" + (warn ? " warn" : "");
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1600);
}

export function renderAbout(username) {
  loadStyle("./styles/main.css");
  loadStyle("./styles/about.css");

  const app = document.getElementById("app");
  app.innerHTML = "";

  const header = renderHeader(
    username,
    (key) => {
      setCurrentPage(key);
      switch (key) {
        case "dashboard":
          return renderDashboard(username);
        case "banners":
          return renderBannerEditor(username);
        case "marketing":
          return renderMarketingPage(username);
        case "landing":
          return renderLandingPage(username);
        case "about":
          return renderAbout(username);
        default:
          return renderDashboard(username);
      }
    },
    () => {
      clearLoggedInUser();
      clearCurrentPage();
      location.reload();
    },
    "about"
  );

  const container = document.createElement("div");
  container.className = "page about-container";

  // Cards data
  const people = [
    {
      key: "guy",
      name: "Guy Mor",
      img: "./assets/img/guy.jpeg",
      bio:
        "something about us\n" +
        "fdjkfkjdsfksdjgsdaksjgfasgdfkadsj gfjkdsgjadsksgdjgsdjbdbafaj,sdbf\n" +
        "aksjbfkabsdfbasdbfakjgdkjasdbfd aksjbfj,kBA.KBFJSA.KBFDSA.KB\n" +
        "DFBSA.DBFAFBJKDSBABFKJHG SDAFKGLAUEIGWUAIGFIRWLE GLLGQT",
      route: "portfolio", // SPA route (Guy)
      btn: "Portfolio",
    },
    {
      key: "adi",
      name: "Adi Marciano",
      img: "./assets/img/adi.jpeg",
      bio:
        "something about us\n" +
        "fdjkfkjdsfksdjgsdaksjgfasgdfkadsj gfjkdsgjadsksgdjgsdjbdbafaj,sdbf\n" +
        "aksjbfkabsdfbasdbfakjgdkjasdbfd aksjbfj,kBA.KBFJSA.KBFDSA.KB\n" +
        "DFBSA.DBFAFBJKDSBABFKJHG SDAFKGLAUEIGWUAIGFIRWLE GLLGQT",
      route: "", // אין SPA — משתמשים בקישור חיצוני
      externalUrl: "https://portfolioadimarciano.netlify.app/",
      btn: "Portfolio",
    },
  ];

  // Grid
  const grid = document.createElement("section");
  grid.className = "about-grid";
  grid.innerHTML = people
    .map(
      (p) => `
    <article class="about-card" data-person="${p.key}">
      <div class="about-card__media">
        <img src="${p.img}" alt="${p.name} portrait" loading="lazy" />
      </div>
      <div class="about-card__body">
        <h3 class="about-card__name">${p.name}</h3>
        <p class="about-card__bio">${p.bio}</p>
        <button
          class="btn about-card__btn"
          data-route="${p.route || ""}"
          data-external="${p.externalUrl ? p.externalUrl : ""}">
          ${p.btn}
        </button>
      </div>
    </article>
  `
    )
    .join("");

  container.append(grid);
  app.append(header, container, renderFooter());

  // Delegated navigation
  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".about-card__btn");
    if (!btn) return;

    const external = (btn.getAttribute("data-external") || "").trim();
    if (external) {
      // open external portfolio in a new tab
      window.open(external, "_blank", "noopener");
      return;
    }

    const pageKey = (btn.getAttribute("data-route") || "").trim();
    if (pageKey) {
      setCurrentPage(pageKey);
      window.dispatchEvent(
        new CustomEvent("app:navigate", { detail: { page: pageKey } })
      );
      toast("Navigating…");
    }
  });
}

// footer.js
import { loadStyle } from "./utils.js";

export function renderFooter() {
  loadStyle("./styles/main.css");

  const footer = document.createElement("footer");
  footer.className = "footer";

  footer.innerHTML = `
    <div class="footer__inner">
      <span class="footer__left">Bannerist</span>
      <span class="footer__right">2025</span>
    </div>
  `;

  return footer;
}

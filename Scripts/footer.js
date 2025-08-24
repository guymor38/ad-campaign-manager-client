// footer.js
export function renderFooter() {
  const year = new Date().getFullYear();
  const el = document.createElement("footer");
  el.className = "footer";
  el.innerHTML = `
    <div class="footer__inner">
      <div class="footer__brand">Bannerist</div>
      <div class="footer__year">${year}</div>
    </div>
  `;
  return el;
}

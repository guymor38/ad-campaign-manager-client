// footer.js
export function renderFooter() {
  const year = new Date().getFullYear();

  const footer = document.createElement("footer");
  footer.className = "footer";

  const inner = document.createElement("div");
  inner.className = "footer__inner";

  const brand = document.createElement("div");
  brand.className = "footer__brand";
  brand.textContent = "Bannerist";

  const right = document.createElement("div");
  right.className = "footer__right";
  right.textContent = String(year);

  inner.append(brand, right);
  footer.appendChild(inner);
  return footer;
}

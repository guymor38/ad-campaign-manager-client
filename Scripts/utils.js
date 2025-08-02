// Remove existing dynamic styles to prevent duplicates
export function loadStyle(href) {
  const existing = document.querySelector("link[data-dynamic-style]");
  if (existing) existing.remove();

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.setAttribute("data-dynamic-style", "true");
  document.head.appendChild(link);
}

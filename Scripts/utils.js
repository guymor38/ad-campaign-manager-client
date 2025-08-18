// ===== CSS loader =====
export function loadStyle(href) {
  if (document.querySelector(`link[data-href="${href}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.dataset.href = href;
  document.head.appendChild(link);
}

// ===== Toast =====
// type: "ok" (ברירת מחדל) או "warn"
export function showToast(msg, type = "ok") {
  const t = document.createElement("div");
  t.className = "toast" + (type === "warn" ? " warn" : "");
  t.textContent = msg;
  document.body.appendChild(t);
  // להסיר בסוף האנימציה
  setTimeout(() => t.remove(), 1600);
}

// ===== Element helper =====
// el("div", "class-names", "<b>html</b>")
export function el(tag, className, html) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  if (html !== undefined) n.innerHTML = html;
  return n;
}

// ==========================
// Users (auth)
// ==========================

export function initDefaultUser() {
  const users = getUsers();
  if (users.length === 0) {
    const defaultUser = { username: "admin", password: "1234" };
    saveUser(defaultUser);
    console.log("Default user created:", defaultUser);
  }
}

export function getUsers() {
  const data = localStorage.getItem("users");
  return data ? JSON.parse(data) : [];
}

export function saveUser(newUser) {
  const users = getUsers();
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
}

export function findUser(username) {
  return getUsers().find((u) => u.username === username);
}

export function deleteUser(username) {
  const filtered = getUsers().filter((u) => u.username !== username);
  localStorage.setItem("users", JSON.stringify(filtered));
}

export function setLoggedInUser(username) {
  localStorage.setItem("loggedInUser", username);
}
export function getLoggedInUser() {
  return localStorage.getItem("loggedInUser");
}
export function clearLoggedInUser() {
  localStorage.removeItem("loggedInUser");
}

// ==========================
// Banners (legacy + v2)
// ==========================

// Legacy object store: { "250x250": {...}, "300x600": {...} }
const BANNERS_KEY = "banners";
// New list store (preferred going forward): [{ id, size, ... }]
const BANNERS_V2_KEY = "banners_v2";

/** Read the v2 list if exists (array) */
function readBannersV2() {
  const raw = localStorage.getItem(BANNERS_V2_KEY);
  if (!raw) return null;
  try {
    const val = JSON.parse(raw);
    return Array.isArray(val) ? val : null;
  } catch {
    return null;
  }
}

/** Write the v2 list (array) */
function writeBannersV2(list) {
  localStorage.setItem(BANNERS_V2_KEY, JSON.stringify(list || []));
}

/** Read legacy object (or empty object) */
function readBannersLegacy() {
  const raw = localStorage.getItem(BANNERS_KEY);
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" && !Array.isArray(obj) ? obj : {};
  } catch {
    return {};
  }
}
/** Write legacy object */
function writeBannersLegacy(obj) {
  localStorage.setItem(BANNERS_KEY, JSON.stringify(obj || {}));
}

/** Public: return v2 list if exists, otherwise legacy object */
export function getBanners() {
  const v2 = readBannersV2();
  if (v2) return v2;
  return readBannersLegacy();
}

/** Public (legacy API): get by size */
export function getBanner(size) {
  const all = getBanners();
  if (Array.isArray(all)) {
    return all.find((it) => it.size === size) || null;
  }
  return all[size] || null;
}

/** Public: return only active (shape matches storage: array for v2, object for legacy) */
export function getActiveBanners() {
  const all = getBanners();
  if (Array.isArray(all)) {
    return all.filter((it) => it && it.active);
  }
  const out = {};
  Object.keys(all).forEach((k) => {
    if (all[k] && all[k].active) out[k] = all[k];
  });
  return out;
}

/** Public (legacy API): save by size – updates both legacy and v2 (migration-friendly) */
export function saveBanner(size, data) {
  // --- legacy update ---
  const legacy = readBannersLegacy();
  const prev = legacy[size] || {};
  const activeValue =
    data.active !== undefined
      ? data.active
      : prev.active !== undefined
      ? prev.active
      : false;

  legacy[size] = {
    ...prev,
    ...data,
    size,
    active: activeValue,
    updatedAt: Date.now(),
  };
  writeBannersLegacy(legacy);

  // --- v2 update (upsert by size; if none – create with generated id) ---
  const list = readBannersV2() || migrateLegacyToV2(legacy);
  const idx = list.findIndex((it) => it.size === size);
  if (idx === -1) {
    list.unshift({
      id: cryptoRandom(),
      size,
      ...data,
      active: activeValue,
      updatedAt: Date.now(),
    });
  } else {
    list[idx] = {
      ...list[idx],
      ...data,
      size,
      active: activeValue,
      updatedAt: Date.now(),
    };
  }
  writeBannersV2(list);
}

/** Public (legacy API): delete by size – removes from both stores if present */
export function deleteBanner(size) {
  // legacy
  const legacy = readBannersLegacy();
  if (legacy[size]) {
    delete legacy[size];
    writeBannersLegacy(legacy);
  }
  // v2
  const list = readBannersV2();
  if (list) {
    writeBannersV2(list.filter((it) => it.size !== size));
  }
}

export function resetBanner(size) {
  deleteBanner(size);
}

export function resetAllBanners() {
  localStorage.removeItem(BANNERS_KEY);
  localStorage.removeItem(BANNERS_V2_KEY);
}

/** Public (legacy API): set active by size; supports v2 as well */
export function setBannerActive(sizeOrId, active) {
  // try by id in v2
  let list = readBannersV2();
  if (list) {
    const byId = list.findIndex((it) => it.id === sizeOrId);
    if (byId !== -1) {
      list[byId].active = !!active;
      list[byId].updatedAt = Date.now();
      writeBannersV2(list);
      // also mirror to legacy if this item has size
      if (list[byId].size) {
        const legacy = readBannersLegacy();
        const s = list[byId].size;
        if (legacy[s]) {
          legacy[s].active = !!active;
          legacy[s].updatedAt = Date.now();
          writeBannersLegacy(legacy);
        }
      }
      return;
    }
  }
  // fallback: legacy by size
  const legacy = readBannersLegacy();
  if (legacy[sizeOrId]) {
    legacy[sizeOrId].active = !!active;
    legacy[sizeOrId].updatedAt = Date.now();
    writeBannersLegacy(legacy);
    // mirror to v2
    list = readBannersV2() || migrateLegacyToV2(legacy);
    const idx = list.findIndex((it) => it.size === sizeOrId);
    if (idx !== -1) {
      list[idx].active = !!active;
      list[idx].updatedAt = Date.now();
      writeBannersV2(list);
    }
  }
}

export function isBannerActive(size) {
  const b = getBanner(size);
  return !!(b && b.active);
}

/* ---------- v2 helpers (optional new API) ---------- */

/** List (array) – always returns an array (migrates if needed) */
export function getBannersList() {
  const v2 = readBannersV2();
  if (v2) return v2;
  const migrated = migrateLegacyToV2(readBannersLegacy());
  writeBannersV2(migrated);
  return migrated;
}

/** Upsert a banner item with id (for future multi-banner editor) */
export function upsertBannerItem(item) {
  const list = getBannersList();
  const id = item.id || cryptoRandom();
  const idx = list.findIndex((it) => it.id === id);
  const merged = {
    id,
    size: item.size || "250x250",
    title: item.title || "",
    subtitle: item.subtitle || "",
    body: item.body || "",
    bg: item.bg || "",
    color: item.color || "",
    fontFamily: item.fontFamily || "",
    titleSize: item.titleSize,
    subtitleSize: item.subtitleSize,
    bodySize: item.bodySize,
    dotColor: item.dotColor,
    dotSize: item.dotSize,
    template: item.template || "t1",
    active: !!item.active,
    updatedAt: Date.now(),
  };
  if (idx === -1) list.unshift(merged);
  else list[idx] = { ...list[idx], ...merged };

  writeBannersV2(list);
  return id;
}

export function deleteBannerById(id) {
  const list = getBannersList().filter((it) => it.id !== id);
  writeBannersV2(list);
}
export function setBannerActiveById(id, active) {
  const list = getBannersList();
  const i = list.findIndex((it) => it.id === id);
  if (i !== -1) {
    list[i].active = !!active;
    list[i].updatedAt = Date.now();
    writeBannersV2(list);
  }
}

/* ---------- migration + utils ---------- */

function migrateLegacyToV2(legacyObj) {
  const out = [];
  Object.entries(legacyObj || {}).forEach(([size, data]) => {
    out.push({
      id: size, // deterministic id for legacy
      size,
      ...data,
    });
  });
  // newest first (roughly by updatedAt)
  return out.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

function cryptoRandom() {
  // best-effort id generator (works in browsers)
  if (crypto?.randomUUID) return crypto.randomUUID();
  return "id_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ==========================
// Marketing (email) – single entry (unchanged)
// ==========================

const MARKETING_KEY = "marketingPage";

export function getMarketingPage() {
  const raw = localStorage.getItem(MARKETING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveMarketingPage(data) {
  const prev = getMarketingPage() || {};
  const activeValue =
    data.active !== undefined
      ? data.active
      : prev.active !== undefined
      ? prev.active
      : false;

  const newData = {
    ...prev,
    ...data,
    active: activeValue,
    updatedAt: Date.now(),
  };
  localStorage.setItem(MARKETING_KEY, JSON.stringify(newData));
}

export function clearMarketingPage() {
  localStorage.removeItem(MARKETING_KEY);
}
export function setMarketingActive(active) {
  const prev = getMarketingPage();
  if (!prev) return;
  saveMarketingPage({ ...prev, active: !!active });
}
export function isMarketingActive() {
  const p = getMarketingPage();
  return !!(p && p.active);
}

// ==========================
// Landing Page – single entry (unchanged)
// ==========================

const LANDING_KEY = "landingPage";

export function getLandingPage() {
  const raw = localStorage.getItem(LANDING_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLandingPage(data) {
  const prev = getLandingPage() || {};
  const activeValue =
    data.active !== undefined
      ? data.active
      : prev.active !== undefined
      ? prev.active
      : false;

  const newData = {
    ...prev,
    ...data,
    active: activeValue,
    updatedAt: Date.now(),
  };
  localStorage.setItem(LANDING_KEY, JSON.stringify(newData));
}

export function clearLandingPage() {
  localStorage.removeItem(LANDING_KEY);
}
export function setLandingActive(active) {
  const prev = getLandingPage();
  if (!prev) return;
  saveLandingPage({ ...prev, active: !!active });
}
export function isLandingActive() {
  const p = getLandingPage();
  return !!(p && p.active);
}

// ==========================
// Current page (view state)
// ==========================

const CURRENT_PAGE_KEY = "currentPage";
export function setCurrentPage(pageKey) {
  localStorage.setItem(CURRENT_PAGE_KEY, pageKey);
}
export function getCurrentPage() {
  return localStorage.getItem(CURRENT_PAGE_KEY);
}
export function clearCurrentPage() {
  localStorage.removeItem(CURRENT_PAGE_KEY);
}
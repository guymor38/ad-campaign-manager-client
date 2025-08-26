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
  const users = getUsers().filter((u) => u.username !== username);
  localStorage.setItem("users", JSON.stringify(users));
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
// Banners
// ==========================

const BANNERS_KEY = "banners";

export function getBanners() {
  const raw = localStorage.getItem(BANNERS_KEY);
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

export function saveBanner(size, data) {
  const all = getBanners();
  const prev = all[size] || {};
  const activeValue =
    data.active !== undefined
      ? data.active
      : prev.active !== undefined
      ? prev.active
      : false;

  all[size] = { ...prev, ...data, active: activeValue, updatedAt: Date.now() };
  localStorage.setItem(BANNERS_KEY, JSON.stringify(all));
}

export function getBanner(size) {
  return getBanners()[size] || null;
}

export function deleteBanner(size) {
  const all = getBanners();
  if (!all[size]) return;
  delete all[size];
  const keys = Object.keys(all);
  if (keys.length === 0) localStorage.removeItem(BANNERS_KEY);
  else localStorage.setItem(BANNERS_KEY, JSON.stringify(all));
}

export function resetBanner(size) {
  deleteBanner(size);
}
export function resetAllBanners() {
  localStorage.removeItem(BANNERS_KEY);
}

export function setBannerActive(size, active) {
  const all = getBanners();
  if (!all[size]) return;
  all[size].active = !!active;
  all[size].updatedAt = Date.now();
  localStorage.setItem(BANNERS_KEY, JSON.stringify(all));
}

export function isBannerActive(size) {
  const b = getBanner(size);
  return !!(b && b.active);
}

export function getActiveBanners() {
  const all = getBanners();
  const res = {};
  for (const k in all) if (all[k]?.active) res[k] = all[k];
  return res;
}

// ==========================
// Marketing (email)
// ==========================

const MARKETING_KEY = "marketingPage";

export function getMarketingPage() {
  const raw = localStorage.getItem(MARKETING_KEY);
  if (!raw) return null; // יכול להיות אובייקט או מערך
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveMarketingPage(data) {
  const prev = getMarketingPage();
  if (Array.isArray(data)) {
    // אם שולחים ישירות מערך – לשמור כמות שהוא
    localStorage.setItem(MARKETING_KEY, JSON.stringify(data));
    return;
  }
  const prevObj = prev && !Array.isArray(prev) ? prev : {};
  const activeValue =
    data.active !== undefined
      ? data.active
      : prevObj.active !== undefined
      ? prevObj.active
      : false;

  const newData = {
    ...prevObj,
    ...data,
    active: activeValue,
    updatedAt: Date.now(),
  };
  localStorage.setItem(MARKETING_KEY, JSON.stringify(newData));
}

export function addMarketingCampaign(data) {
  const prev = getMarketingPage();
  const list = Array.isArray(prev) ? prev.slice() : prev ? [prev] : [];
  list.push({ ...data, updatedAt: Date.now() });
  localStorage.setItem(MARKETING_KEY, JSON.stringify(list));
}

export function clearMarketingPage() {
  localStorage.removeItem(MARKETING_KEY);
}

export function setMarketingActive(indexOrActive, maybeActive) {
  const prev = getMarketingPage();
  if (!prev) return;

  if (Array.isArray(prev)) {
    const list = prev.slice();
    if (typeof indexOrActive === "number") {
      if (list[indexOrActive]) {
        list[indexOrActive].active = !!maybeActive;
        list[indexOrActive].updatedAt = Date.now();
      }
    } else {
      const flag = !!indexOrActive;
      list.forEach((i) => {
        i.active = flag;
        i.updatedAt = Date.now();
      });
    }
    localStorage.setItem(MARKETING_KEY, JSON.stringify(list));
  } else {
    saveMarketingPage({ ...prev, active: !!(maybeActive ?? indexOrActive) });
  }
}

export function isMarketingActive() {
  const p = getMarketingPage();
  return Array.isArray(p) ? p.some((x) => x?.active) : !!(p && p.active);
}

// ==========================
// Landing Page (published)
// ==========================

const LANDING_KEY = "landingPage";

export function getLandingPage() {
  const raw = localStorage.getItem(LANDING_KEY);
  if (!raw) return null; // יכול להיות אובייקט או מערך
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLandingPage(data) {
  const prev = getLandingPage();
  if (Array.isArray(data)) {
    localStorage.setItem(LANDING_KEY, JSON.stringify(data));
    return;
  }
  const prevObj = prev && !Array.isArray(prev) ? prev : {};
  const activeValue =
    data.active !== undefined
      ? data.active
      : prevObj.active !== undefined
      ? prevObj.active
      : false;

  const newData = {
    ...prevObj,
    ...data,
    active: activeValue,
    updatedAt: Date.now(),
  };
  localStorage.setItem(LANDING_KEY, JSON.stringify(newData));
}

export function addLandingCampaign(data) {
  const prev = getLandingPage();
  const list = Array.isArray(prev) ? prev.slice() : prev ? [prev] : [];
  list.push({ ...data, updatedAt: Date.now() });
  localStorage.setItem(LANDING_KEY, JSON.stringify(list));
}

export function clearLandingPage() {
  localStorage.removeItem(LANDING_KEY);
}

export function setLandingActive(indexOrActive, maybeActive) {
  const prev = getLandingPage();
  if (!prev) return;

  if (Array.isArray(prev)) {
    const list = prev.slice();
    if (typeof indexOrActive === "number") {
      if (list[indexOrActive]) {
        list[indexOrActive].active = !!maybeActive;
        list[indexOrActive].updatedAt = Date.now();
      }
    } else {
      const flag = !!indexOrActive;
      list.forEach((i) => {
        i.active = flag;
        i.updatedAt = Date.now();
      });
    }
    localStorage.setItem(LANDING_KEY, JSON.stringify(list));
  } else {
    saveLandingPage({ ...prev, active: !!(maybeActive ?? indexOrActive) });
  }
}

export function isLandingActive() {
  const p = getLandingPage();
  return Array.isArray(p) ? p.some((x) => x?.active) : !!(p && p.active);
}

// ==========================
// Landing Draft (for editor)
// ==========================

const LANDING_DRAFT_KEY = "landingDraft";

export function getLandingDraft() {
  const raw = localStorage.getItem(LANDING_DRAFT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLandingDraft(data) {
  const safe = { ...data, updatedAt: Date.now() };
  localStorage.setItem(LANDING_DRAFT_KEY, JSON.stringify(safe));
}

export function clearLandingDraft() {
  localStorage.removeItem(LANDING_DRAFT_KEY);
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

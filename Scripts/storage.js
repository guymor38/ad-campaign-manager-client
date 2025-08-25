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
  if (data) {
    return JSON.parse(data);
  } else {
    return [];
  }
}

export function saveUser(newUser) {
  const users = getUsers();
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
}

export function findUser(username) {
  const users = getUsers();
  for (let i = 0; i < users.length; i++) {
    if (users[i].username === username) {
      return users[i];
    }
  }
  return undefined;
}

export function deleteUser(username) {
  const users = getUsers();
  const filtered = [];
  for (let i = 0; i < users.length; i++) {
    if (users[i].username !== username) {
      filtered.push(users[i]);
    }
  }
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
// Banners
// ==========================

const BANNERS_KEY = "banners";

export function getBanners() {
  const raw = localStorage.getItem(BANNERS_KEY);
  if (!raw) {
    return {};
  }
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === "object") {
      return obj;
    } else {
      return {};
    }
  } catch (e) {
    return {};
  }
}

export function saveBanner(size, data) {
  const all = getBanners();
  let prev = {};
  if (all[size]) {
    prev = all[size];
  }

  let activeValue;
  if (data.active !== undefined) {
    activeValue = data.active;
  } else if (prev.active !== undefined) {
    activeValue = prev.active;
  } else {
    activeValue = false;
  }

  all[size] = {
    ...prev,
    ...data,
    active: activeValue,
    updatedAt: Date.now(),
  };

  localStorage.setItem(BANNERS_KEY, JSON.stringify(all));
}

export function getBanner(size) {
  const all = getBanners();
  if (all[size]) {
    return all[size];
  } else {
    return null;
  }
}

export function clearBanners() {
  localStorage.removeItem(BANNERS_KEY);
}

export function deleteBanner(size) {
  const all = getBanners();
  if (all[size]) {
    delete all[size];
    const keys = Object.keys(all);
    if (keys.length === 0) {
      localStorage.removeItem(BANNERS_KEY);
    } else {
      localStorage.setItem(BANNERS_KEY, JSON.stringify(all));
    }
  }
}

export function resetBanner(size) {
  deleteBanner(size);
}

export function resetAllBanners() {
  localStorage.removeItem(BANNERS_KEY);
}

export function setBannerActive(size, active) {
  const all = getBanners();
  if (all[size]) {
    if (active) {
      all[size].active = true;
    } else {
      all[size].active = false;
    }
    all[size].updatedAt = Date.now();
    localStorage.setItem(BANNERS_KEY, JSON.stringify(all));
  }
}

export function isBannerActive(size) {
  const b = getBanner(size);
  if (b && b.active) {
    return true;
  } else {
    return false;
  }
}

export function getActiveBanners() {
  const all = getBanners();
  const result = {};
  for (const key in all) {
    if (all[key] && all[key].active) {
      result[key] = all[key];
    }
  }
  return result;
}

// ==========================
// Marketing (email)
// ==========================

const MARKETING_KEY = "marketingPage";

export function getMarketingPage() {
  const raw = localStorage.getItem(MARKETING_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveMarketingPage(data) {
  const prev = getMarketingPage();
  let prevData = {};
  if (prev) {
    prevData = prev;
  }

  let activeValue;
  if (data.active !== undefined) {
    activeValue = data.active;
  } else if (prevData.active !== undefined) {
    activeValue = prevData.active;
  } else {
    activeValue = false;
  }

  const newData = {
    ...prevData,
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
  if (prev) {
    const copy = { ...prev };
    if (active) {
      copy.active = true;
    } else {
      copy.active = false;
    }
    saveMarketingPage(copy);
  }
}

export function isMarketingActive() {
  const p = getMarketingPage();
  if (p && p.active) {
    return true;
  } else {
    return false;
  }
}

// ==========================
// Landing Page
// ==========================

const LANDING_KEY = "landingPage";

export function getLandingPage() {
  const raw = localStorage.getItem(LANDING_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function saveLandingPage(data) {
  const prev = getLandingPage();
  let prevData = {};
  if (prev) {
    prevData = prev;
  }

  let activeValue;
  if (data.active !== undefined) {
    activeValue = data.active;
  } else if (prevData.active !== undefined) {
    activeValue = prevData.active;
  } else {
    activeValue = false;
  }

  const newData = {
    ...prevData,
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
  if (prev) {
    const copy = { ...prev };
    if (active) {
      copy.active = true;
    } else {
      copy.active = false;
    }
    saveLandingPage(copy);
  }
}

export function isLandingActive() {
  const p = getLandingPage();
  if (p && p.active) {
    return true;
  } else {
    return false;
  }
}

// Current page (view state)
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

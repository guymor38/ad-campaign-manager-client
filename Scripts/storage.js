// Initialize a default user if no users exist in localStorage
export function initDefaultUser() {
  const users = getUsers();
  if (users.length === 0) {
    const defaultUser = { username: "admin", password: "1234" };
    saveUser(defaultUser);
    console.log("Default user created:", defaultUser);
  }
}

// Retrieve users from localStorage
// If data exists, parse it; otherwise return an empty array
export function getUsers() {
  const data = localStorage.getItem("users");

  if (data) {
    return JSON.parse(data);
  } else {
    return [];
  }
}

// Save a new user to localStorage
export function saveUser(newUser) {
  const users = getUsers(); // Retrieve existing users
  users.push(newUser); // Add the new user to the array
  localStorage.setItem("users", JSON.stringify(users)); // Save the updated array back to localStorage.
}

// Check if a user with the given username exists
export function findUser(username) {
  const users = getUsers();
  return users.find((u) => u.username === username);
}

// Delete a user by username
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

// Get the currently logged-in user from localStorage
export function setLoggedInUser(username) {
  localStorage.setItem("loggedInUser", username);
}

// Retrieve the currently logged-in user from localStorage
export function getLoggedInUser() {
  return localStorage.getItem("loggedInUser");
}

// Clear the currently logged-in user from localStorage
export function clearLoggedInUser() {
  localStorage.removeItem("loggedInUser");
}

// ===== BANNERS STORAGE =====
const BANNERS_KEY = "banners";

export function getBanners() {
  const raw = localStorage.getItem(BANNERS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveBanner(size, data) {
  const all = getBanners();
  all[size] = { ...data, updatedAt: Date.now() };
  localStorage.setItem(BANNERS_KEY, JSON.stringify(all));
}

export function getBanner(size) {
  const all = getBanners();
  return all[size] || null;
}

export function clearBanners() {
  localStorage.removeItem(BANNERS_KEY);
}

// === MARKETING (email) ===
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
  localStorage.setItem(
    MARKETING_KEY,
    JSON.stringify({ ...data, updatedAt: Date.now() })
  );
}

export function clearMarketingPage() {
  localStorage.removeItem(MARKETING_KEY);
}

// === LANDING PAGE ===
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
  localStorage.setItem(
    LANDING_KEY,
    JSON.stringify({ ...data, updatedAt: Date.now() })
  );
}

export function clearLandingPage() {
  localStorage.removeItem(LANDING_KEY);
}

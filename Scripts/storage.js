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

// Clear all users from localStorage
export function clearAllUsers() {
  localStorage.removeItem("users");
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

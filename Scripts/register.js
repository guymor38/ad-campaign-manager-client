import { loadStyle } from "./utils.js";
import { renderLogin } from "./login.js";
import { getUsers, saveUser, findUser } from "./storage.js";

export function renderRegister() {
  loadStyle("./Styles/register.css");

  const app = document.getElementById("app");
  app.innerHTML = "";

  const container = document.createElement("div");
  container.className = "register-container";

  const logo = document.createElement("h1");
  logo.className = "logo";
  logo.textContent = "Bannerist";

  const form = document.createElement("form");
  form.className = "register-form";

  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.placeholder = "User Name";
  usernameInput.required = true;

  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.placeholder = "Password";
  passwordInput.required = true;

  const confirmInput = document.createElement("input");
  confirmInput.type = "password";
  confirmInput.placeholder = "Confirm Password";
  confirmInput.required = true;

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Sign Up";

  const message = document.createElement("p");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const confirm = confirmInput.value;

    if (password !== confirm) {
      message.textContent = "Passwords do not match";
      return;
    }

    const existingUser = findUser(username);
    if (existingUser) {
      message.textContent = "User already exists!";
      return;
    }

    const newUser = { username, password };
    saveUser(newUser);
    message.textContent = "User registered successfully!";
  });

  const switchToLogin = document.createElement("p");
  switchToLogin.innerHTML = `Already have an account? <a href="#" id="to-login">Log In</a>`;
  switchToLogin.style.marginTop = "15px";
  switchToLogin.querySelector("#to-login").addEventListener("click", (e) => {
    e.preventDefault();
    renderLogin();
  });

  form.append(usernameInput, passwordInput, confirmInput, submitBtn);
  container.append(logo, form, message, switchToLogin);
  app.appendChild(container);
}

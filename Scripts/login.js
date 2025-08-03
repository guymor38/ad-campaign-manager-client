import { loadStyle } from "./utils.js";
import { renderRegister } from "./register.js";
import { findUser } from "./storage.js";

export function renderLogin() {
  loadStyle("./Styles/login.css");

  const app = document.getElementById("app");
  app.innerHTML = "";

  const container = document.createElement("div");
  container.className = "login-container";

  const logo = document.createElement("img");
  logo.src = "./Assets/img/BanneriestLogo.svg";
  logo.alt = "Bannerist Logo";
  logo.className = "logo";
  

  const form = document.createElement("form");
  form.className = "login-form";

  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.placeholder = "User Name";
  usernameInput.required = true;

  const passwordInput = document.createElement("input");
  passwordInput.type = "password";
  passwordInput.placeholder = "Password";
  passwordInput.required = true;

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Login";

  const message = document.createElement("p");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const existingUser = findUser(username);

    if (!existingUser) {
      message.textContent = "User does not exist.";
      return;
    }

    if (existingUser.password !== password) {
      message.textContent = "Incorrect password.";
      return;
    }

    message.textContent = "Login successful!";
  });

  const switchToRegister = document.createElement("p");
  switchToRegister.innerHTML = `Don't have an account? <a href="#" id="to-register">Sign Up</a>`;
  switchToRegister.style.marginTop = "15px";
  switchToRegister
    .querySelector("#to-register")
    .addEventListener("click", (e) => {
      e.preventDefault();
      renderRegister();
    });

  form.append(usernameInput, passwordInput, submitBtn);
  container.append(logo, form, message, switchToRegister);
  app.appendChild(container);
}

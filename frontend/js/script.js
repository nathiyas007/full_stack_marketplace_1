const isLocalDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

const isDevFrontend = isLocalDev && window.location.port !== "8000";

const API_BASE_URL = isDevFrontend
  ? "http://127.0.0.1:8000/api"
  : "/api";


// --- API HELPER ---
async function apiCall(endpoint, method = "GET", body = null, auth = false) {

  const headers = {
    "Content-Type": "application/json",
  };

  // Safe user parse
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Add auth headers only if needed
  if (auth && user) {
    headers["X-User-Id"] = user.id;
    headers["X-User-Role"] = user.role;
  }

  const options = {
    method,
    headers,
  };

  // Don't attach body for GET requests
  if (body && method !== "GET") {
    options.body = JSON.stringify(body);
  }

  try {

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(data.detail || "API Error");
    }

    return data;

  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}


// --- AUTH LOGIC ---
const Auth = {

  login: async (email, password) => {
    try {

      const data = await apiCall("/auth/login", "POST", { email, password });

      if (data.user_id) {

        const user = {
          id: data.user_id,
          name: data.name,
          email: email,
          role: data.role,
        };

        localStorage.setItem("user", JSON.stringify(user));

        return user;
      }

      return false;

    } catch (e) {
      alert(e.message);
      return false;
    }
  },


  signup: async (name, email, password, mobile, address) => {
    try {

      await apiCall("/auth/signup", "POST", {
        name,
        email,
        password,
        mobile,
        address,
      });

      return true;

    } catch (e) {
      alert(e.message);
      return false;
    }
  },


  logout: () => {

    localStorage.removeItem("user");

    const isSubfolder = window.location.pathname.includes("/pages/");

    window.location.href = isSubfolder
      ? "../../index.html"
      : "index.html";
  },


  getCurrentUser: () => {
    return JSON.parse(localStorage.getItem("user") || "null");
  }

};


// --- UI HELPERS ---

function toggleUserMenu() {

  const menu = document.getElementById("userMenu");

  if (menu) {
    menu.style.display =
      menu.style.display === "block" ? "none" : "block";
  }

}


function toggleCategoryMenu() {

  const menu = document.getElementById("categoryMenu");

  if (menu) {
    menu.style.display =
      menu.style.display === "block" ? "none" : "block";
  }

}


function filterByCategory(category) {

  const isSubfolder = window.location.pathname.includes("/pages/");
  const pfx = isSubfolder ? "../../" : "";

  if (category === "All") {
    window.location.href = pfx + "index.html";
    return;
  }

  window.location.href =
    `${pfx}index.html?category=${encodeURIComponent(category)}`;
}


document.addEventListener("click", function (event) {

  const userMenu = document.getElementById("userMenu");
  const categoryMenu = document.getElementById("categoryMenu");

  if (userMenu && !event.target.closest(".toggle-btn")) {
    userMenu.style.display = "none";
  }

  if (categoryMenu && !event.target.closest(".Category_dropdown")) {
    categoryMenu.style.display = "none";
  }

});


document.addEventListener("DOMContentLoaded", () => {
  updateHeaderUI();
});


// --- HEADER UI ---
function updateHeaderUI() {

  const user = Auth.getCurrentUser();

  const loginLink = document.getElementById("loginLink");
  const logoutLink = document.getElementById("logoutLink");
  const accountSpan = document.getElementById("navAccountName");

  if (user) {

    if (loginLink) loginLink.style.display = "none";
    if (logoutLink) logoutLink.style.display = "block";

    if (accountSpan) {

      accountSpan.innerText = user.name.split(" ")[0];

      const avatar = accountSpan.previousElementSibling;

      if (avatar) {

        if (avatar.tagName === "I") {

          avatar.outerHTML =
            `<div class="letter-avatar">${user.name.charAt(0).toUpperCase()}</div>`;

        }
        else if (avatar.classList.contains("letter-avatar")) {

          avatar.innerText =
            user.name.charAt(0).toUpperCase();

        }

      }

    }

  }

  else {

    if (loginLink) loginLink.style.display = "block";
    if (logoutLink) logoutLink.style.display = "none";

    if (accountSpan) {

      accountSpan.innerText = "Account";

      const avatar = accountSpan.previousElementSibling;

      if (avatar && avatar.classList.contains("letter-avatar")) {

        avatar.outerHTML = `<i class="fa-regular fa-user"></i>`;

      }

    }

  }

}


function handleLogout() {
  Auth.logout();
}


// --- GLOBAL EXPORT ---
window.handleLogout = handleLogout;
window.apiCall = apiCall;
window.Auth = Auth;
window.API_BASE_URL = API_BASE_URL;


// --- IMAGE URL HELPER ---
window.getImageUrl = function (path) {

  if (!path) {
    return "https://via.placeholder.com/300";
  }

  if (path.startsWith("http")) {
    return path;
  }

  let cleanPath = path.startsWith("/") ? path : "/" + path;

  if (isDevFrontend) {
    return "http://127.0.0.1:8000" + cleanPath;
  }

  return cleanPath;
};
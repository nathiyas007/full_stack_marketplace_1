const API_BASE_URL = "https://deployment-backend-1-t8r4.onrender.com";

// --- API HELPER ---
async function apiCall(endpoint, method = 'GET', body = null, auth = false) {
    const headers = {
        'Content-Type': 'application/json'
    };

    // Simple basic auth or custom header logic if your backend requires token
    // For now, based on your backend, it seems to not fully enforce JWT yet or uses simple checking.
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        headers['X-User-Id'] = user.id;
        headers['X-User-Role'] = user.role;
    }

    const options = {
        method,
        headers,
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'API Error');
        }
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}

// --- AUTH LOGIC ---
const Auth = {
    login: async (email, password) => {
        try {
            const data = await apiCall('/auth/login', 'POST', { email, password });
            if (data.user_id) {
                // Save session
                const user = {
                    id: data.user_id,
                    name: data.name,
                    email: email,
                    role: data.role
                };
                localStorage.setItem('user', JSON.stringify(user));
                return user; // Return user object instead of true
            }
            return false;
        } catch (e) {
            alert(e.message);
            return false;
        }
    },
    signup: async (name, email, password, mobile, address) => {
        try {
            await apiCall('/auth/signup', 'POST', { name, email, password, mobile, address });
            return true;
        } catch (e) {
            alert(e.message);
            return false;
        }
    },
    logout: () => {
        localStorage.removeItem('user');
        const isSubfolder = window.location.pathname.includes('/pages/');
        window.location.href = isSubfolder ? '../../index.html' : 'index.html';
    },
    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    }
};


// --- UI HELPERS ---

function toggleUserMenu() {
    const menu = document.getElementById('userMenu');
    if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function toggleCategoryMenu() {
    const menu = document.getElementById('categoryMenu');
    if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function filterByCategory(category) {
    const isSubfolder = window.location.pathname.includes('/pages/');
    const pfx = isSubfolder ? '../../' : '';

    if (category === 'All') {
        window.location.href = pfx + 'index.html';
        return;
    }
    window.location.href = `${pfx}index.html?category=${encodeURIComponent(category)}`;
}

document.addEventListener('click', function (event) {
    const userMenu = document.getElementById('userMenu');
    const categoryMenu = document.getElementById('categoryMenu');
    if (userMenu && !event.target.closest('.toggle-btn')) {
        userMenu.style.display = 'none';
    }
    if (categoryMenu && !event.target.closest('.Category_dropdown')) {
        categoryMenu.style.display = 'none';
    }
});


document.addEventListener('DOMContentLoaded', () => {
    updateHeaderUI();
});

function updateHeaderUI() {
    const user = Auth.getCurrentUser();
    const loginLink = document.getElementById('loginLink');
    const logoutLink = document.getElementById('logoutLink');
    const accountSpan = document.getElementById('navAccountName');

    if (user) {
        if (loginLink) loginLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'block';
        if (accountSpan) {
            accountSpan.innerText = user.name.split(' ')[0];
            const avatar = accountSpan.previousElementSibling;
            if (avatar) {
                if (avatar.tagName === 'I') {
                    avatar.outerHTML = `<div class="letter-avatar">${user.name.charAt(0).toUpperCase()}</div>`;
                } else if (avatar.classList.contains('letter-avatar')) {
                    avatar.innerText = user.name.charAt(0).toUpperCase();
                }
            }
        }
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (logoutLink) logoutLink.style.display = 'none';
        if (accountSpan) {
            accountSpan.innerText = 'Account';
            const avatar = accountSpan.previousElementSibling;
            if (avatar && avatar.classList.contains('letter-avatar')) {
                avatar.outerHTML = `<i class="fa-regular fa-user"></i>`;
            }
        }
    }
}

function handleLogout() {
    Auth.logout();
}

// Export for global use
window.handleLogout = handleLogout;

// Function exported for other files to usage
window.apiCall = apiCall;
window.Auth = Auth;

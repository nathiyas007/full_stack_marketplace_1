document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    loadSection('dashboard');
    setupNavigation();
});

function checkAdminAuth() {
    const user = Auth.getCurrentUser();
    if (!user || user.role !== 'admin') {
        alert("Access Denied! Admin access only.");
        window.location.href = 'login.html';
    }
    document.getElementById('admin-name').innerText = user.name;
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');

            // UI Update
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            document.getElementById('section-title').innerText = section.charAt(0).toUpperCase() + section.slice(1);

            loadSection(section);
        });
    });
}

async function loadSection(section) {
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = '<div class="loading">Loading...</div>';

    try {
        switch (section) {
            case 'dashboard':
                await renderDashboard();
                break;
            case 'products':
                await renderProducts();
                break;
            case 'orders':
                await renderOrders();
                break;
            case 'qfa':
                await renderQFA();
                break;
            case 'safety':
                await renderSafetyTips();
                break;
            case 'users':
                await renderUsers();
                break;
            case 'contacts':
                await renderContacts();
                break;
        }
    } catch (error) {
        contentArea.innerHTML = `<div class="error">Error loading section: ${error.message}</div>`;
    }
}

// --- RENDERING FUNCTIONS ---

async function renderDashboard() {
    const stats = await apiCall('/admin/stats');
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <i class="fa-solid fa-box"></i>
                <div class="stat-info">
                    <h3>Total Products</h3>
                    <p>${stats.total_products}</p>
                </div>
            </div>
            <div class="stat-card">
                <i class="fa-solid fa-cart-shopping"></i>
                <div class="stat-info">
                    <h3>Total Orders</h3>
                    <p>${stats.total_orders}</p>
                </div>
            </div>
            <div class="stat-card">
                <i class="fa-solid fa-users"></i>
                <div class="stat-info">
                    <h3>Total Users</h3>
                    <p>${stats.total_users}</p>
                </div>
            </div>
            <div class="stat-card">
                <i class="fa-solid fa-circle-question"></i>
                <div class="stat-info">
                    <h3>Pending Q&A</h3>
                    <p>${stats.pending_qfa}</p>
                </div>
            </div>
        </div>
    `;
}

async function renderProducts() {
    const products = await apiCall('/admin/products');
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="data-table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Category</th>
                        <th>Image</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(p => `
                        <tr>
                            <td>${p.id}</td>
                            <td>${p.title}</td>
                            <td>$${p.price}</td>
                            <td>${p.category}</td>
                            <td><img src="${p.image1 || '../assets/placeholder.jpg'}" width="50" style="border-radius:4px; object-fit: cover; height: 50px;"></td>
                            <td class="action-btns">
                                <button class="btn btn-delete" onclick="deleteProduct(${p.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function renderOrders() {
    const orders = await apiCall('/admin/orders');
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="data-table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Product ID</th>
                        <th>Buyer ID</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(o => `
                        <tr>
                            <td>${o.id}</td>
                            <td>${o.product_id}</td>
                            <td>${o.user_id}</td>
                            <td><span class="status-badge ${o.status}">${o.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function renderQFA() {
    const questions = await apiCall('/admin/questions');
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="data-table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>User ID</th>
                        <th>Question</th>
                        <th>Answer</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${questions.map(q => `
                        <tr>
                            <td>${q.id}</td>
                            <td>${q.user_id}</td>
                            <td>${q.question}</td>
                            <td>${q.answer || '<span style="color:red">Pending</span>'}</td>
                            <td class="action-btns">
                                <button class="btn btn-view" onclick="answerQuestion(${q.id})">Answer</button>
                                <button class="btn btn-delete" onclick="deleteQuestion(${q.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function renderSafetyTips() {
    const tips = await apiCall('/admin/safety-tips');
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div style="margin-bottom: 20px;">
            <button class="btn btn-success" onclick="showTipModal()">+ Add New Tip</button>
        </div>
        <div class="data-table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${tips.map(t => `
                        <tr>
                            <td>${t.id}</td>
                            <td>${t.title}</td>
                            <td>${t.description.substring(0, 50)}...</td>
                            <td class="action-btns">
                                <button class="btn btn-edit" onclick="showTipModal(${t.id}, '${t.title}', '${t.description}')">Edit</button>
                                <button class="btn btn-delete" onclick="deleteTip(${t.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function renderUsers() {
    const users = await apiCall('/admin/users');
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="data-table-container">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(u => `
                        <tr>
                            <td>${u.id}</td>
                            <td>${u.name}</td>
                            <td>${u.email}</td>
                            <td>${u.is_active ? 'Active' : 'Blocked'}</td>
                            <td class="action-btns">
                                <button class="btn btn-toggle" onclick="toggleUserStatus(${u.id})">
                                    ${u.is_active ? 'Block' : 'Unblock'}
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

async function renderContacts() {
    const contacts = await apiCall('/admin/contacts');
    const contentArea = document.getElementById('content-area');
    contentArea.innerHTML = `
        <div class="data-table-container">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Issue Type</th>
                        <th>Message</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${contacts.map(c => `
                        <tr>
                            <td>${new Date(c.created_at).toLocaleDateString()}</td>
                            <td>${c.name}</td>
                            <td>${c.email}</td>
                            <td><span class="status-badge" style="background:#e0f7fa; color:#006064;">${c.issue_type}</span></td>
                            <td style="max-width: 300px; font-size: 0.9rem;">${c.message}</td>
                            <td class="action-btns">
                                <button class="btn btn-delete" onclick="deleteContactMessage(${c.id})">Delete</button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// --- ACTION HANDLERS ---

async function deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
        await apiCall(`/admin/products/${id}`, 'DELETE');
        renderProducts();
    }
}

async function toggleUserStatus(id) {
    await apiCall(`/admin/users/${id}/toggle-status`, 'POST');
    renderUsers();
}

async function deleteQuestion(id) {
    if (confirm("Delete this question?")) {
        await apiCall(`/admin/questions/${id}`, 'DELETE');
        renderQFA();
    }
}

function answerQuestion(id) {
    const answer = prompt("Enter your answer:");
    if (answer) {
        apiCall(`/admin/questions/${id}/answer`, 'POST', { answer })
            .then(() => renderQFA());
    }
}

async function deleteTip(id) {
    if (confirm("Delete this tip?")) {
        await apiCall(`/admin/safety-tips/${id}`, 'DELETE');
        renderSafetyTips();
    }
}

function showTipModal(id = null, title = '', description = '', icon = '') {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');

    modalBody.innerHTML = `
        <h2>${id ? 'Edit Safety Tip' : 'Add Safety Tip'}</h2>
        <form id="tipForm">
            <div class="form-group">
                <label>Title</label>
                <input type="text" id="tipTitle" value="${title}" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="tipDesc" required>${description}</textarea>
            </div>
            <button type="submit" class="btn btn-success">${id ? 'Update' : 'Save'}</button>
        </form>
    `;

    modal.style.display = 'block';

    document.getElementById('tipForm').onsubmit = async (e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById('tipTitle').value,
            description: document.getElementById('tipDesc').value
        };

        if (id) {
            await apiCall(`/admin/safety-tips/${id}`, 'PUT', payload);
        } else {
            await apiCall('/admin/safety-tips', 'POST', payload);
        }

        modal.style.display = 'none';
        renderSafetyTips();
    };
}

// Modal Close logic
document.querySelector('.close-modal').onclick = () => {
    document.getElementById('modal').style.display = 'none';
};

window.onclick = (event) => {
    if (event.target == document.getElementById('modal')) {
        document.getElementById('modal').style.display = 'none';
    }
};

async function deleteContactMessage(id) {
    if (confirm("Delete this message?")) {
        await apiCall(`/admin/contacts/${id}`, 'DELETE');
        renderContacts();
    }
}

// Global exports
window.deleteProduct = deleteProduct;
window.toggleUserStatus = toggleUserStatus;
window.deleteQuestion = deleteQuestion;
window.answerQuestion = answerQuestion;
window.deleteTip = deleteTip;
window.showTipModal = showTipModal;
window.deleteContactMessage = deleteContactMessage;

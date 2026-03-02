async function loadUserProfile() {
    const user = Auth.getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return; }

    try {
        // 1. Fetch Profile Stats
        const stats = await apiCall(`/auth/${user.id}/profile`);
        if (document.getElementById('profileName')) document.getElementById('profileName').innerText = stats.name;
        if (document.getElementById('profileEmail')) document.getElementById('profileEmail').innerText = stats.email;

        // Update Avatar
        const avatarImg = document.querySelector('.profile-avatar');
        if (avatarImg) {
            const letter = stats.name.charAt(0).toUpperCase();
            avatarImg.outerHTML = `<div class="letter-avatar">${letter}</div>`;
        }

        // 2. My Listings
        const products = await apiCall(`/products/user/${user.id}`);
        const listingsContainer = document.getElementById('myListings');
        if (listingsContainer) {
            if (products.length === 0) listingsContainer.innerHTML = '<p>No items posted.</p>';
            else {
                listingsContainer.innerHTML = products.map(p => `
                    <div class="product-item">
                        <img src="${p.image1 || 'https://via.placeholder.com/100'}" alt="${p.title}">
                        <div class="product-info">
                            <div class="title">${p.title}</div>
                            <div class="price">₹${p.price}</div>
                        </div>
                        <div class="actions">
                            <button onclick="editProduct('${p.id}')" class="btn edit">
                                <i class="fa-regular fa-pen-to-square"></i> Edit
                            </button>
                            <button onclick="deleteProduct('${p.id}')" class="btn delete">
                                <i class="fa-regular fa-trash-can"></i> Delete
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }

    } catch (e) {
        console.error("Profile load error", e);
    }


    // 4. Call Seller Orders (Incoming)
    await loadSellerOrders(user.id);
}

// Global scope
window.editProduct = function (id) {
    window.location.href = `sell.html?edit=${id}`;
}

window.deleteProduct = async function (id) {
    if (confirm("Are you sure you want to delete this product?")) {
        try {
            await apiCall(`/products/${id}`, 'DELETE');
            loadUserProfile(); // Refresh
        } catch (e) {
            alert("Delete failed: " + e.message);
        }
    }
}



async function loadSellerOrders(sellerId) {
    const container = document.getElementById('mySales');
    if (!container) return;

    try {
        const orders = await apiCall(`/orders/seller/${sellerId}`);
        if (orders.length === 0) {
            container.innerHTML = '<p>No new orders.</p>';
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-card-header">
                    <span><b>Order #${order.order_id}</b></span>
                    <span>${new Date(order.created_at).toLocaleDateString()}</span>
                </div>
                <div class="product-info">
                    <img src="${order.product_image || 'https://via.placeholder.com/80'}" alt="${order.product_title}">
                    <div style="flex:1;">
                        <div class="title">${order.product_title}</div>
                        <div class="price">₹${order.product_price}</div>
                        <div class="status-badge" style="color:${getStatusColor(order.status)};">Status: ${order.status}</div>
                    </div>
                </div>
                ${order.status === 'Cancelled' ? `
                <div class="cancelled-notification">
                    <b><i class="fa-solid fa-circle-xmark"></i> Cancelled:</b> ${order.cancel_reason || 'No reason provided'}
                </div>
                ` : ''}
                <div class="buyer-details-box">
                    <div><b>Buyer:</b> ${order.buyer_name}</div>
                    <div><b>Phone:</b> ${order.buyer_mobile}</div>
                    <div><b>Address:</b> ${order.buyer_address}</div>
                </div>
                <div class="actions">
                    ${renderStatusButtons(order)}
                </div>
            </div>
        `).join('');

    } catch (e) {
        console.error("Error loading seller orders", e);
        container.innerHTML = '<p>Error loading orders.</p>';
    }
}

function getStatusColor(status) {
    if (status === 'Pending' || status === 'Placed') return '#faad14'; // Orange
    if (status === 'Cancelled') return '#f5222d'; // Red
    if (status === 'Declined') return '#d93025'; // Crimson
    if (status === 'Accepted') return '#52c41a'; // Green
    if (status === 'Packing') return '#1890ff'; // Blue
    if (status === 'Ready for Delivery') return '#722ed1'; // Purple
    if (status === 'Delivered') return '#52c41a'; // Green
    return '#1890ff';
}

function renderStatusButtons(order) {
    const s = order.status.toLowerCase();
    // Handle both 'Pending' (new) and 'Placed' (legacy) as the initial state
    if (s === 'pending' || s === 'placed') {
        return `
            <div style="display:flex; gap:10px; margin-top:10px;">
                <button onclick="updateOrderStatus(${order.order_id}, 'Accepted')" class="btn edit" style="background:#1fb7b0; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:600; flex:1;">Accept Order</button>
                <button onclick="updateOrderStatus(${order.order_id}, 'Declined')" class="btn delete" style="background:#fff1f0; color:#d93025; border:1px solid #ffa39e; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:600;">Decline</button>
            </div>
        `;
    }
    if (s === 'accepted') return `<button onclick="updateOrderStatus(${order.order_id}, 'Packing')" class="btn edit" style="background:#1890ff; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:600; width:100%; margin-top:10px;">📦 Mark as Packing</button>`;
    if (s === 'packing') return `<button onclick="updateOrderStatus(${order.order_id}, 'Ready for Delivery')" class="btn edit" style="background:#722ed1; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:600; width:100%; margin-top:10px;">🚚 Ready for Delivery</button>`;
    if (s === 'ready for delivery') return `<button onclick="updateOrderStatus(${order.order_id}, 'Delivered')" class="btn edit" style="background:#52c41a; color:white; border:none; padding:12px; border-radius:8px; cursor:pointer; font-weight:600; width:100%; margin-top:10px;">✅ Mark as Delivered</button>`;
    if (s === 'delivered') return `<div style="color:#52c41a; font-weight:800; padding:15px; background:#f6ffed; border:1px solid #b7eb8f; border-radius:12px; text-align:center; margin-top:10px;"><i class="fa-solid fa-circle-check"></i> Order Delivered Successfully</div>`;
    if (s === 'cancelled') return `<div style="color:#d93025; font-weight:700; padding:15px; background:#fff1f0; border:1px solid #ffa39e; border-radius:12px; text-align:center; margin-top:10px;"><i class="fa-solid fa-ban"></i> Order Cancelled by Buyer</div>`;
    if (s === 'declined') return `<div style="color:#d93025; font-weight:700; padding:15px; background:#fff1f0; border:1px solid #ffa39e; border-radius:12px; text-align:center; margin-top:10px;"><i class="fa-solid fa-circle-xmark"></i> You Declined this order</div>`;
    return '';
}

window.updateOrderStatus = async function (orderId, newStatus) {
    try {
        await apiCall(`/orders/${orderId}/status`, 'PUT', { status: newStatus });
        loadUserProfile(); // Refresh ALL
    } catch (e) {
        alert("Failed to update status: " + e.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
});

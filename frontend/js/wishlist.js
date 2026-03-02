async function loadWishlist() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    const container = document.getElementById('wishlistContainer');
    if (!container) return;

    try {
        const items = await apiCall(`/wishlist/${user.id}`);

        if (items.length === 0) container.innerHTML = '<p style="text-align:center; flex-basis:100%;">Wishlist empty.</p>';
        else {
            window.wishlistItems = items; // Store for filtering
            renderWishlistItems(items);
        }
    } catch (e) {
        container.innerHTML = '<p>Error loading wishlist.</p>';
    }
}

function renderWishlistItems(items) {
    const container = document.getElementById('wishlistContainer');
    if (items.length === 0) {
        container.innerHTML = '<p style="text-align:center; flex-basis:100%;">No items found.</p>';
        return;
    }

    container.innerHTML = items.map(item => {
        const p = item.product;
        // Mocking old price for visual (10% higher)
        const oldPrice = p.price ? (p.price * 1.1).toFixed(0) : 0;
        const image = p.image1 || 'https://via.placeholder.com/300';

        return `
        <div class="wishlist-card">
            <div class="card-img-box">
                <a href="prd_view1.html?id=${p.id}">
                    <img src="${image}" alt="${p.title}">
                </a>
                <button class="remove-btn" onclick="removeFromWishlist('${item.wishlist_id}')" title="Remove">
                    <i class="fa-solid fa-heart"></i>
                </button>
            </div>
            <div class="card-details">
                <p class="card-category">${p.category || 'Product'}</p>
                <a href="prd_view1.html?id=${p.id}" style="text-decoration:none;">
                    <h3 class="card-title">${p.title}</h3>
                </a>
                <div class="card-price-row">
                    <span class="card-price">₹${p.price}</span>
                    <span class="card-old-price">₹${oldPrice}</span>
                </div>
            </div>
        </div>
     `}).join('');
}

function filterWishlistLocal(query) {
    if (!window.wishlistItems) return;
    const lowerQuery = query.toLowerCase();
    const filtered = window.wishlistItems.filter(item =>
        item.product.title.toLowerCase().includes(lowerQuery) ||
        (item.product.category && item.product.category.toLowerCase().includes(lowerQuery))
    );
    renderWishlistItems(filtered);
}


async function removeFromWishlist(wishlistId) {
    try {
        await apiCall(`/wishlist/${wishlistId}`, 'DELETE');
        loadWishlist(); // Refresh
    } catch (e) {
        alert("Remove failed: " + e.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadWishlist();
});

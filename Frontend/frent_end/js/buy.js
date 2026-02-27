async function initBuyPage() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    if (!productId) return;

    try {
        // Fetch Product for details
        const product = await apiCall(`/products/${productId}`);
        if (!product) return;

        if (product.is_sold) {
            alert("This item has already been sold.");
            window.location.href = '../../index.html';
            return;
        }

        // Map Backend Schema to UI
        const image = product.image1 || 'https://via.placeholder.com/300';

        if (document.getElementById('buyPrdImage')) document.getElementById('buyPrdImage').src = image;
        if (document.getElementById('buyPrdName')) document.getElementById('buyPrdName').innerText = product.title;
        if (document.getElementById('buyPrdPrice')) document.getElementById('buyPrdPrice').innerText = '₹' + product.price;
        if (document.getElementById('buyPrdPriceSummary')) document.getElementById('buyPrdPriceSummary').innerText = '₹' + product.price;
        if (document.getElementById('buyTotalPrice')) document.getElementById('buyTotalPrice').innerText = '₹' + (parseInt(product.price) + 50);

        // Display Seller Name
        if (document.getElementById('buyPrdSeller')) {
            if (product.owner && product.owner.name) {
                document.getElementById('buyPrdSeller').innerText = product.owner.name;
            } else {
                document.getElementById('buyPrdSeller').innerText = product.user_id; // Fallback
            }
        }

    } catch (e) {
        console.error("Error loading product for buy page", e);
    }
}

async function handleOrderSubmit(event) {
    event.preventDefault();

    if (!Auth.getCurrentUser()) {
        alert("Please Login to Buy");
        window.location.href = 'login.html';
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    const orderData = {
        user_id: Auth.getCurrentUser().id,
        product_id: parseInt(productId), // Backend expects INT for IDs generally in SQL models
        full_name: document.getElementById('orderName').value,
        mobile: document.getElementById('orderMobile').value,
        address: document.getElementById('orderAddress').value,
        city: document.getElementById('orderCity').value,
        pincode: document.getElementById('orderPincode').value,
        payment_method: 'COD' // Default for now
    };

    try {
        const response = await apiCall('/orders/', 'POST', orderData);
        alert("Order Placed Successfully! Your order is now Pending seller acceptance.");
        window.location.href = `success.html?order_id=${response.order_id}`;
    } catch (e) {
        alert("Order Failed: " + e.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initBuyPage();
});

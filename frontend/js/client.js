async function loadClientOrders() {
    const user = Auth.getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return; }

    const container = document.getElementById('myOrders');
    if (!container) return;

    try {
        const orders = await apiCall(`/orders/user/${user.id}`);

        if (orders.length === 0) container.innerHTML = '<p>No orders placed.</p>';
        else {
            // For displaying product details, we typically need to fetch them or if the order API returns joined data.
            // The current backend 'Order' model might be simple. Let's assume we need to display basic info.
            // Ideally backend Should return Order JOIN Product.
            // If not, we might just show ID. Checking backend... Backend Order model has product_id.
            // We can fetch product or just show ID for MVP speed.
            // Enhancing: We will try to just show Order ID and Status first to ensure stability.

            container.innerHTML = orders.map(o => `
                    <div class="order-card-client" style="border:1px solid #ddd; padding:15px; margin-bottom:15px; display:flex; gap:15px; align-items:center; background:white; border-radius:12px; box-shadow:0 4px 6px rgba(0,0,0,0.05);">
                        <img src="${o.product_image || 'https://via.placeholder.com/80'}" width="80" height="80" style="object-fit:cover; border-radius:8px;">
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                                <h4 style="margin:0 0 5px 0;">${o.product_title}</h4>
                                <span style="font-size:0.85em; color:#777;">#${o.id}</span>
                            </div>
                            <p style="margin:0; color:#555; font-weight:bold;">₹${o.product_price}</p>
                            <p style="margin:5px 0 0 0; font-size:0.9em;">Status: <span style="font-weight:bold; color:${getStatusColor(o.status)};">${o.status}</span></p> 
                            ${o.cancel_reason ? `<p style="margin:2px 0 0 0; font-size:0.85em; color:#d93025;"><b>Reason:</b> ${o.cancel_reason}</p>` : ''}
                            
                            <p style="margin:10px 0 0 0; font-size:0.85em; color:#666;">Deliver To: ${o.address}, ${o.city} - ${o.pincode}</p>
                        </div>
                        <div class="order-actions" style="display:flex; flex-direction:column; gap:8px;">
                            ${o.status === 'Pending' ? `<button onclick="openCancelModal(${o.id})" class="btn-cancel-link" style="background:#fff1f0; color:#d93025; border:1px solid #ffa39e; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:12px;">Cancel Order</button>` : ''}
                            
                            <a href="seller_profile.html?id=${o.seller_id}" class="btn-view-seller" style="text-decoration:none; text-align:center; background:#f0f7ff; color:#0050b3; border:1px solid #91d5ff; padding:6px 12px; border-radius:6px; font-weight:600; font-size:12px;">View Seller</a>
                            
                            ${o.status === 'Delivered' ? `<button onclick="openReviewModal(${o.id}, ${o.seller_id})" class="btn-review-link" style="background:#f6ffed; color:#389e0d; border:1px solid #b7eb8f; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:12px;">Rate & Review</button>` : ''}
                        </div>
                    </div>
             `).join('');

            // Note: 'Status' field is missing in backend Order model! Using static 'Ordered'.
        }

    } catch (e) {
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
    return '#1890ff'; // Blue for others
}


let activeOrderId = null;

window.openCancelModal = function (orderId) {
    activeOrderId = orderId;
    document.getElementById('cancelModal').style.display = 'flex';
}

window.closeCancelModal = function () {
    document.getElementById('cancelModal').style.display = 'none';
    activeOrderId = null;
}

window.confirmCancellation = async function () {
    const reasonSelect = document.getElementById('cancelReason');
    const otherText = document.getElementById('otherReason');
    let reason = reasonSelect.value;

    if (reason === 'Other') {
        reason = otherText.value.trim() || 'Other';
    }

    try {
        await apiCall(`/orders/${activeOrderId}/status`, 'PUT', {
            status: 'Cancelled',
            cancel_reason: reason
        });
        closeCancelModal();
        loadClientOrders(); // Refresh
    } catch (e) {
        alert("Failed to cancel: " + e.message);
    }
}

// Show/hide other reason textarea
document.addEventListener('change', (e) => {
    if (e.target.id === 'cancelReason') {
        const otherReason = document.getElementById('otherReason');
        if (e.target.value === 'Other') {
            otherReason.style.display = 'block';
        } else {
            otherReason.style.display = 'none';
        }
    }
});

// Review Modal Logic
let activeReviewOrder = null;
let activeReviewSeller = null;

window.openReviewModal = function (orderId, sellerId) {
    activeReviewOrder = orderId;
    activeReviewSeller = sellerId;
    document.getElementById('reviewModal').style.display = 'flex';
}

window.closeReviewModal = function () {
    document.getElementById('reviewModal').style.display = 'none';
    activeReviewOrder = null;
    activeReviewSeller = null;
    resetStars();
}

function resetStars() {
    document.querySelectorAll('.star-btn').forEach(s => s.classList.remove('active'));
    document.getElementById('selectedRating').value = 0;
    document.getElementById('reviewComment').value = '';
}

// Star Selection Logic
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('star-btn')) {
        const val = parseInt(e.target.getAttribute('data-value'));
        document.getElementById('selectedRating').value = val;

        document.querySelectorAll('.star-btn').forEach(s => {
            const sVal = parseInt(s.getAttribute('data-value'));
            if (sVal <= val) s.classList.add('active');
            else s.classList.remove('active');
        });
    }
});

window.submitReview = async function () {
    const rating = parseInt(document.getElementById('selectedRating').value);
    const comment = document.getElementById('reviewComment').value;
    const user = Auth.getCurrentUser();

    if (rating === 0) {
        alert("Please select a rating.");
        return;
    }

    try {
        await apiCall('/reviews/', 'POST', {
            seller_id: activeReviewSeller,
            buyer_id: user.id,
            order_id: activeReviewOrder,
            rating: rating,
            comment: comment
        });
        alert("Thank you for your review!");
        closeReviewModal();
        loadClientOrders(); // Refresh to hide review button if needed (backend logic prevents double review)
    } catch (e) {
        alert("Failed to submit review: " + e.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadClientOrders();
});

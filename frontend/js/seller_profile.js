async function loadSellerProfile() {
    const params = new URLSearchParams(window.location.search);
    const sellerId = params.get('id');
    if (!sellerId) {
        window.location.href = '../../index.html';
        return;
    }

    try {
        const profile = await apiCall(`/users/${sellerId}/profile`);
        if (!profile) return;

        document.getElementById('sellerName').innerText = profile.name;
        document.getElementById('totalReviews').innerText = `${profile.total_reviews} Reviews`;

        // Render Stars
        renderStars(profile.avg_rating, 'sellerRating');

        // Render products
        const listingsContainer = document.getElementById('sellerListings');
        if (profile.products.length === 0) {
            listingsContainer.innerHTML = '<p>No products listed.</p>';
        } else {
            listingsContainer.innerHTML = profile.products.map(p => `
                <div class="product-card" onclick="location.href='prd_view1.html?id=${p.id}'" style="cursor:pointer; border:1px solid #eee; border-radius:12px; overflow:hidden; background:white; position:relative;">
                    <img src="${p.image1 || 'https://via.placeholder.com/200'}" style="width:100%; height:150px; object-fit:contain; background:#f8f9fa; padding:5px;">
                    <div style="padding:10px;">
                        <h4 style="margin:0; font-size:0.9rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.title}</h4>
                        <p style="color:var(--primary); font-weight:bold; margin:5px 0 0 0;">₹${p.price}</p>
                    </div>
                     ${p.is_sold ? '<span style="position:absolute; top:5px; right:5px; background:rgba(255,71,87,0.9); color:white; padding:2px 8px; border-radius:4px; font-size:0.7rem; font-weight:bold;">SOLD</span>' : ''}
                </div>
            `).join('');
        }

        // Render Reviews
        const reviewsContainer = document.getElementById('sellerReviews');
        if (profile.reviews.length === 0) {
            reviewsContainer.innerHTML = '<p>No reviews yet.</p>';
        } else {
            reviewsContainer.innerHTML = profile.reviews.map(r => `
                <div class="review-card">
                    <div class="review-header">
                        <span class="review-buyer">${r.buyer_name}</span>
                        <div class="rating-stars" style="font-size:0.8rem;">${getStarsHtml(r.rating)}</div>
                    </div>
                    <p class="review-comment">${r.comment || 'No comment provided.'}</p>
                    <span class="review-date">${new Date(r.created_at).toLocaleDateString()}</span>
                </div>
            `).join('');
        }

        // Try to load contact details (will only work if buyer has an order)
        loadContactDetails(sellerId);

    } catch (e) {
        console.error("Error loading profile", e);
    }
}

async function loadContactDetails(sellerId) {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;
    if (currentUser.id == sellerId) {
        document.getElementById('contactDetailsSection').innerHTML = '<p style="font-size:0.85rem; color:#888; text-align:center;">This is your own profile.</p>';
        return;
    }

    try {
        const contact = await apiCall(`/users/${sellerId}/contact`);
        if (contact) {
            document.getElementById('contactDetailsSection').innerHTML = `
                <div class="contact-box">
                    <h4><i class="fa-solid fa-address-book"></i> Seller Contact</h4>
                    <div class="contact-item"><i class="fa-solid fa-phone"></i> ${contact.mobile || 'Not provided'}</div>
                    <div class="contact-item"><i class="fa-solid fa-envelope"></i> ${contact.email}</div>
                    <div class="contact-item"><i class="fa-solid fa-location-dot"></i> ${contact.address || 'Not provided'}</div>
                    <p style="font-size:0.75rem; color:#777; margin-top:10px; border-top:1px solid #ddd; padding-top:10px;">Visible because the seller accepted your order.</p>
                </div>
            `;
        }
    } catch (e) {
        if (e.message.includes("not accepted")) {
            document.getElementById('contactDetailsSection').innerHTML = `
                <div style="background:#fff7e6; border:1px solid #ffe58f; padding:15px; border-radius:12px; text-align:center;">
                    <i class="fa-solid fa-clock-rotate-left" style="color:#d48806; font-size:1.5rem; margin-bottom:10px;"></i>
                    <p style="font-size:0.9rem; color:#874d00; font-weight:600;">Seller has not accepted your order yet.</p>
                    <p style="font-size:0.75rem; color:#888; margin-top:5px;">Contact details will be revealed once the seller confirms your purchase.</p>
                </div>
            `;
        } else {
            console.log("Contact inhibited: ", e.message);
        }
    }
}

function renderStars(rating, elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = getStarsHtml(rating) + ` <span style="font-size:0.9rem; color:#333; margin-left:5px;">(${rating})</span>`;
}

function getStarsHtml(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            stars += '<i class="fa-solid fa-star"></i>';
        } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
            stars += '<i class="fa-solid fa-star-half-stroke"></i>';
        } else {
            stars += '<i class="fa-regular fa-star"></i>';
        }
    }
    return stars;
}

let currentProductImages = [];
let currentImgIndex = 0;

async function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    if (!productId) return;

    try {
        const product = await apiCall(`/products/${productId}`);
        if (!product) {
            if (document.getElementById('prdTitle')) document.getElementById('prdTitle').innerText = 'Product Not Found';
            return;
        }

        // Map Data
        // Note: Backend might use 'title' vs Frontend 'name'
        if (document.getElementById('prdTitle')) document.getElementById('prdTitle').innerText = product.title;
        if (document.getElementById('prdPrice')) document.getElementById('prdPrice').innerText = '₹' + product.price;
        if (document.getElementById('prdOldPrice')) document.getElementById('prdOldPrice').innerText = '₹' + (parseInt(product.price) * 1.1).toFixed(0);
        // Condition, Seller, Duration are missing in basic Backend Product Model? 
        // Checking schema... ProductCreate has 'condition', 'duration', 'location'. Product model should match.
        // Assuming Backend Model matches Schema.

        // Check if owner data is populated (due to backend relationship update)
        if (product.owner && product.owner.name) {
            if (document.getElementById('prdSeller')) document.getElementById('prdSeller').innerText = product.owner.name;
            if (document.getElementById('prdSellerLink')) document.getElementById('prdSellerLink').href = `seller_profile.html?id=${product.user_id}`;
        } else {
            if (document.getElementById('prdSeller')) document.getElementById('prdSeller').innerText = product.user_id; // Fallback to ID
            if (document.getElementById('prdSellerLink')) document.getElementById('prdSellerLink').href = `seller_profile.html?id=${product.user_id}`;
        }

        if (document.getElementById('prdCondition')) document.getElementById('prdCondition').innerText = product.condition;
        if (document.getElementById('prdDescription')) document.getElementById('prdDescription').innerText = product.description;
        if (document.getElementById('prdCategory')) document.getElementById('prdCategory').innerText = product.category;

        // Images: Backend usually has image1, image2 fields properly
        currentProductImages = [product.image1, product.image2, product.image3].filter(Boolean);
        if (currentProductImages.length === 0) currentProductImages = ['https://via.placeholder.com/300'];

        currentImgIndex = 0;
        updateMainImage();

        // Update Buy Link

        // Check if current user is the seller
        const currentUser = Auth.getCurrentUser();
        const actionRow = document.querySelector('.action-row');
        const buyBtnLink = document.getElementById('buyBtnLink');

        if (product.is_sold) {
            if (buyBtnLink) buyBtnLink.style.display = 'none';
            if (actionRow) {
                const soldBadge = document.createElement('div');
                soldBadge.innerHTML = '<span style="background:#ff4757; color:white; padding:10px 25px; border-radius:50px; font-weight:700; font-size:18px; display:inline-block; margin-top:10px;"><i class="fa-solid fa-circle-check"></i> SOLD OUT</span>';
                actionRow.appendChild(soldBadge);
            }
        } else if (currentUser && currentUser.id === product.user_id) {
            if (document.getElementById('prdSeller')) document.getElementById('prdSeller').innerText = 'You (This is your product)';
            if (buyBtnLink) {
                buyBtnLink.style.display = 'none'; // Hide Buy Button
                if (actionRow) {
                    const msg = document.createElement('p');
                    msg.innerText = "You cannot buy your own product.";
                    msg.style.color = 'var(--primary)';
                    msg.style.fontWeight = 'bold';
                    msg.style.marginTop = '10px';
                    actionRow.appendChild(msg);
                }
            }
        } else {
            // Update Buy Link normally
            if (buyBtnLink) buyBtnLink.href = `buy.html?id=${product.id}`;
        }

    } catch (e) {
        console.error("Error loading product", e);
    }
}

function updateMainImage() {
    const mainImg = document.getElementById('mainImg');
    if (mainImg && currentProductImages.length > 0) {
        mainImg.src = currentProductImages[currentImgIndex];
        // Add error handler in case URL is broken (e.g. user entered local path)
        mainImg.onerror = function () {
            this.onerror = null; // prevent loop
            this.src = 'https://via.placeholder.com/400x300?text=No+Image';
        }
    }
}

function changeSlide(direction) {
    if (currentProductImages.length === 0) return;
    currentImgIndex += direction;
    if (currentImgIndex >= currentProductImages.length) {
        currentImgIndex = 0;
    } else if (currentImgIndex < 0) {
        currentImgIndex = currentProductImages.length - 1;
    }
    updateMainImage();
}

// Touch Swipe Support
const imgView = document.querySelector('.img-view');
let touchStartX = 0;
let touchEndX = 0;

if (imgView) {
    imgView.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    imgView.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
}

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        changeSlide(1); // Swipe Left -> Next
    }
    if (touchEndX > touchStartX + 50) {
        changeSlide(-1); // Swipe Right -> Prev
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
});

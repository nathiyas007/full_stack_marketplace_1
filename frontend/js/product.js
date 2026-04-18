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
        if (document.getElementById('prdTitle')) document.getElementById('prdTitle').innerText = product.title || product.name || 'Untitled Product';
        if (document.getElementById('prdPrice')) document.getElementById('prdPrice').innerText = '₹' + product.price;
        if (document.getElementById('prdOldPrice')) document.getElementById('prdOldPrice').innerText = '₹' + (parseInt(product.price) * 1.1).toFixed(0);
        
        if (product.owner && product.owner.name) {
            if (document.getElementById('prdSeller')) document.getElementById('prdSeller').innerText = product.owner.name;
        } else {
            if (document.getElementById('prdSeller')) document.getElementById('prdSeller').innerText = product.user_id; 
        }
        if (document.getElementById('prdSellerLink')) document.getElementById('prdSellerLink').href = `seller_profile.html?id=${product.user_id}`;

        if (document.getElementById('prdCondition')) document.getElementById('prdCondition').innerText = product.condition || 'New';
        if (document.getElementById('prdDescription')) document.getElementById('prdDescription').innerText = product.description || 'No description provided.';
        if (document.getElementById('prdCategory')) document.getElementById('prdCategory').innerText = product.category || 'Category';

        // Images
        currentProductImages = [product.image1, product.image2, product.image3].filter(Boolean);
        if (currentProductImages.length === 0) currentProductImages = ['https://via.placeholder.com/600x500?text=No+Image'];

        currentImgIndex = 0;
        renderThumbnails();
        updateMainImage();

        // Access Control
        const currentUser = Auth.getCurrentUser();
        const actionRow = document.getElementById('actionRow');
        const selfBuyWarning = document.getElementById('selfBuyWarning');
        const soldOutBadge = document.getElementById('soldOutBadge');
        const buyBtnLink = document.getElementById('buyBtnLink');

        if (product.is_sold) {
            if (actionRow) actionRow.style.display = 'none';
            if (soldOutBadge) soldOutBadge.style.display = 'flex';
        } else if (currentUser && currentUser.id === product.user_id) {
            if (document.getElementById('prdSeller')) document.getElementById('prdSeller').innerText += ' (You)';
            if (actionRow) actionRow.style.display = 'none';
            if (selfBuyWarning) selfBuyWarning.style.display = 'flex';
        } else {
            if (buyBtnLink) buyBtnLink.href = `buy.html?id=${product.id}`;
        }

    } catch (e) {
        console.error("Error loading product", e);
    }
}

function renderThumbnails() {
    const thumbnailList = document.getElementById('thumbnailList');
    if (!thumbnailList) return;
    
    thumbnailList.innerHTML = '';
    currentProductImages.forEach((imgUrl, index) => {
        const thumb = document.createElement('div');
        thumb.className = `thumb-item ${index === 0 ? 'active' : ''}`;
        thumb.onclick = () => updateMainImage(index);
        
        const img = document.createElement('img');
        try {
            img.src = typeof getImageUrl === 'function' ? getImageUrl(imgUrl) : imgUrl;
        } catch(e) {
            img.src = imgUrl;
        }
        
        img.onerror = function() { this.src = 'https://via.placeholder.com/80x80?text=N/A'; };
        
        thumb.appendChild(img);
        thumbnailList.appendChild(thumb);
    });
}

function updateMainImage(index = -1) {
    if (index !== -1) currentImgIndex = index;
    const mainImg = document.getElementById('mainImg');
    if (mainImg && currentProductImages.length > 0) {
        try {
            mainImg.src = typeof getImageUrl === 'function' ? getImageUrl(currentProductImages[currentImgIndex]) : currentProductImages[currentImgIndex];
        } catch(e) {
            mainImg.src = currentProductImages[currentImgIndex];
        }
        mainImg.onerror = function() {
            this.src = 'https://via.placeholder.com/600x500?text=No+Image';
        };
    }
    
    // Update thumbnail highlights
    const thumbs = document.querySelectorAll('.thumb-item');
    thumbs.forEach((thumb, i) => {
        if(i === currentImgIndex) thumb.classList.add('active');
        else thumb.classList.remove('active');
    });
}

// Optional Touch Swipe
const imgView = document.querySelector('.main-image-wrapper');
let touchStartX = 0;
let touchEndX = 0;

if (imgView) {
    imgView.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });
    imgView.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchEndX < touchStartX - 50) {
            updateMainImage((currentImgIndex + 1) % currentProductImages.length);
        }
        if (touchEndX > touchStartX + 50) {
            updateMainImage((currentImgIndex - 1 + currentProductImages.length) % currentProductImages.length);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
});

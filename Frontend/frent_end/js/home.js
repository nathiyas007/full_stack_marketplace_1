let userWishlistIds = new Set();

async function renderProducts() {
  const container = document.getElementById('productContainer');
  if (!container) return;

  const user = Auth.getCurrentUser();
  if (user) {
    try {
      const wishlist = await apiCall(`/wishlist/${user.id}`);
      userWishlistIds = new Set(wishlist.map(item => String(item.product.id)));
    } catch (e) {
      console.error("Wishlist sync error", e);
    }
  }

  const params = new URLSearchParams(window.location.search);
  const categoryFilter = params.get('category');
  const searchFilter = params.get('search');

  let endpoint = '/products/';
  if (categoryFilter) endpoint = `/products/category/${categoryFilter}`;
  if (searchFilter) endpoint = `/products/search/?query=${searchFilter}`;

  try {
    const products = await apiCall(endpoint);
    displayProducts(products);
  } catch (error) {
    console.error("Failed to load products", error);
    container.innerHTML = '<p>Failed to load products.</p>';
  }
}

function displayProducts(products) {
  const container = document.getElementById('productContainer');

  if (products.length === 0) {
    container.innerHTML = '<p>No products found.</p>';
    return;
  }

  container.innerHTML = products.map(p => {
    const isWishlisted = userWishlistIds.has(String(p.id));
    return `
        <div class="prd_card" style="position: relative;">
          ${p.is_sold ? '<div class="sold-badge" style="z-index: 5;">SOLD</div>' : ''}
          
          <div class="wishlist-wrapper" style="position: absolute; top: 15px; right: 15px; z-index: 10;">
                <i class="${isWishlisted ? 'fa-solid active' : 'fa-regular'} fa-heart" 
                   onclick="toggleWishlist(this, '${p.id}')"
                   aria-label="${isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}"></i>
                <span class="wishlist-tooltip">${isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}</span>
          </div>

          <img src="${p.image1 || 'https://via.placeholder.com/300'}" alt="${p.title}" style="height:200px; object-fit:contain; width:100%; background:#f8f9fa; padding:10px;">
          <div class="prd_details">
            <h2>${p.title}</h2>
            <p class="price">₹${p.price}</p>
            <span class="location">
              <i class="fa-solid fa-location-dot"></i> ${p.location}
            </span>
          </div>
          <div class="prd_action">
            <a href="frent_end/pages/prd_view1.html?id=${p.id}" style="width: 100%;">
              <button style="width: 100%;">${p.is_sold ? 'View Sold Item' : 'View product'}</button>
            </a>
          </div>
        </div>
    `}).join('');
}

async function searchProduct() {
  const query = document.getElementById('searchInput').value;
  if (!query) return;
  try {
    const products = await apiCall(`/products/search/?query=${query}`);
    displayProducts(products);
  } catch (e) {
    console.error(e);
  }
}

async function toggleWishlist(element, productId) {
  const user = Auth.getCurrentUser();
  if (!user) {
    alert("Please Login to use Wishlist");
    window.location.href = 'frent_end/pages/login.html';
    return;
  }

  const isAdding = !element.classList.contains('active');
  const tooltip = element.nextElementSibling;

  try {
    if (isAdding) {
      await apiCall('/wishlist/', 'POST', {
        user_id: user.id,
        product_id: parseInt(productId)
      });
      element.classList.replace('fa-regular', 'fa-solid');
      element.classList.add('active');
      userWishlistIds.add(String(productId));
      if (tooltip) tooltip.innerText = 'Remove from wishlist';
      element.setAttribute('aria-label', 'Remove from wishlist');
    } else {
      await apiCall(`/wishlist/user/${user.id}/product/${productId}`, 'DELETE');
      element.classList.replace('fa-solid', 'fa-regular');
      element.classList.remove('active');
      userWishlistIds.delete(String(productId));
      if (tooltip) tooltip.innerText = 'Add to wishlist';
      element.setAttribute('aria-label', 'Add to wishlist');
    }
  } catch (e) {
    console.error("Wishlist toggle error", e);
    alert("Action failed: " + e.message);
  }
}

// ... existing code ...

// --- SLIDER LOGIC ---
let slideIndex = 1;
let slideInterval;

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("slide");
  let dots = document.getElementsByClassName("dot");

  if (slides.length === 0) return; // Guard clause if slider doesn't exist

  if (n > slides.length) { slideIndex = 1 }
  if (n < 1) { slideIndex = slides.length }

  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }

  if (slides[slideIndex - 1]) slides[slideIndex - 1].style.display = "block";
  if (dots[slideIndex - 1]) dots[slideIndex - 1].className += " active";
}

// Next/previous controls
function moveSlide(n) {
  clearInterval(slideInterval); // Stop auto-play on manual interaction
  showSlides(slideIndex += n);
  startAutoSlide(); // Restart auto-play
}

// Thumbnail image controls
function currentSlide(n) {
  clearInterval(slideInterval); // Stop auto-play on manual interaction
  showSlides(slideIndex = n);
  startAutoSlide(); // Restart auto-play
}

function startAutoSlide() {
  slideInterval = setInterval(() => {
    showSlides(slideIndex += 1);
  }, 4000); // Change image every 4 seconds
}

document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  showSlides(slideIndex);
  startAutoSlide();
});


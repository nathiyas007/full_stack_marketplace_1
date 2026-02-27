let currentFiles = [];
let existingImageUrls = [];

async function initSellPage() {
    if (!Auth.getCurrentUser()) {
        alert("Please Login to Sell");
        window.location.href = 'login.html';
        return;
    }

    // Initialize File Input Listener
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
        imageInput.addEventListener('change', handleFileSelect);
    }

    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');
    if (editId) {
        try {
            const product = await apiCall(`/products/${editId}`);
            if (product) {
                document.getElementById('sellCategory').value = product.category;
                document.getElementById('sellName').value = product.title;
                document.getElementById('sellPrice').value = product.price;
                document.getElementById('sellCondition').value = product.condition;
                document.getElementById('sellDuration').value = product.duration;
                document.getElementById('sellLocation').value = product.location;
                document.getElementById('sellDescription').value = product.description;

                // Load existing images
                if (product.image1) existingImageUrls.push(product.image1);
                if (product.image2) existingImageUrls.push(product.image2);
                if (product.image3) existingImageUrls.push(product.image3);

                renderPreviews();

                const form = document.getElementById('sellForm');
                if (form) form.dataset.editId = editId;

                const btn = document.querySelector('.submit-btn');
                if (btn) btn.innerText = "Update Product";
            }
        } catch (e) { console.error(e); }
    }
}

function handleFileSelect(event) {
    const files = event.target.files;
    if (!files) return;

    // Process selected files
    Array.from(files).forEach(file => {
        if ((currentFiles.length + existingImageUrls.length) >= 3) {
            alert("Maximum 3 images allowed");
            return;
        }

        if (!file.type.startsWith('image/')) return;

        currentFiles.push(file);
    });

    renderPreviews();

    // Reset input
    event.target.value = '';
}

function renderPreviews() {
    const container = document.getElementById('previewContainer');
    if (!container) return;
    container.innerHTML = '';

    // Render Existing URLs (Edit Mode)
    existingImageUrls.forEach((url, index) => {
        createPreviewElement(container, url, index, true);
    });

    // Render New Files
    currentFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            createPreviewElement(container, e.target.result, index, false);
        };
        reader.readAsDataURL(file);
    });
}

function createPreviewElement(container, imgSrc, index, isExisting) {
    const div = document.createElement('div');
    div.className = 'preview-card';
    div.innerHTML = `
        <img src="${imgSrc}" alt="Product Image">
        <button class="remove-img-btn" type="button" onclick="${isExisting ? 'removeExistingImage' : 'removeNewImage'}(${index})">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;
    container.appendChild(div);
}

function removeNewImage(index) {
    currentFiles.splice(index, 1);
    renderPreviews();
}

function removeExistingImage(index) {
    existingImageUrls.splice(index, 1);
    renderPreviews();
}

async function uploadImage(file) {
    if (typeof API_BASE_URL === 'undefined') {
        console.error("API_BASE_URL is not defined! Defaulting to localhost.");
        window.API_BASE_URL = "http://127.0.0.1:8000";
    }

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/upload/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
            // Note: Content-Type not set for FormData, browser handles it
        },
        body: formData
    });

    if (!response.ok) {
        let errorMsg = 'Image upload failed';
        try {
            const errData = await response.json();
            errorMsg = errData.detail || errorMsg;
        } catch (e) {
            errorMsg = await response.text();
        }
        throw new Error(`Upload failed (${response.status}): ${errorMsg}`);
    }

    const data = await response.json();
    return data.url;
}

async function handleSell(event) {
    event.preventDefault();

    const category = document.getElementById('sellCategory').value;
    if (!category) { alert("Please select a category"); return; }

    if (currentFiles.length === 0 && existingImageUrls.length === 0) {
        alert("Please upload at least 1 image");
        return;
    }

    const submitBtn = document.querySelector('.submit-btn');
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = "Uploading Images...";
    submitBtn.disabled = true;

    try {
        // Upload new files
        const newImageUrls = [];
        for (const file of currentFiles) {
            const url = await uploadImage(file);
            newImageUrls.push(url);
        }

        // Combine all URLs
        const allImages = [...existingImageUrls, ...newImageUrls];

        const title = document.getElementById('sellName').value;
        const price = document.getElementById('sellPrice').value;

        const productData = {
            title: title,
            price: parseFloat(price),
            category: category,
            condition: document.getElementById('sellCondition').value,
            duration: document.getElementById('sellDuration').value,
            location: document.getElementById('sellLocation').value,
            description: document.getElementById('sellDescription').value,
            image1: allImages[0] || null,
            image2: allImages[1] || null,
            image3: allImages[2] || null,
            user_id: Auth.getCurrentUser().id
        };

        const form = document.getElementById('sellForm');
        const editId = form ? form.dataset.editId : null;

        if (editId) {
            await apiCall(`/products/${editId}`, 'PUT', productData);
            alert("Product Updated!");
        } else {
            await apiCall('/products/', 'POST', productData);
            alert("Product Posted Successfully!");
        }
        window.location.href = '../../index.html';

    } catch (e) {
        alert("Error: " + e.message);
    } finally {
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    }
}

// Global scope
window.initSellPage = initSellPage;
window.handleSell = handleSell;
window.removeNewImage = removeNewImage;
window.removeExistingImage = removeExistingImage;

document.addEventListener('DOMContentLoaded', () => {
    initSellPage();
});

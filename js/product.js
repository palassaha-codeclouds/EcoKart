let currentProduct = null;

// Utility functions
function getWishlist() {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
}

function saveWishlist(wishlist) {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

document.addEventListener('DOMContentLoaded', function () {
    updateCartBadge();
    loadProductDetail();
    setupWishlistButton();
    renderWishlist();
});

// Load product details
async function loadProductDetail() {
    try {
        // Get product ID from localStorage (set by home page)
        const productId = localStorage.getItem('currentProductId');

        if (!productId) {
            showError();
            return;
        }

        const response = await fetch('products.json');
        const ProductsData = await response.json();

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Find the requested product
        const product = ProductsData.products.find(p => p.id == productId);

        if (!product) {
            showError();
            return;
        }

        currentProduct = product;
        displayProduct(product);

        refreshWishlistIcon();

    } catch (error) {
        console.error('Error loading product:', error);
        showError();
    }
}

function displayProduct(product) {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('product-content').style.display = 'block';
    document.title = `${product.name} - EcoKart`;

    // Fill in product information
    document.getElementById('product-image').src = product.image;
    document.getElementById('product-image').alt = product.name;
    document.getElementById('product-category').textContent = product.category;
    document.getElementById('product-name').textContent = product.name;
    document.getElementById('product-description').textContent = product.description;
    document.getElementById('product-price').textContent = `₹${product.price.toFixed(2)}`;
}

function showError() {
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('error-state').style.display = 'block';
}

function updateQuantity(change) {
    const quantityInput = document.getElementById('quantity-input');
    const decreaseBtn = document.getElementById('decrease-btn');
    const increaseBtn = document.getElementById('increase-btn');

    let currentQuantity = parseInt(quantityInput.value);
    let newQuantity = currentQuantity + change;

    // Enforce min/max limits
    if (newQuantity < 1) newQuantity = 1;
    if (newQuantity > 10) newQuantity = 10;

    quantityInput.value = newQuantity;

    // Update button states
    decreaseBtn.disabled = newQuantity === 1;
    increaseBtn.disabled = newQuantity === 10;
}

// Add product to cart with selected quantity
function addToCartWithQuantity() {
    if (!currentProduct) {
        alert('Product information not available');
        return;
    }

    const quantity = parseInt(document.getElementById('quantity-input').value);

    // Get existing cart from localStorage
    let cart = getCartFromStorage();

    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === currentProduct.id);

    if (existingItemIndex > -1) {
        // Update quantity if item exists
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item to cart
        cart.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            image: currentProduct.image,
            category: currentProduct.category,
            quantity: quantity
        });
    }

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart badge
    updateCartBadge();

    // Show success feedback
    showAddToCartSuccess(currentProduct.name, quantity);
}

function getCartFromStorage() {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
}

// Update cart badge in nav
function updateCartBadge() {
    const cart = getCartFromStorage();
    const badge = document.getElementById('cart-badge');

    // Calculate total items in cart
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }
}

function showAddToCartSuccess(productName, quantity) {
    // Create and show a Bootstrap toast notification
    const quantityText = quantity > 1 ? ` (${quantity} items)` : '';
    const toastHtml = `
                <div class="toast-container position-fixed bottom-0 end-0 p-3">
                    <div class="toast align-items-center text-white bg-success border-0 show" role="alert">
                        <div class="d-flex">
                            <div class="toast-body">
                                <i class="fas fa-check-circle me-2"></i>
                                ${productName}${quantityText} added to cart!
                                <div class="mt-2">
                                    <a href="checkout.html" class="btn btn-sm btn-light">View Cart</a>
                                </div>
                            </div>
                            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                        </div>
                    </div>
                </div>
            `;

    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-container');
    if (existingToast) {
        existingToast.remove();
    }

    // Add new toast
    document.body.insertAdjacentHTML('beforeend', toastHtml);

    // Initialize and show the toast
    const toastElement = document.querySelector('.toast');
    const toast = new bootstrap.Toast(toastElement, { delay: 4000 });
    toast.show();

    // Clean up after toast is hidden
    toastElement.addEventListener('hidden.bs.toast', function () {
        const container = document.querySelector('.toast-container');
        if (container) {
            container.remove();
        }
    });
}

// Initialize quantity button states when page loads
document.addEventListener('DOMContentLoaded', function () {
    const decreaseBtn = document.getElementById('decrease-btn');
    if (decreaseBtn) {
        decreaseBtn.disabled = true; // Start with quantity 1, so decrease should be disabled
    }
});

// Wishlist button setup
function setupWishlistButton() {
    const btn = document.getElementById('wishlist-btn');
    if (!btn) return;

    updateWishlistIcon(btn);
    btn.addEventListener('click', () => {
        toggleWishlist(currentProduct.id);
        updateWishlistIcon(btn);
    });
}

function updateWishlistIcon(btn) {
    const wishlist = getWishlist();
    const exists = currentProduct && wishlist.some(item => item.id === currentProduct.id);

    if (exists) {
        btn.classList.add('fas'); // solid
        btn.classList.remove('far');
    } else {
        btn.classList.add('far'); // outline
        btn.classList.remove('fas');
    }
}

// Add/remove product from wishlist
function toggleWishlist(productId) {
    let wishlist = getWishlist();
    const index = wishlist.findIndex(item => item.id === productId);

    if (index > -1) {
        wishlist.splice(index, 1);
    } else if (currentProduct) {
        wishlist.push({
            id: currentProduct.id,
            name: currentProduct.name,
            price: currentProduct.price,
            image: currentProduct.image,
            category: currentProduct.category
        });
    }

    saveWishlist(wishlist);
    renderWishlist();
}

// Render sidebar wishlist
function renderWishlist() {
    const container = document.getElementById("wishlist-items");
    container.innerHTML = "";

    const wishlist = getWishlist();

    if (wishlist.length === 0) {
        container.innerHTML = `<p class="text-center text-muted my-3">Your wishlist is empty</p>`;
        return;
    }

    wishlist.forEach(product => {
        const item = document.createElement("div");
        item.className = "list-group-item d-flex align-items-center justify-content-between py-2";

        item.innerHTML = `
            <div class="d-flex align-items-center" style="cursor:pointer; max-width: 200px; gap: 0.5rem;" onclick="viewProductDetail(${product.id})">
                <img src="${product.image}" alt="${product.name}" class="rounded" style="width:50px; height:50px; object-fit:cover;">
                <span class="fw-semibold" style="max-width:140px; word-wrap: break-word;">${product.name}</span>
            </div>
            <div class="d-flex gap-1">
                <button class="btn btn-sm btn-outline-success px-2 py-1" style="max-width:80px;" onclick="addWishlistItemToCart(${product.id})">
                    <i class="fas fa-cart-plus"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger px-2 py-1" style="max-width:80px;" onclick="removeFromWishlist(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(item);
    });
}

// Remove from wishlist
function removeFromWishlist(productId) {
    let wishlist = getWishlist();
    wishlist = wishlist.filter(item => item.id !== productId);
    saveWishlist(wishlist);
    renderWishlist();

    // Update heart icon if current product is affected
    if (currentProduct && currentProduct.id === productId) {
        const wishlistBtn = document.getElementById('wishlist-btn');
        if (wishlistBtn) updateWishlistIcon(wishlistBtn);
    }
}

// Add wishlist item to cart
function addWishlistItemToCart(productId) {
    const wishlist = getWishlist();
    const product = wishlist.find(item => item.id === productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    const index = cart.findIndex(item => item.id === productId);

    if (index > -1) cart[index].quantity += 1;
    else cart.push({ ...product, quantity: 1 });

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
    showAddToCartSuccess(product.name, 1);
}

// wishlist -> cart
function goToCart() {
    // Get wishlist and cart from localStorage
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    wishlist.forEach(product => {
        const index = cart.findIndex(item => item.id === product.id);
        if (index > -1) {
            cart[index].quantity += 1; // increase quantity if already in cart
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                quantity: 1
            });
        }
    });

    // Save updated cart
    localStorage.setItem("cart", JSON.stringify(cart));

    // Optional: clear wishlist after moving items
    localStorage.setItem("wishlist", JSON.stringify([]));

    // Redirect to cart page
    window.location.href = 'checkout.html';
}

// Call this after currentProduct is loaded
function refreshWishlistIcon() {
    const btn = document.getElementById('wishlist-btn');
    if (!btn || !currentProduct) return;

    const wishlist = getWishlist();
    const exists = wishlist.some(item => item.id === currentProduct.id);

    if (exists) {
        btn.classList.add('fas'); // solid heart
        btn.classList.remove('far'); // remove outline
    } else {
        btn.classList.add('far'); // outline heart
        btn.classList.remove('fas'); // remove solid
    }
}

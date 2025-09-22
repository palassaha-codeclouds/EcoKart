let allProducts = [];
let filteredProducts = [];

document.addEventListener('DOMContentLoaded', function () {
    updateCartBadge();
    loadProducts();
    loadFeaturedProducts();
});

async function loadProducts() {
    try {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('products-grid').style.display = 'none';
        document.getElementById('empty-state').style.display = 'none';

        const response = await fetch('products.json');
        const ProductsData = await response.json();

        await new Promise(resolve => setTimeout(resolve, 800));

        allProducts = ProductsData.products;
        filteredProducts = [...allProducts];

        document.getElementById('loading').style.display = 'none';
        displayProducts();

    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('loading').innerHTML = `
                    <i class="fas fa-exclamation-triangle fa-2x text-warning"></i>
                    <p class="mt-2">Error loading products. Please try again later.</p>
                `;
    }
}

// Display Products
function displayProducts() {
    const grid = document.getElementById('products-grid');
    const emptyState = document.getElementById('empty-state');

    if (filteredProducts.length === 0) {
        grid.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    grid.style.display = 'flex';

    // Product cards HTML
    grid.innerHTML = filteredProducts.map(product => `
                <div class="col-lg-4 col-md-6 col-sm-6 mb-4">
                    <div class="card product-card h-100 shadow-sm">
                        <img src="${product.image}" class="card-img-top product-image" alt="${product.name}" loading="lazy">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${product.name}</h5>
                            <p class="card-text text-muted flex-grow-1">${truncateText(product.description, 100)}</p>
                            <div class="mt-auto">
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <span class="h4 text-success mb-0">₹${product.price.toFixed(2)}</span>
                                    <small class="text-muted text-capitalize">${product.category}</small>
                                </div>
                                <div class="d-grid gap-2">
                                    <div class="btn-group">
                                        <button class="btn btn-outline-primary" onclick="viewProductDetail(${product.id})">
                                            <i class="fas fa-eye"></i> View Details
                                        </button>
                                        <button class="btn btn-eco" onclick="addToCart(${product.id})">
                                            <i class="fas fa-cart-plus"></i> Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
}


// Featured Products
async function loadFeaturedProducts() {
    try {
        const loadingEl = document.getElementById('featured-loading');
        const gridEl = document.getElementById('featured-grid');
        const emptyEl = document.getElementById('featured-empty-state');

        loadingEl.style.display = 'block';
        gridEl.style.display = 'none';
        emptyEl.style.display = 'none';

        const response = await fetch('products.json');
        const data = await response.json();

        await new Promise(resolve => setTimeout(resolve, 500));

        // Pick products with featured: true
        const featuredProducts = data.products.filter(p => p.featured);

        loadingEl.style.display = 'none';

        if (featuredProducts.length === 0) {
            emptyEl.style.display = 'block';
            return;
        }

        gridEl.style.display = 'flex';
        gridEl.innerHTML = featuredProducts.map(product => `
            <div class="col-lg-4 col-md-6 col-sm-6 mb-4">
                <div class="card product-card h-100 shadow-sm">
                    <img src="${product.image}" class="card-img-top product-image" alt="${product.name}" loading="lazy">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text text-muted flex-grow-1">${truncateText(product.description, 100)}</p>
                        <div class="mt-auto">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="h4 text-success mb-0">₹${product.price.toFixed(2)}</span>
                                <small class="text-muted text-capitalize">${product.category}</small>
                            </div>
                            <div class="d-grid gap-2">
                                <div class="btn-group">
                                    <button class="btn btn-outline-primary" onclick="viewProductDetail(${product.id})">
                                        <i class="fas fa-eye"></i> View Details
                                    </button>
                                    <button class="btn btn-eco" onclick="addToCart(${product.id})">
                                        <i class="fas fa-cart-plus"></i> Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading featured products:', error);
        document.getElementById('featured-loading').innerHTML = `
            <i class="fas fa-exclamation-triangle fa-2x text-warning"></i>
            <p class="mt-2">Error loading featured products.</p>
        `;
    }
}



// Filter Products
function filterProducts() {
    const selectedCategory = document.getElementById('category-filter').value;

    if (selectedCategory === 'all') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(product => product.category === selectedCategory);
    }

    displayProducts();
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function scrollToProducts() {
    document.getElementById('products-section').scrollIntoView({
        behavior: 'smooth'
    });
}

function viewProductDetail(productId) {
    localStorage.setItem('currentProductId', productId);
    window.location.href = 'product-detail.html';
}

function addToCart(productId, quantity = 1) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }

    // Get existing cart from localStorage
    let cart = getCartFromStorage();

    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);

    if (existingItemIndex > -1) {
        // Update quantity if item exists
        cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new item to cart
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: quantity
        });
    }

    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));

    // Update cart badge
    updateCartBadge();

    // Show success feedback
    showAddToCartSuccess(product.name);
}

function getCartFromStorage() {
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
}

// Update card badge in nav
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

// Cart success message
function showAddToCartSuccess(productName) {
    // Create and show a Bootstrap toast notification
    const toastHtml = `
                <div class="toast-container position-fixed bottom-0 end-0 p-3">
                    <div class="toast align-items-center text-white bg-success border-0" role="alert">
                        <div class="d-flex">
                            <div class="toast-body">
                                <i class="fas fa-check-circle me-2"></i>
                                ${productName} added to cart!
                            </div>
                            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
                        </div>
                    </div>
                </div>
            `;

    // Remove existing toast
    const existingToast = document.querySelector('.toast-container');
    if (existingToast) {
        existingToast.remove();
    }

    // Add new toast
    document.body.insertAdjacentHTML('beforeend', toastHtml);

    // Initialize and show the toast
    const toastElement = document.querySelector('.toast');
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    // Clean up after toast is hidden
    toastElement.addEventListener('hidden.bs.toast', function () {
        const container = document.querySelector('.toast-container');
        if (container) {
            container.remove();
        }
    });
}
let currentProduct = null;
        
        document.addEventListener('DOMContentLoaded', function() {
            updateCartBadge();
            loadProductDetail();
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
            toastElement.addEventListener('hidden.bs.toast', function() {
                const container = document.querySelector('.toast-container');
                if (container) {
                    container.remove();
                }
            });
        }
        
        // Initialize quantity button states when page loads
        document.addEventListener('DOMContentLoaded', function() {
            const decreaseBtn = document.getElementById('decrease-btn');
            if (decreaseBtn) {
                decreaseBtn.disabled = true; // Start with quantity 1, so decrease should be disabled
            }
        });
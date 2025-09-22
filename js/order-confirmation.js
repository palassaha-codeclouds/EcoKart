document.addEventListener('DOMContentLoaded', function() {
            updateCartBadge();
            loadOrderConfirmation();
        });

        /**
         * Load and display order confirmation details
         */
        function loadOrderConfirmation() {
            try {
                // Get order data from localStorage (set by checkout page)
                const orderData = localStorage.getItem('currentOrder');
                
                if (!orderData) {
                    showError();
                    return;
                }

                const order = JSON.parse(orderData);
                
                // Simulate processing delay
                setTimeout(() => {
                    displayOrderConfirmation(order);
                }, 800);

            } catch (error) {
                console.error('Error loading order confirmation:', error);
                showError();
            }
        }

        /**
         * Display order confirmation details
         * @param {Object} order - Order data object
         */
        function displayOrderConfirmation(order) {
            // Hide loading state
            document.getElementById('loading-state').style.display = 'none';
            
            // Show confirmation content
            document.getElementById('confirmation-content').style.display = 'block';
            
            // Update page title
            document.title = `Order ${order.orderNumber} - EcoKart`;
            
            // Display order details
            document.getElementById('order-number').textContent = `Order #${order.orderNumber}`;
            document.getElementById('customer-email').textContent = order.email;
            
            // Display order items
            displayOrderItems(order.items);
            
            // Display pricing
            document.getElementById('order-subtotal').textContent = `₹${order.subtotal.toFixed(2)}`;
            document.getElementById('order-shipping').textContent = `₹${order.shipping.toFixed(2)}`;
            document.getElementById('order-tax').textContent = `₹${order.tax.toFixed(2)}`;
            document.getElementById('order-total').textContent = `₹${order.total.toFixed(2)}`;
            
            // Display shipping address
            displayShippingAddress(order);
            
            // Display delivery estimate
            displayDeliveryEstimate();
            
            // Calculate environmental impact
            calculateEcoImpact(order.items);
        }

        function displayOrderItems(items) {
            const container = document.getElementById('order-items-container');
            
            container.innerHTML = items.map(item => `
                <div class="order-item">
                    <div class="row align-items-center">
                        <div class="col-2">
                            <img src="${item.image}" alt="${item.name}" class="order-item-image">
                        </div>
                        <div class="col-7">
                            <h6 class="mb-1">${item.name}</h6>
                            <small class="text-muted text-capitalize">${item.category}</small>
                            <div class="text-muted small">Quantity: ${item.quantity}</div>
                        </div>
                        <div class="col-3 text-end">
                            <div class="fw-bold">₹${(item.price * item.quantity).toFixed(2)}</div>
                            <small class="text-muted">₹${item.price.toFixed(2)} each</small>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function displayShippingAddress(order) {
            const container = document.getElementById('shipping-address');
            
            container.innerHTML = `
                <div class="mb-2">
                    <strong>${order.firstName} ${order.lastName}</strong>
                </div>
                <div class="text-muted">
                    ${order.address}<br>
                    ${order.city}, ${order.state} ${order.zip}<br>
                    <i class="fas fa-envelope me-2"></i>${order.email}<br>
                    <i class="fas fa-phone me-2"></i>${order.phone}
                </div>
            `;
        }

        function displayDeliveryEstimate() {
            const today = new Date();
            const deliveryStart = new Date(today);
            const deliveryEnd = new Date(today);
            
            // Add 5-7 business days
            deliveryStart.setDate(today.getDate() + 5);
            deliveryEnd.setDate(today.getDate() + 7);
            
            // Format dates
            const options = { month: 'short', day: 'numeric' };
            const startDate = deliveryStart.toLocaleDateString('en-US', options);
            const endDate = deliveryEnd.toLocaleDateString('en-US', options);
            
            document.getElementById('delivery-date').textContent = `${startDate} - ${endDate}`;
        }

        function calculateEcoImpact(items) {
            const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
            
            // Mock calculations for environmental impact
            const plasticSaved = totalItems * 2; // Assume each product replaces 2 plastic items
            const co2Saved = (totalItems * 1.5).toFixed(1); // 1.5 lbs CO2 per product
            const treesHelped = Math.ceil(totalItems * 0.3); // Help 0.3 trees per product
            
            // Animate the numbers counting up
            animateNumber(document.getElementById('plastic-saved'), plasticSaved);
            animateText(document.getElementById('co2-saved'), `${co2Saved} lbs`);
            animateNumber(document.getElementById('trees-helped'), treesHelped);
        }

        /**
         * Animate number counting up effect
         * @param {Element} element - DOM element to animate
         * @param {number} target - Target number
         */
        function animateNumber(element, target) {
            let current = 0;
            const increment = target / 30; // 30 steps
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target;
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current);
                }
            }, 50);
        }

        /**
         * Animate text with counting effect
         * @param {Element} element - DOM element to animate
         * @param {string} targetText - Target text to display
         */
        function animateText(element, targetText) {
            const numericPart = parseFloat(targetText);
            let current = 0;
            const increment = numericPart / 30;
            const suffix = targetText.replace(/[\d.]/g, '').trim();
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= numericPart) {
                    element.textContent = targetText;
                    clearInterval(timer);
                } else {
                    element.textContent = `${current.toFixed(1)} ${suffix}`;
                }
            }, 50);
        }

        /**
         * Show error state when order is not found
         */
        function showError() {
            document.getElementById('loading-state').style.display = 'none';
            document.getElementById('error-state').style.display = 'block';
        }

        /**
         * Update cart badge in navigation (should be 0 after order)
         */
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

        /**
         * Get cart from localStorage
         * @returns {Array} - Cart items array
         */
        function getCartFromStorage() {
            const cartData = localStorage.getItem('cart');
            return cartData ? JSON.parse(cartData) : [];
        }

        // Clean up old order data after 5 minutes (optional)
        setTimeout(() => {
            localStorage.removeItem('currentOrder');
        }, 5 * 60 * 1000);
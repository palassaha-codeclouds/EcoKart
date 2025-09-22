let cart = [];
        const shippingRate = 100;
        const taxRate = 0.18; 

        document.addEventListener('DOMContentLoaded', function() {
            updateCartBadge();
            loadCartItems();
            setupFormValidation();
            setupEnterKeyNavigation();
        });

        function loadCartItems() {
            cart = getCartFromStorage();
            renderCartItems();
            calculateTotals();
        }

        function getCartFromStorage() {
            const cartData = localStorage.getItem('cart');
            return cartData ? JSON.parse(cartData) : [];
        }

        function saveCartToStorage() {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartBadge();
        }

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

        //Render cart items in checkout 
        function renderCartItems() {
            const container = document.getElementById('cart-items-container');
            
            if (cart.length === 0) {
                document.getElementById('empty-cart').style.display = 'block';
                document.getElementById('checkout-content').style.display = 'none';
                return;
            }

            document.getElementById('empty-cart').style.display = 'none';
            document.getElementById('checkout-content').style.display = 'flex';

            container.innerHTML = cart.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="row align-items-center">
                        <div class="col-3">
                            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                        </div>
                        <div class="col-4">
                            <h6 class="mb-1">${item.name}</h6>
                            <small class="text-muted">₹${item.price.toFixed(2)} each</small>
                            <div class="text-muted small text-capitalize">${item.category}</div>
                        </div>
                        <div class="col-3">
                            <div class="quantity-controls mb-2">
                                <button type="button" class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                                        onchange="updateQuantity(${item.id}, parseInt(this.value))"/>
                                <button type="button" class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <strong class="align-self-center">₹${(item.price * item.quantity).toFixed(2)}</strong>
                                <button type="button" class="btn btn-sm btn-outline-danger remove-btn-mobile ms-3" 
                                        onclick="removeFromCart(${item.id})" title="Remove item">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        function updateQuantity(productId, newQuantity) {
            if (newQuantity <= 0) {
                removeFromCart(productId);
                return;
            }

            const itemIndex = cart.findIndex(item => item.id === productId);
            if (itemIndex > -1) {
                cart[itemIndex].quantity = newQuantity;
                saveCartToStorage();
                renderCartItems();
                calculateTotals();
            }
        }

        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            saveCartToStorage();
            renderCartItems();
            calculateTotals();
        }

        function calculateTotals() {
            const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            const shipping = cart.length > 0 ? shippingRate : 0;
            const tax = subtotal * taxRate;
            const total = subtotal + shipping + tax;

            document.getElementById('subtotal').textContent = `₹${subtotal.toFixed(2)}`;
            document.getElementById('shipping').textContent = shipping > 0 ? `₹${shipping.toFixed(2)}` : 'FREE';
            document.getElementById('tax').textContent = `₹${tax.toFixed(2)}`;
            document.getElementById('total').textContent = `₹${total.toFixed(2)}`;
        }

        function validateAllFields(displayErrors = true) {
            const form = document.getElementById('checkout-form');
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');

            // Validate all required fields
            requiredFields.forEach(field => {
                // The third argument is the boolean that controls whether to display the error
                if (!validateField(field, displayErrors)) { 
                    isValid = false;
                }
            });

            return isValid;
        }

        function setupFormValidation() {
            const form = document.getElementById('checkout-form');
            const submitButton = document.getElementById('place-order-btn');
            
            // Validate individual fields on blur
            form.querySelectorAll('[required]').forEach(field => {
                field.addEventListener('blur', () => {
                    validateField(field);
                });
            });

            // Handle form submission
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                // Run full form validation on submit
                if (validateAllFields()) {
                    processOrder();
                }
            });

            // Event listener to validate all fields
            form.addEventListener('input', () => {
                const isValid = validateAllFields(false);
                submitButton.disabled = !isValid;
            });

            // To format card number
            document.getElementById('cardNumber').addEventListener('input', (e) => {
                formatCardNumber(e.target);
            });

            // To format expiry date
            document.getElementById('expiry').addEventListener('input', (e) => {
                formatExpiryDate(e.target);
            });
        }

        function validateForm() {
            const form = document.getElementById('checkout-form');
            const submitButton = document.getElementById('place-order-btn');
            let isValid = true;
            const requiredFields = form.querySelectorAll('[required]');

            // Validate all required fields
            requiredFields.forEach(field => {
                if (!validateField(field)) {
                    isValid = false;
                }
            });

            // Enable/disable submit button
            submitButton.disabled = !isValid;
            return isValid;
        }

        function validateField(field, displayError = true) {
            const value = field.value.trim();
            let isValid = true;
            let errorMessage = '';

            if (!value) {
                isValid = false;
                errorMessage = 'This field is required.';
            } else {
                switch (field.name) {
                    case 'email':
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        if (!emailRegex.test(value)) {
                            isValid = false;
                            errorMessage = 'Please enter a valid email address.';
                        }
                        break;
                    case 'phone':
                        const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
                        if (!phoneRegex.test(value.replace(/\D/g, ''))) {
                            isValid = false;
                            errorMessage = 'Please enter a valid phone number.';
                        }
                        break;
                    case 'cardNumber':
                        const cardRegex = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
                        if (!cardRegex.test(value)) {
                            isValid = false;
                            errorMessage = 'Please enter a valid card number.';
                        }
                        break;
                    case 'expiry':
                        const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
                        if (!expiryRegex.test(value)) {
                            isValid = false;
                            errorMessage = 'Please enter a valid expiry date (MM/YY).';
                        }
                        break;
                    case 'cvv':
                        const cvvRegex = /^\d{3,4}$/;
                        if (!cvvRegex.test(value)) {
                            isValid = false;
                            errorMessage = 'Please enter a valid CVV.';
                        }
                        break;
                    case 'zip':
                        const zipRegex = /^\d{6}(-\d{4})?$/;
                        if (!zipRegex.test(value)) {
                            isValid = false;
                            errorMessage = 'Please enter a valid ZIP code.';
                        }
                        break;
                }
            }

            // Only apply classes and show messages if displayError is true
            if (displayError) {
                if (isValid) {
                    field.classList.remove('is-invalid');
                    field.classList.add('is-valid');
                    field.nextElementSibling.style.display = 'none';
                } else {
                    field.classList.remove('is-valid');
                    field.classList.add('is-invalid');
                    const feedback = field.nextElementSibling;
                    if (feedback && feedback.classList.contains('invalid-feedback')) {
                        feedback.textContent = errorMessage;
                        feedback.style.display = 'block';
                    }
                }
            }
            
            return isValid;
        }

        function formatCardNumber(input) {
            let value = input.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            input.value = value;
        }

        function formatExpiryDate(input) {
            let value = input.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            input.value = value;
        }

        function processOrder() {
            const formData = new FormData(document.getElementById('checkout-form'));
            const orderData = {};
            for (let [key, value] of formData.entries()) {
                orderData[key] = value;
            }

            orderData.items = cart;
            orderData.orderNumber = generateOrderNumber();
            orderData.orderDate = new Date().toISOString();
            orderData.subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
            orderData.shipping = shippingRate;
            orderData.tax = orderData.subtotal * taxRate;
            orderData.total = orderData.subtotal + orderData.shipping + orderData.tax;

            localStorage.setItem('currentOrder', JSON.stringify(orderData));

            localStorage.removeItem('cart');

            showOrderSuccessToast();
            setTimeout(() => {
                window.location.href = 'order-confirmation.html';
            }, 1500);
        }

        function setupEnterKeyNavigation() {
            const form = document.getElementById('checkout-form');
            const fields = form.querySelectorAll('input, select');
            
            fields.forEach((field, index) => {
                field.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        
                        const nextField = fields[index + 1];
                        if (nextField) {
                            nextField.focus();
                        } else {
                            document.getElementById('place-order-btn').focus();
                        }
                    }
                });
            });
        }

        function generateOrderNumber() {
            return 'ECO' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
        }

        function showOrderSuccessToast() {
            const toastHtml = `
                <div class="toast-container position-fixed bottom-0 end-0 p-3">
                    <div class="toast align-items-center text-white bg-success border-0 show" role="alert">
                        <div class="d-flex">
                            <div class="toast-body">
                                <i class="fas fa-check-circle me-2"></i>
                                Order placed successfully! Redirecting...
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', toastHtml);
            
            const toastElement = document.querySelector('.toast');
            const toast = new bootstrap.Toast(toastElement, { delay: 2000 });
            toast.show();
        }
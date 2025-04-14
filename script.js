// Global variables
let products = [];
let cart = [];

// DOM elements
const productsContainer = document.getElementById('products-container');
const cartContainer = document.getElementById('cart-container');
const overlay = document.getElementById('overlay');
const cartIcon = document.getElementById('cart-icon');
const closeCart = document.getElementById('close-cart');
const cartItems = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');

// Templates
const productTemplate = document.getElementById('product-template');
const cartItemTemplate = document.getElementById('cart-item-template');

// Event listeners
document.addEventListener('DOMContentLoaded', init);
cartIcon.addEventListener('click', toggleCart);
closeCart.addEventListener('click', toggleCart);
overlay.addEventListener('click', toggleCart);
checkoutBtn.addEventListener('click', checkout);

// Initialize the application
function init() {
    fetchProducts();
    fetchCart();
}

// Fetch products from the server
function fetchProducts() {
    fetch('api.php?action=getProducts')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            products = data;
            renderProducts();
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            productsContainer.innerHTML = `<div class="error">Failed to load products. Please try again later.</div>`;
        });
}

// Fetch cart from the server
function fetchCart() {
    fetch('api.php?action=getCart')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                cart = data.cart;
                updateCartUI();
            }
        })
        .catch(error => {
            console.error('Error fetching cart:', error);
        });
}

// Render products in the UI
function renderProducts() {
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productClone = document.importNode(productTemplate.content, true);
        
        const productImage = productClone.querySelector('.product-image img');
        productImage.src = product.image_url;
        productImage.alt = product.name;
        
        productClone.querySelector('.product-name').textContent = product.name;
        productClone.querySelector('.product-description').textContent = product.description;
        productClone.querySelector('.product-price').textContent = `$${parseFloat(product.price).toFixed(2)}`;
        
        const addToCartBtn = productClone.querySelector('.add-to-cart-btn');
        addToCartBtn.dataset.productId = product.id;
        addToCartBtn.addEventListener('click', () => addToCart(product.id));
        
        productsContainer.appendChild(productClone);
    });
}

// Toggle cart visibility
function toggleCart() {
    cartContainer.classList.toggle('active');
    overlay.classList.toggle('active');
}

// Add product to cart
function addToCart(productId) {
    fetch('api.php?action=addToCart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            productId: productId,
            quantity: 1
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            cart = data.cart;
            updateCartUI();
            
            // Show cart briefly
            if (!cartContainer.classList.contains('active')) {
                toggleCart();
                setTimeout(() => {
                    if (cartContainer.classList.contains('active')) {
                        toggleCart();
                    }
                }, 2000);
            }
        }
    })
    .catch(error => console.error('Error adding to cart:', error));
}

// Remove product from cart
function removeFromCart(productId) {
    fetch('api.php?action=removeFromCart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            productId: productId
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            cart = data.cart;
            updateCartUI();
        }
    })
    .catch(error => console.error('Error removing from cart:', error));
}

// Update product quantity in cart
function updateCartQuantity(productId, quantity) {
    fetch('api.php?action=updateCart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            productId: productId,
            quantity: quantity
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            cart = data.cart;
            updateCartUI();
        }
    })
    .catch(error => console.error('Error updating cart:', error));
}

// Process checkout
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    fetch('api.php?action=checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            cart = [];
            updateCartUI();
            alert('Checkout completed successfully!');
            toggleCart();
        }
    })
    .catch(error => console.error('Error during checkout:', error));
}

// Update cart UI
function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        cartTotalPrice.textContent = '$0.00';
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    // Process each cart item
    cart.forEach(cartItem => {
        const product = products.find(p => p.id == cartItem.productId);
        if (!product) return;
        
        const cartItemClone = document.importNode(cartItemTemplate.content, true);
        
        const cartItemImage = cartItemClone.querySelector('.cart-item-image img');
        cartItemImage.src = product.image_url;
        cartItemImage.alt = product.name;
        
        cartItemClone.querySelector('.cart-item-name').textContent = product.name;
        cartItemClone.querySelector('.cart-item-price').textContent = `$${parseFloat(product.price).toFixed(2)}`;
        cartItemClone.querySelector('.quantity-value').textContent = cartItem.quantity;
        
        const decreaseBtn = cartItemClone.querySelector('.decrease-quantity');
        const increaseBtn = cartItemClone.querySelector('.increase-quantity');
        const removeBtn = cartItemClone.querySelector('.remove-item');
        
        decreaseBtn.addEventListener('click', () => {
            const newQuantity = cartItem.quantity - 1;
            if (newQuantity > 0) {
                updateCartQuantity(cartItem.productId, newQuantity);
            } else {
                removeFromCart(cartItem.productId);
            }
        });
        
        increaseBtn.addEventListener('click', () => {
            updateCartQuantity(cartItem.productId, cartItem.quantity + 1);
        });
        
        removeBtn.addEventListener('click', () => {
            removeFromCart(cartItem.productId);
        });
        
        cartItems.appendChild(cartItemClone);
        
        // Calculate item total and add to overall total
        const itemTotal = product.price * cartItem.quantity;
        total += itemTotal;
    });
    
    // Update total price
    cartTotalPrice.textContent = `$${total.toFixed(2)}`;
}
<?php
// Set header for JSON response
header('Content-Type: application/json');
// Allow requests from any origin (for development purposes)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

// Include database configuration
require_once 'db_config.php';

// Start session for cart management
session_start();

// Initialize cart if it doesn't exist
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

// Get the action parameter
$action = isset($_GET['action']) ? $_GET['action'] : '';

// Handle different actions
switch ($action) {
    case 'getProducts':
        getProducts($conn);
        break;
    case 'addToCart':
        addToCart();
        break;
    case 'removeFromCart':
        removeFromCart();
        break;
    case 'updateCart':
        updateCart();
        break;
    case 'getCart':
        getCart();
        break;
    case 'checkout':
        checkout();
        break;
    default:
        echo json_encode(['error' => 'Invalid action']);
}

// Function to get all products
function getProducts($conn) {
    try {
        $stmt = $conn->prepare("SELECT * FROM products");
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($products);
    } catch(PDOException $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
}

// Function to add item to cart
function addToCart() {
    // Get the request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['productId']) || !isset($data['quantity'])) {
        echo json_encode(['error' => 'Product ID and quantity are required']);
        return;
    }
    
    $productId = $data['productId'];
    $quantity = intval($data['quantity']);
    
    // Check if product is already in cart
    $found = false;
    foreach ($_SESSION['cart'] as &$item) {
        if ($item['productId'] == $productId) {
            $item['quantity'] += $quantity;
            $found = true;
            break;
        }
    }
    
    // If product not in cart, add it
    if (!$found) {
        $_SESSION['cart'][] = [
            'productId' => $productId,
            'quantity' => $quantity
        ];
    }
    
    echo json_encode(['success' => true, 'cart' => $_SESSION['cart']]);
}

// Function to remove item from cart
function removeFromCart() {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['productId'])) {
        echo json_encode(['error' => 'Product ID is required']);
        return;
    }
    
    $productId = $data['productId'];
    
    // Remove product from cart
    foreach ($_SESSION['cart'] as $key => $item) {
        if ($item['productId'] == $productId) {
            unset($_SESSION['cart'][$key]);
            // Reset array keys
            $_SESSION['cart'] = array_values($_SESSION['cart']);
            break;
        }
    }
    
    echo json_encode(['success' => true, 'cart' => $_SESSION['cart']]);
}

// Function to update cart item quantity
function updateCart() {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['productId']) || !isset($data['quantity'])) {
        echo json_encode(['error' => 'Product ID and quantity are required']);
        return;
    }
    
    $productId = $data['productId'];
    $quantity = intval($data['quantity']);
    
    // Update product quantity
    foreach ($_SESSION['cart'] as &$item) {
        if ($item['productId'] == $productId) {
            if ($quantity <= 0) {
                // If quantity is 0 or negative, remove item
                foreach ($_SESSION['cart'] as $key => $cartItem) {
                    if ($cartItem['productId'] == $productId) {
                        unset($_SESSION['cart'][$key]);
                        // Reset array keys
                        $_SESSION['cart'] = array_values($_SESSION['cart']);
                        break;
                    }
                }
            } else {
                $item['quantity'] = $quantity;
            }
            break;
        }
    }
    
    echo json_encode(['success' => true, 'cart' => $_SESSION['cart']]);
}

// Function to get cart contents
function getCart() {
    echo json_encode(['success' => true, 'cart' => $_SESSION['cart']]);
}

// Function to process checkout
function checkout() {
    // In a real application, you would process payment here
    // and store order details in the database
    
    // For this assignment, simply clear the cart
    $_SESSION['cart'] = [];
    
    echo json_encode([
        'success' => true, 
        'message' => 'Checkout completed successfully',
        'cart' => $_SESSION['cart']
    ]);
}
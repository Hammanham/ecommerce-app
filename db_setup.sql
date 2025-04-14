-- Create database
CREATE DATABASE IF NOT EXISTS ecommerce_app;
USE ecommerce_app;

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Insert sample products
INSERT INTO products (name, description, image_url, price) VALUES
('Smartphone X', 'Latest smartphone with advanced camera and long battery life', 'images\smartphone image 181.jpg', 799.99),
('Laptop Pro', 'High-performance laptop for professionals and gamers', 'images\laptop 208.jpg', 1299.99),
('Wireless Headphones', 'Noise-cancelling wireless headphones with 20-hour battery life', 'images\headphones jbl 234.webp', 149.99),
('Smart Watch', 'Fitness tracker and smart watch with heart rate monitoring', 'images\smartwatch 261.jpg', 199.99),
('Bluetooth Speaker', 'Portable speaker with rich sound and waterproof design', 'images\Bluetooth speaker 287.jpg', 89.99);
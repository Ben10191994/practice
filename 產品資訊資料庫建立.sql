CREATE DATABASE IF NOT EXISTS inventory;

USE inventory;

CREATE TABLE IF NOT EXISTS products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    quality VARCHAR(255),
    defects TEXT,
    detection_time DATETIME,
    image_data VARCHAR(255)  -- 儲存圖片檔案的路徑
);
DROP TABLE IF EXISTS products;


SELECT * FROM products;



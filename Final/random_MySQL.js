const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const mysql = require('mysql2');

// 设置 MySQL 连接配置
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'P@ssw0rd',
    database: 'inventory'
});

// 生成随机图片并保存至本地
function generateRandomImage(imagePath) {
    const canvas = createCanvas(200, 200);  // 创建一个 200x200 的画布
    const ctx = canvas.getContext('2d');
    
    // 随机填充背景颜色
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 可以加入随机文字或其他图案
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText('產品', 50, 100);
    
    // 保存图片到指定的路径
    const out = fs.createWriteStream(imagePath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    
    out.on('finish', () => {
        console.log(`图片已保存至 ${imagePath}`);
    });
}

const products = [];

// 创建图片并生成产品数据
for (let i = 1; i <= 5000; i++) {
    const isDefective = Math.random() > 0.6; // 随机决定是否为劣质品
    const quality = isDefective ? '劣質品' : '良品';

    // 生成缺陷数据（确保劣质品一定有缺陷）
    const defects = isDefective 
        ? (() => {
            const possibleDefects = ['划痕', '汙點', '裁切', '大範圍污痕', '顏色汙染'];
            // 确保至少随机选择一种缺陷
            const selectedDefects = possibleDefects.filter(() => Math.random() > 0.8); // 减少随机门槛以确保缺陷存在
            if (selectedDefects.length === 0) {
                // 如果随机结果导致无缺陷，强制选择一种缺陷
                return possibleDefects[Math.floor(Math.random() * possibleDefects.length)];
            }
            return selectedDefects.join(', ');
        })()
        : '';
    
    // 生成随机时间
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const randomHour = String(Math.floor(Math.random() * 24)).padStart(2, '0');
    const randomMinute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    const randomSecond = String(Math.floor(Math.random() * 60)).padStart(2, '0');
    const detectionTime = `${year}-${month}-${day} ${randomHour}:${randomMinute}:${randomSecond}`;

    // 生成随机图片并保存
    const imagePath = `images/product_${i}.png`;
    generateRandomImage(imagePath);

    // 推送数据
    products.push({
        quality: quality,
        defects: defects,
        detection_time: detectionTime,
        image_data: imagePath
    });
}

// 使用 Promise 和 async/await 来确保插入数据后再关闭连接
async function insertData() {
    for (const product of products) {
        const query = `INSERT INTO products (quality, defects, detection_time, image_data)
                       VALUES (?, ?, ?, ?)`;
        await new Promise((resolve, reject) => {
            connection.query(query, [
                product.quality,
                product.defects,
                product.detection_time,
                product.image_data
            ], (err, results) => {
                if (err) {
                    console.error('插入错误: ', err);
                    reject(err);
                } else {
                    console.log(`产品已插入`);
                    resolve();
                }
            });
        });
    }
    connection.end();
}

// 开始插入数据
insertData().catch(err => console.error(err));


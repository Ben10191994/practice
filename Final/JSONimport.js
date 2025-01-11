const fs = require('fs');
const mysql = require('mysql2');

// 設定 MySQL 連接配置
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'P@ssw0rd',
    database: 'inventory'
});

// 創建資料庫連接
connection.connect((err) => {
    if (err) {
        console.error('資料庫連接失敗: ', err);
        return;
    }
    console.log('資料庫連接成功！');
});

// 讀取 JSON 檔案並插入資料庫
function importJSONToDatabase(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('讀取 JSON 文件時發生錯誤: ', err);
            return;
        }
        const products = JSON.parse(data);  // 將 JSON 轉換為 JavaScript 物件
        console.log('JSON 讀取完成，開始插入資料庫...');
        insertData(products);
    });
}

// 查詢資料庫中的最大 product_id
function getMaxProductId() {
    return new Promise((resolve, reject) => {
        const query = 'SELECT MAX(product_id) AS max_id FROM products';
        connection.query(query, (err, results) => {
            if (err) {
                console.error('查詢最大 ID 時發生錯誤: ', err);
                reject(err);
            } else {
                resolve(results[0].max_id || 0); // 如果查無資料，則返回 0
            }
        });
    });
}

// 將資料插入 MySQL 資料庫(會先取得數據庫中最大的product_id，接著比對即將插入的資料，如有重複id的情況發生，則產生最大ID+1為新ID並插入數據庫)
async function insertData(products) {
    let maxProductId = await getMaxProductId(); // 先取得最大 product_id

    const query = `
        INSERT INTO products (product_id, quality, defects, detection_time, image_data)
        VALUES (?, ?, ?, ?, ?)
    `;

    for (const product of products) {
        let { product_id, quality, defects, detection_time, image_data } = product;

        // 如果資料庫中已經存在相同的 product_id，則將插入資料的 product_id 設為最大 product_id + 1
        if (parseInt(product_id) <= maxProductId) {
            product_id = maxProductId + 1;
        }

        // 使用 Promise 來確保資料插入完成後再繼續
        await new Promise((resolve, reject) => {
            connection.query(query, [product_id, quality, defects, detection_time, image_data], (err, results) => {
                if (err) {
                    console.error('插入錯誤: ', err);
                    reject(err);
                } else {
                    console.log(`產品 ${product_id} 已插入`);
                    resolve();
                }
            });
        });

        // 更新最大 ID
        const newMaxProductId = await getMaxProductId();
        if (newMaxProductId > maxProductId) {
            maxProductId = newMaxProductId;
        }
    }

    console.log('所有資料已成功插入資料庫');
    connection.end();
}

// 指定 JSON 文件的路徑並開始導入
importJSONToDatabase('products_data.json');


//需要創建JSON的同時進行這段程式
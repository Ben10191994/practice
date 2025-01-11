const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const cors = require('cors'); // 引入 cors 模組


// 設置 Express 伺服器
const app = express();
const port = 3001;

// 啟用 CORS
app.use(cors());

// 設置 MySQL 連接配置
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'P@ssw0rd',  // 請替換為您的 MySQL 密碼
    database: 'inventory'   // 您的資料庫名稱
});

// 連接 MySQL
connection.connect((err) => {
    if (err) {
        console.error('無法連接 MySQL: ', err);
    } else {
        console.log('成功連接到 MySQL');
    }
});

// 設置靜態資源目錄
// app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 獲取所有檢查項目 (ID)
app.get('/api/products', (req, res) => {
    const query = 'SELECT product_id, quality, defects, detection_time, image_data FROM products';  // 查詢產品的ID、品質、缺陷、標籤
    connection.query(query, (err, results) => {
        if (err) {
            res.status(500).send('查詢錯誤');
            return;
        }
        res.json(results);  // 返回所有產品資訊
    });
});
  
 // 建立 API 路由來獲取良品/劣質品總數/比率
app.get('/api/product-counts', (req, res) => {
    // 查詢良品數量
    const queryGoodCount = 'SELECT COUNT(*) AS count FROM products WHERE quality = "良品"';
    
    // 查詢劣質品數量
    const queryDefectiveCount = 'SELECT COUNT(*) AS count FROM products WHERE quality = "劣質品"';
    
    // 同時執行兩個查詢
    connection.query(queryGoodCount, (err, goodResults) => {
        if (err) {
            console.error('查詢良品數量時發生錯誤:', err);
            return res.status(500).json({ error: '查詢良品數量失敗' });
        }

        connection.query(queryDefectiveCount, (err, defectiveResults) => {
            if (err) {
                console.error('查詢劣質品數量時發生錯誤:', err);
                return res.status(500).json({ error: '查詢劣質品數量失敗' });
            }

            // 獲取良品數量和劣質品數量
            const goodCount = goodResults[0].count;
            const defectiveCount = defectiveResults[0].count;
            
            // 計算總數量
            const totalCount = goodCount + defectiveCount;

            // 計算劣質品比率
            const defectiveRate = totalCount > 0 
                ? ((defectiveCount / totalCount) * 100).toFixed(2) 
                : 0;

            // 返回結果
            res.status(200).json({
                good: goodCount,
                defective: defectiveCount,
                defectiveRate: defectiveRate,
            });
        });
    });
});

// 根據產品 ID 查詢特定產品資料(修改後)
app.get('/api/product/:id', (req, res) => {
    const productId = req.params.id;  // 從 URL 參數中獲取產品 ID

    // 確保傳入的 ID 是有效的數字
    if (isNaN(productId)) {
        return res.status(400).json({ error: 'ID 必須為數字' });
    }

    // 使用 MySQL 查詢產品資料
    const query = 'SELECT product_id, quality, defects, detection_time, image_data FROM products WHERE product_id = ?';
    
    connection.query(query, [productId], (err, results) => {
        if (err) {
            console.error('查詢失敗', err);
            return res.status(500).json({ error: '伺服器錯誤' });
        }

        if (results.length > 0) {
            // 返回找到的產品資料
            res.status(200).json(results[0]);
        } else {
            // 如果找不到資料，返回 404 錯誤
            res.status(404).json({ error: '未找到產品數據' });
        }
    });
});


// 根據檢測時間範圍查詢資料(修改後)
app.get('/api/products/time-range', (req, res) => {
    const { start, end } = req.query; // 取得查詢參數

    // 檢查開始時間和結束時間是否有效
    if (!start || !end) {
        return res.status(400).json({ error: '請提供開始時間和結束時間' });
    }

    // 查詢特定時間範圍內的所有產品數據
    const queryProducts = `
        SELECT product_id, quality, defects, detection_time, image_data
        FROM products
        WHERE detection_time BETWEEN ? AND ?
    `;

    // 查詢良品數量
    const queryGoodCount = `
        SELECT COUNT(*) AS count
        FROM products
        WHERE quality = "良品" AND detection_time BETWEEN ? AND ?
    `;

    // 查詢劣質品數量
    const queryDefectiveCount = `
        SELECT COUNT(*) AS count
        FROM products
        WHERE quality = "劣質品" AND detection_time BETWEEN ? AND ?
    `;

    // 同時執行產品查詢和統計查詢
    connection.query(queryProducts, [start, end], (err, productResults) => {
        if (err) {
            console.error('查詢產品資料時發生錯誤:', err);
            return res.status(500).json({ error: '查詢產品資料失敗' });
        }

        // 查詢良品數量
        connection.query(queryGoodCount, [start, end], (err, goodResults) => {
            if (err) {
                console.error('查詢良品數量時發生錯誤:', err);
                return res.status(500).json({ error: '查詢良品數量失敗' });
            }

            // 查詢劣質品數量
            connection.query(queryDefectiveCount, [start, end], (err, defectiveResults) => {
                if (err) {
                    console.error('查詢劣質品數量時發生錯誤:', err);
                    return res.status(500).json({ error: '查詢劣質品數量失敗' });
                }

                // 獲取良品數量和劣質品數量
                const goodCount = goodResults[0].count;
                const defectiveCount = defectiveResults[0].count;

                // 計算總數量
                const totalCount = goodCount + defectiveCount;

                // 計算劣質品比率
                const defectiveRate = totalCount > 0
                    ? ((defectiveCount / totalCount) * 100).toFixed(2)
                    : 0;

                // 返回查詢結果和統計信息
                res.status(200).json({
                    products: productResults, // 產品數據
                    good: goodCount, // 良品數量
                    defective: defectiveCount, // 劣質品數量
                    defectiveRate: defectiveRate, // 劣質品比率
                });
            });
        });
    });
});


 // 建立 API 路由來獲取資料筆數(資料總數)(符合缺陷條件產品數量：500)(修改後)

app.get('/api/product-count', (req, res) => {
    const { quality, defects, start, end } = req.query; // 获取筛选条件

    // 基本查询语句
    let countQuery = 'SELECT COUNT(*) AS count FROM products WHERE 1=1';

    // 添加质量条件
    if (quality) {
        countQuery += ` AND quality = ${mysql.escape(quality)}`;
    }

    // 添加缺陷条件
    if (defects) {
        const defectsArray = defects.split(',');
        const defectsCondition = defectsArray
            .map(defect => `defects LIKE ${mysql.escape('%' + defect + '%')}`)
            .join(' AND '); // 使用 AND 拼接条件
        countQuery += ` AND (${defectsCondition})`;
    }

    // 添加时间范围条件
    if (start && end) {
        countQuery += ` AND detection_time BETWEEN ${mysql.escape(start)} AND ${mysql.escape(end)}`;
    }

    console.log('SQL Query:', countQuery); // 调试用

    // 执行查询
    connection.query(countQuery, (err, results) => {
        if (err) {
            console.error('查询数据笔数时出错:', err);
            return res.status(500).json({ error: '无法查询数据', details: err.message });
        }

        // 返回符合条件的数据总数
        res.status(200).json({ count: results[0].count });
    });
});



// 根據篩選條件查詢產品資料(更新後)

app.get('/api/products/filter', (req, res) => {
    const { quality, defects, start, end, startTime, endTime } = req.query; // 加入時間範圍的查詢參數

    let query = 'SELECT * FROM products WHERE 1=1';

    // 根據選擇的品質篩選
    if (quality) {
        query += ` AND quality = ${mysql.escape(quality)}`;
    }

    // 根據選擇的缺陷篩選
    if (defects) {
        const defectsArray = defects.split(',');
        const defectsCondition = defectsArray
            .map(defect => `defects LIKE ${mysql.escape('%' + defect + '%')}`)
            .join(' AND '); // 使用 AND 拼接條件
        query += ` AND (${defectsCondition})`;
    }

    // 根據選擇的檢測時間篩選
    if (startTime && endTime) {
        query += ` AND detection_time BETWEEN ${mysql.escape(startTime)} AND ${mysql.escape(endTime)}`;
    }

    // 根據選擇的範圍篩選
    const offset = parseInt(start, 10) || 0;  // 確保是整數，若未提供則設為0
    const limit = parseInt(end, 10) - offset || 10;  // 計算限制數量，若未提供則設為10
    query += ` LIMIT ${offset}, ${limit}`;

    console.log("Executing query: ", query); // 输出执行的查询语句，用于调试

    // 執行查詢
    connection.query(query, (err, results) => {
        if (err) {
            console.error('查詢錯誤: ', err);
            return res.status(500).send('伺服器錯誤');
        }
        res.json(results); // 返回篩選後的結果
    });
});





// 啟動伺服器
app.listen(port, () => {
    console.log(`伺服器正在運行在 http://localhost:${port}`);
});





// =========================================================================

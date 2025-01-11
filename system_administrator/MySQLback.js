const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 建立 MySQL 連接
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // 替換為你的 MySQL 使用者名稱
    password: 'P@ssw0rd', // 替換為你的 MySQL 密碼
    database: 'memberaccount' // 替換為你的資料庫名稱
});

// 連接資料庫
db.connect(err => {
    if (err) {
        console.error('無法連接到資料庫:', err);
        return;
    }
    console.log('已成功連接到資料庫');
});

// 提供 API 接口：取得所有使用者資料
app.get('/api/users', (req, res) => {
    const query = 'SELECT id, account, password, creating_time, permissions FROM users';
    db.query(query, (err, results) => {
        if (err) {
            console.error('查詢失敗:', err);
            res.status(500).json({ success: false, message: '伺服器錯誤' });
            return;
        }
        res.json({ success: true, data: results });
    });
});

// 提供 API 接口：新增使用者
app.post('/api/add-user', (req, res) => {
    const { account, password, permissions } = req.body;
    const creating_time = new Date().toISOString().slice(0, 19).replace('T', ' '); // 格式化為 'YYYY-MM-DD HH:MM:SS'
    const query = `
        INSERT INTO users (account, password, creating_time, permissions)
        VALUES (?, ?, ?, ?)
    `;
    db.query(query, [account, password, creating_time, permissions], (err, results) => {
        if (err) {
            console.error('新增失敗:', err);
            res.status(500).json({ success: false, message: '伺服器錯誤' });
            return;
        }
        res.json({ success: true, message: '使用者已新增' });
    });
});

// 提供 API 接口：更新使用者資料
app.post('/api/update-user', (req, res) => {
    const { id, account, password, permissions } = req.body;

    // 檢查權限是否為有效值
    const validPermissions = ['supervisor', 'admin', 'user'];
    if (!validPermissions.includes(permissions.toLowerCase())) {
        return res.status(400).json({ success: false, message: '無效的權限，請輸入supervisor, admin或user' });
    }

    const query = `
        UPDATE users 
        SET account = ?, password = ?, permissions = ? 
        WHERE id = ?
    `;
    db.query(query, [account, password, permissions, id], (err, results) => {
        if (err) {
            console.error('無效的權限，請輸入supervisor, admin或user:', err);
            res.status(500).json({ success: false, message: '伺服器錯誤' });
            return;
        }
        res.json({ success: true, message: '更新成功' });
    });
});


// 提供 API 接口：刪除使用者
app.delete('/api/delete-user/:id', (req, res) => {
    const { id } = req.params;
    
    // 刪除指定 ID 的使用者
    const deleteQuery = 'DELETE FROM users WHERE id = ?';
    db.query(deleteQuery, [id], (err, results) => {
        if (err) {
            console.error('刪除失敗:', err);
            res.status(500).json({ success: false, message: '伺服器錯誤' });
            return;
        }
        if (results.affectedRows > 0) {
            res.json({ success: true, message: '刪除成功' });
        } else {
            res.status(404).json({ success: false, message: '未找到指定的使用者' });
        }
    });
});

// 登入 API
app.post('/api/login', (req, res) => {
    const { account, password } = req.body;

    if (!account || !password) {
        return res.status(400).json({ success: false, message: '請填寫所有欄位' });
    }

    const query = 'SELECT * FROM users WHERE account = ? AND password = ?';
    db.query(query, [account, password], (err, results) => {
        if (err) {
            console.error('查詢失敗:', err);
            return res.status(500).json({ success: false, message: '伺服器錯誤' });
        }

        if (results.length > 0) {
            // 比對成功
            res.json({ success: true, message: '登入成功', role: results[0].role });
        } else {
            // 比對失敗
            res.status(401).json({ success: false, message: '無效的使用者名稱或密碼' });
        }
    });
});


// 啟動伺服器
const PORT = 3002;
app.listen(PORT, () => {
    console.log(`伺服器正在運行於 http://localhost:${PORT}`);
});



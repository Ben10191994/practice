const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
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
app.get('/api/usersaccount', (req, res) => {
    const query = 'SELECT id, username, account, password, creating_time, permissions FROM usersaccount';
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
    const { username, account, password} = req.body;

    // 檢查欄位是否為空
    if (!username || !account || !password) {
        return res.status(400).json({ success: false, message: '請填寫所有欄位！' });
    }

    // 先檢查帳號是否已經存在
    const checkQuery = 'SELECT COUNT(*) AS count FROM usersaccount WHERE account = ?';
    db.query(checkQuery, [account], (err, results) => {
        if (err) {
            console.error('查詢帳號失敗:', err);
            return res.status(500).json({ success: false, message: '伺服器錯誤' });
        }

        if (results[0].count > 0) {
            // 如果帳號已經存在，返回錯誤信息
            return res.status(400).json({ success: false, message: '帳號已存在，請選擇其他帳號' });
        }

        // 帳號不存在，繼續新增使用者
        const creating_time = new Date().toISOString().slice(0, 19).replace('T', ' '); // 格式化為 'YYYY-MM-DD HH:MM:SS'
        const insertQuery = `
            INSERT INTO usersaccount (username, account, password, creating_time, permissions)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(insertQuery, [username, account, password, creating_time, 'user'], (err, results) => {
            if (err) {
                console.error('新增失敗:', err);
                return res.status(500).json({ success: false, message: '伺服器錯誤' });
            }
            res.json({ success: true, message: '使用者已新增' });
        });
    });
});


// 提供 API 接口：更新使用者資料
app.post('/api/update-user', (req, res) => {
    const { id, username, account, password, permissions } = req.body;

    

    // 檢查帳號是否已經存在，排除是正在更新的帳號
    const checkQuery = 'SELECT COUNT(*) AS count FROM usersaccount WHERE account = ? AND id != ?';
    db.query(checkQuery, [account, id], (err, results) => {
        if (err) {
            console.error('查詢帳號失敗:', err);
            return res.status(500).json({ success: false, message: '伺服器錯誤，無法檢查帳號' });
        }

        if (results[0].count > 0) {
            // 如果帳號已經存在且不是正在更新的帳號，返回錯誤
            console.log(results[0]);
            return res.status(400).json({ success: false, message: '帳號已存在，請選擇其他帳號ZZZ' });
        }


        // 更新資料
        const updateQuery = `
            UPDATE usersaccount 
            SET username = ?, password = ? 
            WHERE id = ?
        `;
        db.query(updateQuery, [username, password, id], (err, results) => {
            if (err) {
                console.error('更新資料失敗:', err);
                return res.status(500).json({ success: false, message: '伺服器錯誤，無法更新資料' });
            }

            if (results.affectedRows === 0) {
                return res.status(400).json({ success: false, message: '更新失敗，找不到該使用者' });
            }

            res.json({ success: true, message: '更新成功' });
        });
    });
});




// 提供 API 接口：刪除使用者
app.delete('/api/delete-user/:id', (req, res) => {
    const { id } = req.params;
    
    // 刪除指定 ID 的使用者
    const deleteQuery = 'DELETE FROM usersaccount WHERE id = ?';
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
app.post('/login', (req, res) => {
    const { account, password } = req.body;
  
    // 檢查帳號和密碼是否存在
    if (!account || !password) {
      return res.status(400).json({ error: '請填寫所有欄位。' });
    }
  
    // 特別處理 supervisor 帳號，無論密碼如何都可以登入
    if (account === 'supervisor' && password === 'supervisor') {
      return res.json({ redirectUrl: '../brickeye_supervisor/web_brickeyehome_user.html' });
    }
  
    // 查詢資料庫中的帳號和密碼
    const query = 'SELECT password, permissions FROM usersaccount WHERE account = ?';
    db.query(query, [account], (err, results) => {
      if (err) {
        return res.status(500).json({ error: '資料庫查詢錯誤' });
      }
  
      if (results.length > 0) {
        // 直接比對密碼
        if (password === results[0].password) {
          const role = results[0].permissions;
          let redirectUrl = '';
  
          switch (role) {
            case 'user':
              redirectUrl = '../brickeye_user/web_brickeyehome_user.html';
              break;
            case 'admin':
              redirectUrl = '../brickeye_admin/admin-dashboard_org.html';
              break;
            case 'supervisor':
              redirectUrl = '../brickeye_supervisor/web_brickeyehome_user.html';
              break;
            default:
              return res.status(400).json({ error: '無效的使用者角色。' });
          }
  
          res.json({ redirectUrl: redirectUrl });
        } else {
          res.status(400).json({ error: '無效的使用者名稱或密碼。' });
        }
      } else {
        res.status(400).json({ error: '無效的使用者名稱或密碼。' });
      }
    });
});



// 啟動伺服器
const PORT = 3002;
app.listen(PORT, () => {
    console.log(`伺服器正在運行於 http://localhost:${PORT}`);
});

// const express = require('express');
// const mysql = require('mysql2');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const bcrypt = require('bcrypt');
// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

// // 建立 MySQL 連接
// const db = mysql.createConnection({
//     host: 'localhost',
//     user: 'root', // 替換為你的 MySQL 使用者名稱
//     password: 'P@ssw0rd', // 替換為你的 MySQL 密碼
//     database: 'memberaccount' // 替換為你的資料庫名稱
// });

// // 連接資料庫
// db.connect(err => {
//     if (err) {
//         console.error('無法連接到資料庫:', err);
//         return;
//     }
//     console.log('已成功連接到資料庫');
// });

// // 提供 API 接口：取得所有使用者資料
// app.get('/api/users', (req, res) => {
//     const query = 'SELECT id, account, password, creating_time, permissions FROM users';
//     db.query(query, (err, results) => {
//         if (err) {
//             console.error('查詢失敗:', err);
//             res.status(500).json({ success: false, message: '伺服器錯誤' });
//             return;
//         }
//         res.json({ success: true, data: results });
//     });
// });

// // 提供 API 接口：新增使用者

// app.post('/api/add-user', (req, res) => {
//     const { account, password, permissions } = req.body;

//     // 檢查欄位是否為空
//     if (!account || !password || !permissions) {
//         return res.status(400).json({ success: false, message: '請填寫所有欄位！' });
//     }

//     // 先檢查帳號是否已經存在
//     const checkQuery = 'SELECT COUNT(*) AS count FROM users WHERE account = ?';
//     db.query(checkQuery, [account], (err, results) => {
//         if (err) {
//             console.error('查詢帳號失敗:', err);
//             return res.status(500).json({ success: false, message: '伺服器錯誤' });
//         }

//         if (results[0].count > 0) {
//             // 如果帳號已經存在，返回錯誤信息
//             return res.status(400).json({ success: false, message: '帳號已存在，請選擇其他帳號' });
//         }

//         // 帳號不存在，繼續新增使用者
//         const creating_time = new Date().toISOString().slice(0, 19).replace('T', ' '); // 格式化為 'YYYY-MM-DD HH:MM:SS'
//         const insertQuery = `
//             INSERT INTO users (account, password, creating_time, permissions)
//             VALUES (?, ?, ?, ?)
//         `;
//         db.query(insertQuery, [account, password, creating_time, permissions], (err, results) => {
//             if (err) {
//                 console.error('新增失敗:', err);
//                 return res.status(500).json({ success: false, message: '伺服器錯誤' });
//             }
//             res.json({ success: true, message: '使用者已新增' });
//         });
//     });
// });


// // 提供 API 接口：更新使用者資料
// app.post('/api/update-user', (req, res) => {
//     const { id, account, password, permissions } = req.body;

//     // 檢查所有欄位是否為空
//     if (!id || !account || !password || !permissions) {
//         return res.status(400).json({ success: false, message: '所有欄位均為必填，請提供完整資料' });
//     }

//     // 檢查帳號是否已經存在，排除是正在更新的帳號
//     const checkQuery = 'SELECT COUNT(*) AS count FROM users WHERE account = ? AND id != ?';
//     db.query(checkQuery, [account, id], (err, results) => {
        
//         if (err) {
//             console.error('查詢帳號失敗:', err);
//             return res.status(500).json({ success: false, message: '伺服器錯誤，無法檢查帳號' });
//         }

//         if (results[0].count > 0) {
//             // 如果帳號已經存在且不是正在更新的帳號，返回錯誤
//             return res.status(400).json({ success: false, message: '帳號已存在，請選擇其他帳號' });
//         }

//         // 檢查權限是否為有效值
//         const validPermissions = ['supervisor', 'admin', 'user'];
//         if (!validPermissions.includes(permissions.toLowerCase())) {
//             return res.status(400).json({ success: false, message: '無效的權限，請輸入supervisor, admin或user' });
//         }

//         // 更新資料
//         const updateQuery = `
//             UPDATE users 
//             SET account = ?, password = ?, permissions = ? 
//             WHERE id = ?
//         `;
//         db.query(updateQuery, [account, password, permissions, id], (err, results) => {
//             if (err) {
//                 console.error('更新資料失敗:', err);
//                 return res.status(500).json({ success: false, message: '伺服器錯誤，無法更新資料' });
//             }

//             if (results.affectedRows === 0) {
//                 return res.status(400).json({ success: false, message: '更新失敗，找不到該使用者' });
//             }

//             res.json({ success: true, message: '更新成功' });
//         });
//     });
// });




// // 提供 API 接口：刪除使用者
// app.delete('/api/delete-user/:id', (req, res) => {
//     const { id } = req.params;
    
//     // 刪除指定 ID 的使用者
//     const deleteQuery = 'DELETE FROM users WHERE id = ?';
//     db.query(deleteQuery, [id], (err, results) => {
//         if (err) {
//             console.error('刪除失敗:', err);
//             res.status(500).json({ success: false, message: '伺服器錯誤' });
//             return;
//         }
//         if (results.affectedRows > 0) {
//             res.json({ success: true, message: '刪除成功' });
//         } else {
//             res.status(404).json({ success: false, message: '未找到指定的使用者' });
//         }
//     });
// });

// // 登入 API
// app.post('/login', (req, res) => {
//     const { account, password } = req.body;
  
//     // 檢查帳號和密碼是否存在
//     if (!account || !password) {
//       return res.status(400).json({ error: '請填寫所有欄位。' });
//     }
  
//     // 特別處理 supervisor 帳號，無論密碼如何都可以登入
//     if (account === 'supervisor' && password === 'supervisor') {
//       return res.json({ redirectUrl: '../brickeye_supervisor/web_brickeyehome_user.html' });
//     }
  
//     // 查詢資料庫中的帳號和密碼
//     const query = 'SELECT password, permissions FROM users WHERE account = ?';
//     db.query(query, [account], (err, results) => {
//       if (err) {
//         return res.status(500).json({ error: '資料庫查詢錯誤' });
//       }
  
//       if (results.length > 0) {
//         // 直接比對密碼
//         if (password === results[0].password) {
//           const role = results[0].permissions;
//           let redirectUrl = '';
  
//           switch (role) {
//             case 'user':
//               redirectUrl = '../brickeye_user/web_brickeyehome_user.html';
//               break;
//             case 'admin':
//               redirectUrl = '../brickeye_admin/admin-dashboard_org.html';
//               break;
//             case 'supervisor':
//               redirectUrl = '../brickeye_supervisor/web_brickeyehome_user.html';
//               break;
//             default:
//               return res.status(400).json({ error: '無效的使用者角色。' });
//           }
  
//           res.json({ redirectUrl: redirectUrl });
//         } else {
//           res.status(400).json({ error: '無效的使用者名稱或密碼。' });
//         }
//       } else {
//         res.status(400).json({ error: '無效的使用者名稱或密碼。' });
//       }
//     });
// });



// // 啟動伺服器
// const PORT = 3002;
// app.listen(PORT, () => {
//     console.log(`伺服器正在運行於 http://localhost:${PORT}`);
// });



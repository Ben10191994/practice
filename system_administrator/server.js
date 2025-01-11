

const token = localStorage.getItem('token'); // 從 localStorage 獲取 token

// 進入頁面時自動加載使用者資料
document.addEventListener('DOMContentLoaded', async () => {
    await loadUsers();  // 頁面加載後自動載入資料
});

// // 載入使用者資料並顯示在表格中
// 載入使用者資料並顯示在表格中
async function loadUsers() {
    try {
        const response = await fetch('http://localhost:3002/api/users', {
            method: 'GET',
            headers: {
                'Authorization': token
            }
        });

        const data = await response.json();
        if (data.success) {
            const users = data.data; // 伺服器返回的使用者資料
            let tableContent = ''; // 初始空內容

            // 生成每一行的資料
            users.forEach(user => {
                tableContent += `
                    <tr>
                        <td>${user.id}</td>
                        <td><input type="text" value="${user.account}" data-id="${user.id}" class="userAccount"></td>
                        <td><input type="text" value="${user.password}" data-id="${user.id}" class="userPassword"></td>
                        <td><input type="text" value="${user.permissions}" data-id="${user.id}" class="userPermissions"></td>
                        <td><button class="saveBtn" data-id="${user.id}">保存</button></td>
                        <td><button class="deleteBtn" data-id="${user.id}">刪除</button></td>
                    </tr>`; 
            });

            // 更新表格內容
            document.querySelector('#userTable tbody').innerHTML = tableContent;

            // 綁定保存按鈕事件
            document.querySelectorAll('.saveBtn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const id = event.target.getAttribute('data-id');
                    const account = document.querySelector(`.userAccount[data-id="${id}"]`).value;
                    const password = document.querySelector(`.userPassword[data-id="${id}"]`).value;
                    const permissions = document.querySelector(`.userPermissions[data-id="${id}"]`).value;

                    const response = await fetch('http://localhost:3002/api/update-user', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': token
                        },
                        body: JSON.stringify({ id, account, password, permissions })
                    });

                    const result = await response.json();
                    if (result.success) {
                        alert('使用者資訊已更新');
                        await loadUsers();  // 更新完資料後重新載入表格
                    } else {
                        alert('更新失敗，無效的權限，請輸入supervisor, admin或user');
                    }
                });
            });

            // 綁定刪除按鈕事件
            document.querySelectorAll('.deleteBtn').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const id = event.target.getAttribute('data-id');

                    const response = await fetch(`http://localhost:3002/api/delete-user/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': token
                        }
                    });

                    const result = await response.json();
                    if (result.success) {
                        alert('使用者已刪除');
                        await loadUsers();  // 刪除後重新載入表格
                    } else {
                        alert('刪除失敗');
                    }
                });
            });

        } else {
            alert('無法加載使用者資料');
        }
    } catch (error) {
        console.error('載入使用者資料失敗', error);
    }
}

// 新增使用者
document.getElementById('addUserForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // 防止表單默認提交

    const account = document.getElementById('account').value;
    const password = document.getElementById('password').value;
    const permissions = document.getElementById('permissions').value;

    // 檢查欄位是否為空
    if (!account || !password || !permissions) {
        alert('請填寫所有欄位！');
        return; // 停止執行後續的提交
    }

    // 檢查權限是否為有效值
    const validPermissions = ['supervisor', 'admin', 'user'];
    if (!validPermissions.includes(permissions.toLowerCase())) {
        alert('無效的權限，請輸入supervisor, admin或user');
        return; // 停止執行後續的提交
    }

    // 獲取當前電腦本地時間
    const currentTime = new Date();
    const localTime = currentTime.getFullYear() + '-' +
                     (currentTime.getMonth() + 1).toString().padStart(2, '0') + '-' +
                     currentTime.getDate().toString().padStart(2, '0') + ' ' +
                     currentTime.getHours().toString().padStart(2, '0') + ':' +
                     currentTime.getMinutes().toString().padStart(2, '0') + ':' +
                     currentTime.getSeconds().toString().padStart(2, '0');

    try {
        const response = await fetch('http://localhost:3002/api/add-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token // 如果需要，這裡傳送 token 以進行身份驗證
            },
            body: JSON.stringify({ account, password, permissions, creating_time: localTime })  // 傳送當前時間
        });

        const result = await response.json();
        if (result.success) {
            alert('使用者新增成功');
            await loadUsers();  // 新增使用者成功後重新載入表格
        } else {
            alert('新增使用者失敗: ' + result.message);
        }
    } catch (error) {
        console.error('新增使用者失敗', error);
        alert('新增使用者時出現錯誤');
    }
});

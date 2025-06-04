// הגדרות
const GITHUB_OWNER = 'Shlomo116'; // החלף את זה עם שם המשתמש שלך ב-GitHub
const GITHUB_REPO = 'YOUR_REPO_NAME'; // החלף את זה עם שם ה-repository שלך
const USERS_FILE_PATH = 'data/users.json';

// משתנים גלובליים
let githubToken = localStorage.getItem('githubToken');
let addUserModal;

// אתחול
document.addEventListener('DOMContentLoaded', () => {
    addUserModal = new bootstrap.Modal(document.getElementById('addUserModal'));
    
    // בדיקת התחברות
    if (githubToken) {
        showMainPage();
        fetchUsers();
    }

    // טיפול בטופס התחברות
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // כאן תוכל להגדיר את שם המשתמש והסיסמא הרצויים
        if (username === 'admin' && password === 'your-password') {
            try {
                const response = await fetch('https://api.github.com/user', {
                    headers: {
                        'Authorization': `token ${githubToken}`
                    }
                });

                if (response.ok) {
                    showMainPage();
                    fetchUsers();
                } else {
                    alert('שגיאה בהתחברות. אנא בדוק את פרטי ההתחברות שלך.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('שגיאה בהתחברות. אנא נסה שוב.');
            }
        } else {
            alert('שם משתמש או סיסמא שגויים');
        }
    });

    loadUsers();
});

// פונקציות עזר
function showMainPage() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainPage').style.display = 'block';
}

function showLoginPage() {
    document.getElementById('loginPage').style.display = 'block';
    document.getElementById('mainPage').style.display = 'none';
}

function logout() {
    githubToken = null;
    localStorage.removeItem('githubToken');
    showLoginPage();
}

function showAddUserModal() {
    document.getElementById('modalTitle').textContent = 'הוספת משתמש חדש';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    const modal = new bootstrap.Modal(document.getElementById('userModal'));
    modal.show();
}

// פונקציות עבודה עם GitHub
async function fetchUsers() {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${USERS_FILE_PATH}`,
            {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (response.ok) {
            const data = await response.json();
            const content = atob(data.content);
            const users = JSON.parse(content);
            displayUsers(users);
        } else {
            console.error('Error fetching users:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function saveUser() {
    const userId = document.getElementById('userId').value;
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const phone = document.getElementById('userPhone').value;

    if (!name || !email || !phone) {
        alert('אנא מלא את כל השדות');
        return;
    }

    try {
        // קבלת תוכן הקובץ הנוכחי
        const getResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${USERS_FILE_PATH}`,
            {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (!getResponse.ok) {
            throw new Error('Failed to fetch current content');
        }

        const getData = await getResponse.json();
        const currentContent = atob(getData.content);
        const users = JSON.parse(currentContent);

        if (userId) {
            // עדכון משתמש קיים
            const index = users.findIndex(u => u.id === parseInt(userId));
            if (index !== -1) {
                users[index] = { ...users[index], name, email, phone };
            }
        } else {
            // הוספת משתמש חדש
            const newUser = {
                id: Date.now(),
                name,
                email,
                phone,
                createdAt: new Date().toISOString()
            };
            users.push(newUser);
        }

        // עדכון הקובץ ב-GitHub
        const updateResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${USERS_FILE_PATH}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userId ? 'Update user' : 'Add new user',
                    content: btoa(JSON.stringify(users, null, 2)),
                    sha: getData.sha
                })
            }
        );

        if (updateResponse.ok) {
            bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
            fetchUsers();
        } else {
            throw new Error('Failed to update content');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('שגיאה בשמירת המשתמש. אנא נסה שוב.');
    }
}

async function deleteUser(userId) {
    try {
        // קבלת תוכן הקובץ הנוכחי
        const getResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${USERS_FILE_PATH}`,
            {
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        if (!getResponse.ok) {
            throw new Error('Failed to fetch current content');
        }

        const getData = await getResponse.json();
        const currentContent = atob(getData.content);
        const users = JSON.parse(currentContent);

        // מחיקת המשתמש
        const updatedUsers = users.filter(user => user.id !== userId);

        // עדכון הקובץ ב-GitHub
        const updateResponse = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${USERS_FILE_PATH}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${githubToken}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: 'Delete user',
                    content: btoa(JSON.stringify(updatedUsers, null, 2)),
                    sha: getData.sha
                })
            }
        );

        if (updateResponse.ok) {
            bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
            fetchUsers();
        } else {
            throw new Error('Failed to update content');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('שגיאה במחיקת המשתמש. אנא נסה שוב.');
    }
}

function displayUsers(users) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary" onclick="editUser(${user.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load users from localStorage
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = '';

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary" onclick="editUser(${user.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Show modal for editing user
function editUser(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    
    if (user) {
        document.getElementById('modalTitle').textContent = 'עריכת משתמש';
        document.getElementById('userId').value = user.id;
        document.getElementById('userName').value = user.name;
        document.getElementById('userEmail').value = user.email;
        document.getElementById('userPhone').value = user.phone;
        
        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        modal.show();
    }
} 
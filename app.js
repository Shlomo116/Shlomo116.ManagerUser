// משתנים גלובליים
let isLoggedIn = false;

// אתחול
document.addEventListener('DOMContentLoaded', async () => {
    // בדיקת טוקן GitHub
    const githubToken = localStorage.getItem('githubToken');
    if (!githubToken) {
        const token = prompt('אנא הזן את טוקן ה-GitHub שלך:');
        if (token) {
            localStorage.setItem('githubToken', token);
            // יצירת Gists חדשים
            await Promise.all([
                adminManager.createGist(),
                usersManager.createGist()
            ]);
        } else {
            alert('לא ניתן להמשיך ללא טוקן GitHub');
            return;
        }
    }

    // בדיקת התחברות
    if (localStorage.getItem('isLoggedIn') === 'true') {
        showMainPage();
        await loadUsers();
    }

    // טיפול בטופס התחברות
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const adminConfig = await adminManager.loadConfig();
            if (username === adminConfig.username && password === adminConfig.password) {
                isLoggedIn = true;
                localStorage.setItem('isLoggedIn', 'true');
                showMainPage();
                await loadUsers();
            } else {
                alert('שם משתמש או סיסמא שגויים');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('שגיאה בהתחברות. אנא נסה שוב.');
        }
    });
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
    isLoggedIn = false;
    localStorage.removeItem('isLoggedIn');
    showLoginPage();
}

function showAddUserModal() {
    document.getElementById('modalTitle').textContent = 'הוספת משתמש חדש';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    const modal = new bootstrap.Modal(document.getElementById('userModal'));
    modal.show();
}

async function loadUsers() {
    await usersManager.loadUsers();
    displayUsers(usersManager.getAllUsers());
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

    if (userId) {
        // עדכון משתמש קיים
        await usersManager.updateUser(parseInt(userId), { name, email, phone });
    } else {
        // הוספת משתמש חדש
        const newUser = {
            id: Date.now(),
            name,
            email,
            phone,
            createdAt: new Date().toISOString()
        };
        await usersManager.addUser(newUser);
    }

    bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
    await loadUsers();
}

async function deleteUser(userId) {
    if (confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) {
        await usersManager.deleteUser(userId);
        await loadUsers();
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

async function editUser(userId) {
    const users = usersManager.getAllUsers();
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
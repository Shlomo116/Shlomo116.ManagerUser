// משתנים גלובליים
let isLoggedIn = false;

// אתחול
document.addEventListener('DOMContentLoaded', () => {
    // בדיקת התחברות
    if (localStorage.getItem('isLoggedIn') === 'true') {
        showMainPage();
        loadUsers();
    }

    // טיפול בטופס התחברות
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (username === ADMIN_CONFIG.username && password === ADMIN_CONFIG.password) {
            isLoggedIn = true;
            localStorage.setItem('isLoggedIn', 'true');
            showMainPage();
            loadUsers();
        } else {
            alert('שם משתמש או סיסמא שגויים');
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

function loadUsers() {
    const users = usersManager.getAllUsers();
    displayUsers(users);
}

function saveUser() {
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
        usersManager.updateUser(parseInt(userId), { name, email, phone });
    } else {
        // הוספת משתמש חדש
        const newUser = {
            id: Date.now(),
            name,
            email,
            phone,
            createdAt: new Date().toISOString()
        };
        usersManager.addUser(newUser);
    }

    bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
    loadUsers();
}

function deleteUser(userId) {
    if (confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) {
        usersManager.deleteUser(userId);
        loadUsers();
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

function editUser(userId) {
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
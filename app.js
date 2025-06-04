// הגדרות
const GITHUB_OWNER = 'YOUR_GITHUB_USERNAME'; // החלף את זה עם שם המשתמש שלך ב-GitHub
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
        const token = document.getElementById('githubToken').value;
        
        try {
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    'Authorization': `token ${token}`
                }
            });

            if (response.ok) {
                githubToken = token;
                localStorage.setItem('githubToken', token);
                showMainPage();
                fetchUsers();
            } else {
                alert('שגיאה בהתחברות. אנא בדוק את ה-Token שלך.');
            }
        } catch (error) {
            console.error('Error:', error);
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
    githubToken = null;
    localStorage.removeItem('githubToken');
    showLoginPage();
}

function showAddUserModal() {
    document.getElementById('addUserForm').reset();
    addUserModal.show();
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

async function addUser() {
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

        // הוספת משתמש חדש
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            phone,
            createdAt: new Date().toISOString()
        };
        users.push(newUser);

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
                    message: 'Add new user',
                    content: btoa(JSON.stringify(users, null, 2)),
                    sha: getData.sha
                })
            }
        );

        if (updateResponse.ok) {
            addUserModal.hide();
            fetchUsers();
        } else {
            throw new Error('Failed to update content');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('שגיאה בהוספת המשתמש. אנא נסה שוב.');
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
            <td>${new Date(user.createdAt).toLocaleDateString('he-IL')}</td>
        `;
        tbody.appendChild(row);
    });
} 
// מערך המשתמשים במערכת
let users = [];

// פונקציות לניהול המשתמשים
const usersManager = {
    // קבלת כל המשתמשים
    getAllUsers: () => {
        return users;
    },

    // הוספת משתמש חדש
    addUser: (user) => {
        users.push(user);
        return user;
    },

    // עדכון משתמש קיים
    updateUser: (userId, updatedData) => {
        const index = users.findIndex(user => user.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...updatedData };
            return users[index];
        }
        return null;
    },

    // מחיקת משתמש
    deleteUser: (userId) => {
        users = users.filter(user => user.id !== userId);
    }
}; 
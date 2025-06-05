// GitHub API configuration
const GITHUB_REPO = 'Shlomo116/Shlomo116.ManagerUser';
const GITHUB_PATH = 'movies.json';

// Sample movies data - will be migrated to GitHub
const defaultMovies = [
    {
        id: 1,
        title: 'סרט לדוגמה 1',
        category: 'comedy',
        videoId: 'ZQmGPEh4yaU'
    },
    {
        id: 2,
        title: 'סרט לדוגמה 2',
        category: 'drama',
        videoId: 'FU2gJooc41E'
    }
];

// Initialize movies array
let movies = [];

// Categories data structure
let categories = [
    'קומדיה',
    'דרמה',
    'אקשן',
    'דוקומנטרי',
    'חדשות'
];

// Load movies from GitHub (public access)
async function loadMoviesFromGitHub() {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const content = decodeURIComponent(escape(atob(data.content)));
            return JSON.parse(content);
        } else if (response.status === 404) {
            // If file doesn't exist, return default movies
            console.log('Movies file not found, using default movies...');
            return defaultMovies;
        } else {
            console.error('Failed to load movies from GitHub');
            return defaultMovies;
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        return defaultMovies;
    }
}

// Load movies from GitHub with token (admin access)
async function loadMoviesFromGitHubWithToken(token) {
    if (!token) {
        console.error('לא הוזן טוקן');
        return null;
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const content = decodeURIComponent(escape(atob(data.content)));
            return JSON.parse(content);
        } else if (response.status === 404) {
            // If file doesn't exist, create it with default movies
            console.log('Creating new movies.json file with default movies...');
            const success = await saveMoviesToGitHub(defaultMovies, token);
            return success ? defaultMovies : null;
        } else {
            const errorData = await response.json();
            console.error('GitHub API Error:', errorData);
            alert(`שגיאה בטעינת רשימת הסרטים: ${errorData.message}`);
            return null;
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        alert('שגיאה בטעינת רשימת הסרטים');
        return null;
    }
}

// Save movies to GitHub (admin only)
async function saveMoviesToGitHub(movies, token) {
    if (!token) {
        console.error('לא הוזן טוקן');
        return false;
    }

    try {
        // Convert Hebrew characters to UTF-8 before encoding
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(movies, null, 2))));
        
        // Get current SHA if file exists
        let sha = null;
        try {
            const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                sha = data.sha;
            }
        } catch (error) {
            console.log('File does not exist, will create new file');
        }

        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update movies list',
                content: content,
                sha: sha
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('GitHub API Error:', errorData);
            alert(`שגיאה בשמירת רשימת הסרטים: ${errorData.message}`);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error saving movies:', error);
        alert('שגיאה בשמירת רשימת הסרטים');
        return false;
    }
}

// Load categories from GitHub (public access)
async function loadCategoriesFromGitHub() {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/categories.json`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const content = decodeURIComponent(escape(atob(data.content)));
            const loaded = JSON.parse(content);
            // Always return as array
            return Array.isArray(loaded) ? loaded : Object.values(loaded);
        } else if (response.status === 404) {
            // If file doesn't exist, return default categories
            console.log('Categories file not found, using default categories...');
            return categories;
        } else {
            console.error('Failed to load categories from GitHub');
            return categories;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        return categories;
    }
}

// Load categories from GitHub with token (admin access)
async function loadCategoriesFromGitHubWithToken(token) {
    if (!token) {
        console.error('לא הוזן טוקן');
        return null;
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/categories.json`, {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const content = decodeURIComponent(escape(atob(data.content)));
            return JSON.parse(content);
        } else if (response.status === 404) {
            // If file doesn't exist, create it with default categories
            console.log('Creating new categories.json file with default categories...');
            const success = await saveCategoriesToGitHub(categories, token);
            return success ? categories : null;
        } else {
            const errorData = await response.json();
            console.error('GitHub API Error:', errorData);
            alert(`שגיאה בטעינת רשימת הקטגוריות: ${errorData.message}`);
            return null;
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        alert('שגיאה בטעינת רשימת הקטגוריות');
        return null;
    }
}

// Save categories to GitHub (array only)
async function saveCategoriesToGitHub(categoriesArr, token) {
    if (!token) {
        console.error('לא הוזן טוקן');
        return false;
    }

    try {
        const content = btoa(unescape(encodeURIComponent(JSON.stringify(categoriesArr, null, 2))));
        // Get current SHA if file exists
        let sha = null;
        try {
            const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/categories.json`, {
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                sha = data.sha;
            }
        } catch (error) {
            console.log('File does not exist, will create new file');
        }

        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/categories.json`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update categories list',
                content: content,
                sha: sha
            })
        });

        if (!response.ok) {
            let errorMessage;
            try {
                const errorData = await response.json();
                console.error('GitHub API Error:', errorData);
                errorMessage = errorData.message;
            } catch (e) {
                const errorText = await response.text();
                console.error('GitHub API Error (raw):', errorText);
                errorMessage = errorText;
            }
            alert(`שגיאה בשמירת רשימת הקטגוריות: ${errorMessage}`);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error saving categories:', error);
        alert('שגיאה בשמירת רשימת הקטגוריות');
        return false;
    }
}

// Admin password verification
const ADMIN_PASSWORD = 'admin123';

function verifyAdminPassword(password) {
    return password === ADMIN_PASSWORD;
}

// DOM Elements
const moviesGrid = document.getElementById('moviesGrid');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const categorySelect = document.getElementById('categoryFilter');
const uploadModal = document.getElementById('uploadModal');
const uploadForm = document.getElementById('uploadForm');
const closeModal = document.querySelectorAll('.close');
const uploadButton = document.getElementById('uploadButton');

// Extract YouTube video ID from URL
function extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Simple SHA-256 hash function
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Display movies
function displayMovies(moviesToShow = movies) {
    const moviesGrid = document.querySelector('.movies-grid');
    if (!moviesGrid) return;
    moviesGrid.innerHTML = moviesToShow.map(movie => {
        const videoId = movie.videoId || extractVideoId(movie.url);
        return `
            <div class="movie-card" data-id="${movie.id}">
                <img class="movie-thumbnail" src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="${movie.title}">
                <div class="movie-info">
                    <div class="movie-title">${movie.title}</div>
                    <div class="movie-category">${movie.category}</div>
                </div>
            </div>
        `;
    }).join('');

    // Add click event to movie cards
    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const videoId = card.querySelector('img').src.split('/vi/')[1].split('/')[0];
            window.location.href = `player.html?v=${videoId}`;
        });
    });
}

// Get category name (now just returns the value itself)
function getCategoryName(category) {
    return category;
}

// Filter movies
function filterMovies() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    if (!searchInput || !categoryFilter) return;

    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    
    const filteredMovies = movies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || movie.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    displayMovies(filteredMovies);
}

// Play movie
function playMovie(movie) {
    window.location.href = `player.html?v=${movie.videoId}`;
}

// Get video title from YouTube
async function getVideoTitle(videoId) {
    try {
        const response = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        const data = await response.json();
        if (data.title) {
            return data.title;
        }
        return null;
    } catch (error) {
        console.error('Error fetching video title:', error);
        return null;
    }
}

// Token management
function getToken() {
    let token = localStorage.getItem('githubToken');
    if (!token) {
        token = prompt('הזן את טוקן הגיט האב שלך:');
        if (token) {
            localStorage.setItem('githubToken', token);
        }
    }
    return token;
}

function clearToken() {
    localStorage.removeItem('githubToken');
    alert('הטוקן נמחק מהמחשב');
}

// Update handleUpload function
async function handleUpload(event) {
    event.preventDefault();
    
    const password = document.getElementById('adminPassword').value;
    if (!verifyAdminPassword(password)) {
        alert('סיסמה שגויה');
        return;
    }

    const url = document.getElementById('movieUrl').value;
    const videoId = extractVideoId(url);
    if (!videoId) {
        alert('כתובת יוטיוב לא תקינה');
        return;
    }

    const title = document.getElementById('movieTitle').value;
    if (!title) {
        alert('לא נמצאה כותרת לסרטון');
        return;
    }

    const category = document.getElementById('movieCategory').value;
    
    const token = getToken();
    if (!token) {
        alert('לא הוזן טוקן');
        return;
    }

    try {
        // First, load current movies from GitHub
        const currentMovies = await loadMoviesFromGitHubWithToken(token);
        if (!currentMovies) {
            alert('שגיאה בטעינת רשימת הסרטים');
            return;
        }

        const newMovie = {
            id: Date.now().toString(),
            title,
            category,
            videoId
        };
        
        const updatedMovies = [...currentMovies, newMovie];
        const success = await saveMoviesToGitHub(updatedMovies, token);
        
        if (success) {
            movies = updatedMovies;
            displayMovies(updatedMovies);
            document.getElementById('uploadModal').style.display = 'none';
            document.getElementById('uploadForm').reset();
            alert('הסרט נוסף בהצלחה');
        } else {
            alert('שגיאה בשמירת הסרט בגיט האב');
        }
    } catch (error) {
        console.error('Error uploading movie:', error);
        alert('שגיאה בהעלאת הסרט');
    }
}

// Show movie selection modal
function showMovieSelectionModal(action) {
    // Create modal container
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.style.zIndex = '1000';

    // Create modal content
    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.maxHeight = '80vh';
    content.style.overflowY = 'auto';

    // Add close button
    const closeButton = document.createElement('span');
    closeButton.className = 'close';
    closeButton.innerHTML = '&times;';
    closeButton.style.position = 'absolute';
    closeButton.style.right = '10px';
    closeButton.style.top = '10px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '24px';

    // Add title
    const title = document.createElement('h2');
    title.textContent = `בחר סרט ל${action === 'edit' ? 'עריכה' : 'מחיקה'}`;

    // Create movie list container
    const movieList = document.createElement('div');
    movieList.className = 'movie-selection-list';
    movieList.style.marginTop = '20px';

    // Add movies to the list
    movies.forEach(movie => {
        const movieItem = document.createElement('div');
        movieItem.className = 'movie-selection-item';
        movieItem.style.display = 'flex';
        movieItem.style.alignItems = 'center';
        movieItem.style.padding = '10px';
        movieItem.style.border = '1px solid #ddd';
        movieItem.style.marginBottom = '10px';
        movieItem.style.cursor = 'pointer';
        movieItem.style.borderRadius = '4px';
        movieItem.dataset.id = movie.id;

        const img = document.createElement('img');
        img.src = `https://img.youtube.com/vi/${movie.videoId}/hqdefault.jpg`;
        img.alt = movie.title;
        img.style.width = '120px';
        img.style.height = '68px';
        img.style.objectFit = 'cover';
        img.style.marginLeft = '10px';
        img.style.borderRadius = '4px';

        const info = document.createElement('div');
        info.className = 'movie-selection-info';
        info.style.flex = '1';

        const movieTitle = document.createElement('h3');
        movieTitle.textContent = movie.title;
        movieTitle.style.margin = '0';
        movieTitle.style.fontSize = '16px';

        const movieCategory = document.createElement('p');
        movieCategory.textContent = getCategoryName(movie.category);
        movieCategory.style.margin = '5px 0 0';
        movieCategory.style.color = '#666';
        movieCategory.style.fontSize = '14px';

        info.appendChild(movieTitle);
        info.appendChild(movieCategory);
        movieItem.appendChild(img);
        movieItem.appendChild(info);
        movieList.appendChild(movieItem);

        // Add click event
        movieItem.addEventListener('click', () => {
            document.body.removeChild(modal);
            
            if (action === 'edit') {
                const editModal = document.getElementById('editModal');
                document.getElementById('editMovieId').value = movie.id;
                document.getElementById('editMovieTitle').value = movie.title;
                document.getElementById('editMovieCategory').value = movie.category;
                document.getElementById('editMovieUrl').value = `https://www.youtube.com/watch?v=${movie.videoId}`;
                editModal.style.display = 'block';
            } else if (action === 'delete') {
                const deleteModal = document.getElementById('deleteModal');
                document.getElementById('deleteMovieId').value = movie.id;
                deleteModal.style.display = 'block';
            }
        });
    });

    // Add close button event
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // Assemble modal
    content.appendChild(closeButton);
    content.appendChild(title);
    content.appendChild(movieList);
    modal.appendChild(content);
    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// Update handleDelete function
async function handleDelete(event) {
    event.preventDefault();
    
    const password = document.getElementById('deleteAdminPassword').value;
    if (!verifyAdminPassword(password)) {
        alert('סיסמה שגויה');
        return;
    }

    const movieId = document.getElementById('deleteMovieId').value;
    if (!movieId) {
        alert('לא נבחר סרט למחיקה');
        return;
    }

    const token = getToken();
    if (!token) {
        alert('לא הוזן טוקן');
        return;
    }

    try {
        // First, load current movies from GitHub
        const currentMovies = await loadMoviesFromGitHubWithToken(token);
        if (!currentMovies) {
            alert('שגיאה בטעינת רשימת הסרטים');
            return;
        }

        const movieIndex = currentMovies.findIndex(m => m.id === movieId);
        if (movieIndex === -1) {
            alert('סרט לא נמצא');
            return;
        }

        const updatedMovies = currentMovies.filter(m => m.id !== movieId);
        const success = await saveMoviesToGitHub(updatedMovies, token);
        
        if (success) {
            movies = updatedMovies;
            displayMovies(updatedMovies);
            document.getElementById('deleteModal').style.display = 'none';
            document.getElementById('deleteForm').reset();
            alert('הסרט נמחק בהצלחה');
        } else {
            alert('שגיאה במחיקת הסרט מגיט האב');
        }
    } catch (error) {
        console.error('Error deleting movie:', error);
        alert('שגיאה במחיקת הסרט');
    }
}

// Update handleEdit function
async function handleEdit(event) {
    event.preventDefault();
    
    const password = document.getElementById('editAdminPassword').value;
    if (!verifyAdminPassword(password)) {
        alert('סיסמה שגויה');
        return;
    }

    const movieId = document.getElementById('editMovieId').value;
    if (!movieId) {
        alert('לא נבחר סרט לעריכה');
        return;
    }

    const title = document.getElementById('editMovieTitle').value;
    const category = document.getElementById('editMovieCategory').value;
    const url = document.getElementById('editMovieUrl').value;
    
    const videoId = extractVideoId(url);
    if (!videoId) {
        alert('כתובת יוטיוב לא תקינה');
        return;
    }

    const token = getToken();
    if (!token) {
        alert('לא הוזן טוקן');
        return;
    }

    try {
        // First, load current movies from GitHub
        const currentMovies = await loadMoviesFromGitHubWithToken(token);
        if (!currentMovies) {
            alert('שגיאה בטעינת רשימת הסרטים');
            return;
        }

        const movieIndex = currentMovies.findIndex(m => m.id === movieId);
        if (movieIndex === -1) {
            alert('סרט לא נמצא');
            return;
        }

        const updatedMovies = [...currentMovies];
        updatedMovies[movieIndex] = {
            ...updatedMovies[movieIndex],
            title,
            category,
            videoId
        };

        const success = await saveMoviesToGitHub(updatedMovies, token);
        
        if (success) {
            movies = updatedMovies;
            displayMovies(updatedMovies);
            document.getElementById('editModal').style.display = 'none';
            document.getElementById('editForm').reset();
            alert('הסרט עודכן בהצלחה');
        } else {
            alert('שגיאה בשמירת השינויים בגיט האב');
        }
    } catch (error) {
        console.error('Error editing movie:', error);
        alert('שגיאה בעריכת הסרט');
    }
}

// Add category (Hebrew only)
async function handleCategorySubmit(event) {
    event.preventDefault();
    
    const password = document.getElementById('categoryAdminPassword').value;
    if (!verifyAdminPassword(password)) {
        alert('סיסמה שגויה');
        return;
    }

    const categoryName = document.getElementById('categoryName').value.trim();
    if (!categoryName) {
        alert('יש למלא את שם הקטגוריה');
        return;
    }

    const token = getToken();
    if (!token) {
        alert('לא הוזן טוקן');
        return;
    }

    try {
        // First, load current categories from GitHub
        const currentCategories = await loadCategoriesFromGitHub();
        if (!currentCategories) {
            alert('שגיאה בטעינת רשימת הקטגוריות');
            return;
        }
        if (currentCategories.includes(categoryName)) {
            alert('הקטגוריה כבר קיימת');
            return;
        }
        const updatedCategories = [...currentCategories, categoryName];
        const success = await saveCategoriesToGitHub(updatedCategories, token);
        
        if (success) {
            categories = updatedCategories;
            updateCategoriesList();
            updateCategorySelects();
            document.getElementById('categoryForm').reset();
            alert('הקטגוריה נוספה בהצלחה');
        } else {
            alert('שגיאה בשמירת הקטגוריה בגיט האב');
        }
    } catch (error) {
        console.error('Error adding category:', error);
        alert('שגיאה בהוספת הקטגוריה');
    }
}

// Delete category (Hebrew only)
async function deleteCategory(categoryValue) {
    const password = prompt('הזן סיסמת מנהל:');
    if (!verifyAdminPassword(password)) {
        alert('סיסמה שגויה');
        return;
    }

    const token = getToken();
    if (!token) {
        alert('לא הוזן טוקן');
        return;
    }

    try {
        // First, load current categories from GitHub
        const currentCategories = await loadCategoriesFromGitHub();
        if (!currentCategories) {
            alert('שגיאה בטעינת רשימת הקטגוריות');
            return;
        }
        // Check if category is in use
        const movies = await loadMoviesFromGitHubWithToken(token);
        if (movies) {
            const categoryInUse = movies.some(movie => movie.category === categoryValue);
            if (categoryInUse) {
                alert('לא ניתן למחוק קטגוריה שנמצאת בשימוש');
                return;
            }
        }
        // Remove category
        const updatedCategories = currentCategories.filter(cat => cat !== categoryValue);
        const success = await saveCategoriesToGitHub(updatedCategories, token);
        
        if (success) {
            categories = updatedCategories;
            updateCategoriesList();
            updateCategorySelects();
            alert('הקטגוריה נמחקה בהצלחה');
        } else {
            alert('שגיאה במחיקת הקטגוריה מגיט האב');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('שגיאה במחיקת הקטגוריה');
    }
}

// Update categories list in the modal
function updateCategoriesList() {
    const categoriesListContent = document.getElementById('categoriesListContent');
    if (!categoriesListContent) return;

    categoriesListContent.innerHTML = categories.map((name, index) => `
        <div class="category-item" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid #ddd; margin-bottom: 10px; border-radius: 4px;">
            <div>
                <strong>${name}</strong>
            </div>
            <button onclick="deleteCategory('${name}')" class="delete-button" style="background-color: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                מחק
            </button>
        </div>
    `).join('');
}

// Update category selects in all forms
function updateCategorySelects() {
    const categorySelects = [
        document.getElementById('categoryFilter'),
        document.getElementById('movieCategory'),
        document.getElementById('editMovieCategory')
    ];

    categorySelects.forEach(select => {
        if (!select) return;

        // Keep the "all" option in the filter
        const isFilter = select.id === 'categoryFilter';
        select.innerHTML = isFilter ? '<option value="all">כל הקטגוריות</option>' : '';

        // Add all categories in Hebrew
        categories.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            select.appendChild(option);
        });
    });
}

// Initialize the page
async function initializePage() {
    try {
        // Load movies and categories
        const [loadedMovies, loadedCategories] = await Promise.all([
            loadMoviesFromGitHub(),
            loadCategoriesFromGitHub()
        ]);

        if (loadedMovies) {
            movies = loadedMovies;
            displayMovies(movies);
        }

        if (loadedCategories) {
            categories = loadedCategories;
            updateCategorySelects();
        }
    } catch (error) {
        console.error('Error initializing page:', error);
    }
}

// Call initializePage when the page loads
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializePage();
});

// Setup event listeners
function setupEventListeners() {
    // Admin button
    const adminButton = document.getElementById('adminButton');
    const adminModal = document.getElementById('adminModal');

    if (adminButton && adminModal) {
        adminButton.addEventListener('click', () => {
            adminModal.style.display = 'block';
        });
    }

    // Tool buttons
    const addMovieButton = document.getElementById('addMovieButton');
    const editMoviesButton = document.getElementById('editMoviesButton');
    const deleteMoviesButton = document.getElementById('deleteMoviesButton');

    if (addMovieButton) {
        addMovieButton.addEventListener('click', () => {
            adminModal.style.display = 'none';
            document.getElementById('uploadModal').style.display = 'block';
        });
    }

    if (editMoviesButton) {
        editMoviesButton.addEventListener('click', () => {
            adminModal.style.display = 'none';
            showMovieSelectionModal('edit');
        });
    }

    if (deleteMoviesButton) {
        deleteMoviesButton.addEventListener('click', () => {
            adminModal.style.display = 'none';
            showMovieSelectionModal('delete');
        });
    }

    // Close buttons for all modals
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    // Cancel buttons
    const cancelButtons = document.querySelectorAll('.cancel-button');
    cancelButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').style.display = 'none';
        });
    });

    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterMovies);
    }

    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterMovies);
    }

    // Form submissions
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUpload);
    }

    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEdit);
    }

    const deleteForm = document.getElementById('deleteForm');
    if (deleteForm) {
        deleteForm.addEventListener('submit', handleDelete);
    }

    // Category management
    const manageCategoriesButton = document.getElementById('manageCategoriesButton');
    const categoryModal = document.getElementById('categoryModal');
    const categoryForm = document.getElementById('categoryForm');

    if (manageCategoriesButton && categoryModal) {
        manageCategoriesButton.addEventListener('click', async () => {
            adminModal.style.display = 'none';
            categoryModal.style.display = 'block';
            updateCategoriesList();
        });
    }

    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategorySubmit);
    }

    // Add event listener for URL input in upload form
    const movieUrlInput = document.getElementById('movieUrl');
    if (movieUrlInput) {
        movieUrlInput.addEventListener('change', async function() {
            const url = this.value;
            const videoId = extractVideoId(url);
            const titleInput = document.getElementById('movieTitle');
            const titleLoading = document.getElementById('titleLoading');
            
            if (videoId) {
                titleLoading.style.display = 'block';
                titleInput.value = '';
                
                const title = await getVideoTitle(videoId);
                titleLoading.style.display = 'none';
                
                if (title) {
                    titleInput.value = title;
                } else {
                    alert('לא ניתן היה לקבל את כותרת הסרטון');
                }
            }
        });
    }

    // Add event listener for the 'שכח טוקן' button
    const clearTokenButton = document.getElementById('clearTokenButton');
    if (clearTokenButton) {
        clearTokenButton.addEventListener('click', clearToken);
    }
}

// --- Night Mode Toggle with localStorage ---
function applyNightModeFromStorage() {
    const night = localStorage.getItem('nightMode') === 'true';
    document.body.classList.toggle('night-mode', night);
    const nightBtn = document.getElementById('nightModeToggle');
    if (nightBtn) {
        nightBtn.innerHTML = night ? '☀️ מצב יום' : '🌙 מצב לילה';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Apply night mode from storage
    applyNightModeFromStorage();
    // Night mode toggle
    const nightBtn = document.getElementById('nightModeToggle');
    if (nightBtn) {
        nightBtn.addEventListener('click', function() {
            const isNight = !document.body.classList.contains('night-mode');
            document.body.classList.toggle('night-mode', isNight);
            localStorage.setItem('nightMode', isNight);
            nightBtn.innerHTML = isNight ? '☀️ מצב יום' : '🌙 מצב לילה';
        });
    }
}); 
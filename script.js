// GitHub API configuration
const GITHUB_TOKEN = 'ghp_2QYwQYwQYwQYwQYwQYwQYwQYwQYwQYwQYwQ';
const GITHUB_REPO = 'shlomodavid/kosher-movies';
const GITHUB_PATH = 'movies.json';

// Load movies from GitHub
async function loadMovies() {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            const content = atob(data.content);
            return JSON.parse(content);
        } else {
            console.error('Failed to load movies from GitHub');
            return [];
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        return [];
    }
}

// Save movies to GitHub
async function saveMovies(movies) {
    try {
        const content = btoa(JSON.stringify(movies, null, 2));
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update movies list',
                content: content,
                sha: await getFileSha()
            })
        });

        if (!response.ok) {
            throw new Error('Failed to save movies to GitHub');
        }
    } catch (error) {
        console.error('Error saving movies:', error);
        throw error;
    }
}

// Get file SHA for GitHub update
async function getFileSha() {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data.sha;
        }
        return null;
    } catch (error) {
        console.error('Error getting file SHA:', error);
        return null;
    }
}

// Admin password verification
const ADMIN_PASSWORD = 'admin123';

function verifyAdminPassword(password) {
    return password === ADMIN_PASSWORD;
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const movies = await loadMovies();
        displayMovies(movies);
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing page:', error);
    }
});

function setupEventListeners() {
    // Admin button
    const adminButton = document.getElementById('adminButton');
    const adminToolsModal = document.getElementById('adminToolsModal');
    const closeAdminTools = document.getElementById('closeAdminTools');

    if (adminButton && adminToolsModal && closeAdminTools) {
        adminButton.addEventListener('click', () => {
            adminToolsModal.style.display = 'block';
        });

        closeAdminTools.addEventListener('click', () => {
            adminToolsModal.style.display = 'none';
        });
    }

    // Tool buttons
    const addMovieBtn = document.getElementById('addMovieBtn');
    const editMovieBtn = document.getElementById('editMovieBtn');
    const deleteMovieBtn = document.getElementById('deleteMovieBtn');

    if (addMovieBtn) {
        addMovieBtn.addEventListener('click', () => {
            adminToolsModal.style.display = 'none';
            document.getElementById('uploadModal').style.display = 'block';
        });
    }

    if (editMovieBtn) {
        editMovieBtn.addEventListener('click', () => {
            adminToolsModal.style.display = 'none';
            document.getElementById('editModal').style.display = 'block';
        });
    }

    if (deleteMovieBtn) {
        deleteMovieBtn.addEventListener('click', () => {
            adminToolsModal.style.display = 'none';
            document.getElementById('deleteModal').style.display = 'block';
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
}

// Admin password hash - this is a simple hash for demonstration
// In a real application, you would use a proper backend with secure password storage
// The password is 'admin123' - you can change it by updating this hash
const ADMIN_PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

// Sample movies data - in a real application, this would come from a database
let movies = [
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
    },
    {
        "id": 3,
        "title": "מחשב",
        "category": "מחשבים",
        "videoId": "V4JTEaNDmH8"
    }
];

// DOM Elements
const moviesGrid = document.getElementById('moviesGrid');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const categorySelect = document.getElementById('categorySelect');
const uploadModal = document.getElementById('uploadModal');
const uploadForm = document.getElementById('uploadForm');
const closeModal = document.querySelectorAll('.close');
const uploadButton = document.getElementById('uploadButton');

// Extract YouTube video ID from URL
function getYouTubeId(url) {
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

    moviesGrid.innerHTML = moviesToShow.map(movie => `
        <div class="movie-card">
            <img src="https://img.youtube.com/vi/${movie.videoId}/maxresdefault.jpg" 
                 alt="${movie.title}" 
                 class="movie-thumbnail"
                 onerror="this.src='https://img.youtube.com/vi/${movie.videoId}/hqdefault.jpg'">
            <div class="movie-actions">
                <button class="movie-action-button" onclick="editMovie('${movie.videoId}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="movie-action-button" onclick="deleteMovie('${movie.videoId}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-category">${getCategoryName(movie.category)}</p>
            </div>
        </div>
    `).join('');

    // Add click event to movie cards
    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', (e) => {
            // Don't navigate if clicking on action buttons
            if (e.target.closest('.movie-actions')) {
                return;
            }
            const videoId = card.querySelector('img').src.split('/vi/')[1].split('/')[0];
            window.location.href = `player.html?v=${videoId}`;
        });
    });
}

// Get category name in Hebrew
function getCategoryName(category) {
    const categories = {
        'comedy': 'קומדיה',
        'drama': 'דרמה',
        'action': 'אקשן',
        'documentary': 'דוקומנטרי'
    };
    return categories[category] || category;
}

// Search functionality
function searchMovies() {
    const searchInput = document.getElementById('searchInput');
    const categorySelect = document.getElementById('categoryFilter');
    if (!searchInput || !categorySelect) return;

    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categorySelect.value;
    
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

// Upload functionality
async function handleUpload(event) {
    event.preventDefault();
    
    const password = document.getElementById('uploadPassword').value;
    if (!verifyAdminPassword(password)) {
        alert('סיסמה שגויה');
        return;
    }

    const title = document.getElementById('movieTitle').value;
    const category = document.getElementById('movieCategory').value;
    const url = document.getElementById('movieUrl').value;
    
    const videoId = extractVideoId(url);
    if (!videoId) {
        alert('כתובת יוטיוב לא תקינה');
        return;
    }

    try {
        const movies = await loadMovies();
        const newMovie = {
            id: Date.now().toString(),
            title,
            category,
            videoId,
            likes: 0,
            dislikes: 0
        };
        
        movies.push(newMovie);
        await saveMovies(movies);
        
        displayMovies(movies);
        document.getElementById('uploadModal').style.display = 'none';
        document.getElementById('uploadForm').reset();
    } catch (error) {
        console.error('Error uploading movie:', error);
        alert('שגיאה בהעלאת הסרט');
    }
}

async function handleEdit(event) {
    event.preventDefault();
    
    const password = document.getElementById('editPassword').value;
    if (!verifyAdminPassword(password)) {
        alert('סיסמה שגויה');
        return;
    }

    const movieId = document.getElementById('editMovieId').value;
    const title = document.getElementById('editMovieTitle').value;
    const category = document.getElementById('editMovieCategory').value;
    const url = document.getElementById('editMovieUrl').value;
    
    const videoId = extractVideoId(url);
    if (!videoId) {
        alert('כתובת יוטיוב לא תקינה');
        return;
    }

    try {
        const movies = await loadMovies();
        const movieIndex = movies.findIndex(m => m.id === movieId);
        
        if (movieIndex === -1) {
            alert('סרט לא נמצא');
            return;
        }

        movies[movieIndex] = {
            ...movies[movieIndex],
            title,
            category,
            videoId
        };

        await saveMovies(movies);
        displayMovies(movies);
        document.getElementById('editModal').style.display = 'none';
        document.getElementById('editForm').reset();
    } catch (error) {
        console.error('Error editing movie:', error);
        alert('שגיאה בעריכת הסרט');
    }
}

function editMovie(videoId) {
    const movie = movies.find(m => m.videoId === videoId);
    if (!movie) return;

    document.getElementById('editMovieId').value = videoId;
    document.getElementById('editMovieTitle').value = movie.title;
    document.getElementById('editMovieCategory').value = movie.category;
    document.getElementById('editModal').style.display = 'block';
}

function deleteMovie(videoId) {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הסרט?')) {
        return;
    }

    const password = prompt('הזן סיסמת מנהל:');
    if (password !== ADMIN_PASSWORD_HASH) {
        alert('סיסמה שגויה');
        return;
    }

    movies = movies.filter(m => m.videoId !== videoId);
    saveMovies();
    displayMovies();
}

function saveMovies() {
    localStorage.setItem('movies', JSON.stringify(movies));
}

// Update handleDelete function
async function handleDelete(event) {
    event.preventDefault();
    
    const password = document.getElementById('deletePassword').value;
    if (!verifyAdminPassword(password)) {
        alert('סיסמה שגויה');
        return;
    }

    const movieId = document.getElementById('deleteMovieId').value;

    try {
        const movies = await loadMovies();
        const updatedMovies = movies.filter(m => m.id !== movieId);
        
        if (updatedMovies.length === movies.length) {
            alert('סרט לא נמצא');
            return;
        }

        await saveMovies(updatedMovies);
        displayMovies(updatedMovies);
        document.getElementById('deleteModal').style.display = 'none';
        document.getElementById('deleteForm').reset();
    } catch (error) {
        console.error('Error deleting movie:', error);
        alert('שגיאה במחיקת הסרט');
    }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load movies from localStorage
    const savedMovies = localStorage.getItem('movies');
    if (savedMovies) {
        movies = JSON.parse(savedMovies);
    }

    // Setup event listeners
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const categorySelect = document.getElementById('categoryFilter');
    const uploadModal = document.getElementById('uploadModal');
    const editModal = document.getElementById('editModal');
    const uploadButton = document.getElementById('uploadButton');
    const closeButtons = document.querySelectorAll('.close');
    const uploadForm = document.getElementById('uploadForm');
    const editForm = document.getElementById('editForm');

    if (searchButton) {
        searchButton.addEventListener('click', searchMovies);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') searchMovies();
        });
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', searchMovies);
    }

    if (uploadButton) {
        uploadButton.addEventListener('click', () => {
            uploadModal.style.display = 'block';
        });
    }

    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            uploadModal.style.display = 'none';
            editModal.style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === uploadModal) {
            uploadModal.style.display = 'none';
        }
        if (e.target === editModal) {
            editModal.style.display = 'none';
        }
    });

    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUpload);
    }

    if (editForm) {
        editForm.addEventListener('submit', handleEdit);
    }

    // Initial display
    displayMovies();
}); 
// GitHub API configuration
const GITHUB_REPO = 'shlomodavid/kosher-movies';
const GITHUB_PATH = 'movies.json';

// Load movies from localStorage
function loadMoviesFromStorage() {
    const savedMovies = localStorage.getItem('movies');
    return savedMovies ? JSON.parse(savedMovies) : [];
}

// Save movies to localStorage
function saveMoviesToStorage(movies) {
    localStorage.setItem('movies', JSON.stringify(movies));
}

// Load movies from GitHub
async function loadMoviesFromGitHub(token) {
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
            const content = atob(data.content);
            return JSON.parse(content);
        } else {
            console.error('Failed to load movies from GitHub');
            return null;
        }
    } catch (error) {
        console.error('Error loading movies:', error);
        return null;
    }
}

// Save movies to GitHub
async function saveMoviesToGitHub(movies, token) {
    if (!token) {
        console.error('לא הוזן טוקן');
        return false;
    }

    try {
        const content = btoa(JSON.stringify(movies, null, 2));
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
                sha: await getFileSha(token)
            })
        });

        return response.ok;
    } catch (error) {
        console.error('Error saving movies:', error);
        return false;
    }
}

// Get file SHA for GitHub update
async function getFileSha(token) {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`, {
            headers: {
                'Authorization': `token ${token}`,
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

// Sample movies data
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
    }
];

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

    moviesGrid.innerHTML = moviesToShow.map(movie => `
        <div class="movie-card">
            <img src="https://img.youtube.com/vi/${movie.videoId}/maxresdefault.jpg" 
                 alt="${movie.title}" 
                 class="movie-thumbnail"
                 onerror="this.src='https://img.youtube.com/vi/${movie.videoId}/hqdefault.jpg'">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-category">${getCategoryName(movie.category)}</p>
            </div>
        </div>
    `).join('');

    // Add click event to movie cards
    document.querySelectorAll('.movie-card').forEach(card => {
        card.addEventListener('click', (e) => {
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

// Update handleUpload function
async function handleUpload(event) {
    event.preventDefault();
    
    const password = document.getElementById('adminPassword').value;
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

    const token = prompt('הזן את טוקן הגיט האב שלך:');
    if (!token) {
        alert('לא הוזן טוקן');
        return;
    }

    try {
        const newMovie = {
            id: Date.now().toString(),
            title,
            category,
            videoId,
            likes: 0,
            dislikes: 0
        };
        
        movies.push(newMovie);
        saveMoviesToStorage(movies);
        
        const success = await saveMoviesToGitHub(movies, token);
        if (success) {
            displayMovies(movies);
            document.getElementById('uploadModal').style.display = 'none';
            document.getElementById('uploadForm').reset();
        } else {
            alert('שגיאה בשמירת הסרט בגיט האב');
        }
    } catch (error) {
        console.error('Error uploading movie:', error);
        alert('שגיאה בהעלאת הסרט');
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
    const title = document.getElementById('editMovieTitle').value;
    const category = document.getElementById('editMovieCategory').value;
    const url = document.getElementById('editMovieUrl').value;
    
    const videoId = extractVideoId(url);
    if (!videoId) {
        alert('כתובת יוטיוב לא תקינה');
        return;
    }

    const token = prompt('הזן את טוקן הגיט האב שלך:');
    if (!token) {
        alert('לא הוזן טוקן');
        return;
    }

    try {
        const movies = loadMoviesFromStorage();
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

        saveMoviesToStorage(movies);
        const success = await saveMoviesToGitHub(movies, token);
        
        if (success) {
            displayMovies(movies);
            document.getElementById('editModal').style.display = 'none';
            document.getElementById('editForm').reset();
        } else {
            alert('שגיאה בשמירת השינויים בגיט האב');
        }
    } catch (error) {
        console.error('Error editing movie:', error);
        alert('שגיאה בעריכת הסרט');
    }
}

// Show movie selection modal
function showMovieSelectionModal(action) {
    const movies = loadMoviesFromStorage();
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.innerHTML = `
        <span class="close">&times;</span>
        <h2>בחר סרט ל${action === 'edit' ? 'עריכה' : 'מחיקה'}</h2>
        <div class="movie-selection-list">
            ${movies.map(movie => `
                <div class="movie-selection-item" data-id="${movie.id}">
                    <img src="https://img.youtube.com/vi/${movie.videoId}/hqdefault.jpg" alt="${movie.title}">
                    <div class="movie-selection-info">
                        <h3>${movie.title}</h3>
                        <p>${getCategoryName(movie.category)}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Add click event to close button
    const closeButton = content.querySelector('.close');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // Add click events to movie items
    content.querySelectorAll('.movie-selection-item').forEach(item => {
        item.addEventListener('click', () => {
            const movieId = item.dataset.id;
            document.body.removeChild(modal);
            
            if (action === 'edit') {
                const movie = movies.find(m => m.id === movieId);
                if (movie) {
                    document.getElementById('editMovieId').value = movie.id;
                    document.getElementById('editMovieTitle').value = movie.title;
                    document.getElementById('editMovieCategory').value = movie.category;
                    document.getElementById('editModal').style.display = 'block';
                }
            } else if (action === 'delete') {
                document.getElementById('deleteMovieId').value = movieId;
                document.getElementById('deleteModal').style.display = 'block';
            }
        });
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

    const token = prompt('הזן את טוקן הגיט האב שלך:');
    if (!token) {
        alert('לא הוזן טוקן');
        return;
    }

    try {
        const movies = loadMoviesFromStorage();
        const updatedMovies = movies.filter(m => m.id !== movieId);
        
        if (updatedMovies.length === movies.length) {
            alert('סרט לא נמצא');
            return;
        }

        saveMoviesToStorage(updatedMovies);
        const success = await saveMoviesToGitHub(updatedMovies, token);
        
        if (success) {
            displayMovies(updatedMovies);
            document.getElementById('deleteModal').style.display = 'none';
            document.getElementById('deleteForm').reset();
        } else {
            alert('שגיאה במחיקת הסרט מגיט האב');
        }
    } catch (error) {
        console.error('Error deleting movie:', error);
        alert('שגיאה במחיקת הסרט');
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Load movies from localStorage or use default
    const savedMovies = localStorage.getItem('movies');
    if (savedMovies) {
        movies = JSON.parse(savedMovies);
    }
    displayMovies(movies);
    setupEventListeners();
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
} 
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
    
    const password = document.getElementById('adminPassword').value;
    const title = document.getElementById('movieTitle').value;
    const category = document.getElementById('movieCategory').value;
    const videoUrl = document.getElementById('movieUrl').value;
    
    // Hash the password and compare with stored hash
    const passwordHash = await sha256(password);
    if (passwordHash !== ADMIN_PASSWORD_HASH) {
        alert('סיסמה שגויה');
        return;
    }
    
    // Extract YouTube video ID
    const videoId = getYouTubeId(videoUrl);
    if (!videoId) {
        alert('קישור לא חוקי. אנא הזן קישור YouTube תקין');
        return;
    }
    
    // Create new movie object
    const newMovie = {
        id: movies.length + 1,
        title,
        category,
        videoId
    };
    
    // Add to movies array
    movies.push(newMovie);
    saveMovies();
    displayMovies();
    
    // Reset form and close modal
    event.target.reset();
    document.getElementById('uploadModal').style.display = 'none';
    alert('הסרט הועלה בהצלחה!');
}

function handleEdit(e) {
    e.preventDefault();
    const password = document.getElementById('editAdminPassword').value;
    const title = document.getElementById('editMovieTitle').value;
    const category = document.getElementById('editMovieCategory').value;
    const videoId = document.getElementById('editMovieId').value;

    if (password !== ADMIN_PASSWORD_HASH) {
        alert('סיסמה שגויה');
        return;
    }

    const movieIndex = movies.findIndex(m => m.videoId === videoId);
    if (movieIndex === -1) {
        alert('הסרט לא נמצא');
        return;
    }

    movies[movieIndex] = {
        ...movies[movieIndex],
        title,
        category
    };

    saveMovies();
    displayMovies();

    // Reset form and close modal
    e.target.reset();
    document.getElementById('editModal').style.display = 'none';
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
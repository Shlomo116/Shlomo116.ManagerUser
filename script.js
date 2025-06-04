// Admin password hash - this is a simple hash for demonstration
// In a real application, you would use a proper backend with secure password storage
const ADMIN_PASSWORD_HASH = '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918';

// Sample movies data - in a real application, this would come from a database
let movies = [
    {
        id: 1,
        title: 'סרט לדוגמה 1',
        category: 'comedy',
        thumbnail: 'https://img.youtube.com/vi/ZQmGPEh4yaU/maxresdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=ZQmGPEh4yaU'
    },
    {
        id: 2,
        title: 'סרט לדוגמה 2',
        category: 'drama',
        thumbnail: 'https://img.youtube.com/vi/FU2gJooc41E/maxresdefault.jpg',
        videoUrl: 'https://www.youtube.com/watch?v=FU2gJooc41E'
    }
];

// DOM Elements
const moviesGrid = document.getElementById('moviesGrid');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const categorySelect = document.getElementById('categorySelect');
const uploadModal = document.getElementById('uploadModal');
const uploadForm = document.getElementById('uploadForm');
const closeModal = document.querySelector('.close');
const uploadButton = document.getElementById('uploadButton');

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
    moviesGrid.innerHTML = '';
    moviesToShow.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            <img src="${movie.thumbnail}" alt="${movie.title}" class="movie-thumbnail">
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <p class="movie-category">${getCategoryName(movie.category)}</p>
            </div>
        `;
        movieCard.addEventListener('click', () => playMovie(movie));
        moviesGrid.appendChild(movieCard);
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
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categorySelect.value;
    
    const filteredMovies = movies.filter(movie => {
        const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
        const matchesCategory = !selectedCategory || movie.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    displayMovies(filteredMovies);
}

// Play movie
function playMovie(movie) {
    window.open(movie.videoUrl, '_blank');
}

// Upload functionality
async function handleUpload(event) {
    event.preventDefault();
    
    const password = document.getElementById('adminPassword').value;
    const title = document.getElementById('movieTitle').value;
    const category = document.getElementById('movieCategory').value;
    const videoUrl = document.getElementById('movieUrl').value;
    const thumbnailUrl = document.getElementById('thumbnailUrl').value;
    
    // Hash the password and compare with stored hash
    const passwordHash = await sha256(password);
    if (passwordHash !== ADMIN_PASSWORD_HASH) {
        alert('סיסמה שגויה');
        return;
    }
    
    // In a real application, this would be saved to a database
    const newMovie = {
        id: movies.length + 1,
        title,
        category,
        thumbnail: thumbnailUrl,
        videoUrl: videoUrl
    };
    
    movies.push(newMovie);
    displayMovies();
    uploadModal.style.display = 'none';
    uploadForm.reset();
}

// Event Listeners
searchButton.addEventListener('click', searchMovies);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchMovies();
});
categorySelect.addEventListener('change', searchMovies);
uploadForm.addEventListener('submit', handleUpload);

// Modal functionality
uploadButton.addEventListener('click', () => {
    uploadModal.style.display = 'block';
});

document.addEventListener('click', (e) => {
    if (e.target === uploadModal) {
        uploadModal.style.display = 'none';
    }
});

closeModal.addEventListener('click', () => {
    uploadModal.style.display = 'none';
});

// Initial display
displayMovies(); 
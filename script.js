// Admin password - in a real application, this should be stored securely on the server
const ADMIN_PASSWORD = 'admin123';

// Sample movies data - in a real application, this would come from a database
let movies = [
    {
        id: 1,
        title: 'סרט לדוגמה 1',
        category: 'comedy',
        thumbnail: 'https://via.placeholder.com/300x150',
        videoUrl: 'path/to/video1.mp4'
    },
    {
        id: 2,
        title: 'סרט לדוגמה 2',
        category: 'drama',
        thumbnail: 'https://via.placeholder.com/300x150',
        videoUrl: 'path/to/video2.mp4'
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
    // In a real application, this would open a video player
    alert(`נגן סרט: ${movie.title}`);
}

// Upload functionality
function handleUpload(event) {
    event.preventDefault();
    
    const password = document.getElementById('adminPassword').value;
    const title = document.getElementById('movieTitle').value;
    const category = document.getElementById('movieCategory').value;
    const file = document.getElementById('movieFile').files[0];
    
    if (password !== ADMIN_PASSWORD) {
        alert('סיסמה שגויה');
        return;
    }
    
    // In a real application, this would upload the file to a server
    const newMovie = {
        id: movies.length + 1,
        title,
        category,
        thumbnail: 'https://via.placeholder.com/300x150',
        videoUrl: URL.createObjectURL(file)
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
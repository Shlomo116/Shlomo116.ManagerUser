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
    moviesGrid.innerHTML = '';
    moviesToShow.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.className = 'movie-card';
        movieCard.innerHTML = `
            <img src="https://img.youtube.com/vi/${movie.videoId}/maxresdefault.jpg" 
                 alt="${movie.title}" 
                 class="movie-thumbnail"
                 onerror="this.src='https://img.youtube.com/vi/${movie.videoId}/hqdefault.jpg'">
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
    
    // Create GitHub API request
    const token = prompt('אנא הזן את ה-GitHub Personal Access Token שלך:');
    if (!token) {
        alert('לא ניתן להעלות סרט ללא טוקן GitHub');
        return;
    }

    try {
        // Get current content
        const response = await fetch('https://api.github.com/repos/Shlomo116/Shlomo116.ManagerUser/contents/script.js', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        const data = await response.json();
        const content = atob(data.content);
        
        // Update movies array in content
        const updatedContent = content.replace(
            /let movies = \[([\s\S]*?)\];/,
            `let movies = ${JSON.stringify(movies, null, 4)};`
        );
        
        // Encode content to base64 safely
        const encodedContent = btoa(unescape(encodeURIComponent(updatedContent)));
        
        // Update file on GitHub
        await fetch('https://api.github.com/repos/Shlomo116/Shlomo116.ManagerUser/contents/script.js', {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: 'הוספת סרט חדש',
                content: encodedContent,
                sha: data.sha
            })
        });
        
        displayMovies();
        uploadModal.style.display = 'none';
        uploadForm.reset();
        alert('הסרט הועלה בהצלחה!');
    } catch (error) {
        console.error('Error:', error);
        alert('אירעה שגיאה בהעלאת הסרט. אנא נסה שוב.');
    }
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

closeModal.forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        uploadModal.style.display = 'none';
    });
});

document.addEventListener('click', (e) => {
    if (e.target === uploadModal) {
        uploadModal.style.display = 'none';
    }
});

// Initial display
displayMovies(); 
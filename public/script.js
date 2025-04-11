// Function to generate a random ID
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Function to save note using GitHub Gists
async function saveNote(noteId, content) {
    try {
        const response = await fetch('https://api.github.com/gists', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                public: true,
                files: {
                    'note.txt': {
                        content: content
                    }
                }
            })
        });
        
        if (!response.ok) {
            console.error('Server response:', await response.text());
            return false;
        }
        
        const data = await response.json();
        return data.id; // Return the Gist ID
    } catch (error) {
        console.error('Error saving note:', error);
        return false;
    }
}

// Function to get note from GitHub Gists
async function getNote(gistId) {
    try {
        const response = await fetch(`https://api.github.com/gists/${gistId}`);
        
        if (!response.ok) {
            console.error('Server response:', await response.text());
            return null;
        }
        
        const data = await response.json();
        return data.files['note.txt'].content;
    } catch (error) {
        console.error('Error getting note:', error);
        return null;
    }
}

// Utility function to format time remaining
function formatTimeRemaining(expiryTime) {
    if (!expiryTime) return "Invalid expiry time";
    
    try {
        const now = new Date().getTime();
        const expiry = new Date(expiryTime).getTime();
        
        if (isNaN(expiry)) {
            console.error("Invalid expiry time format:", expiryTime);
            return "Invalid expiry time";
        }
        
        const timeLeft = expiry - now;

        if (timeLeft <= 0) {
            return "Expired";
        }

        const minutes = Math.floor(timeLeft / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        return `${minutes}m ${seconds}s`;
    } catch (error) {
        console.error("Error formatting time:", error);
        return "Error calculating time";
    }
}

// Update expiry time display
function updateExpiryTime(expiryTime, elementId = 'expiryTime') {
    if (!expiryTime) return;
    
    const expiryElement = document.getElementById(elementId);
    if (!expiryElement) return;

    const updateTimer = () => {
        const timeRemaining = formatTimeRemaining(expiryTime);
        expiryElement.textContent = `Time remaining: ${timeRemaining}`;

        if (timeRemaining === "Expired") {
            clearInterval(timerInterval);
            document.getElementById('noteDisplay').textContent = "This note has expired.";
            document.getElementById('viewExpiryTime').textContent = "Note has expired";
        }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return timerInterval;
}

// Share note function
async function shareNote() {
    const noteContent = document.getElementById('noteInput').value.trim();
    if (!noteContent) {
        alert('Please enter a note to share');
        return;
    }

    try {
        const response = await fetch('/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: noteContent }),
        });

        if (!response.ok) {
            throw new Error('Failed to create note');
        }

        const data = await response.json();
        if (!data || !data.id) {
            throw new Error('Invalid server response');
        }

        const shareLink = `${window.location.origin}/note/${data.id}`;
        
        document.getElementById('shareLink').value = shareLink;
        document.getElementById('linkContainer').style.display = 'flex';
        
        if (data.expiryTime) {
            updateExpiryTime(data.expiryTime);
        } else {
            console.error("No expiry time in response:", data);
            document.getElementById('expiryTime').textContent = "Expiry time not available";
        }
        
    } catch (error) {
        console.error('Error sharing note:', error);
        alert('Failed to share note. Please try again.');
    }
}

// Copy link function
function copyLink() {
    const linkInput = document.getElementById('shareLink');
    linkInput.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
}

// Create new note function
function createNewNote() {
    document.getElementById('createSection').style.display = 'block';
    document.getElementById('viewSection').style.display = 'none';
    document.getElementById('linkContainer').style.display = 'none';
    document.getElementById('noteInput').value = '';
    history.pushState({}, '', '/');
}

// Load and display note
async function loadNote(noteId) {
    try {
        document.getElementById('createSection').style.display = 'none';
        document.getElementById('viewSection').style.display = 'block';
        document.getElementById('noteDisplay').textContent = 'Loading note...';

        const response = await fetch(`/api/notes/${noteId}`);
        if (!response.ok) {
            throw new Error('Note not found or expired');
        }

        const data = await response.json();
        
        if (!data || !data.content) {
            throw new Error('Invalid note data');
        }

        document.getElementById('noteDisplay').textContent = data.content;
        
        if (data.expiryTime) {
            const timerInterval = updateExpiryTime(data.expiryTime, 'viewExpiryTime');
            // Clean up interval when navigating away
            window.addEventListener('beforeunload', () => {
                clearInterval(timerInterval);
            });
        }
    } catch (error) {
        console.error('Error loading note:', error);
        document.getElementById('noteDisplay').textContent = 'Note not found or has expired.';
        document.getElementById('viewExpiryTime').textContent = '';
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;
    const noteId = path.match(/\/note\/([^\/]+)/)?.[1];

    if (noteId) {
        loadNote(noteId);
    } else {
        document.getElementById('createSection').style.display = 'block';
        document.getElementById('viewSection').style.display = 'none';
    }
}); 
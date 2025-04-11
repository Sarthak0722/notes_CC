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

// Function to format time remaining
function formatTimeRemaining(expiryDate) {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry - now;
    
    if (diff <= 0) {
        return 'Expired';
    }

    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) {
        return `Expires in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    return `Expires in 1 hour`;
}

// Function to update expiry time display
function updateExpiryTime(elementId, expiryDate) {
    const element = document.getElementById(elementId);
    if (element && expiryDate) {
        const updateTimer = () => {
            element.textContent = formatTimeRemaining(expiryDate);
            if (new Date() < new Date(expiryDate)) {
                setTimeout(updateTimer, 60000); // Update every minute
            }
        };
        updateTimer();
    }
}

// Function to share a note
async function shareNote() {
    const noteContent = document.getElementById('noteContent').value;
    if (!noteContent.trim()) {
        alert('Please enter some text before sharing');
        return;
    }

    try {
        // Show loading state
        const shareButton = document.querySelector('.primary-btn');
        const originalText = shareButton.textContent;
        shareButton.textContent = 'Saving...';
        shareButton.disabled = true;

        // Save note to backend
        const response = await fetch('/api/notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content: noteContent })
        });

        if (!response.ok) {
            throw new Error('Failed to save note');
        }

        const data = await response.json();
        
        // Generate the shareable link
        const shareLink = `${window.location.origin}/note/${data.id}`;
        
        // Show the share view and hide the editor
        document.getElementById('editorView').style.display = 'none';
        document.getElementById('shareView').style.display = 'block';
        document.getElementById('shareLink').value = shareLink;

        // Update expiry time
        updateExpiryTime('shareExpiry', data.expiresAt);

        // Update URL without reloading
        history.pushState({}, '', `/note/${data.id}`);

        // Reset button state
        shareButton.textContent = originalText;
        shareButton.disabled = false;
    } catch (error) {
        alert('Failed to save note. Please try again.');
        const shareButton = document.querySelector('.primary-btn');
        shareButton.textContent = 'Share Note';
        shareButton.disabled = false;
    }
}

// Function to copy the link to clipboard
function copyLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    document.execCommand('copy');
    
    // Change button text temporarily
    const copyBtn = document.querySelector('.copy-btn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyBtn.textContent = originalText;
    }, 2000);
}

// Function to create a new note
function createNewNote() {
    document.getElementById('noteContent').value = '';
    document.getElementById('editorView').style.display = 'block';
    document.getElementById('shareView').style.display = 'none';
    document.getElementById('viewNote').style.display = 'none';
    history.pushState({}, '', '/');
}

// Function to load and display a note
async function loadNote(noteId) {
    try {
        // Show loading state
        document.getElementById('noteDisplay').textContent = 'Loading note...';
        document.getElementById('viewNote').style.display = 'block';
        document.getElementById('editorView').style.display = 'none';
        document.getElementById('shareView').style.display = 'none';

        const response = await fetch(`/api/notes/${noteId}`);
        if (!response.ok) {
            throw new Error('Note not found');
        }

        const data = await response.json();
        document.getElementById('noteDisplay').textContent = data.content;
        
        // Update expiry time
        updateExpiryTime('viewExpiry', data.expiresAt);
    } catch (error) {
        document.getElementById('noteDisplay').textContent = 'Note not found or has expired';
        document.getElementById('viewExpiry').textContent = '';
    }
}

// Check URL on page load
window.onload = () => {
    const path = window.location.pathname;
    const noteMatch = path.match(/^\/note\/([a-zA-Z0-9_-]+)$/);
    
    if (noteMatch) {
        loadNote(noteMatch[1]);
    } else {
        // Show editor view for the main page
        document.getElementById('editorView').style.display = 'block';
        document.getElementById('shareView').style.display = 'none';
        document.getElementById('viewNote').style.display = 'none';
    }
}; 
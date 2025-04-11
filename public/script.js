// JSONBin.io configuration
const JSONBIN_API_KEY = '$2a$10$Nt/Iq5o.wAfiJaVw5qJXAOPn6/p9zHtAt8mBhzqJVJGkypQvHxcie'; // Read-access API key
const BIN_ID = '65f0c2a8dc74654018a8b8b4';

// Function to generate a random ID
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Function to save note to JSONBin.io
async function saveNote(noteId, content) {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY,
            },
            body: JSON.stringify({
                [noteId]: content
            })
        });
        return response.ok;
    } catch (error) {
        console.error('Error saving note:', error);
        return false;
    }
}

// Function to get note from JSONBin.io
async function getNote(noteId) {
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        const data = await response.json();
        return data.record[noteId];
    } catch (error) {
        console.error('Error getting note:', error);
        return null;
    }
}

// Function to share a note
async function shareNote() {
    const noteContent = document.getElementById('noteContent').value;
    if (!noteContent.trim()) {
        alert('Please enter some text before sharing');
        return;
    }

    // Show loading state
    const shareButton = document.querySelector('.primary-btn');
    const originalText = shareButton.textContent;
    shareButton.textContent = 'Saving...';
    shareButton.disabled = true;

    // Generate a unique ID for the note
    const noteId = generateId();
    
    // Save the note
    const saved = await saveNote(noteId, noteContent);
    
    if (saved) {
        // Generate the shareable link
        const shareLink = `${window.location.origin}${window.location.pathname}?note=${noteId}`;
        
        // Show the share view and hide the editor
        document.getElementById('editorView').style.display = 'none';
        document.getElementById('shareView').style.display = 'block';
        document.getElementById('shareLink').value = shareLink;
    } else {
        alert('Failed to save note. Please try again.');
    }

    // Reset button state
    shareButton.textContent = originalText;
    shareButton.disabled = false;
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
}

// Function to check for note ID in URL and display note if present
async function checkForNoteInUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('note');
    
    if (noteId) {
        // Show loading state
        document.getElementById('noteDisplay').textContent = 'Loading note...';
        document.getElementById('viewNote').style.display = 'block';
        document.getElementById('editorView').style.display = 'none';

        const noteContent = await getNote(noteId);
        if (noteContent) {
            document.getElementById('noteDisplay').textContent = noteContent;
        } else {
            document.getElementById('noteDisplay').textContent = 'Note not found or has expired';
        }
    }
}

// Check for note in URL when page loads
window.onload = checkForNoteInUrl; 
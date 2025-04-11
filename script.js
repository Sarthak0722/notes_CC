// Function to generate a random ID
function generateId() {
    return Math.random().toString(36).substring(2, 15);
}

// Function to save a note
function saveNote() {
    const noteContent = document.getElementById('noteContent').value;
    if (!noteContent.trim()) {
        alert('Please enter some text for your note');
        return;
    }

    // Generate a unique ID for the note
    const noteId = generateId();
    
    // Store the note in localStorage
    localStorage.setItem(noteId, noteContent);
    
    // Generate the shareable link
    const shareLink = `${window.location.origin}${window.location.pathname}?note=${noteId}`;
    
    // Display the link
    document.getElementById('shareLink').value = shareLink;
    document.getElementById('noteLink').style.display = 'block';
    
    // Clear the textarea
    document.getElementById('noteContent').value = '';
}

// Function to copy the link to clipboard
function copyLink() {
    const shareLink = document.getElementById('shareLink');
    shareLink.select();
    document.execCommand('copy');
    alert('Link copied to clipboard!');
}

// Function to check for note ID in URL and display note if present
function checkForNoteInUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('note');
    
    if (noteId) {
        const noteContent = localStorage.getItem(noteId);
        if (noteContent) {
            document.getElementById('noteDisplay').textContent = noteContent;
            document.getElementById('viewNote').style.display = 'block';
            document.querySelector('.note-form').style.display = 'none';
        } else {
            document.getElementById('noteDisplay').textContent = 'Note not found';
            document.getElementById('viewNote').style.display = 'block';
        }
    }
}

// Check for note in URL when page loads
window.onload = checkForNoteInUrl; 
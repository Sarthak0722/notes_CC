// Function to generate a random ID
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Function to share a note
function shareNote() {
    const noteContent = document.getElementById('noteContent').value;
    if (!noteContent.trim()) {
        alert('Please enter some text before sharing');
        return;
    }

    // Generate a unique ID for the note
    const noteId = generateId();
    
    // Store the note in localStorage
    localStorage.setItem(noteId, noteContent);
    
    // Generate the shareable link
    const shareLink = `${window.location.origin}${window.location.pathname}?note=${noteId}`;
    
    // Show the share view and hide the editor
    document.getElementById('editorView').style.display = 'none';
    document.getElementById('shareView').style.display = 'block';
    document.getElementById('shareLink').value = shareLink;
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
function checkForNoteInUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const noteId = urlParams.get('note');
    
    if (noteId) {
        const noteContent = localStorage.getItem(noteId);
        if (noteContent) {
            document.getElementById('noteDisplay').textContent = noteContent;
            document.getElementById('viewNote').style.display = 'block';
            document.getElementById('editorView').style.display = 'none';
        } else {
            document.getElementById('noteDisplay').textContent = 'Note not found or has expired';
            document.getElementById('viewNote').style.display = 'block';
            document.getElementById('editorView').style.display = 'none';
        }
    }
}

// Check for note in URL when page loads
window.onload = checkForNoteInUrl; 
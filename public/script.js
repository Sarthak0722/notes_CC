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

    // Save the note and get Gist ID
    const gistId = await saveNote(generateId(), noteContent);
    
    if (gistId) {
        // Generate the shareable link
        const shareLink = `${window.location.origin}${window.location.pathname}?note=${gistId}`;
        
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
const express = require('express');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dbUser:GwWt9zrVEgItoOjU@cluster0.j3lma.mongodb.net/notes-app?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Note Schema
const noteSchema = new mongoose.Schema({
    _id: { type: String, default: () => nanoid(6) },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 3600 } // Expires after 1 hour
});

const Note = mongoose.model('Note', noteSchema);

// API Routes
app.post('/api/notes', async (req, res) => {
    try {
        const { content } = req.body;
        
        if (!content || typeof content !== 'string') {
            return res.status(400).json({ error: 'Invalid note content' });
        }

        const note = new Note({ content });
        await note.save();
        
        // Calculate expiry time (1 hour from now)
        const expiryTime = new Date(Date.now() + 3600000).toISOString();
        
        res.json({ 
            id: note._id,
            expiryTime
        });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: 'Failed to save note' });
    }
});

app.get('/api/notes/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        
        if (!note) {
            return res.status(404).json({ error: 'Note not found or expired' });
        }

        // Calculate remaining time
        const expiryTime = new Date(note.createdAt.getTime() + 3600000).toISOString();
        
        if (new Date() >= new Date(expiryTime)) {
            await Note.findByIdAndDelete(req.params.id);
            return res.status(404).json({ error: 'Note has expired' });
        }

        res.json({ 
            content: note.content,
            expiryTime
        });
    } catch (error) {
        console.error('Retrieve error:', error);
        res.status(500).json({ error: 'Failed to retrieve note' });
    }
});

// Handle SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 
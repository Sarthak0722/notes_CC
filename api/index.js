const express = require('express');
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://dbUser:GwWt9zrVEgItoOjU@cluster0.j3lma.mongodb.net/dairy-app?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Note Schema
const noteSchema = new mongoose.Schema({
    _id: { type: String, default: () => nanoid(6) },
    content: String,
    createdAt: { type: Date, default: Date.now, expires: 3600 } // Expires after 1 hour (3600 seconds)
});

// Create TTL index for auto-deletion after 1 hour
noteSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

const Note = mongoose.model('Note', noteSchema);

// API Routes
app.post('/api/notes', async (req, res) => {
    try {
        const note = new Note({ content: req.body.content });
        await note.save();
        
        // Calculate expiry time (1 hour from now)
        const expiresAt = new Date(Date.now() + 3600000);
        
        res.json({ 
            id: note._id,
            expiresAt: expiresAt.toISOString()
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
            return res.status(404).json({ error: 'Note not found' });
        }

        // Calculate remaining time
        const expiresAt = new Date(note.createdAt.getTime() + 3600000);
        if (expiresAt < new Date()) {
            return res.status(404).json({ error: 'Note has expired' });
        }

        res.json({ 
            content: note.content,
            expiresAt: expiresAt.toISOString()
        });
    } catch (error) {
        console.error('Retrieve error:', error);
        res.status(500).json({ error: 'Failed to retrieve note' });
    }
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 
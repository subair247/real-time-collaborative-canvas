// server/server.js
const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const roomManager = require('./rooms'); // Logic for isolating different drawing sessions

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware to serve static files from the client folder
app.use(express.static(path.join(__dirname, '../client')));

// Explicit route for the home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

/**
 * WebSocket Logic: State Synchronization and Conflict Resolution
 */
io.on('connection', (socket) => {
    // Determine the room from the client's query
    const roomId = socket.handshake.query.room || 'default-room';
    socket.join(roomId);

    // Access the state-manager for this specific room
    const roomState = roomManager.getRoomState(roomId);

    /**
     * Users Online Tracking logic
     */
    const broadcastUserCount = () => {
        const clients = io.sockets.adapter.rooms.get(roomId);
        const count = clients ? clients.size : 0;
        // Broadcast to everyone in the room
        io.to(roomId).emit('user-count-update', count);
    };

    // Broadcast current user count to everyone in the room
    broadcastUserCount();

    // Send the current drawing history to the newly connected user
    socket.emit('init-history', roomState.getHistory());

    /**
     * Drawing Synchronization Events
     */
    socket.on('draw-step', (data) => {
        // Broadcast the line segment to others in the same room while drawing is happening
        socket.to(roomId).emit('remote-draw-step', { ...data, userId: socket.id });
    });

    socket.on('draw-end', (strokeData) => {
        // Save the finished stroke into the global history stack
        roomState.addStroke(strokeData);
    });

    /**
     * User Indicator (Ghost Cursor) logic
     */
    socket.on('mouse-move', (pos) => {
        socket.to(roomId).emit('user-move', { ...pos, userId: socket.id });
    });

    /**
     * Global Undo logic
     */
    socket.on('undo-request', () => {
        const success = roomState.undo();
        if (success) {
            // Force every user in the room to re-render from the new source of truth
            io.to(roomId).emit('state-reset', roomState.getHistory());
        }
    });

    socket.on('disconnect', () => {
        // Update user count and perform cleanup if room is empty
        broadcastUserCount();
        roomManager.handleCleanup(roomId, io);
        io.to(roomId).emit('user-disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
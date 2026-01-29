// server/rooms.js
const DrawingState = require('./drawing-state');
const StateManager = require('./state-manager');

const rooms = {};

function getRoom(roomId) {
    if (!rooms[roomId]) {
        rooms[roomId] = new StateManager();
    }
    return rooms[roomId];
}

class RoomManager {
    constructor() {
        // Map stores roomId as key and DrawingState instance as value
        this.rooms = new Map();
    }

    /**
     * Gets an existing room's state or creates a new one if it doesn't exist
     */
    getRoomState(roomId) {
        if (!this.rooms.has(roomId)) {
            console.log(`Creating new room: ${roomId}`);
            this.rooms.set(roomId, new DrawingState());
        }
        return this.rooms.get(roomId);
    }

    /**
     * Optional: Cleanup logic to prevent memory leaks when a room is empty
     */
    handleCleanup(roomId, io) {
        const room = io.sockets.adapter.rooms.get(roomId);
        if (!room || room.size === 0) {
            console.log(`Cleaning up empty room: ${roomId}`);
            this.rooms.delete(roomId);
        }
    }
}

// Export as a singleton
module.exports = new RoomManager();
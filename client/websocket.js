// client/websocket.js
export class SocketManager {
    constructor(canvasManager) {
        this.socket = io(); // Assumes socket.io client is loaded via index.html
        this.canvasManager = canvasManager;
        this.setupListeners();
    }
}
const socket = io();
    setupListeners() {
        // Initial state sync
        this.socket.on('init-history', (history) => {
            this.canvasManager.clearAndReplay(history);
        });

        // Inside your setupListeners() method
      this.socket.on('user-count-update', (count) => {
       const userDisplay = document.getElementById('userCount');
    if (userDisplay) {
        userDisplay.textContent = `Users Online: ${count}`;
    }
});

        // Receiving a single segment from another user
        this.socket.on('remote-draw-step', (data) => {
            this.canvasManager.drawSegment(data.start, data.end, data.style);
        });

        // Global Undo/Redo - the server sends the full new history
        this.socket.on('state-reset', (history) => {
            this.canvasManager.clearAndReplay(history);
        });

        // User Presence (Ghost Cursors)
        this.socket.on('user-move', (data) => {
            this.updateRemoteCursor(data);
        });

        this.socket.on('user-disconnected', (userId) => {
            const cursor = document.getElementById(`cursor-${userId}`);
            if (cursor) cursor.remove();
        });
    }

    // Emit local actions to server
    emitDrawStep(start, end, style) {
        this.socket.emit('draw-step', { start, end, style });
    }

    emitDrawEnd(points, style) {
        this.socket.emit('draw-end', { points, style });
    }

    emitUndo() {
        this.socket.emit('undo-request');
    }

    emitMouseMove(pos) {
        this.socket.emit('mouse-move', pos);
    }

    updateRemoteCursor(data) {
        let cursor = document.getElementById(`cursor-${data.userId}`);
        if (!cursor) {
            cursor = document.createElement('div');
            cursor.id = `cursor-${data.userId}`;
            cursor.className = 'cursor-node';
            cursor.innerHTML = `<span class="cursor-label">User ${data.userId.slice(0,4)}</span>`;
            document.getElementById('cursor-layer').appendChild(cursor);
        }
        cursor.style.backgroundColor = data.color || '#ff0000';
        cursor.style.left = `${data.x}px`;
        cursor.style.top = `${data.y}px`;
    }
}
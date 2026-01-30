// client/websocket.js
export class SocketManager {
    constructor(canvasManager) {

        // In the constructor
    const urlParams = new URLSearchParams(window.location.search);
    const room = urlParams.get('room') || 'public';
        this.socket = io({ query: { room: room } });

        this.canvasManager = canvasManager;
        // Connect to the server using the current window location
        this.socket = io(); 

        this.setupListeners();
    }

    setupListeners() {
        // Receives the full history when a user first joins
        this.socket.on('init-history', (history) => {
            this.canvasManager.clearAndReplay(history);
        });

        // Receives drawing segments from other users in real-time
        this.socket.on('remote-draw-step', (data) => {
            this.canvasManager.drawSegment(data.start, data.end, data.style);
        });

        // Updates the "Users Online" count in the UI
        this.socket.on('user-count-update', (count) => {
            const userDisplay = document.getElementById('userCount');
            if (userDisplay) {
                userDisplay.textContent = `Users Online: ${count}`;
            }
        });

        // Handles global undo requests
        this.socket.on('state-reset', (history) => {
            this.canvasManager.clearAndReplay(history);
        });
    }

    // Methods used by main.js to send data back to the server
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
}
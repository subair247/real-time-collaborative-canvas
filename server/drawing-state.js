class DrawingState {
    constructor() {
        this.history = []; // The "Source of Truth"
        this.users = new Map(); // Store user data: { id, color, position }
    }

    addStroke(stroke) {
        this.history.push(stroke);
    }

    undo() {
        return this.history.pop();
    }

    getHistory() {
        return this.history;
    }
}

module.exports = DrawingState;
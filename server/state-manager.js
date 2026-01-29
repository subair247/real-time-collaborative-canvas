class StateManager {
    constructor() {
        // This array stores the history of all completed strokes in a room
        this.history = []; 
        // This stack stores undone strokes for the 'Redo' functionality
        this.redoStack = [];
    }

    /**
     * Adds a completed stroke to the history.
     * @param {Object} strokeData - { points: [], style: { color, width } }
     */
    addStroke(strokeData) {
        this.history.push(strokeData);
        // On a new action, we must clear the redo stack to prevent state conflicts
        this.redoStack = []; 
    }

    /**
     * Removes the last action from the global history.
     * This fulfills the requirement: "One user can undo another user’s drawing."
     */
    undo() {
        if (this.history.length > 0) {
            const lastAction = this.history.pop();
            this.redoStack.push(lastAction);
            return true;
        }
        return false;
    }

    /**
     * Re-adds the last undone action back to history.
     */
    redo() {
        if (this.redoStack.length > 0) {
            const actionToRestore = this.redoStack.pop();
            this.history.push(actionToRestore);
            return true;
        }
        return false;
    }

    /**
     * Returns the full history for new users joining the room.
     */
    getHistory() {
        return this.history;
    }

    /**
     * Completely wipes the state for the room.
     */
    clearAll() {
        this.history = [];
        this.redoStack = [];
    }
}

module.exports = StateManager;
// client/main.js
import { CanvasManager } from './canvas.js';
import { SocketManager } from './websocket.js';

window.addEventListener('DOMContentLoaded', () => {
    // 1. First, find all the UI elements in the HTML
    const canvasElement = document.getElementById('mainCanvas');
    const colorPicker = document.getElementById('colorPicker');
    const sizePicker = document.getElementById('sizePicker');
    const eraserBtn = document.getElementById('eraserBtn');
    const undoBtn = document.getElementById('undoBtn');

    // 2. Initialize Managers (Now that canvasElement is defined)
    const canvasManager = new CanvasManager('mainCanvas');
    const socketManager = new SocketManager(canvasManager);

    // 3. Set up State Variables
    let isDrawing = false;
    let isEraser = false;
    let lastPos = { x: 0, y: 0 };
    let currentStrokePoints = [];

    // Helper function for coordinates
    const getCoords = (e) => {
        const rect = canvasElement.getBoundingClientRect();
        const scaleX = canvasElement.width / rect.width;
        const scaleY = canvasElement.height / rect.height;
        return {
            x: (e.clientX - rect.left) * (scaleX / window.devicePixelRatio),
            y: (e.clientY - rect.top) * (scaleY / window.devicePixelRatio)
        };
    };

    // 4. Set up the event listeners
    canvasElement.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const pos = getCoords(e);
        lastPos = pos;
        currentStrokePoints = [pos];
    });

    canvasElement.addEventListener('mousemove', (e) => {
        const currentPos = getCoords(e);
        socketManager.emitMouseMove({ x: e.clientX, y: e.clientY });

        if (!isDrawing) return;

        const style = {
            color: colorPicker.value,
            width: parseInt(sizePicker.value),
            isEraser: isEraser
        };

        canvasManager.drawSegment(lastPos, currentPos, style);
        socketManager.emitDrawStep(lastPos, currentPos, style);
        lastPos = currentPos;
    });

    window.addEventListener('mouseup', () => {
        if (!isDrawing) return;
        isDrawing = false;
        socketManager.emitDrawEnd(currentStrokePoints, {
            color: colorPicker.value,
            width: parseInt(sizePicker.value),
            isEraser: isEraser
        });
    });

    // 5. Tool Controls (This fixes the "Brush Mode" button)
    eraserBtn.addEventListener('click', () => {
        isEraser = !isEraser;
        eraserBtn.textContent = isEraser ? 'Brush Mode' : 'Eraser';
        eraserBtn.classList.toggle('active', isEraser);
    });

    undoBtn.addEventListener('click', () => socketManager.emitUndo());
});
// client/main.js
import { CanvasManager } from './canvas.js';
import { SocketManager } from './websocket.js';

window.addEventListener('DOMContentLoaded', () => {

    // Add these to client/main.js inside the DOMContentLoaded listener
canvasElement.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Prevents scrolling while drawing
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvasElement.dispatchEvent(mouseEvent);
}, { passive: false });

canvasElement.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvasElement.dispatchEvent(mouseEvent);
}, { passive: false });

canvasElement.addEventListener('touchend', () => {
    canvasElement.dispatchEvent(new MouseEvent('mouseup'));
});
    // 1. Initialize Core Managers
    const canvasManager = new CanvasManager('mainCanvas');
    const socketManager = new SocketManager(canvasManager);

    // 2. UI Element References
    const colorPicker = document.getElementById('colorPicker');
    const sizePicker = document.getElementById('sizePicker');
    const eraserBtn = document.getElementById('eraserBtn');
    const undoBtn = document.getElementById('undoBtn');
    const canvasElement = document.getElementById('mainCanvas');

    // 3. State Variables
    let isDrawing = false;
    let isEraser = false;
    let lastPos = { x: 0, y: 0 };
    let currentStrokePoints = [];

    // Helper: Normalize coordinates for different screen sizes
    const getCoords = (e) => {
        const rect = canvasElement.getBoundingClientRect();
        const scaleX = canvasElement.width / rect.width;
        const scaleY = canvasElement.height / rect.height;
        return {
            x: (e.clientX - rect.left) * (scaleX / window.devicePixelRatio),
            y: (e.clientY - rect.top) * (scaleY / window.devicePixelRatio)
        };
    };

    // 4. Drawing Event Listeners
    
    canvasElement.addEventListener('mousedown', (e) => {
        isDrawing = true;
        const pos = getCoords(e);
        lastPos = pos;
        currentStrokePoints = [pos];
    });

    canvasElement.addEventListener('mousemove', (e) => {
        const currentPos = getCoords(e);
        
        // Always emit mouse position for the "Ghost Cursor"
        socketManager.emitMouseMove({ 
            x: e.clientX, 
            y: e.clientY, 
            color: isEraser ? '#ffffff' : colorPicker.value 
        });

        if (!isDrawing) return;

        const style = {
            color: colorPicker.value,
            width: parseInt(sizePicker.value),
            isEraser: isEraser
        };

        // Render locally (Optimistic UI)
        canvasManager.drawSegment(lastPos, currentPos, style);

        // Broadcast segment to other users
        socketManager.emitDrawStep(lastPos, currentPos, style);

        lastPos = currentPos;
        currentStrokePoints.push(currentPos);
    });

    window.addEventListener('mouseup', () => {
        if (!isDrawing) return;
        isDrawing = false;

        // Save the completed stroke to the server history
        const finalStyle = {
            color: colorPicker.value,
            width: parseInt(sizePicker.value),
            isEraser: isEraser
        };
        socketManager.emitDrawEnd(currentStrokePoints, finalStyle);
        currentStrokePoints = [];
    });

    // 5. Tool Controls

    eraserBtn.addEventListener('click', () => {
        isEraser = !isEraser;
        eraserBtn.textContent = isEraser ? 'Brush Mode' : 'Eraser';
        eraserBtn.classList.toggle('active', isEraser);
    });

    undoBtn.addEventListener('click', () => {
        // Request a global undo from the server
        socketManager.emitUndo();
    });

    // Ensure the color picker works as expected
    colorPicker.addEventListener('change', () => {
        if (isEraser) {
            isEraser = false;
            eraserBtn.textContent = 'Eraser';
        }
    });
});
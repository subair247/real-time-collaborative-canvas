export class CanvasManager {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element with ID "${canvasId}" not found.`);
        }

        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        // Listen for window resize to keep canvas full-screen
        window.addEventListener('resize', () => this.setupCanvas());
    }


    setupCanvas() {
        
    // 1. Get the actual screen pixel ratio (important for sharp lines)
    const dpr = window.devicePixelRatio || 1;
    
    // 2. Set the CANVAS CSS size to fill the window
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';

    // 3. Set the INTERNAL DRAWING resolution (The Attributes)
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;

    // 4. Scale the context so your drawing math still works
    this.ctx.scale(dpr, dpr);
    
    // 5. Re-apply styles (they reset when width/height change)
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
}
    drawSegment(start, end, style) {
        this.ctx.beginPath();
        
        // Handle Eraser logic
        if (style.isEraser) {
            this.ctx.globalCompositeOperation = 'destination-out';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.strokeStyle = style.color || '#000000';
        }

        this.ctx.lineWidth = style.width || 5;
        this.ctx.moveTo(start.x, start.y);
        this.ctx.lineTo(end.x, end.y);
        this.ctx.stroke();
        this.ctx.closePath();
        
        // Reset composite operation so next draw is normal
        this.ctx.globalCompositeOperation = 'source-over';
    }

    /**
     * The "State Sync" heart: Clears the canvas and redraws everything from history.
     * This is called when a new user joins or when someone hits "Undo".
     */
    clearAndReplay(history) {
        // 1. Clear the entire drawing area
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 2. Loop through every completed stroke in the history array
        history.forEach(stroke => {
            if (!stroke.points || stroke.points.length < 2) return;

            this.ctx.beginPath();
            
            if (stroke.style.isEraser) {
                this.ctx.globalCompositeOperation = 'destination-out';
            } else {
                this.ctx.globalCompositeOperation = 'source-over';
                this.ctx.strokeStyle = stroke.style.color;
            }

            this.ctx.lineWidth = stroke.style.width;
            
            // Move to the first point of the stroke
            this.ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

            // Draw lines through all subsequent points
            for (let i = 1; i < stroke.points.length; i++) {
                this.ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            
            this.ctx.stroke();
        });
        
        // Ensure state is reset for future segments
        this.ctx.globalCompositeOperation = 'source-over';
    }
}
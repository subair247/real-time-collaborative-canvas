Collaborative Canvas
A real-time, multi-user drawing application built with the native HTML5 Canvas API and WebSockets. This project demonstrates complex state synchronization, global undo/redo logic, and low-latency communication.

🚀 Features
Real-Time Drawing: Every stroke is broadcasted instantly to all connected users.

Global Undo/Redo: Collaborative history management where one user can undo another user's action.

User Indicators: "Ghost cursors" show where other users are on the canvas in real-time.

Room Isolation: Supports multiple drawing sessions through room-based logic.

Responsive Canvas: Normalizes coordinates to ensure consistency across different screen sizes and DPIs.

Core Tools: Brush, Eraser, Color Picker, and Stroke Width adjustment.

🛠️ Tech Stack
Frontend: Vanilla JavaScript (ES6+), HTML5 Canvas API.

Backend: Node.js, Express.

Communication: Socket.io (WebSockets).

📦 Installation & Setup
1.Clone the repository:
Bash
git clone https://github.com/your-username/collaborative-canvas.git
cd collaborative-canvas

2.Install dependencies:
Bash
npm install

3.Start the server:
Bash
npm start

4.Open the app: Navigate to http://localhost:3000 in your web browser.

 Testing Collaboration
 To see the real-time features in action:

 1.Open the application in two different browser windows (or one normal and one incognito).
 2.Draw in Window A; observe the stroke appearing in Window B immediately.
 3.Click Undo in Window B; observe the stroke disappearing from both windows.
 4Move your mouse in Window A; observe the Ghost Cursor moving in Window B.
 
 📐 Architecture Highlights
 
 .The Replay Pattern: To handle the global undo, the canvas is cleared and redrawn from a centralized history log provided by the server.
 
 .Coordinate Mapping: Uses a normalization formula to map client mouse coordinates to the internal canvas coordinate system:
 
$$x_{canvas} = (x_{client} - rect.left) \times \frac{canvas.width}{rect.width}$$
 
 .Optimistic Rendering: Local strokes are rendered instantly for the user, while remote strokes are synchronized via the server to ensure a lag-free experience.
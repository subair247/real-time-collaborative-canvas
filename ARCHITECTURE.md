🏗️ ARCHITECTURE.md1. 

1.System Overview

The application follows a Client-Server-Broadcast architecture. Unlike a traditional "painting" app that stores pixels, this system treats the canvas as a Vector Event Log.

Core Workflow:

  1.Input: User interacts with the Canvas via mouse/touch events.
  2.Optimistic UI: The client renders the stroke locally immediately for zero-latency feedback.
  3.Propagation: Path segments are emitted via WebSockets to the Node.js server.
  4.Synchronization: The Server validates the action, updates the StateManager, and broadcasts the event to other clients in the same room.
  
2. State Management & "Global Undo"

The most significant challenge was implementing an Undo feature that works across multiple users.

The Problem

If User A draws a circle and User B draws a square on top of it, "erasing" pixels for User A's undo would leave a "hole" in User B's drawing.

The Solution: The Replay Pattern

We implement Event Sourcing. The server maintains a history array of all drawing commands.
 
 . Undo Logic: When an "Undo" is triggered, the server removes the last command from the history and broadcasts a STATE_RESET event.
 . Re-rendering: Every client performs a Clean Re-render.

    1. ctx.clearRect(0, 0, width, height)
    2. Iterate through the history array.
    3. Redraw every path segment.
    
 To prevent visual flickering during high-frequency re-renders, the system uses a Double Buffering approach (redrawing logic is optimized to occur within a single requestAnimationFrame tick).
 
3. Real-Time Optimization

Coordinate Normalization

Screens vary in size and resolution (DPI). To ensure a stroke drawn on a small laptop appears correctly on a 4K monitor, we normalize coordinates:

$$x_{normalized} = (x_{client} - canvas.offsetLeft) \times \frac{internalWidth}{displayWidth}$$

This ensures the "Source of Truth" is resolution-independent.

Network Throttling

Sending a WebSocket packet for every single pixel moved would saturate the network and cause lag.

. Batching: We collect mouse coordinates and emit them in small batches (segments) every 16ms–30ms.
. User Cursors: Remote cursors are rendered on a separate DOM layer (or transparent overlay) to avoid the overhead of re-clearing the main drawing canvas every time a user moves their mouse.

4. Conflict Resolution

In a collaborative environment, two users might draw at the exact same millisecond.

. Server-Side Sequencing: Since Node.js is single-threaded, the Socket.io server acts as a Linearizer. Events are processed in the order they arrive at the server.
. Consistency: By assigning a unique ID to every stroke on the server, we ensure that every client eventually reaches the same visual state, even if packets arrive out of order.

5. Scalability & Rooms

The RoomManager uses a Memory-Isolated Map. Each room contains its own StateManager instance.

. Isolation: Drawing events are scoped to a roomId using Socket.io namespaces/rooms.
. Memory Management: Rooms are deleted from the server's memory when the last user disconnects to prevent memory leaks.

6. Future Improvements

. Snapshots: For very long drawing sessions, the server could store a PNG "snapshot" every 100 actions to speed up the initial load for new users.
. Binary Protocols: Moving from JSON to Protocol Buffers could reduce the payload size by 60-70%, further decreasing latency.
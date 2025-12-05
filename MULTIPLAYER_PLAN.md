# Multiplayer Implementation Plan

## Overview

Transform the FNF Companion from a single-player local application to a real-time multiplayer experience where multiple users can share the same game session and see each other's changes in real-time.

## Architecture

### Current State

- **Frontend**: React SPA with local state management
- **Storage**: localStorage only
- **State**: All state is local to each browser instance
- **No backend**: Pure client-side application

### Target State

- **Frontend**: React SPA with shared state management
- **Backend**: Node.js/Express server with WebSocket support
- **Storage**: In-memory session storage (with optional persistence)
- **State**: Shared state synchronized via WebSocket
- **Sessions**: Unique session IDs in URL (e.g., `/session/abc123`)

## Required Dependencies

### Backend (New)

```json
{
  "express": "^4.18.2",
  "ws": "^8.14.2", // WebSocket server
  "uuid": "^9.0.1", // Session ID generation
  "cors": "^2.8.5" // CORS support
}
```

### Frontend (New)

```json
{
  "socket.io-client": "^4.6.1" // Or native WebSocket API
}
```

**Note**: Could use native WebSocket API instead of socket.io-client to avoid extra dependency, but socket.io provides better reconnection handling.

## Implementation Approach

### Option 1: Socket.io (Recommended)

- **Pros**: Built-in reconnection, rooms, better error handling
- **Cons**: Larger bundle size (~50KB gzipped)

### Option 2: Native WebSocket

- **Pros**: No extra dependency, smaller bundle
- **Cons**: Manual reconnection logic, more error handling code

**Recommendation**: Start with Socket.io for faster development, can optimize later.

## Backend Server Structure

### New Files to Create

1. **`server/index.js`** - Main server file
   - Express server setup
   - WebSocket server setup
   - Session management
   - Route handlers

2. **`server/sessionManager.js`** - Session management
   - Create sessions
   - Store session state
   - Clean up expired sessions
   - Handle client connections/disconnections

3. **`server/package.json`** - Backend dependencies

### Server Responsibilities

- Generate unique session IDs
- Store session state in memory (or Redis for production)
- Broadcast state changes to all clients in a session
- Handle client join/leave events
- Clean up inactive sessions (TTL: ~24 hours)

## Frontend Changes

### Files to Modify

1. **`src/App.jsx`** (Major changes)
   - Add session ID detection from URL
   - Initialize WebSocket connection
   - Replace local state updates with broadcasted updates
   - Listen for remote state changes
   - Handle connection status (connected/disconnected indicator)
   - Distinguish between local and remote updates

2. **`src/utils/stateManager.js`** (Moderate changes)
   - Add WebSocket sync layer
   - Keep localStorage as fallback/backup
   - Handle conflict resolution (last-write-wins or merge strategies)

3. **`src/main.jsx`** (Minor changes)
   - Add routing for session URLs
   - Handle session ID in URL

### New Files to Create

1. **`src/utils/socketManager.js`** - WebSocket connection management
   - Connect/disconnect logic
   - Message sending/receiving
   - Reconnection handling
   - Connection status tracking

2. **`src/utils/sessionUtils.js`** - Session utilities
   - Generate session ID
   - Extract session ID from URL
   - Share session URL functionality

3. **`src/components/SessionIndicator.jsx`** - UI component
   - Show connection status
   - Display session ID
   - Copy session URL button
   - Show number of connected users

4. **`src/components/Header.jsx`** (Modify)
   - Add session indicator/controls

## State Synchronization Strategy

### Shared State (Synchronized)

- Character stats (name, skill, health, luck, etc.)
- Consumables (coins, meals, potions)
- Inventory
- Notes
- Trail sequence
- Fight state (monster, health, dice rolls)
- Sound URLs and volumes
- Book name

### Local State (Not Synchronized)

- Theme preference (each user has their own)
- Language preference (each user has their own)
- UI state (expanded/collapsed sections)
- Notification banners
- Confirmation dialogs

### Special Cases

1. **Sound Playback**
   - When one user plays a sound, broadcast a `playSound` event
   - All clients receive the event and play the sound simultaneously
   - Need to handle timing synchronization (may have slight delays)

2. **Dice Rolls**
   - Dice rolls should be synchronized (same random seed or server-side rolls)
   - When one user rolls dice, all see the same result
   - This ensures consistency across all clients

3. **Fight Mechanics**
   - Fight state must be synchronized
   - Dice rolls in fights must be consistent
   - All users see the same fight outcome

4. **Race Conditions**
   - Use optimistic updates with conflict resolution
   - Last-write-wins for simple fields (name, stats)
   - Merge strategies for arrays (inventory, trail sequence)

## URL Structure

### Current

- `https://example.com/` - Single player mode

### New

- `https://example.com/` - Single player mode (default)
- `https://example.com/session/abc123` - Multiplayer session
- `https://example.com/session/new` - Create new session (redirects to `/session/{id}`)

## Implementation Steps

### Phase 1: Backend Setup

1. Create server directory structure
2. Set up Express server
3. Set up WebSocket server
4. Implement session management
5. Create API endpoints for session creation

### Phase 2: Frontend Connection

1. Add WebSocket client library
2. Create socket manager utility
3. Add session ID detection from URL
4. Connect to WebSocket server
5. Add connection status indicator

### Phase 3: State Synchronization

1. Modify state updates to broadcast changes
2. Listen for remote state changes
3. Apply remote changes to local state
4. Handle conflict resolution
5. Test with multiple clients

### Phase 4: Sound Synchronization

1. Broadcast sound play events
2. Listen for remote sound events
3. Play sounds on all clients simultaneously
4. Handle sound state synchronization

### Phase 5: UI Enhancements

1. Add session indicator component
2. Add "Create Session" button
3. Add "Copy Session URL" functionality
4. Show connected users count
5. Add disconnect/reconnect handling

### Phase 6: Testing & Polish

1. Test with 2-4 simultaneous users
2. Test reconnection scenarios
3. Test conflict resolution
4. Performance optimization
5. Error handling improvements

## Files Changed/Created Summary

### Backend (New - ~5 files)

- `server/index.js`
- `server/sessionManager.js`
- `server/package.json`
- `server/.gitignore`
- `server/README.md` (optional)

### Frontend (Modified - ~6 files)

- `src/App.jsx` (major refactor)
- `src/utils/stateManager.js` (add sync layer)
- `src/main.jsx` (add routing)
- `src/components/Header.jsx` (add session UI)
- `package.json` (add dependencies)
- `vite.config.js` (proxy config for dev)

### Frontend (New - ~4 files)

- `src/utils/socketManager.js`
- `src/utils/sessionUtils.js`
- `src/components/SessionIndicator.jsx`
- `src/translations/en.json` (add multiplayer strings)
- `src/translations/pt.json` (add multiplayer strings)

**Total: ~15 files changed/created**

## Technical Challenges

1. **State Conflict Resolution**
   - Two users editing the same field simultaneously
   - Solution: Last-write-wins with timestamp comparison

2. **Sound Synchronization**
   - Network latency causes desync
   - Solution: Acceptable delay (<100ms), or use server timestamp

3. **Dice Roll Consistency**
   - Random numbers must be same for all clients
   - Solution: Server generates random numbers, or use seeded RNG

4. **Connection Reliability**
   - Users may disconnect/reconnect
   - Solution: Reconnection logic, state sync on reconnect

5. **Session Persistence**
   - Sessions should survive server restarts (optional)
   - Solution: Use Redis or database for production

6. **Scalability**
   - Many concurrent sessions
   - Solution: Horizontal scaling with Redis pub/sub

## Development Environment

### Local Development

- Frontend: `npm run dev` (Vite dev server on port 5173)
- Backend: `node server/index.js` (Express on port 3000)
- WebSocket: Same server, different endpoint (`ws://localhost:3000`)

### Production Deployment

- Frontend: Static files (Vite build)
- Backend: Node.js server (PM2, Docker, etc.)
- Consider: Serverless functions (Vercel, Netlify) for backend

## Estimated Complexity

- **Backend**: Medium (3-5 days)
- **Frontend Integration**: High (5-7 days)
- **Testing & Polish**: Medium (2-3 days)
- **Total**: ~10-15 days of development

## Alternative: Serverless Approach

Instead of a dedicated server, could use:

- **Firebase Realtime Database** - Real-time sync built-in
- **Supabase Realtime** - PostgreSQL with real-time subscriptions
- **Pusher** - Managed WebSocket service
- **Ably** - Real-time messaging platform

**Pros**: No server to maintain, faster to implement
**Cons**: Vendor lock-in, potential costs at scale

## Recommendation

Start with a simple Node.js + WebSocket server for MVP, then consider migrating to a managed service if needed. This gives full control and understanding of the system.

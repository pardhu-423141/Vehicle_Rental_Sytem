import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';

let io: SocketServer;

// Map from userId → socketId for targeted messaging
const userSocketMap = new Map<string, string>();

export const initSocket = (httpServer: HttpServer): SocketServer => {
  io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    // Client sends their userId after connecting
    socket.on('register', (userId: string) => {
      userSocketMap.set(userId, socket.id);
      socket.join(`user:${userId}`);
      console.log(`Socket registered: user ${userId} → ${socket.id}`);
    });

    socket.on('disconnect', () => {
      // Clean up map
      for (const [uid, sid] of userSocketMap.entries()) {
        if (sid === socket.id) {
          userSocketMap.delete(uid);
          break;
        }
      }
    });
  });

  return io;
};

export const getIO = (): SocketServer => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

/**
 * Emit a notification to a specific user by their DB userId.
 * Falls back silently if they are offline.
 */
export const notifyUser = (
  userId: string,
  event: string,
  payload: Record<string, unknown>
) => {
  if (!io) return;
  io.to(`user:${userId}`).emit(event, payload);
};

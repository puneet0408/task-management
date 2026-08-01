let io;

export const initSocket = (socketInstance) => {
  io = socketInstance;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
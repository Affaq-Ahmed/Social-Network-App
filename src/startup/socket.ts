import { Server } from 'socket.io';

let io: any;
const socket = {
	init: (httpServer: any) => {
		io = new Server(httpServer);
		return io;
	},
	getIO: () => {
		if (!io) {
			throw new Error('Socket.io not initialized');
		}
		return io;
	},
};

export default socket;

import { Server as Engine } from '@socket.io/bun-engine';

import 'dotenv/config';

import { Server } from 'socket.io';

const engine = new Engine({
    path: '/socket.io/',
});

const io = new Server({
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

io.bind(engine);

// stores a list of active rooms
// if a room is inactive a event is return that the room does not exists
const activeRooms = new Map<string, string>(); // roomId -> ownerId (socket.id)

io.on('connection', (socket) => {
    console.log('a new user connected', socket.id);

    // send by the room owner to register as a active room
    socket.on('register-room', (data: RegisterRoomPayload) => {
        // joinging the room
        socket.join(data.roomId);
        // save the info
        if (data.isOwner && !activeRooms.has(data.roomId)) {
            activeRooms.set(data.roomId, socket.id);
        }
    });

    // for non-admin user to join the room
    socket.on('join-room', (data: JoinRoomPayload) => {
        socket.join(data.roomId);
    });

    socket.on('disconnect', () => {
        for (const [roomId, ownerId] of activeRooms.entries()) {
            if (ownerId === socket.id) {
                io.to(roomId).emit('room-closed');
                activeRooms.delete(roomId);
                break;
            }
        }
    });
});

export default {
    port: 8080,
    ...engine.handler(),
};

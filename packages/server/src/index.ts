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
    // socket.onAny((event, ...args) => {
    //     console.log(`[${socket.id}] event: ${event}`, args);
    // });

    console.log('a new user connected', socket.id);

    // send by the room owner to register as a active room
    socket.on('register-room', (data: RegisterRoomPayload) => {
        // joining the room
        socket.join(data.roomId);
        // save the info
        if (data.isOwner && !activeRooms.has(data.roomId)) {
            activeRooms.set(data.roomId, socket.id);
        }
        console.log('room is registered', data.roomId);
    });

    socket.on('join-room', (data: JoinRoomPayload) => {
        const room = activeRooms.get(data.roomId);

        if (!room) {
            socket.emit('room-not-found');
            return;
        }

        // prevent duplicate join
        if (socket.rooms.has(data.roomId)) {
            return;
        }

        socket.join(data.roomId);
        console.log('A new user joins the room', socket.id);
    });

    // for non-admin user exiting the room
    socket.on('exit-room', (data: ExitingRoomPayload) => {
        // client exits the room
        console.log('non-admin user left');
        socket.leave(data.roomId);
    });

    // for real time updates
    socket.on('element:preview', (data: PreviewPayload) => {
        socket.to(data.roomId).emit('element:preview', data);
    });

    // admin sync
    socket.on('sync-canvas', (data: SyncEventPayload) => {
        socket.to(data.roomId).emit('canvas-synced', data);
    });

    // client request to admin to sync
    socket.on('req-sync', (roomId: string) => {
        console.log('request', roomId);
        socket.to(roomId).emit('request-sync');
    });

    // closing the room -> admin user
    socket.on('close-room', () => {
        for (const [roomId, ownerId] of activeRooms.entries()) {
            if (ownerId === socket.id) {
                io.to(roomId).emit('room-shutdown');
                activeRooms.delete(roomId);
                break;
            }
        }
        console.log('room closed');
    });

    // adding element
    socket.on('element:add', (data: AddEventPayload) => {
        console.log('new add', data.roomId);
        socket.to(data.roomId).emit('element:added', data);
    });

    // updating elements
    socket.on('element:update', (data: UpdateEventPayload) => {
        console.log('update', data.roomId);
        socket.to(data.roomId).emit('element:updated', data);
    });

    // removing elements
    socket.on('element:remove', (data: RemoveEventPayload) => {
        socket.to(data.roomId).emit('element:removed', data);
    });

    // pushing the history
    socket.on('history:push', (data: PushEventPayload) => {
        socket.to(data.roomId).emit('history:pushed', data);
    });

    socket.on('disconnect', () => {
        for (const [roomId, ownerId] of activeRooms.entries()) {
            if (ownerId === socket.id) {
                io.to(roomId).emit('room-shutdown');
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

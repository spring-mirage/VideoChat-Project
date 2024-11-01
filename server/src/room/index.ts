import { Socket } from "socket.io";
import { v4 as uuidv4 } from 'uuid';

const rooms: Record<string, string[]> ={}

interface IRoomParams {
    roomId: string;
    peerId: string;
}

export const roomHandle = (socket: Socket) => {
    
    const createRoom = () => {
        const roomId = uuidv4();
        rooms[roomId] = [];
        // socket.join(roomId);
        socket.emit('room-created', { roomId });
        console.log('user create the room', roomId);
    };

    const joinRoom = ({ roomId, peerId }: IRoomParams) => {
        if (rooms[roomId]) {
            console.log('user joined to room', roomId);
            rooms[roomId].push(peerId);
            socket.join(roomId);
            socket.to(roomId).emit('user-joined', { peerId });
            socket.emit('get-users', { 
                roomId, 
                participants: rooms[roomId] 
            })
            socket.on('disconnect', () => {
                console.log('user left room', peerId);
                leaveRoom({roomId, peerId});
            })
        } else {
            console.log('room not found');
        }
    };

    const leaveRoom = ({ roomId, peerId }: IRoomParams) => {
        if (rooms[roomId]) {
            rooms[roomId] = rooms[roomId].filter((id) => id !== peerId);
            socket.to(roomId).emit('user-disconnected', peerId);
        } else {
            console.log('room not found');
        }
    }

    socket.on("create-room", createRoom);
    
    socket.on("join-room", joinRoom);
}

import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io as socketIOClient } from 'socket.io-client';
import Peer from 'peerjs';
import { v4 as uuidv4 } from 'uuid';

const WS = ('http://localhost:6001');

interface RoomProviderProps {
    children: React.ReactNode
}

export const RoomContext = createContext<null | any>(null);

const ws = socketIOClient(WS);

export const RoomProvider: React.FC<RoomProviderProps> = ({children}) => {
    
    const navigate = useNavigate();

    const [me, setMe] = useState<Peer>();

    const [stream, setStream] = useState<MediaStream>();

    const enterRoom = ({ roomId }: { roomId: "string"}) => {
        console.log({roomId});
        navigate(`/room/${roomId}`);
    }

    const getUsers = ({ participants }: { participants: string[]}) => {
        console.log({participants});
    }

    useEffect(() => {
        const meId = uuidv4();

        const peer = new Peer(meId);
        setMe(peer);

        try {
            navigator.mediaDevices.getUserMedia({video: true, audio: true})
            .then((stream) => {
                setStream(stream);
            })
        } catch (error) {
           console.error(error); 
        }

        ws.on('room-created', enterRoom);
        ws.on('get-users', getUsers);
        
    }, []);

    useEffect(() => {
        if(!me) return;
        if(!stream) return;
        ws.on('user-joined', ({peerId}) => {
            const call = me.call(peerId, stream);
        });

        me.on('call', (call) => {
            call.answer(stream);
        });
        
    }, [me, stream]);
    return (
        <RoomContext.Provider value={{ws, me, stream}}>
            {children}
        </RoomContext.Provider>
    )
}
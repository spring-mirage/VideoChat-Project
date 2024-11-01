
import { createContext, useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io as socketIOClient } from 'socket.io-client';
import Peer from 'peerjs';
import { v4 as uuidv4 } from 'uuid';
import { peersReducer } from './PeerReducer';
import { addPeerAction, removePeerAction } from './PeerActions';

const WS = ('http://localhost:6001');

interface RoomProviderProps {
    children: React.ReactNode
}

export const RoomContext = createContext<null | any>(null);

const ws = socketIOClient(WS);

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
    
    const navigate = useNavigate();

    const [me, setMe] = useState<Peer>();

    const [stream, setStream] = useState<MediaStream>();
    
    const [peers, dispatch] = useReducer(peersReducer, {})

    const enterRoom = ({ roomId }: { roomId: string}) => {
        console.log({roomId});
        navigate(`/room/${roomId}`);
    }

    const getUsers = ({ participants }: { participants: string[]}) => {
        console.log({participants});
    }

    const removePeer = (peerId: string) => {
        dispatch(removePeerAction(peerId));
    }

    useEffect(() => {
        const meId = uuidv4();

        const peer = new Peer(meId);
        setMe(peer);

        try {
            navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                setStream(stream);
            })
        } catch (error) {
           console.error(error); 
        }

        ws.on('room-created', enterRoom);
        ws.on('get-users', getUsers);
        ws.on('user-disconnected', removePeer);
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if(!me) return;
        if(!stream) return;

        ws.on('user-joined', ({peerId}) => {
            const call = me.call(peerId, stream);
            call.on('stream',(peerStream) => {
                dispatch(addPeerAction(peerId, peerStream));
            })
        });

        me.on('call', (call) => {
            call.answer(stream);
            call.on('stream',(peerStream) => {
                dispatch(addPeerAction(call.peer, peerStream));
            })
        });
        
    }, [me, stream]);

    console.log({ peers })

    return (
        <RoomContext.Provider value={{ws, me, stream, peers}}>
            {children}
        </RoomContext.Provider>
    )
}
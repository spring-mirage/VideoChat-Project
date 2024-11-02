
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

    const [stream, setStream] = useState<MediaStream | null>(null);
    
    const [peers, dispatch] = useReducer(peersReducer, {})

    const [screenSharingId, setScreenSharingId] = useState<string | null>()

    const enterRoom = ({ roomId }: { roomId: string}) => {
        console.log({roomId});
        navigate(`/room/${roomId}`);
    }

    const getUsers = ({ participants }: { participants: string[]}) => {
        console.log({participants});
        // Agregar nuevos peers
        participants.forEach(peerId => {
            if (!peers[peerId] && stream) {
                const call = me?.call(peerId, stream);
                call?.on('stream', (peerStream) => {
                    dispatch(addPeerAction(peerId, peerStream));
                });
            }
        });
    }

    const removePeer = (peerId: string) => {
        dispatch(removePeerAction(peerId));
    }

    const switchStream = (stream: MediaStream) => {
        setStream(stream);
        setScreenSharingId(me?.id || "");

        // Object.values(me?.connections).forEach((connection: any) => {
        //     const videoTrack = stream
        //         ?.getTracks()
        //         .find((track) => track.kind === 'video');
            
        //     connection[0].peerConnection
        //         .getSenders()[1]
        //         .replaceTrack(videoTrack)
        //         .catch((err:any) => console.error(err));
        // });

        if (me && stream) {
            const videoTrack = stream.getTracks().find((track) => track.kind === 'video');
            if (videoTrack) {
                Object.values(me.connections).forEach((connection: any) => {
                    const conn = connection[0];
                    console.log(conn.peerConnection.getSenders()[1]);
                    conn.peerConnection.getSenders()[1]
                        .replaceTrack(videoTrack)
                        .catch((err: any) => console.error(err));
                });
            }
        }

        // Store active connections manually
        // const activeConnections: { [peerId: string]: any } = {};

        // // Replacing the video track on each active connection
        // Object.values(activeConnections).forEach((connection: any) => {
        //     const videoTrack = stream?.getTracks().find((track) => track.kind === 'video');
        //     if (!videoTrack) {
        //         console.error("No video track found in the stream.");
        //         return;
        //     }

        //     const sender = connection.peerConnection?.getSenders()?.[1];
        //     if (sender) {
        //         sender.replaceTrack(videoTrack).catch((err: any) => console.error(err));
        //     } else {
        //         console.error("Sender not found or index out of bounds.");
        //     }
        // });


        // Reemplazo de Object.values(me?.connections)
        // if (me && stream) {
        //     const videoTrack = stream.getTracks().find((track) => track.kind === 'video');
        //     if (videoTrack) {
        //         me.on('call', (call) => {
        //             call.answer(stream);
        //             call.on('stream', (peerStream) => {
        //                 dispatch(addPeerAction(call.peer, peerStream));
        //             });
        //         });

        //         me.on('connection', (conn) => {
        //             conn.on('open', () => {
        //                 conn.peerConnection.getSenders().forEach((sender) => {
        //                     if (sender.track?.kind === 'video') {
        //                         sender.replaceTrack(videoTrack).catch((err) => console.error(err));
        //                     }
        //                 });
        //             });
        //         });
        //     }
        // }
    }

    const shareScreen = () => {
        if(screenSharingId) {
            navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(switchStream)
        } else {
            navigator.mediaDevices.getDisplayMedia({}).then(switchStream)
        }
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
        <RoomContext.Provider value={{ws, me, stream, peers, shareScreen}}>
            {children}
        </RoomContext.Provider>
    )
}
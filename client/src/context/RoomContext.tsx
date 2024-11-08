
import { createContext, useEffect, useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io as socketIOClient } from 'socket.io-client';
import Peer from 'peerjs';
import { v4 as uuidv4 } from 'uuid';
import { peersReducer } from '../reducers/PeerReducer';
import { addPeerStreamAction, addPeerNameAction, removePeerAction } from '../reducers/PeerActions';
import { IMessage } from '../components/types/chat';
import { chatReducer } from '../reducers/ChatReducer';
import { addHistoryAction, addMessageAction, toggleChatAction } from '../reducers/ChatActions';

const WS = ('http://localhost:6001');

interface RoomProviderProps {
    children: React.ReactNode
}

export const RoomContext = createContext<null | any>(null);

const ws = socketIOClient(WS);

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
    
    const navigate = useNavigate();

    const [me, setMe] = useState<Peer>();

    const [userName, setUserName] = useState(localStorage.getItem("userName") || "")

    const [stream, setStream] = useState<MediaStream>();
    
    const [peers, dispatch] = useReducer(peersReducer, {})

    const [chat, chatDispatch] = useReducer(chatReducer, {
        messages: [],
        isChatOpen: false
    })

    const [screenSharingId, setScreenSharingId] = useState<string>("")

    const [roomId, setRoomId] = useState<string>("");

    const enterRoom = ({ roomId }: { roomId: string}) => {
        console.log({roomId});
        navigate(`/room/${roomId}`);
    }

    const getUsers = ({ participants } : { participants: string[]}) => {
        console.log({participants});
    }

    const removePeer = (peerId: string) => {
        dispatch(removePeerAction(peerId));
    }

    const switchStream = (stream: MediaStream) => {
        setStream(stream);
        setScreenSharingId(me?.id || "");


        Object.values(me?.connections).forEach((connection: any) => {
            const videoTrack: any = stream
                ?.getTracks()
                .find((track) => track.kind === "video");
            connection[0].peerConnection
                .getSenders()
                .find((sender: any) => sender.track.kind === "video")
                .replaceTrack(videoTrack)
                .catch((err: any) => console.error(err));
        });
    }

    const shareScreen = () => {
        if(screenSharingId) {
            navigator.mediaDevices
                .getUserMedia({video: true, audio: true})
                .then(switchStream)
        } else {
            navigator.mediaDevices
                .getDisplayMedia({})
                .then(switchStream)
        }
    }

    const sendMessage = (message: string) => {
        const messageData: IMessage = {
            content: message,
            timestamp: new Date().getTime(),
            author: me?.id,
        };
        chatDispatch(addMessageAction(messageData));

        ws.emit('send-message', roomId, messageData)
    }

    const addMessage = (message: IMessage) => {
        console.log("new message", message);
        chatDispatch(addMessageAction(message));
    }
    
    const addHistory = (message: IMessage[]) => {
        chatDispatch(addHistoryAction(message));
    }

    const toggleChat = () => {
        chatDispatch(toggleChatAction(!chat.isChatOpen));
    }

    useEffect(() => {
        localStorage.setItem("userName", userName);
        // console.log("userName", userName);
    }, [userName]);

    useEffect(() => {

        const savedId = localStorage.getItem("userId");

        const meId = savedId || uuidv4();

        localStorage.setItem("userId", meId);
        console.log({savedId, meId});
        const peer = new Peer(meId, {
            host: "videochat-project.onrender.com",
            secure: true,     
        });
        setMe(peer);

        try {
            navigator.mediaDevices
                .getUserMedia({ video: true, audio: true })
                .then((stream) => {
                    setStream(stream);
                })
        } catch (error) {
           console.error(error); 
        }

        ws.on('room-created', enterRoom);
        ws.on('get-users', getUsers);
        ws.on('user-disconnected', removePeer);
        ws.on('user-started-sharing', (peerId) => setScreenSharingId(peerId));
        ws.on('user-stopped-sharing', () => setScreenSharingId(""));
        ws.on('add-message', addMessage);
        ws.on('get-messages', addHistory);

        return () => {
            ws.off('room-created');
            ws.off('user-joined');
            ws.off('get-users');
            ws.off('user-disconnected');
            ws.off('user-started-sharing');
            ws.off('user-stopped-sharing');
            ws.off('add-message');
        }
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (screenSharingId) {
            ws.emit("start-sharing", { peerId: screenSharingId, roomId})
        } else {
            ws.emit("stop-sharing");
        }
    }, [screenSharingId, roomId])

    useEffect(() => {
        if(!me) return;
        if(!stream) return;

        ws.on('user-joined', ({ peerId, userName: name }) => {
            dispatch(addPeerNameAction(peerId, name));
            const call = me.call(peerId, stream, {
                metadata: {
                    userName
                }
            });
            call.on('stream',(peerStream) => {
                dispatch(addPeerStreamAction(peerId, peerStream));
            })
        });

        me.on('call', (call) => {
            const { userName } = call.metadata;
            dispatch(addPeerNameAction(call.peer, userName));
            call.answer(stream);
            call.on('stream',(peerStream) => {
                dispatch(addPeerStreamAction(call.peer, peerStream));
            })
        });
        
    }, [me, stream, userName]);

    console.log({ peers })

    return (
        <RoomContext.Provider 
            value={{
                ws, 
                me, 
                stream, 
                peers,
                chat, 
                shareScreen, 
                screenSharingId, 
                setRoomId,
                sendMessage,
                toggleChat,
                userName,
                setUserName
            }}
        >
            {children}
        </RoomContext.Provider>
    )
}
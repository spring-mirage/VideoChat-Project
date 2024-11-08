import { ADD_PEER_STREAM, ADD_PEER_NAME, REMOVE_PEER } from "./PeerActions";

export type PeerState = Record<string, 
    { 
        stream?: MediaStream;
        userName?: string;
        peerId: string;
    }
>

type PeerAction =
    |   {
            type: typeof ADD_PEER_STREAM;
            payload: { peerId: string; stream: MediaStream };
        }
    |   {
            type: typeof ADD_PEER_NAME;
            payload: { peerId: string; userName: string };
        }
    |   {
            type: typeof REMOVE_PEER;
            payload: { peerId: string };
        };


export const peersReducer = (state: PeerState, action: PeerAction) => {
    switch (action.type) {
        case ADD_PEER_STREAM:
            return {
                ...state,
                [action.payload.peerId]: {
                    ...state[action.payload.peerId],
                    stream: action.payload.stream
                }
            };

        case ADD_PEER_NAME:
            return {
                ...state,
                [action.payload.peerId]: {
                    ...state[action.payload.peerId],
                    userName: action.payload.userName,
                },
            };

        case REMOVE_PEER:
            const { [action.payload.peerId]: deleted, ...rest } = state;
            return rest;

        default:
            return state;
    }
}

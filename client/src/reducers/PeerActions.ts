export const ADD_PEER_STREAM = "ADD_PEER_STREAM" as const;
export const ADD_PEER_NAME = "ADD_PEER_NAME" as const;
export const REMOVE_PEER = "REMOVE_PEER" as const;

export const addPeerStreamAction = (peerId: string, stream: MediaStream) => ({
  type: ADD_PEER_STREAM,
  payload: { peerId, stream },
});

export const addPeerNameAction = (peerId: string, userName: string) => ({
  type: ADD_PEER_NAME,
  payload: { peerId, userName },
});

export const removePeerAction = (peerId: string) => ({
    type: REMOVE_PEER,
    payload: { peerId },
});
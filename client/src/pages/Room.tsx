import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom"
import { RoomContext } from "../context/RoomContext";
import { VideoPlayer } from "../components/VideoPlayer";
import { PeerState } from "../context/PeerReducer";
import { ShareScreenButton } from "../components/ShareScreenButton";

export const Room = () => {

  const { id } = useParams();
  const { ws, me, stream, peers, shareScreen, screenSharingId, setRoomId } = useContext(RoomContext)
  useEffect(() => {
    if(me) ws.emit("join-room", {roomId: id, peerId: me._id})
  }, [id, me, ws])

  useEffect(() => {
    setRoomId(id)
  }, [id, setRoomId])
  
  console.log({screenSharingId});

  const screenSharingVideo = screenSharingId === me?.id ? stream : peers[screenSharingId]?.stream;

  const { [screenSharingId]: sharing, ...peersToShow } = peers;
  
  return (
    <div>
      Room id: {id}
      <div className="flex">
        {screenSharingId && 
          <div className="w-4/5 pr-4">
            <VideoPlayer stream={screenSharingVideo}/>
          </div>
        }
        <div className={`grid gap-4 ${screenSharingVideo ? "w-1/5 grid-cols-1" : "grid-cols-4"}`}>
          {screenSharingId !== me?.id && <VideoPlayer stream={stream}/>}
          { Object.values(peersToShow as PeerState).map((peer) => (
            <VideoPlayer  stream={peer.stream} />
          ))}
        </div>
      </div>
      <div className="fixed bottom-0 p-6 w-full flex justify-center border bg-white">
        <ShareScreenButton onClick={shareScreen}/>
      </div>
    </div>
  )
}
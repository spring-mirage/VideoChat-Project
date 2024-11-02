import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom"
import { RoomContext } from "../context/RoomContext";
import { VideoPlayer } from "../components/VideoPlayer";
import { PeerState } from "../context/PeerReducer";
import { ShareScreenButton } from "../components/ShareScreenButton";

export const Room = () => {

  const { id } = useParams();
  const { ws, me, stream, peers, shareScreen } = useContext(RoomContext)
  useEffect(() => {
    if(me) ws.emit("join-room", {roomId: id, peerId: me._id})
  }, [id, me, ws])
  
  return (
    <div>
      Room id: {id}
      <div className="grid grid-cols-4 gap-4">
        <VideoPlayer stream={stream}/>
        { Object.entries(peers as PeerState).map(([peerId, peer]) => {
          return (
            <VideoPlayer key={peerId} stream={peer.stream} />
          )
        })}
      </div>
      <div className="fixed bottom-0 p-6 w-full flex justify-center border">
        <ShareScreenButton onClick={shareScreen}/>
      </div>
    </div>
  )

  // return (
  //   <div>
  //     Room id: {id}
  //     <div className="grid grid-cols-4 gap-4">
  //       <VideoPlayer stream={stream}/>
  //       { Object.values(peers as PeerState).map((peer) => {
  //         return (
  //           <VideoPlayer stream={peer.stream} />
  //         )
  //       })}
  //     </div>
  //     <div className="fixed bottom-0 p-6 w-full flex justify-center border">
  //       <ShareScreenButton onClick={shareScreen}/>
  //     </div>
  //   </div>
  // )
}
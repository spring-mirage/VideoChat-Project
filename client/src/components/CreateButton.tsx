import { useContext } from "react"
import { RoomContext } from "../context/RoomContext"

export const Join: React.FC = () => {
  const { ws } = useContext(RoomContext);
  const createRoom = () => {
    ws.emit('create-room');
  }

  return (
    <button onClick={createRoom} className='bg-emerald-300 py-2 px-8 rounded-lg text-xl hover:bg-emerald-600 hover:text-white font-semibold'>
      Start new Meeting
    </button>
  );
};
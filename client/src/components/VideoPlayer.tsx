import { useEffect, useRef } from "react";

export const VideoPlayer: React.FC<{ stream: MediaStream }> = ({ stream }) => {
    
    const videoRef = useRef<HTMLVideoElement>(null);
    return (
        useEffect(() => {
           if (videoRef.current) {
               videoRef.current.srcObject = stream;
           } 
        }, [stream]),
        <video ref={videoRef} autoPlay muted className="rounded-lg"/>
    )
}

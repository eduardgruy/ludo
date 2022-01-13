import React, { useState, useEffect } from "react";

const useAudio = (url: any) => {
    const [audio] = useState(new Audio(url));
    const [playing, setPlaying] = useState(false);

    const toggle = () => setPlaying(!playing);

    useEffect(() => {
        playing ? audio.play() : audio.pause();
    },
        [playing]
    );

    useEffect(() => {
        audio.addEventListener('ended', () => setPlaying(false));
        return () => {
            audio.removeEventListener('ended', () => setPlaying(false));
        };
    }, []);

    return [playing, toggle];
};

const Player = ({ url }: any) => {
    const [playing, toggle] = useAudio(url);

    return (
                    

        <div>
            <button onClick={() => {
                //@ts-ignore
                toggle()}}>{playing ? "Pause music" : "Play music"}</button>
        </div>
    );
};

export default Player;
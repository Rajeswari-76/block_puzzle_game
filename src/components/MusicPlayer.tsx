import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, SkipForward, SkipBack, Music, Volume2 } from 'lucide-react';
import { GlitchText } from './GlitchText';

const SONGS = [
  {
    id: 1,
    title: "NEURAL_SYNTH_O1",
    artist: "CORE_PROCESSOR",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "#00ffff"
  },
  {
    id: 2,
    title: "EMPTY_VOID_LOOP",
    artist: "SYSTEM_ERROR",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "#ff00ff"
  },
  {
    id: 3,
    title: "DATA_STREAM_ALPHA",
    artist: "BYTE_BENDER",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "#f0f000"
  }
];

export const MusicPlayer: React.FC = () => {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSong = SONGS[currentSongIndex];

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    setCurrentSongIndex((prev) => (prev + 1) % SONGS.length);
    setIsPlaying(true);
  };

  const skipBackward = () => {
    setCurrentSongIndex((prev) => (prev - 1 + SONGS.length) % SONGS.length);
    setIsPlaying(true);
  };

  useEffect(() => {
    if (isPlaying) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
  }, [currentSongIndex, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const value = (audio.currentTime / audio.duration) * 100;
      setProgress(value || 0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', skipForward);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', skipForward);
    };
  }, []);

  return (
    <div className="w-full max-w-[320px] p-8 border border-neon-cyan/50 bg-black/80 relative overflow-hidden">
      <audio ref={audioRef} src={currentSong.url} />

      <div className="flex flex-col gap-8">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 border border-neon-cyan/40 flex items-center justify-center bg-white/5 relative">
            <Music size={32} className={isPlaying ? "text-neon-cyan opacity-80" : "text-white/20"} />
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,255,0.05)_2px,rgba(0,255,255,0.05)_4px)]" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="text-sm font-bold truncate leading-none uppercase tracking-[0.2em] text-neon-cyan mb-2">
              {currentSong.title}
            </h3>
            <p className="text-[10px] text-neon-magenta opacity-70 tracking-widest uppercase font-mono">{currentSong.artist}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-[2px] bg-white/10 relative">
            <motion.div 
              className="absolute top-0 left-0 h-full bg-neon-cyan/80 shadow-[0_0_8px_rgba(0,255,255,0.8)]"
              style={{ width: `${progress}%` }}
              transition={{ type: "spring", bounce: 0, duration: 0.1 }}
            />
          </div>
          <div className="flex justify-between text-[8px] opacity-40 uppercase tracking-[0.2em] font-mono">
            <span>00:DATA</span>
            <span>SYNC_COMPLETE</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-10">
          <button onClick={skipBackward} className="text-white hover:text-neon-cyan transition-colors transform active:scale-90">
            <SkipBack size={24} />
          </button>
          <button 
            onClick={togglePlay}
            className="w-14 h-14 flex items-center justify-center bg-neon-cyan rounded-full shadow-[0_0_25px_#00ffff] hover:scale-105 transition-transform text-black active:scale-95"
          >
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
          <button onClick={skipForward} className="text-white hover:text-neon-cyan transition-colors transform active:scale-90">
            <SkipForward size={24} />
          </button>
        </div>

        <div className="flex items-center gap-3 opacity-20 hover:opacity-40 transition-opacity">
          <Volume2 size={12} />
          <div className="flex-1 h-[1px] bg-white/30 relative">
             <div className="absolute left-0 top-0 h-full w-2/3 bg-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

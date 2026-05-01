import React, { useState } from 'react';
import { motion } from 'motion/react';
import { PuzzleGame } from './components/PuzzleGame';
import { MusicPlayer } from './components/MusicPlayer';
import { GlitchText } from './components/GlitchText';
import { Terminal, Database, Activity, Cpu } from 'lucide-react';

export default function App() {
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen bg-black text-neon-cyan selection:bg-neon-magenta selection:text-black overflow-hidden noise-bg">
      {/* Background Grid/Matrix Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="h-full w-full bg-[linear-gradient(90deg,rgba(0,255,255,.07)_1px,transparent_1px),linear-gradient(rgba(0,255,255,.07)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      {/* Main Content Area */}
      <main className="container mx-auto h-screen flex flex-col md:grid md:grid-cols-[250px_1fr_250px] items-center gap-12 px-8 relative z-10">
        
        {/* Left - Score Board */}
        <div className="flex flex-col items-center md:items-start gap-4">
           <h1 className="text-xs tracking-[0.4em] uppercase opacity-40 font-mono">SYNC_STATUS</h1>
           <div className="border border-neon-cyan/50 p-2 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
             <div className="border border-neon-cyan/30 px-8 py-6 bg-black flex flex-col items-center justify-center min-w-[200px]">
               <div className="text-[10px] text-neon-magenta mb-3 tracking-[0.3em] font-mono">CURRENT_SCORE</div>
               <span className="text-5xl font-bold tabular-nums neon-text leading-none tracking-tighter">
                 {score.toString().padStart(6, '0')}
               </span>
             </div>
           </div>
        </div>

        {/* Center - Game */}
        <div className="flex flex-col items-center justify-center relative w-full pt-12">
          <PuzzleGame onScoreChange={setScore} />
        </div>

        {/* Right - Music Player */}
        <div className="w-full flex justify-center md:justify-end">
           <MusicPlayer />
        </div>
      </main>

      {/* Decorative Fullscreen Overlay Effects */}
      <div className="fixed inset-0 pointer-events-none z-[100] border-[40px] border-black/20 mix-blend-overlay" />
      <div className="fixed top-0 left-0 w-full h-[1px] bg-neon-magenta/30 animate-[glitch-skew_3s_infinite]" />
      <div className="fixed bottom-0 left-0 w-full h-[1px] bg-neon-cyan/30 animate-[glitch-skew_4s_infinite_reverse]" />
    </div>
  );
}

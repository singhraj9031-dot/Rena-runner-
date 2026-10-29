import React from 'react';
import { Play, RotateCcw, User, Home, Volume2, VolumeX, Music, LifeBuoy, ShieldCheck } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenCustomizer: () => void;
  onOpenSupport: () => void;
  onOpenLegal: () => void;
  onHome: () => void;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenCustomizer,
  onOpenSupport,
  onOpenLegal,
  onHome,
  sfxEnabled,
  musicEnabled,
  onToggleSfx,
  onToggleMusic,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Title */}
        <h2 className="font-arcade text-3xl font-black text-amber-400 tracking-wider mb-2">
          GAME PAUSED
        </h2>
        <p className="text-xs text-slate-400 mb-6">Take a breather, runner!</p>

        {/* Buttons List */}
        <div className="flex flex-col gap-3 w-full">
          {/* Resume */}
          <button
            onClick={() => {
              soundManager.playClickSound();
              onResume();
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-arcade text-lg font-black py-3.5 rounded-2xl shadow-lg cursor-pointer transition transform active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            RESUME RUN
          </button>

          {/* Restart */}
          <button
            onClick={() => {
              soundManager.playClickSound();
              onRestart();
            }}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-2xl border border-slate-700 cursor-pointer transition"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </button>

          {/* Customize Character */}
          <button
            onClick={() => {
              soundManager.playClickSound();
              onOpenCustomizer();
            }}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold py-3 rounded-2xl border border-cyan-500/40 cursor-pointer transition"
          >
            <User className="w-4 h-4 text-cyan-400" />
            Customize Runner
          </button>

          {/* Support & Legal Row */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={() => {
                soundManager.playClickSound();
                onOpenSupport();
              }}
              className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold py-2.5 rounded-xl border border-amber-500/40 text-xs cursor-pointer transition"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
              Support
            </button>

            <button
              onClick={() => {
                soundManager.playClickSound();
                onOpenLegal();
              }}
              className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold py-2.5 rounded-xl border border-slate-700 text-xs cursor-pointer transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Credits & Legal
            </button>
          </div>

          {/* Home Title Screen */}
          <button
            onClick={() => {
              soundManager.playClickSound();
              onHome();
            }}
            className="w-full flex items-center justify-center gap-2 bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white font-bold py-3 rounded-2xl border border-slate-800 cursor-pointer transition"
          >
            <Home className="w-4 h-4" />
            Main Menu
          </button>
        </div>

        {/* Audio Quick Toggles */}
        <div className="flex items-center justify-center gap-4 mt-5 pt-3.5 border-t border-slate-800 w-full">
          <button
            onClick={() => {
              soundManager.playClickSound();
              onToggleMusic();
            }}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer transition ${
              musicEnabled
                ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300'
                : 'border-slate-800 bg-slate-800/40 text-slate-500'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            Music {musicEnabled ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={() => {
              soundManager.playClickSound();
              onToggleSfx();
            }}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer transition ${
              sfxEnabled
                ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                : 'border-slate-800 bg-slate-800/40 text-slate-500'
            }`}
          >
            {sfxEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            SFX {sfxEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Professional Copyright Notice Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10.5px] text-slate-400 leading-snug">
          © 2026 Rena Runner Game. All Rights Reserved. Original Indie Arcade Creation.
        </div>
      </div>
    </div>
  );
};

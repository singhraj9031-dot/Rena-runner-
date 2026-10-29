import React from 'react';
import { Play, Sparkles, Volume2, VolumeX, Music, Sun, Moon, User, Edit3, LifeBuoy, ShieldCheck } from 'lucide-react';
import { CharacterConfig, ThemeMode } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface TitleScreenProps {
  onStart: () => void;
  onOpenCustomizer: () => void;
  onOpenNameEditor: () => void;
  onOpenSupport: () => void;
  onOpenLegal: () => void;
  characterConfig: CharacterConfig;
  theme: ThemeMode;
  onToggleTheme: () => void;
  highScore: number;
  sfxEnabled: boolean;
  musicEnabled: boolean;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenCustomizer,
  onOpenNameEditor,
  onOpenSupport,
  onOpenLegal,
  characterConfig,
  theme,
  onToggleTheme,
  highScore,
  sfxEnabled,
  musicEnabled,
  onToggleSfx,
  onToggleMusic,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-20">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full pointer-events-auto">
        {/* User Profile & Name Edit Pill */}
        <div className="flex items-center gap-1.5 bg-slate-900/85 border-2 border-amber-400/60 rounded-full pl-2 pr-3 py-1.5 shadow-lg">
          <button
            onClick={() => {
              soundManager.playClickSound();
              onOpenCustomizer();
            }}
            title="Open Character Customizer"
            className="flex items-center gap-2 cursor-pointer transition transform active:scale-95 text-left"
          >
            <div
              className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center font-bold text-white shadow-inner"
              style={{ backgroundColor: characterConfig.shirtColor }}
            >
              {characterConfig.username ? characterConfig.username.charAt(0).toUpperCase() : 'R'}
            </div>
            <div>
              <div className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider">Player</div>
              <div className="text-sm font-bold text-white leading-tight">
                {characterConfig.username || 'Rena Player'}
              </div>
            </div>
          </button>

          {/* Quick Edit Name Button */}
          <button
            onClick={() => {
              soundManager.playClickSound();
              onOpenNameEditor();
            }}
            title="Change Player Name"
            className="ml-1 p-1.5 rounded-full bg-slate-800 hover:bg-amber-500 text-slate-300 hover:text-slate-950 border border-slate-700 hover:border-amber-400 cursor-pointer transition transform active:scale-90"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Top Controls: Support, Audio & Theme */}
        <div className="flex items-center gap-2">
          {/* Prominent Support Button */}
          <button
            onClick={() => {
              soundManager.playClickSound();
              onOpenSupport();
            }}
            title="Help & Support (singhraj9031@gmail.com)"
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/35 hover:to-orange-500/35 border-2 border-amber-400/60 text-amber-300 rounded-full px-3.5 py-1.5 shadow-lg text-xs font-bold cursor-pointer transition transform active:scale-95"
          >
            <LifeBuoy className="w-4 h-4 text-amber-400" />
            <span>Support</span>
          </button>

          {/* Credits & Legal Button */}
          <button
            onClick={() => {
              soundManager.playClickSound();
              onOpenLegal();
            }}
            title="Credits & Legal Protection"
            className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/60 text-slate-300 hover:text-amber-300 rounded-full px-3 py-1.5 shadow-md text-xs font-bold cursor-pointer transition transform active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Legal</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-700/80 rounded-full px-3 py-1.5 shadow-lg">
            <button
              onClick={() => {
                soundManager.playClickSound();
                onToggleTheme();
              }}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              className="p-1.5 rounded-full text-slate-200 hover:text-amber-400 hover:bg-slate-800 cursor-pointer transition"
            >
              {theme === 'light' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
            </button>

            <button
              onClick={() => {
                soundManager.playClickSound();
                onToggleMusic();
              }}
              title={musicEnabled ? 'Mute Music' : 'Enable Music'}
              className="p-1.5 rounded-full text-slate-200 hover:text-cyan-400 hover:bg-slate-800 cursor-pointer transition"
            >
              <Music className={`w-4 h-4 ${musicEnabled ? 'text-cyan-400' : 'text-slate-500 line-through'}`} />
            </button>

            <button
              onClick={() => {
                soundManager.playClickSound();
                onToggleSfx();
              }}
              title={sfxEnabled ? 'Mute SFX' : 'Enable SFX'}
              className="p-1.5 rounded-full text-slate-200 hover:text-emerald-400 hover:bg-slate-800 cursor-pointer transition"
            >
              {sfxEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Bespoke Inline SVG Title Lockup */}
      <div className="flex flex-col items-center justify-center my-auto pointer-events-none text-center">
        <div className="relative">
          <svg className="w-[320px] sm:w-[460px] h-[110px] sm:h-[130px] filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
            <defs>
              <linearGradient id="renaTitleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffedd5" />
                <stop offset="35%" stopColor="#f59e0b" />
                <stop offset="70%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#9a3412" />
              </linearGradient>
              <linearGradient id="runnerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
              <filter id="shadowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.8" />
              </filter>
            </defs>
            {/* RENA */}
            <text
              x="50%"
              y="55"
              textAnchor="middle"
              className="font-arcade font-black text-5xl sm:text-6xl tracking-wider uppercase"
              fill="url(#renaTitleGrad)"
              stroke="#0f172a"
              strokeWidth="6"
              strokeLinejoin="round"
            >
              RENA
            </text>
            {/* RUNNER 3D */}
            <text
              x="50%"
              y="108"
              textAnchor="middle"
              className="font-arcade font-black text-3xl sm:text-4xl tracking-widest uppercase"
              fill="url(#runnerGrad)"
              stroke="#0f172a"
              strokeWidth="5"
              strokeLinejoin="round"
            >
              RUNNER GAME
            </text>
          </svg>
        </div>

        {/* High Score Badge */}
        {highScore > 0 && (
          <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-amber-400/80 rounded-full px-4 py-1.5 mt-2 shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs uppercase font-bold text-amber-300 tracking-wider">Top Record:</span>
            <span className="font-arcade text-lg font-bold text-white tabular-nums">
              {highScore.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Bottom CTA & Controls Area */}
      <div className="flex flex-col items-center gap-4 w-full pointer-events-auto">
        {/* Buttons Grid */}
        <div className="flex flex-wrap items-center justify-center gap-4 w-full max-w-md">
          {/* Main Start CTA */}
          <button
            onClick={() => {
              soundManager.playClickSound();
              onStart();
            }}
            className="flex-1 min-w-[200px] flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-arcade text-2xl font-black py-4 px-8 rounded-2xl shadow-[0_10px_25px_rgba(245,158,11,0.4)] border-b-4 border-amber-800 cursor-pointer transition transform active:scale-95 active:border-b-0 active:translate-y-1"
          >
            <Play className="w-7 h-7 fill-slate-950 text-slate-950" />
            START RUN
          </button>

          {/* Customize Character Locker */}
          <button
            onClick={() => {
              soundManager.playClickSound();
              onOpenCustomizer();
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-arcade text-base font-bold py-3.5 px-4 rounded-2xl border-2 border-cyan-500/50 shadow-lg cursor-pointer transition transform active:scale-95"
          >
            <User className="w-4 h-4 text-cyan-400" />
            CUSTOMIZE
          </button>

          {/* Support Button */}
          <button
            onClick={() => {
              soundManager.playClickSound();
              onOpenSupport();
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-amber-300 font-arcade text-base font-bold py-3.5 px-4 rounded-2xl border-2 border-amber-500/40 shadow-lg cursor-pointer transition transform active:scale-95"
          >
            <LifeBuoy className="w-4 h-4 text-amber-400" />
            SUPPORT
          </button>
        </div>

        {/* Flat Minimal Control Hints */}
        <div className="bg-slate-900/80 border border-slate-700/60 rounded-full px-5 py-2 text-xs font-semibold text-slate-300 shadow-md">
          <span className="text-amber-400 font-bold">A / D</span> or Swipe to Move ·{' '}
          <span className="text-cyan-400 font-bold">W / Space</span> to Jump ·{' '}
          <span className="text-rose-400 font-bold">S</span> to Slide
        </div>

        {/* Clean Professional Copyright & Licensing Footer Notice */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2.5 text-center text-[11px] text-slate-400 pointer-events-auto">
          <span>© 2026 Rena Runner Game. All Rights Reserved. Original Indie Arcade Creation.</span>
          <button
            onClick={() => {
              soundManager.playClickSound();
              onOpenLegal();
            }}
            title="View Credits, Originality Proof & Legal Rights"
            className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer transition"
          >
            <ShieldCheck className="w-3.5 h-3.5 inline text-emerald-400" />
            Credits & Legal
          </button>
        </div>
      </div>
    </div>
  );
};

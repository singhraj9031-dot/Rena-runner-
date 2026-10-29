import React, { useState } from 'react';
import { RotateCcw, Trophy, Sparkles, User, Home, Heart, Shield, Edit3, LifeBuoy } from 'lucide-react';
import { GameStats } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface GameOverModalProps {
  stats: GameStats;
  playerName: string;
  onOpenNameEditor: () => void;
  onOpenSupport: () => void;
  onPlayAgain: () => void;
  onRevive: () => void;
  onOpenCustomizer: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  playerName,
  onOpenNameEditor,
  onOpenSupport,
  onPlayAgain,
  onRevive,
  onOpenCustomizer,
  onHome,
}) => {
  const [hasUsedRevive, setHasUsedRevive] = useState(false);
  const canRevive = !hasUsedRevive && stats.coins >= 15;
  const isRecord = stats.newHighScoreAchieved || stats.score >= stats.highScore;

  const handleReviveClick = () => {
    soundManager.playPowerUpSound();
    setHasUsedRevive(true);
    onRevive();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Top Out Banner */}
        <div className="mb-4">
          <div className="inline-block bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full px-4 py-1 text-xs font-black uppercase tracking-wider mb-2">
            RUNNER CRASHED
          </div>
          <h2 className="font-arcade text-4xl sm:text-5xl font-black text-white tracking-wide">
            GAME OVER
          </h2>
        </div>

        {/* High Score Celebration Badge */}
        {isRecord && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-arcade text-sm font-black px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(245,158,11,0.6)] mb-4 animate-bounce">
            <Sparkles className="w-4 h-4 fill-slate-950" />
            NEW RECORD ACHIEVED!
            <Sparkles className="w-4 h-4 fill-slate-950" />
          </div>
        )}

        {/* Score Card Display */}
        <div className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl p-5 mb-5 space-y-3">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Runner:</span>
              <span className="text-sm font-bold text-amber-300">{playerName}</span>
            </div>
            <button
              onClick={() => {
                soundManager.playClickSound();
                onOpenNameEditor();
              }}
              className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 cursor-pointer transition"
            >
              <Edit3 className="w-3 h-3 text-amber-400" />
              Change Name
            </button>
          </div>

          <div className="text-center pt-1">
            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">Final Score</div>
            <div className="font-arcade text-4xl sm:text-5xl font-black text-amber-300 tabular-nums">
              {stats.score.toLocaleString()}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 text-center">
            <div>
              <div className="text-[11px] font-bold text-slate-400">BEST RECORD</div>
              <div className="font-arcade text-base font-bold text-white tabular-nums">
                {stats.highScore.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400">COINS</div>
              <div className="font-arcade text-base font-bold text-amber-400 tabular-nums">
                ★ {stats.coins.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400">DISTANCE</div>
              <div className="font-arcade text-base font-bold text-cyan-300 tabular-nums">
                {stats.distance.toLocaleString()}m
              </div>
            </div>
          </div>
        </div>

        {/* Revive Button (Second Chance with coins) */}
        {canRevive && (
          <button
            onClick={handleReviveClick}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-arcade text-base font-black py-3 rounded-2xl shadow-lg border-2 border-cyan-400/50 mb-3 cursor-pointer transition transform active:scale-95"
          >
            <Shield className="w-5 h-5 text-cyan-200" />
            SECOND CHANCE (15 COINS)
          </button>
        )}

        {/* Primary Play Again */}
        <button
          onClick={() => {
            soundManager.playClickSound();
            onPlayAgain();
          }}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-arcade text-xl font-black py-4 rounded-2xl shadow-[0_8px_20px_rgba(245,158,11,0.4)] border-b-4 border-amber-800 cursor-pointer transition transform active:scale-95 active:border-b-0"
        >
          <RotateCcw className="w-6 h-6 stroke-[3]" />
          PLAY AGAIN
        </button>

        {/* Secondary Buttons */}
        <div className="grid grid-cols-3 gap-2 w-full mt-3">
          <button
            onClick={() => {
              soundManager.playClickSound();
              onOpenCustomizer();
            }}
            className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold py-2.5 rounded-xl border border-cyan-500/40 text-xs cursor-pointer transition"
          >
            <User className="w-3.5 h-3.5" />
            Locker
          </button>

          <button
            onClick={() => {
              soundManager.playClickSound();
              onOpenSupport();
            }}
            className="flex items-center justify-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-amber-300 font-bold py-2.5 rounded-xl border border-amber-500/40 text-xs cursor-pointer transition"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            Support
          </button>

          <button
            onClick={() => {
              soundManager.playClickSound();
              onHome();
            }}
            className="flex items-center justify-center gap-1.5 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white font-bold py-2.5 rounded-xl border border-slate-800 text-xs cursor-pointer transition"
          >
            <Home className="w-3.5 h-3.5" />
            Menu
          </button>
        </div>
      </div>
    </div>
  );
};

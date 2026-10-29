import React from 'react';
import { Pause, Sparkles, Shield, Zap, Magnet, Footprints, ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { GameStats } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface HUDOverlayProps {
  stats: GameStats;
  onPause: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onJump: () => void;
  onSlide: () => void;
}

export const HUDOverlay: React.FC<HUDOverlayProps> = ({
  stats,
  onPause,
  onMoveLeft,
  onMoveRight,
  onJump,
  onSlide,
}) => {
  const isGlowing = stats.highScoreGlow;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-20 overflow-hidden">
      {/* Top Status Bar (Low occlusion perimeter cluster) */}
      <div className="flex items-start justify-between w-full">
        {/* Top-Left: Score & High Score */}
        <div className="flex flex-col gap-1">
          <div
            className={`transition-all duration-300 rounded-2xl px-4 py-2 border ${
              isGlowing
                ? 'bg-amber-950/80 border-amber-400 glow-gold'
                : 'bg-slate-900/80 border-slate-700/80'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Score
              </span>
              {stats.multiplier > 1 && (
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-md animate-bounce">
                  {stats.multiplier}X
                </span>
              )}
            </div>

            <div
              className={`font-arcade font-black text-2xl sm:text-3xl tabular-nums tracking-wide transition-colors ${
                isGlowing ? 'text-amber-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]' : 'text-white'
              }`}
            >
              {stats.score.toLocaleString()}
            </div>
          </div>

          {/* High Score Label */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900/70 border border-slate-800 rounded-full text-xs font-semibold text-slate-300 self-start">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 text-[11px]">Best:</span>
            <span className="font-bold text-amber-300 tabular-nums">
              {stats.highScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Top-Right: Coins, PowerUps & Pause */}
        <div className="flex flex-col items-end gap-2.5">
          <div className="flex items-center gap-2">
            {/* Coins Counter */}
            <div className="flex items-center gap-2 bg-slate-900/85 border border-amber-500/50 rounded-full px-4 py-1.5 shadow-md">
              <div className="w-5 h-5 rounded-full bg-amber-400 border border-amber-200 flex items-center justify-center shadow-inner">
                <span className="text-amber-950 text-xs font-black">★</span>
              </div>
              <span className="font-arcade text-lg font-black text-amber-300 tabular-nums">
                {stats.coins.toLocaleString()}
              </span>
            </div>

            {/* Pause Button */}
            <button
              onClick={() => {
                soundManager.playClickSound();
                onPause();
              }}
              className="pointer-events-auto p-2.5 rounded-full bg-slate-900/85 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white shadow-lg cursor-pointer transition transform active:scale-90"
              title="Pause Game (Esc)"
            >
              <Pause className="w-5 h-5 fill-current" />
            </button>
          </div>

          {/* Active Power-Ups Stack */}
          <div className="flex flex-col gap-1.5 items-end">
            {/* Magnet */}
            {stats.powerUps.magnet > 0 && (
              <div className="flex items-center gap-2 bg-rose-950/90 border border-rose-500/80 rounded-xl px-3 py-1 shadow-md">
                <Magnet className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold text-rose-200">MAGNET</span>
                <span className="text-xs font-arcade font-bold text-rose-300 tabular-nums">
                  {Math.ceil(stats.powerUps.magnet)}s
                </span>
              </div>
            )}

            {/* 2X Multiplier */}
            {stats.powerUps.multiplier > 0 && (
              <div className="flex items-center gap-2 bg-amber-950/90 border border-amber-500/80 rounded-xl px-3 py-1 shadow-md">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-amber-200">2X BOOST</span>
                <span className="text-xs font-arcade font-bold text-amber-300 tabular-nums">
                  {Math.ceil(stats.powerUps.multiplier)}s
                </span>
              </div>
            )}

            {/* Shield */}
            {stats.powerUps.shield && (
              <div className="flex items-center gap-2 bg-cyan-950/90 border border-cyan-400/80 rounded-xl px-3 py-1 shadow-md">
                <Shield className="w-4 h-4 text-cyan-300 fill-cyan-400/20" />
                <span className="text-xs font-bold text-cyan-200">SHIELD</span>
              </div>
            )}

            {/* Super Jump */}
            {stats.powerUps.superJump > 0 && (
              <div className="flex items-center gap-2 bg-emerald-950/90 border border-emerald-500/80 rounded-xl px-3 py-1 shadow-md">
                <Footprints className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-200">SUPER JUMP</span>
                <span className="text-xs font-arcade font-bold text-emerald-300 tabular-nums">
                  {Math.ceil(stats.powerUps.superJump)}s
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center High Score Milestone Celebration Banner */}
      {isGlowing && (
        <div className="self-center animate-bounce transition-all duration-300">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 font-arcade text-base sm:text-xl font-black px-6 py-2 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.85)] border-2 border-white tracking-widest uppercase flex items-center gap-2">
            <Sparkles className="w-5 h-5 fill-slate-950" />
            NEW HIGH SCORE!
            <Sparkles className="w-5 h-5 fill-slate-950" />
          </div>
        </div>
      )}

      {/* Bottom On-Screen Touch Controls (Mobile Friendly, Low Occlusion) */}
      <div className="flex items-end justify-between w-full pointer-events-auto sm:opacity-75 sm:hover:opacity-100 transition-opacity">
        {/* Left & Right Steering Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onMoveLeft();
            }}
            className="w-14 h-14 rounded-2xl bg-slate-900/60 active:bg-amber-500 border-2 border-slate-700/80 active:border-amber-400 flex items-center justify-center text-slate-200 active:text-slate-950 shadow-lg cursor-pointer transition transform active:scale-90"
            aria-label="Move Left"
          >
            <ArrowLeft className="w-7 h-7 stroke-[2.5]" />
          </button>

          <button
            onClick={() => {
              onMoveRight();
            }}
            className="w-14 h-14 rounded-2xl bg-slate-900/60 active:bg-amber-500 border-2 border-slate-700/80 active:border-amber-400 flex items-center justify-center text-slate-200 active:text-slate-950 shadow-lg cursor-pointer transition transform active:scale-90"
            aria-label="Move Right"
          >
            <ArrowRight className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Jump & Slide Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              onSlide();
            }}
            className="w-14 h-14 rounded-2xl bg-slate-900/60 active:bg-rose-500 border-2 border-slate-700/80 active:border-rose-400 flex items-center justify-center text-slate-200 active:text-slate-950 shadow-lg cursor-pointer transition transform active:scale-90"
            aria-label="Slide Under"
          >
            <ArrowDown className="w-7 h-7 stroke-[2.5]" />
          </button>

          <button
            onClick={() => {
              onJump();
            }}
            className="w-16 h-16 rounded-2xl bg-slate-900/60 active:bg-cyan-500 border-2 border-slate-700/80 active:border-cyan-400 flex items-center justify-center text-slate-200 active:text-slate-950 shadow-lg cursor-pointer transition transform active:scale-90"
            aria-label="Jump Over"
          >
            <ArrowUp className="w-8 h-8 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Award,
  Code,
  Music,
  Box,
  CheckCircle,
  FileText,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface LegalModalProps {
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'assets' | 'disclaimer'>('overview');

  const handleCopyNotice = () => {
    soundManager.playClickSound();
    const noticeText = `© 2026 Rena Runner Game. All Rights Reserved. Original Indie Arcade Creation.
All 3D models, audio synthesizers, UI designs, and game logic are 100% original and procedural.`;
    navigator.clipboard?.writeText(noticeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-none animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-amber-400/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h2 className="font-arcade text-lg font-black text-white tracking-wide flex items-center gap-2">
                CREDITS & LEGAL PROTECTION
              </h2>
              <p className="text-[11px] text-slate-400">
                100% Safe, Original & Copyright-Free Certification
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playClickSound();
              onClose();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-800 bg-slate-950/60">
          {[
            { id: 'overview', label: 'Copyright & Notice', icon: Award },
            { id: 'assets', label: 'Asset Provenance', icon: Box },
            { id: 'disclaimer', label: 'Fair Use & Independence', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClickSound();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-slate-200 flex-1">
          {/* TAB 1: OVERVIEW & COPYRIGHT NOTICE */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Official Copyright Shield Banner */}
              <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-400/50 rounded-2xl p-4 text-center space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                  Official Protection Notice
                </div>
                <div className="font-arcade text-lg font-black text-white">
                  © 2026 Rena Runner Game. All Rights Reserved.
                </div>
                <div className="text-xs font-semibold text-amber-300">
                  Original Indie Arcade Creation
                </div>
                <button
                  onClick={handleCopyNotice}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer mt-1"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? 'Copied Notice!' : 'Copy Copyright Statement'}
                </button>
              </div>

              {/* Safe & Clear Certification */}
              <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  100% Copyright-Free Guarantee
                </h4>
                <p>
                  Every element of <strong>Rena Runner Game</strong> has been designed, coded, and generated from scratch in pure source code. There are no imported commercial 3D assets, no copyrighted audio recordings, and no third-party game trademarks.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Streamer & Video Friendly</div>
                      <div className="text-[10px] text-slate-400">Zero DMCA strikes for YouTube, Twitch, or TikTok gameplay.</div>
                    </div>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Zero Third-Party Models</div>
                      <div className="text-[10px] text-slate-400">No scraped or pirated geometry assets.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ASSET PROVENANCE & ARCHITECTURE */}
          {activeTab === 'assets' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
                {/* 3D Geometry */}
                <div className="flex items-start gap-3 pb-3 border-b border-slate-800/80">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                    <Box className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <h5 className="font-bold text-white text-sm">Procedural 3D Character & World Geometry</h5>
                    <p className="text-slate-300 mt-0.5">
                      The runner character (male & female rigs, hair styles, clothing, shoes, facial anatomy) and world entities (commuter trains, ramps, hurdles, coins, tracks, cityscapes) are assembled procedurally in code using <strong>Three.js BufferGeometry primitives</strong> (cylinders, spheres, boxes, cones) without referencing external <code>.glb</code>, <code>.fbx</code>, or <code>.obj</code> files.
                    </p>
                  </div>
                </div>

                {/* Web Audio */}
                <div className="flex items-start gap-3 pb-3 border-b border-slate-800/80">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 shrink-0 mt-0.5">
                    <Music className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <h5 className="font-bold text-white text-sm">Real-Time Procedural Audio Synthesizer</h5>
                    <p className="text-slate-300 mt-0.5">
                      All energetic sound effects (coin chimes, whooshes, jumps, slides, crashes, victory fanfares) and background groove tracks are synthesized mathematically in real-time via the <strong>HTML5 Web Audio API</strong>. No recorded <code>.mp3</code> or <code>.wav</code> audio files are stored or loaded.
                    </p>
                  </div>
                </div>

                {/* Typography & Code */}
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <Code className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <h5 className="font-bold text-white text-sm">Open Font & Vector Design</h5>
                    <p className="text-slate-300 mt-0.5">
                      Fonts: <em>Outfit</em> & <em>Fredoka</em> licensed under SIL Open Font License (OFL). Bespoke SVG title lockups and Lucide vector icons (permissive ISC license).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FAIR USE & INDEPENDENCE DISCLAIMER */}
          {activeTab === 'disclaimer' && (
            <div className="space-y-3.5 animate-in fade-in duration-150">
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h4 className="font-bold text-sm text-white">Fair Use & Independence Statement</h4>
                </div>
                <p>
                  <strong>Rena Runner Game</strong> is an independent, original interactive work. While inspired by the conventions and mechanics of the 3-lane endless runner video game genre, it is an entirely autonomous creation:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-300">
                  <li>It does not use, copy, or redistribute any software code, art assets, textures, 3D meshes, audio clips, or trademarks from any third-party commercial games (such as Subway Surfers, Temple Run, or any other commercial title).</li>
                  <li>All characters, names, styles, color palettes, commuter train obstacles, and environments are unique, copyright-free artistic expressions created specifically for Rena Runner Game.</li>
                  <li>Any similarities in generic runner mechanics (e.g., jumping over barriers, ducking under overhead obstacles, 3-lane dodge navigation) represent universal video game genre mechanics not subject to proprietary copyright monopoly.</li>
                </ul>
              </div>

              {/* Developer Rights */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 text-[11px] text-slate-400 text-center">
                Built with pride for high performance, accessibility, and zero copyright liability.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-900/95 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            © 2026 Rena Runner Game
          </div>
          <button
            onClick={() => {
              soundManager.playClickSound();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade text-sm font-bold shadow-md cursor-pointer transition transform active:scale-95"
          >
            I UNDERSTAND
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Check, User, Sparkles, Edit3 } from 'lucide-react';
import { CharacterConfig } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface NameEditorModalProps {
  currentConfig: CharacterConfig;
  onSaveName: (newName: string) => void;
  onClose: () => void;
}

const SUGGESTED_NAMES = [
  'SpeedyRena',
  'ShadowRunner',
  'TurboDash',
  'SkySurfer',
  'VibeQueen',
  'NitroSprint',
  'ElectroFlash',
  'CyberGhost',
  'ApexRacer',
  'NovaStrider',
];

export const NameEditorModal: React.FC<NameEditorModalProps> = ({
  currentConfig,
  onSaveName,
  onClose,
}) => {
  const [nameInput, setNameInput] = useState<string>(currentConfig.username || 'RenaPlayer');
  const [error, setError] = useState<string>('');

  const handleSave = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError('Please enter a valid runner name!');
      return;
    }
    if (trimmed.length > 16) {
      setError('Name must be 16 characters or fewer');
      return;
    }
    soundManager.playPowerUpSound();
    onSaveName(trimmed);
  };

  const handleSelectSuggestion = (suggested: string) => {
    soundManager.playClickSound();
    setNameInput(suggested);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-none animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-400/80 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
        {/* Header */}
        <div className="flex items-center justify-between w-full mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Edit3 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="font-arcade text-lg font-black text-white tracking-wide">
                CHANGE PLAYER NAME
              </h3>
              <p className="text-[11px] text-slate-400">Personalize your runner tag</p>
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

        {/* Character Avatar Preview Badge */}
        <div className="relative my-2">
          <div
            className="w-20 h-20 rounded-full border-4 border-amber-400 shadow-xl flex items-center justify-center text-3xl font-black text-white"
            style={{ backgroundColor: currentConfig.shirtColor }}
          >
            {nameInput.trim() ? nameInput.trim().charAt(0).toUpperCase() : 'R'}
          </div>
          <span className="absolute bottom-0 right-0 bg-slate-900 border-2 border-white rounded-full p-1 text-sm">
            {currentConfig.gender === 'female' ? '👧' : '👦'}
          </span>
        </div>

        {/* Input Field */}
        <div className="w-full mt-4 mb-2">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 text-left">
            Player Name (1–16 chars)
          </label>
          <div className="relative">
            <input
              type="text"
              autoFocus
              maxLength={16}
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
              }}
              placeholder="e.g. SpeedyRena"
              className="w-full bg-slate-800 border-2 border-slate-700 focus:border-amber-400 rounded-2xl px-4 py-3 text-white font-bold text-center text-lg outline-none transition shadow-inner"
            />
          </div>
          {error && <p className="text-xs text-rose-400 font-semibold mt-1.5">{error}</p>}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="w-full my-3">
          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Quick Suggestions:
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center max-h-24 overflow-y-auto p-1">
            {SUGGESTED_NAMES.map((sug) => (
              <button
                key={sug}
                onClick={() => handleSelectSuggestion(sug)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                  nameInput === sug
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500'
                }`}
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full mt-2">
          <button
            onClick={() => {
              soundManager.playClickSound();
              onClose();
            }}
            className="flex-1 py-3 rounded-2xl border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-sm cursor-pointer transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-2 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-arcade text-base font-black py-3 rounded-2xl shadow-lg cursor-pointer transition transform active:scale-95"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            SAVE NAME
          </button>
        </div>
      </div>
    </div>
  );
};

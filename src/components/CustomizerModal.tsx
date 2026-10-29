import React, { useState } from 'react';
import {
  X,
  Check,
  RotateCcw,
  Sparkles,
  User,
  Scissors,
  Smile,
  Shirt,
  Footprints,
  Palette,
} from 'lucide-react';
import {
  CharacterConfig,
  Gender,
  FaceShape,
  EyeStyle,
  EyebrowStyle,
  NoseStyle,
  HairStyle,
  ShirtStyle,
  PantsStyle,
} from '../types/game';
import { DEFAULT_FEMALE_CONFIG, DEFAULT_MALE_CONFIG } from '../game/CharacterMesh';
import { soundManager } from '../audio/soundManager';

interface CustomizerModalProps {
  currentConfig: CharacterConfig;
  onSave: (newConfig: CharacterConfig) => void;
  onClose: () => void;
  onPreviewChange: (previewConfig: CharacterConfig) => void;
}

type TabType = 'profile' | 'hair' | 'face' | 'clothes' | 'colors';

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  currentConfig,
  onSave,
  onClose,
  onPreviewChange,
}) => {
  const [config, setConfig] = useState<CharacterConfig>({ ...currentConfig });
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  const updateConfig = (patch: Partial<CharacterConfig>) => {
    const updated = { ...config, ...patch };
    setConfig(updated);
    onPreviewChange(updated);
  };

  const handleGenderSwitch = (gender: Gender) => {
    soundManager.playClickSound();
    const template = gender === 'female' ? DEFAULT_FEMALE_CONFIG : DEFAULT_MALE_CONFIG;
    const updated = {
      ...config,
      gender,
      hairStyle: template.hairStyle,
      shirtStyle: template.shirtStyle,
      shirtColor: template.shirtColor,
      pantsStyle: template.pantsStyle,
      pantsColor: template.pantsColor,
      shoeColor: template.shoeColor,
    };
    setConfig(updated);
    onPreviewChange(updated);
  };

  const handleReset = () => {
    soundManager.playClickSound();
    const defaults = config.gender === 'female' ? DEFAULT_FEMALE_CONFIG : DEFAULT_MALE_CONFIG;
    setConfig({ ...defaults, username: config.username });
    onPreviewChange({ ...defaults, username: config.username });
  };

  const handleRandomize = () => {
    soundManager.playPowerUpSound();
    const skinTones = ['#f8d0b0', '#fae2d0', '#e0ac69', '#c68642', '#8d5524', '#bae6fd'];
    const eyeColors = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#111827'];
    const hairColors = ['#0f172a', '#eab308', '#78350f', '#ef4444', '#06b6d4', '#ec4899', '#8b5cf6'];
    const shirtColors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#1e293b'];
    const pantsColors = ['#1e293b', '#0f172a', '#2563eb', '#475569', '#059669', '#7c3aed'];
    const shoeColors = ['#f59e0b', '#ef4444', '#06b6d4', '#10b981', '#ffffff', '#ec4899'];

    const maleHairs: HairStyle[] = ['anime_spike', 'street_fade', 'afro_puffs', 'beanie', 'surfer_flow'];
    const femaleHairs: HairStyle[] = ['high_ponytail', 'twin_buns', 'bob_bangs', 'long_curls', 'street_cap'];
    const hairs = config.gender === 'female' ? femaleHairs : maleHairs;

    const shirts: ShirtStyle[] = ['hoodie', 'tshirt', 'bomber', 'tank', 'cyber_jacket'];
    const pants: PantsStyle[] = ['baggy_jeans', 'cargo', 'track_pants', 'shorts', 'cyber_lowers'];
    const faces: FaceShape[] = ['round', 'oval', 'jawline', 'chibi'];

    const randomized: CharacterConfig = {
      ...config,
      skinColor: skinTones[Math.floor(Math.random() * skinTones.length)],
      eyeColor: eyeColors[Math.floor(Math.random() * eyeColors.length)],
      hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
      hairStyle: hairs[Math.floor(Math.random() * hairs.length)],
      shirtStyle: shirts[Math.floor(Math.random() * shirts.length)],
      shirtColor: shirtColors[Math.floor(Math.random() * shirtColors.length)],
      pantsStyle: pants[Math.floor(Math.random() * pants.length)],
      pantsColor: pantsColors[Math.floor(Math.random() * pantsColors.length)],
      shoeColor: shoeColors[Math.floor(Math.random() * shoeColors.length)],
      faceShape: faces[Math.floor(Math.random() * faces.length)],
    };

    setConfig(randomized);
    onPreviewChange(randomized);
  };

  // Color Swatch Picker helper
  const renderSwatches = (
    label: string,
    colors: string[],
    selected: string,
    onSelect: (c: string) => void
  ) => (
    <div className="mb-4">
      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => {
              soundManager.playClickSound();
              onSelect(c);
            }}
            className={`w-8 h-8 rounded-full border-2 cursor-pointer transition transform active:scale-90 flex items-center justify-center ${
              selected === c ? 'border-amber-400 scale-110 shadow-md ring-2 ring-amber-400/50' : 'border-slate-600 hover:border-slate-400'
            }`}
            style={{ backgroundColor: c }}
          >
            {selected === c && <Check className="w-4 h-4 text-white drop-shadow" />}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black font-arcade text-white tracking-wide">
                RUNNER CUSTOMIZATION
              </h2>
              <p className="text-xs text-slate-400">Style your 3D cartoon runner</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomize}
              title="Randomize Outfit"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold cursor-pointer transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Surprise
            </button>
            <button
              onClick={handleReset}
              title="Reset to Defaults"
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-800 bg-slate-950/60 overflow-x-auto">
          {[
            { id: 'profile', label: 'Identity', icon: User },
            { id: 'hair', label: 'Hairstyle', icon: Scissors },
            { id: 'face', label: 'Face & Eyes', icon: Smile },
            { id: 'clothes', label: 'Outfit', icon: Shirt },
            { id: 'colors', label: 'Color Palette', icon: Palette },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  soundManager.playClickSound();
                  setActiveTab(tab.id as TabType);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* TAB 1: IDENTITY (Gender & Username) */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Runner Name
                </label>
                <input
                  type="text"
                  maxLength={16}
                  value={config.username}
                  onChange={(e) => updateConfig({ username: e.target.value })}
                  placeholder="Enter custom username"
                  className="w-full bg-slate-800 border-2 border-slate-700 focus:border-amber-400 rounded-xl px-4 py-2.5 text-white font-semibold outline-none transition"
                />
              </div>

              {/* Gender Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Gender Specification
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleGenderSwitch('male')}
                    className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 font-arcade font-bold text-base cursor-pointer transition ${
                      config.gender === 'male'
                        ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-md'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl">👦</span>
                    Boy / Male
                  </button>

                  <button
                    onClick={() => handleGenderSwitch('female')}
                    className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 font-arcade font-bold text-base cursor-pointer transition ${
                      config.gender === 'female'
                        ? 'border-pink-400 bg-pink-950/40 text-pink-300 shadow-md'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl">👧</span>
                    Girl / Female
                  </button>
                </div>
              </div>

              {/* Skin Tone Selector */}
              {renderSwatches(
                'Skin Complexion & Tone',
                ['#fae2d0', '#f8d0b0', '#e0ac69', '#c68642', '#8d5524', '#bae6fd'],
                config.skinColor,
                (c) => updateConfig({ skinColor: c })
              )}
            </div>
          )}

          {/* TAB 2: HAIRSTYLE */}
          {activeTab === 'hair' && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  {config.gender === 'female' ? 'Girl Hairstyles' : 'Boy Hairstyles'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(config.gender === 'female'
                    ? [
                        { id: 'high_ponytail', label: 'High Ponytail' },
                        { id: 'twin_buns', label: 'Twin Space Buns' },
                        { id: 'bob_bangs', label: 'Bob Cut Bangs' },
                        { id: 'long_curls', label: 'Long Waves' },
                        { id: 'street_cap', label: 'Sporty Snapback' },
                      ]
                    : [
                        { id: 'anime_spike', label: 'Spiky Anime' },
                        { id: 'street_fade', label: 'Urban Fade' },
                        { id: 'afro_puffs', label: 'Afro Clouds' },
                        { id: 'beanie', label: 'Street Beanie' },
                        { id: 'surfer_flow', label: 'Surfer Waves' },
                      ]
                  ).map((style) => (
                    <button
                      key={style.id}
                      onClick={() => {
                        soundManager.playClickSound();
                        updateConfig({ hairStyle: style.id as HairStyle });
                      }}
                      className={`p-3 rounded-xl border-2 text-xs font-bold cursor-pointer transition text-center ${
                        config.hairStyle === style.id
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-sm'
                          : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Color */}
              {renderSwatches(
                'Hair Dye / Color',
                ['#0f172a', '#eab308', '#78350f', '#ef4444', '#06b6d4', '#ec4899', '#8b5cf6', '#f8fafc'],
                config.hairColor,
                (c) => updateConfig({ hairColor: c })
              )}
            </div>
          )}

          {/* TAB 3: FACE & EYES */}
          {activeTab === 'face' && (
            <div className="space-y-6">
              {/* Face Shape */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Face Shape & Structure
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'oval', label: 'Classic Oval' },
                    { id: 'round', label: 'Soft Round' },
                    { id: 'jawline', label: 'Athletic Jaw' },
                    { id: 'chibi', label: 'Cute Chibi' },
                  ].map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => {
                        soundManager.playClickSound();
                        updateConfig({ faceShape: shape.id as FaceShape });
                      }}
                      className={`p-2.5 rounded-xl border-2 text-xs font-bold cursor-pointer transition text-center ${
                        config.faceShape === shape.id
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-sm'
                          : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {shape.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Eye Colors */}
              {renderSwatches(
                'Eye Color',
                ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#111827'],
                config.eyeColor,
                (c) => updateConfig({ eyeColor: c })
              )}

              {/* Eyebrows & Nose */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Eyebrows
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'thick', label: 'Athletic Bold' },
                      { id: 'arched', label: 'Sleek Arch' },
                      { id: 'trim', label: 'Trim Neat' },
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => updateConfig({ eyebrowStyle: b.id as EyebrowStyle })}
                        className={`w-full p-2 rounded-lg border text-xs font-bold cursor-pointer transition text-left px-3 ${
                          config.eyebrowStyle === b.id
                            ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                            : 'border-slate-800 bg-slate-800/40 text-slate-400'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Nose Style
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { id: 'classic', label: 'Standard Classic' },
                      { id: 'button', label: 'Cute Button' },
                      { id: 'petite', label: 'Petite Trim' },
                    ].map((n) => (
                      <button
                        key={n.id}
                        onClick={() => updateConfig({ noseStyle: n.id as NoseStyle })}
                        className={`w-full p-2 rounded-lg border text-xs font-bold cursor-pointer transition text-left px-3 ${
                          config.noseStyle === n.id
                            ? 'border-cyan-400 bg-cyan-950/40 text-cyan-300'
                            : 'border-slate-800 bg-slate-800/40 text-slate-400'
                        }`}
                      >
                        {n.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: OUTFIT (Shirts & Lowers) */}
          {activeTab === 'clothes' && (
            <div className="space-y-6">
              {/* Shirt Style */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Top / Shirt Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'hoodie', label: 'Street Hoodie' },
                    { id: 'tshirt', label: 'Graphic T-Shirt' },
                    { id: 'cyber_jacket', label: 'Cyber Jacket' },
                    { id: 'bomber', label: 'Varsity Bomber' },
                    { id: 'tank', label: 'Athletic Tank' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        soundManager.playClickSound();
                        updateConfig({ shirtStyle: s.id as ShirtStyle });
                      }}
                      className={`p-3 rounded-xl border-2 text-xs font-bold cursor-pointer transition text-center ${
                        config.shirtStyle === s.id
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                          : 'border-slate-800 bg-slate-800/40 text-slate-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lower / Jeans Style */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Lower / Pants Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'cargo', label: 'Cargo Joggers' },
                    { id: 'baggy_jeans', label: 'Baggy Denim' },
                    { id: 'track_pants', label: 'Track Lowers' },
                    { id: 'shorts', label: 'Denim Shorts' },
                    { id: 'cyber_lowers', label: 'Cyber Pants' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        soundManager.playClickSound();
                        updateConfig({ pantsStyle: p.id as PantsStyle });
                      }}
                      className={`p-3 rounded-xl border-2 text-xs font-bold cursor-pointer transition text-center ${
                        config.pantsStyle === p.id
                          ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                          : 'border-slate-800 bg-slate-800/40 text-slate-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: COLOR PALETTE */}
          {activeTab === 'colors' && (
            <div className="space-y-5">
              {renderSwatches(
                'Shirt / Upper Primary Color',
                ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#0f172a', '#f8fafc'],
                config.shirtColor,
                (c) => updateConfig({ shirtColor: c })
              )}

              {renderSwatches(
                'Shirt Accent / Trim Color',
                ['#f8fafc', '#0f172a', '#ffd700', '#38bdf8', '#f43f5e', '#a855f7'],
                config.shirtAccentColor,
                (c) => updateConfig({ shirtAccentColor: c })
              )}

              {renderSwatches(
                'Pants / Lowers Color',
                ['#1e293b', '#0f172a', '#2563eb', '#475569', '#059669', '#7c3aed', '#b91c1c'],
                config.pantsColor,
                (c) => updateConfig({ pantsColor: c })
              )}

              {renderSwatches(
                'Sneakers / Shoes Accent',
                ['#f59e0b', '#ef4444', '#06b6d4', '#10b981', '#ffffff', '#ec4899', '#8b5cf6'],
                config.shoeColor,
                (c) => updateConfig({ shoeColor: c })
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/95">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-bold cursor-pointer transition"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              soundManager.playHighScoreFanfare();
              onSave(config);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-arcade text-base font-black px-6 py-2.5 rounded-xl shadow-lg cursor-pointer transition transform active:scale-95"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            SAVE & EQUIP
          </button>
        </div>
      </div>
    </div>
  );
};

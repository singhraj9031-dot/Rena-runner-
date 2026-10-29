/**
 * Rena Runner 3D - Main Application Entry
 * Full-Viewport 3D Endless Runner Game Shell
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  CharacterConfig,
  GameStats,
  GameStatus,
  ThemeMode,
} from './types/game';
import { DEFAULT_MALE_CONFIG } from './game/CharacterMesh';
import { GameEngine } from './game/GameEngine';
import { soundManager } from './audio/soundManager';
import { TitleScreen } from './components/TitleScreen';
import { CustomizerModal } from './components/CustomizerModal';
import { HUDOverlay } from './components/HUDOverlay';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { NameEditorModal } from './components/NameEditorModal';
import { SupportModal } from './components/SupportModal';
import { LegalModal } from './components/LegalModal';

const INITIAL_STATS: GameStats = {
  score: 0,
  highScore: 0,
  prevHighScore: 0,
  coins: 0,
  distance: 0,
  multiplier: 1,
  newHighScoreAchieved: false,
  highScoreGlow: false,
  powerUps: {
    magnet: 0,
    multiplier: 0,
    shield: false,
    superJump: 0,
  },
};

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Character Configuration State
  const [characterConfig, setCharacterConfig] = useState<CharacterConfig>(() => {
    const saved = localStorage.getItem('rena_character_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_MALE_CONFIG;
  });

  // Theme Mode State (Default: light, as requested)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('rena_theme_mode');
    return saved === 'dark' ? 'dark' : 'light';
  });

  // Audio States
  const [sfxEnabled, setSfxEnabled] = useState<boolean>(soundManager.sfxEnabled);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(soundManager.musicEnabled);

  // Game Lifecycle State
  const [gameStatus, setGameStatus] = useState<GameStatus>('title');
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isNameEditorOpen, setIsNameEditorOpen] = useState<boolean>(false);
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);
  const [isLegalOpen, setIsLegalOpen] = useState<boolean>(false);

  // Initialize GameEngine
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new GameEngine(
      canvasMountRef.current,
      {
        onStatsUpdate: (newStats) => {
          setStats(newStats);
        },
        onGameOver: (finalStats) => {
          setStats(finalStats);
          setGameStatus('gameover');
        },
        onNewHighScore: () => {
          // Trigger high score celebration state
        },
      },
      characterConfig,
      theme
    );

    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []); // Run once on mount

  // Sync Character Configuration
  const handleSaveCharacterConfig = (newConfig: CharacterConfig) => {
    setCharacterConfig(newConfig);
    localStorage.setItem('rena_character_config', JSON.stringify(newConfig));
    if (engineRef.current) {
      engineRef.current.setCharacterConfig(newConfig);
    }
    setIsCustomizerOpen(false);
    if (gameStatus === 'customizing') {
      setGameStatus('title');
      if (engineRef.current) engineRef.current.setStatus('title');
    }
  };

  const handlePreviewCharacterConfig = (previewConfig: CharacterConfig) => {
    if (engineRef.current) {
      engineRef.current.setCharacterConfig(previewConfig);
    }
  };

  const handleSavePlayerName = (newName: string) => {
    const updated = { ...characterConfig, username: newName };
    setCharacterConfig(updated);
    localStorage.setItem('rena_character_config', JSON.stringify(updated));
    if (engineRef.current) {
      engineRef.current.setCharacterConfig(updated);
    }
    setIsNameEditorOpen(false);
  };

  // Sync Theme
  const handleToggleTheme = () => {
    const nextTheme: ThemeMode = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('rena_theme_mode', nextTheme);
    if (engineRef.current) {
      engineRef.current.setTheme(nextTheme);
    }
  };

  // Audio Toggles
  const handleToggleSfx = () => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    soundManager.setSfx(next);
  };

  const handleToggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    soundManager.setMusic(next);
  };

  // Game Lifecycle Actions
  const handleStartGame = () => {
    setGameStatus('playing');
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const handlePauseGame = () => {
    setGameStatus('paused');
    if (engineRef.current) {
      engineRef.current.pauseGame();
    }
  };

  const handleResumeGame = () => {
    setGameStatus('playing');
    if (engineRef.current) {
      engineRef.current.resumeGame();
    }
  };

  const handleRestartGame = () => {
    setGameStatus('playing');
    if (engineRef.current) {
      engineRef.current.restartGame();
    }
  };

  const handleRevivePlayer = () => {
    setGameStatus('playing');
    if (engineRef.current) {
      engineRef.current.revivePlayer();
    }
  };

  const handleGoHome = () => {
    setGameStatus('title');
    if (engineRef.current) {
      engineRef.current.setStatus('title');
    }
  };

  const handleOpenCustomizer = () => {
    setIsCustomizerOpen(true);
    setGameStatus('customizing');
    if (engineRef.current) {
      engineRef.current.setStatus('customizing');
    }
  };

  const handleCloseCustomizer = () => {
    setIsCustomizerOpen(false);
    // revert to original saved config
    if (engineRef.current) {
      engineRef.current.setCharacterConfig(characterConfig);
      engineRef.current.setStatus('title');
    }
    setGameStatus('title');
  };

  // Controls for HUD buttons
  const handleMoveLeft = () => engineRef.current?.moveLane(-1);
  const handleMoveRight = () => engineRef.current?.moveLane(1);
  const handleJump = () => engineRef.current?.jump();
  const handleSlide = () => engineRef.current?.slide();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* Isolated Three.js WebGL Canvas Mount (No React re-rendering inside loop) */}
      <div
        ref={canvasMountRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-0"
      />

      {/* Title Screen Overlay */}
      {gameStatus === 'title' && (
        <TitleScreen
          onStart={handleStartGame}
          onOpenCustomizer={handleOpenCustomizer}
          onOpenNameEditor={() => setIsNameEditorOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenLegal={() => setIsLegalOpen(true)}
          characterConfig={characterConfig}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          highScore={stats.highScore}
          sfxEnabled={sfxEnabled}
          musicEnabled={musicEnabled}
          onToggleSfx={handleToggleSfx}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {/* Active In-Game HUD Overlay */}
      {gameStatus === 'playing' && (
        <HUDOverlay
          stats={stats}
          onPause={handlePauseGame}
          onMoveLeft={handleMoveLeft}
          onMoveRight={handleMoveRight}
          onJump={handleJump}
          onSlide={handleSlide}
        />
      )}

      {/* Pause Menu Modal */}
      {gameStatus === 'paused' && (
        <PauseModal
          onResume={handleResumeGame}
          onRestart={handleRestartGame}
          onOpenCustomizer={handleOpenCustomizer}
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenLegal={() => setIsLegalOpen(true)}
          onHome={handleGoHome}
          sfxEnabled={sfxEnabled}
          musicEnabled={musicEnabled}
          onToggleSfx={handleToggleSfx}
          onToggleMusic={handleToggleMusic}
        />
      )}

      {/* Game Over Screen Modal */}
      {gameStatus === 'gameover' && (
        <GameOverModal
          stats={stats}
          playerName={characterConfig.username || 'RenaPlayer'}
          onOpenNameEditor={() => setIsNameEditorOpen(true)}
          onOpenSupport={() => setIsSupportOpen(true)}
          onPlayAgain={handleRestartGame}
          onRevive={handleRevivePlayer}
          onOpenCustomizer={handleOpenCustomizer}
          onHome={handleGoHome}
        />
      )}

      {/* Character Customization Studio Modal */}
      {isCustomizerOpen && (
        <CustomizerModal
          currentConfig={characterConfig}
          onSave={handleSaveCharacterConfig}
          onClose={handleCloseCustomizer}
          onPreviewChange={handlePreviewCharacterConfig}
        />
      )}

      {/* Quick Player Name Editor Modal */}
      {isNameEditorOpen && (
        <NameEditorModal
          currentConfig={characterConfig}
          onSaveName={handleSavePlayerName}
          onClose={() => setIsNameEditorOpen(false)}
        />
      )}

      {/* Support & Help Request Modal */}
      {isSupportOpen && (
        <SupportModal
          onClose={() => setIsSupportOpen(false)}
          defaultPlayerName={characterConfig.username}
        />
      )}

      {/* Credits, Licensing & Legal Protection Modal */}
      {isLegalOpen && (
        <LegalModal onClose={() => setIsLegalOpen(false)} />
      )}
    </div>
  );
}

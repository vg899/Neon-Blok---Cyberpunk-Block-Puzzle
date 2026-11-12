import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameMode,
  Grid,
  PieceShape,
  PlayerStats,
  LevelConfig,
  NeonThemeId,
} from './game/types';
import {
  createEmptyGrid,
  canPlacePiece,
  placePiece,
  checkCompletedLines,
  clearLines,
  calculateScore,
  hasAnyValidMove,
  generatePieces,
  tickBombs,
  getCampaignLevels,
  generateDailyChallenge,
} from './game/rules';
import { sound } from './game/audio';
import { loadPlayerStats, savePlayerStats } from './game/storage';
import { ParticlePool } from './game/particles';

import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { GameBoard } from './components/GameBoard';
import { PieceTray } from './components/PieceTray';
import { CampaignMap } from './components/CampaignMap';
import { MultiplayerDuel } from './components/MultiplayerDuel';
import { DailyChallengeView } from './components/DailyChallengeView';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ShareScoreModal } from './components/ShareScoreModal';
import { SyncModal } from './components/SyncModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';

export default function App() {
  // Player Stats & Preferences
  const [stats, setStats] = useState<PlayerStats>(() => loadPlayerStats());
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.isMuted());

  // Navigation State
  const [view, setView] = useState<
    'title' | 'playing' | 'campaign_map' | 'multiplayer' | 'daily_view'
  >('title');

  // Active Game State
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [currentLevelNumber, setCurrentLevelNumber] = useState<number>(1);
  const [currentLevelConfig, setCurrentLevelConfig] = useState<LevelConfig | null>(null);

  const [grid, setGrid] = useState<Grid>(() => createEmptyGrid(8, 8));
  const [pieces, setPieces] = useState<(PieceShape | null)[]>([null, null, null]);
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);

  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxComboRun, setMaxComboRun] = useState<number>(0);
  const [linesClearedTotal, setLinesClearedTotal] = useState<number>(0);
  const [movesMade, setMovesMade] = useState<number>(0);

  // Status overlays
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [victoryStars, setVictoryStars] = useState<number>(1);

  // Visual feedback
  const [shakeTrauma, setShakeTrauma] = useState<number>(0);
  const [highlightLines, setHighlightLines] = useState<{ rows: number[]; cols: number[] }>({
    rows: [],
    cols: [],
  });

  // Auxiliary Modals
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showSyncModal, setShowSyncModal] = useState<boolean>(false);
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);

  const particlePoolRef = useRef<ParticlePool>(new ParticlePool());

  // Persist stats whenever changed
  useEffect(() => {
    savePlayerStats(stats);
  }, [stats]);

  // Sync document.body.dataset.state for ultra-mode compliance
  useEffect(() => {
    if (view === 'title' || view === 'campaign_map' || view === 'daily_view') {
      document.body.dataset.state = 'title';
    } else if (isGameOver || isVictory) {
      document.body.dataset.state = 'gameover';
    } else if (isPaused) {
      document.body.dataset.state = 'paused';
    } else {
      document.body.dataset.state = 'playing';
    }
  }, [view, isGameOver, isVictory, isPaused]);

  // Support ?autostart=1 to jump directly to playing mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        startNewGame('classic');
      }
    }
  }, []);

  // Window blur: clear held keys and selection
  useEffect(() => {
    const handleBlur = () => {
      setSelectedPieceIndex(null);
      setHoverPos(null);
    };
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if inside an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Mute audio
      if (e.code === 'KeyM') {
        e.preventDefault();
        const next = sound.toggleMute();
        setIsMuted(next);
        return;
      }

      if (view === 'playing' && !isGameOver && !isVictory) {
        // Pause
        if (e.code === 'Escape' || e.code === 'KeyP') {
          e.preventDefault();
          sound.playClick();
          setIsPaused((p) => !p);
          return;
        }

        // Restart
        if (e.code === 'KeyR') {
          e.preventDefault();
          sound.playClick();
          startNewGame(gameMode, currentLevelNumber);
          return;
        }

        // Tray slots 1, 2, 3
        if (e.code === 'Digit1') {
          e.preventDefault();
          sound.playClick();
          setSelectedPieceIndex(0);
        } else if (e.code === 'Digit2') {
          e.preventDefault();
          sound.playClick();
          setSelectedPieceIndex(1);
        } else if (e.code === 'Digit3') {
          e.preventDefault();
          sound.playClick();
          setSelectedPieceIndex(2);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, isGameOver, isVictory, gameMode, currentLevelNumber]);

  // Camera shake decay loop
  useEffect(() => {
    if (shakeTrauma <= 0) return;
    const interval = setInterval(() => {
      setShakeTrauma((prev) => Math.max(0, prev - 0.15));
    }, 50);
    return () => clearInterval(interval);
  }, [shakeTrauma]);

  // Start new game session
  const startNewGame = useCallback((mode: GameMode, levelNum = 1) => {
    setGameMode(mode);
    setCurrentLevelNumber(levelNum);
    setIsPaused(false);
    setIsGameOver(false);
    setIsVictory(false);
    setScore(0);
    setCombo(0);
    setMaxComboRun(0);
    setLinesClearedTotal(0);
    setMovesMade(0);
    setSelectedPieceIndex(null);
    setHoverPos(null);

    let baseGrid = createEmptyGrid(8, 8);
    let config: LevelConfig | null = null;

    if (mode === 'campaign') {
      const allLevels = getCampaignLevels();
      config = allLevels[levelNum - 1] || allLevels[0];
      setCurrentLevelConfig(config);

      // Pre-place obstacles
      if (config.initialObstacles) {
        config.initialObstacles.forEach((obs) => {
          baseGrid[obs.y][obs.x] = { type: 'obstacle' };
        });
      }
      // Pre-place bombs
      if (config.initialBombs) {
        config.initialBombs.forEach((bomb) => {
          baseGrid[bomb.y][bomb.x] = { type: 'bomb', countdown: bomb.turns };
        });
      }
    } else if (mode === 'daily') {
      const todayStr = new Date().toISOString().split('T')[0];
      config = generateDailyChallenge(todayStr);
      setCurrentLevelConfig(config);

      if (config.initialObstacles) {
        config.initialObstacles.forEach((obs) => {
          baseGrid[obs.y][obs.x] = { type: 'obstacle' };
        });
      }
    } else {
      setCurrentLevelConfig(null);
    }

    setGrid(baseGrid);
    const initialPieces = generatePieces(3, mode === 'campaign' ? Math.min(3, Math.ceil(levelNum / 8)) : 1);
    setPieces(initialPieces);
    setView('playing');
  }, []);

  // Refill tray when empty and check if moves are still possible
  useEffect(() => {
    if (view !== 'playing' || isGameOver || isVictory) return;

    if (pieces.every((p) => p === null)) {
      const tier =
        gameMode === 'campaign'
          ? Math.min(3, Math.ceil(currentLevelNumber / 8))
          : Math.min(3, Math.floor(score / 3500) + 1);

      const nextBatch = generatePieces(3, tier);
      setPieces(nextBatch);
      setSelectedPieceIndex(null);

      // Check for immediate game over if board is so full that no new piece fits
      if (!hasAnyValidMove(grid, nextBatch)) {
        handleGameOver();
      }
    }
  }, [pieces, grid, view, isGameOver, isVictory, gameMode, currentLevelNumber, score]);

  // Handle game over
  const handleGameOver = () => {
    sound.playGameOver();
    setIsGameOver(true);

    // Update player stats
    setStats((prev) => {
      const nextGames = prev.gamesPlayed + 1;
      const nextTotalScore = prev.totalScore + score;
      const nextTotalLines = prev.totalLinesCleared + linesClearedTotal;
      const nextMaxCombo = Math.max(prev.maxCombo, maxComboRun);
      const nextHigh =
        gameMode === 'classic'
          ? Math.max(prev.highScoreClassic, score)
          : prev.highScoreClassic;

      return {
        ...prev,
        gamesPlayed: nextGames,
        totalScore: nextTotalScore,
        totalLinesCleared: nextTotalLines,
        maxCombo: nextMaxCombo,
        highScoreClassic: nextHigh,
      };
    });
  };

  // Handle stage victory (Campaign or Daily)
  const handleStageVictory = (achievedScore: number) => {
    sound.playVictory();
    setIsVictory(true);

    let starsEarned = 1;
    if (currentLevelConfig) {
      if (achievedScore >= currentLevelConfig.starsThresholds[2]) starsEarned = 3;
      else if (achievedScore >= currentLevelConfig.starsThresholds[1]) starsEarned = 2;
    }
    setVictoryStars(starsEarned);

    // Update stats
    setStats((prev) => {
      const nextStars = { ...prev.campaignStars };
      if (gameMode === 'campaign') {
        nextStars[currentLevelNumber] = Math.max(
          nextStars[currentLevelNumber] || 0,
          starsEarned
        );
      }

      const nextUnlocked =
        gameMode === 'campaign' && currentLevelNumber >= prev.unlockedLevel
          ? Math.min(30, currentLevelNumber + 1)
          : prev.unlockedLevel;

      // Handle daily streak
      let nextStreak = prev.dailyStreak;
      let nextCompletedDays = [...prev.dailyCompletedDates];
      const todayStr = new Date().toISOString().split('T')[0];

      if (gameMode === 'daily' && !prev.dailyCompletedDates.includes(todayStr)) {
        nextStreak = prev.dailyStreak + 1;
        nextCompletedDays.push(todayStr);
      }

      // Unlock themes at milestones
      const nextUnlockedThemes = [...prev.unlockedThemes];
      if (nextUnlocked >= 10 && !nextUnlockedThemes.includes('matrix-emerald')) {
        nextUnlockedThemes.push('matrix-emerald');
      }
      if (nextStreak >= 3 && !nextUnlockedThemes.includes('solar-amber')) {
        nextUnlockedThemes.push('solar-amber');
      }
      if (nextUnlocked >= 20 && !nextUnlockedThemes.includes('void-violet')) {
        nextUnlockedThemes.push('void-violet');
      }

      return {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        totalScore: prev.totalScore + achievedScore,
        totalLinesCleared: prev.totalLinesCleared + linesClearedTotal,
        maxCombo: Math.max(prev.maxCombo, maxComboRun),
        campaignStars: nextStars,
        unlockedLevel: nextUnlocked,
        dailyStreak: nextStreak,
        lastDailyDate: todayStr,
        dailyCompletedDates: nextCompletedDays,
        unlockedThemes: nextUnlockedThemes,
      };
    });
  };

  // Place active piece onto board
  const handleCellClick = (x: number, y: number) => {
    if (isPaused || isGameOver || isVictory || selectedPieceIndex === null) return;
    const activePiece = pieces[selectedPieceIndex];
    if (!activePiece) return;

    if (!canPlacePiece(grid, activePiece.matrix, x, y)) {
      sound.playError();
      return;
    }

    sound.playPlacePiece();

    // 1. Place piece
    const { nextGrid: placedGrid, blocksPlaced } = placePiece(
      grid,
      activePiece.matrix,
      x,
      y,
      activePiece.color
    );

    // 2. Check completed lines
    const { rows, cols } = checkCompletedLines(placedGrid);
    const lineCount = rows.length + cols.length;

    let finalGrid = placedGrid;
    let nextCombo = 0;

    if (lineCount > 0) {
      nextCombo = combo + 1;
      setCombo(nextCombo);
      setMaxComboRun((prev) => Math.max(prev, nextCombo));

      // Trigger line clear visual flash
      setHighlightLines({ rows, cols });
      setTimeout(() => setHighlightLines({ rows: [], cols: [] }), 220);

      const { nextGrid: clearedGrid, clearedCells } = clearLines(placedGrid, rows, cols);
      finalGrid = clearedGrid;

      // Sound and visual juice scaled to weight
      sound.playLineClear(lineCount, nextCombo);
      if (nextCombo >= 3) {
        sound.playComboSurge(nextCombo);
      }

      // Camera shake based on line count
      setShakeTrauma(Math.min(1.5, 0.4 + lineCount * 0.35));

      // Emit particle bursts from cleared cells
      clearedCells.forEach((c) => {
        particlePoolRef.current.emitBurst(
          c.x * 45 + 22,
          c.y * 45 + 22,
          c.color || '#00f0ff',
          14
        );
      });

      // Floating combo text
      if (nextCombo > 1) {
        particlePoolRef.current.emitFloatingText(
          200,
          180,
          `+${lineCount * 200} COMBO x${nextCombo}!`,
          '#ffb800'
        );
      }
    } else {
      setCombo(0);
    }

    // 3. Tick countdown bombs if in campaign
    if (currentLevelConfig?.initialBombs) {
      const { nextGrid: bombedGrid, bombDetonated } = tickBombs(finalGrid);
      finalGrid = bombedGrid;
      if (bombDetonated) {
        handleGameOver();
        return;
      }
    }

    // 4. Calculate score
    const { scoreGained } = calculateScore(blocksPlaced, rows.length, cols.length, nextCombo);
    const updatedScore = score + scoreGained;
    const updatedMoves = movesMade + 1;
    const updatedLines = linesClearedTotal + lineCount;

    setScore(updatedScore);
    setMovesMade(updatedMoves);
    setLinesClearedTotal(updatedLines);

    // 5. Remove placed piece from tray
    const nextPieces = [...pieces];
    nextPieces[selectedPieceIndex] = null;
    setPieces(nextPieces);
    setSelectedPieceIndex(null);
    setGrid(finalGrid);

    // 6. Check Win Conditions for Campaign & Daily
    if (currentLevelConfig) {
      const reachedScore = updatedScore >= currentLevelConfig.targetScore;
      const reachedLines =
        typeof currentLevelConfig.targetLines === 'number'
          ? updatedLines >= currentLevelConfig.targetLines
          : true;

      if (reachedScore && reachedLines) {
        handleStageVictory(updatedScore);
        return;
      }

      // Check move limit failure
      if (
        typeof currentLevelConfig.moveLimit === 'number' &&
        updatedMoves >= currentLevelConfig.moveLimit
      ) {
        handleGameOver();
        return;
      }
    }

    // 7. Check if remaining pieces in tray have any valid moves
    const remainingPieces = nextPieces.filter((p) => p !== null);
    if (remainingPieces.length > 0 && !hasAnyValidMove(finalGrid, remainingPieces)) {
      handleGameOver();
    }
  };

  return (
    <div className="relative w-screen h-screen flex flex-col justify-between overflow-hidden bg-[#07080d] select-none text-slate-100">
      {/* 1. Title Screen */}
      {view === 'title' && (
        <TitleScreen
          onStartGame={(mode) => {
            if (mode === 'campaign') {
              setView('campaign_map');
            } else if (mode === 'daily') {
              setView('daily_view');
            } else if (mode === 'multiplayer') {
              setView('multiplayer');
            } else {
              startNewGame('classic');
            }
          }}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
          onOpenDaily={() => setView('daily_view')}
          onOpenSync={() => setShowSyncModal(true)}
          onOpenThemes={() => setShowThemeModal(true)}
          stats={stats}
        />
      )}

      {/* 2. Campaign Level Map */}
      {view === 'campaign_map' && (
        <CampaignMap
          stats={stats}
          onSelectLevel={(lvl) => startNewGame('campaign', lvl)}
          onBack={() => setView('title')}
        />
      )}

      {/* 3. Daily Protocol View */}
      {view === 'daily_view' && (
        <DailyChallengeView
          stats={stats}
          onStartDaily={() => startNewGame('daily')}
          onBack={() => setView('title')}
        />
      )}

      {/* 4. Local Multiplayer Duel */}
      {view === 'multiplayer' && (
        <MultiplayerDuel onExit={() => setView('title')} />
      )}

      {/* 5. Main Single-Player Playing HUD & Arena */}
      {view === 'playing' && (
        <div className="relative w-full h-full flex flex-col justify-between p-2 sm:p-4 max-w-xl mx-auto">
          {/* Top HUD */}
          <GameHUD
            score={score}
            highScore={stats.highScoreClassic}
            combo={combo}
            mode={gameMode}
            levelNumber={currentLevelNumber}
            targetScore={currentLevelConfig?.targetScore}
            moveLimit={currentLevelConfig?.moveLimit}
            movesMade={movesMade}
            targetLines={currentLevelConfig?.targetLines}
            linesCleared={linesClearedTotal}
            onPause={() => setIsPaused(true)}
            onRestart={() => startNewGame(gameMode, currentLevelNumber)}
            onExit={() => setView('title')}
            isMuted={isMuted}
            onToggleMute={() => {
              const next = sound.toggleMute();
              setIsMuted(next);
            }}
          />

          {/* Interactive Game Board */}
          <main className="flex-1 flex items-center justify-center my-1 sm:my-2">
            <GameBoard
              grid={grid}
              activePiece={
                selectedPieceIndex !== null ? pieces[selectedPieceIndex] : null
              }
              hoverPos={hoverPos}
              onCellClick={handleCellClick}
              onCellHover={(x, y) =>
                setHoverPos(x !== null && y !== null ? { x, y } : null)
              }
              particlePool={particlePoolRef.current}
              shakeTrauma={shakeTrauma}
              highlightLines={highlightLines}
            />
          </main>

          {/* Bottom Piece Selection Tray */}
          <footer>
            <PieceTray
              pieces={pieces}
              selectedIndex={selectedPieceIndex}
              onSelectPiece={(idx) => {
                sound.playClick();
                setSelectedPieceIndex((prev) => (prev === idx ? null : idx));
              }}
              grid={grid}
            />
          </footer>
        </div>
      )}

      {/* Modals */}
      {isPaused && (
        <PauseModal
          onResume={() => setIsPaused(false)}
          onRestart={() => startNewGame(gameMode, currentLevelNumber)}
          onExit={() => setView('title')}
        />
      )}

      {isGameOver && (
        <GameOverModal
          score={score}
          highScore={stats.highScoreClassic}
          lines={linesClearedTotal}
          maxCombo={maxComboRun}
          onRestart={() => startNewGame(gameMode, currentLevelNumber)}
          onShare={() => setShowShareModal(true)}
          onExit={() => setView('title')}
        />
      )}

      {isVictory && (
        <VictoryModal
          score={score}
          levelNumber={currentLevelNumber}
          starsEarned={victoryStars}
          lines={linesClearedTotal}
          onNextStage={
            gameMode === 'campaign' && currentLevelNumber < 30
              ? () => startNewGame('campaign', currentLevelNumber + 1)
              : undefined
          }
          onShare={() => setShowShareModal(true)}
          onExit={() => setView('title')}
        />
      )}

      {showLeaderboard && (
        <LeaderboardModal
          playerHighScore={stats.highScoreClassic}
          onClose={() => setShowLeaderboard(false)}
        />
      )}

      {showShareModal && (
        <ShareScoreModal
          score={score}
          lines={linesClearedTotal}
          combo={maxComboRun}
          mode={gameMode}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {showSyncModal && (
        <SyncModal
          stats={stats}
          onUpdateStats={(newStats) => setStats(newStats)}
          onClose={() => setShowSyncModal(false)}
        />
      )}

      {showThemeModal && (
        <ThemeSelectorModal
          stats={stats}
          onSelectTheme={(themeId) => {
            setStats((prev) => ({ ...prev, activeTheme: themeId }));
            setShowThemeModal(false);
          }}
          onClose={() => setShowThemeModal(false)}
        />
      )}
    </div>
  );
}

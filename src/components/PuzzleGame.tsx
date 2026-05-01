import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlitchText } from './GlitchText';

const SIZE = 8;
const BLOCK_SIZE = 35;

type Piece = {
  id: string;
  shape: number[][];
  color: string;
};

const SHAPES: number[][][] = [
  [[1]], 
  [[1, 1]], 
  [[1], [1]],
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 1], [1, 1]], // 2x2
  [[1, 1, 1], [0, 1, 0]],
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]]
];

const COLORS = ['#00ffff', '#ff00ff', '#ff0000'];

export const PuzzleGame: React.FC<{ onScoreChange: (score: number) => void }> = ({ onScoreChange }) => {
  const [grid, setGrid] = useState<string[][]>(Array(SIZE).fill(null).map(() => Array(SIZE).fill(null)));
  const [availablePieces, setAvailablePieces] = useState<Piece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const floatingRef = useRef<HTMLDivElement>(null);

  const generatePieces = useCallback(() => {
    const newPieces: Piece[] = [];
    for (let i = 0; i < 3; i++) {
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      newPieces.push({
        id: Math.random().toString(36).substr(2, 9),
        shape,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      });
    }
    return newPieces;
  }, []);

  useEffect(() => {
    setAvailablePieces(generatePieces());
  }, [generatePieces]);

  // Efficient mouse tracking without full component re-renders
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (floatingRef.current) {
        floatingRef.current.style.left = `${e.clientX}px`;
        floatingRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const canPlace = (piece: Piece, x: number, y: number, currentGrid: string[][]) => {
    if (y + piece.shape.length > SIZE || x + piece.shape[0].length > SIZE) return false;
    for (let py = 0; py < piece.shape.length; py++) {
      for (let px = 0; px < piece.shape[py].length; px++) {
        if (piece.shape[py][px] && currentGrid[y + py][x + px]) {
          return false;
        }
      }
    }
    return true;
  };

  const checkGameOver = useCallback((currentGrid: string[][], pieces: Piece[]) => {
    if (pieces.length === 0) return false;
    
    for (const piece of pieces) {
      for (let y = 0; y < SIZE; y++) {
        for (let x = 0; x < SIZE; x++) {
          if (canPlace(piece, x, y, currentGrid)) return false;
        }
      }
    }
    return true;
  }, []);

  const handlePlace = (x: number, y: number) => {
    if (!selectedPieceId || gameOver) return;
    
    const piece = availablePieces.find(p => p.id === selectedPieceId);
    if (!piece || !canPlace(piece, x, y, grid)) return;

    // Place
    const newGrid = grid.map(row => [...row]);
    let blocksPlaced = 0;
    piece.shape.forEach((row, py) => {
      row.forEach((val, px) => {
        if (val) {
          newGrid[y + py][x + px] = piece.color;
          blocksPlaced++;
        }
      });
    });

    // Scoring for placement
    let turnScore = blocksPlaced * 10;

    // Line Clearing (Row/Col)
    const rowsToClear: number[] = [];
    const colsToClear: number[] = [];

    for (let i = 0; i < SIZE; i++) {
      if (newGrid[i].every(cell => cell !== null)) rowsToClear.push(i);
      if (newGrid.every(row => row[i] !== null)) colsToClear.push(i);
    }

    // 6x6 Subgrid Clearing
    const subgridsToClear: { x: number, y: number }[] = [];
    for (let sy = 0; sy <= SIZE - 6; sy++) {
      for (let sx = 0; sx <= SIZE - 6; sx++) {
        let full = true;
        for (let dy = 0; dy < 6; dy++) {
          for (let dx = 0; dx < 6; dx++) {
            if (!newGrid[sy + dy][sx + dx]) {
              full = false;
              break;
            }
          }
          if (!full) break;
        }
        if (full) subgridsToClear.push({ x: sx, y: sy });
      }
    }

    // Apply Clears
    const finalGrid = newGrid.map(row => [...row]);
    
    rowsToClear.forEach(ri => {
      finalGrid[ri] = Array(SIZE).fill(null);
      turnScore += 100;
    });

    colsToClear.forEach(ci => {
      for (let i = 0; i < SIZE; i++) finalGrid[i][ci] = null;
      turnScore += 100;
    });

    subgridsToClear.forEach(({ x, y }) => {
      for (let dy = 0; dy < 6; dy++) {
        for (let dx = 0; dx < 6; dx++) {
          finalGrid[y + dy][x + dx] = null;
        }
      }
      turnScore += 1000;
    });

    const updatedScore = score + turnScore;
    setScore(updatedScore);
    onScoreChange(updatedScore);
    setGrid(finalGrid);

    // Update pieces
    const remainingPieces = availablePieces.filter(p => p.id !== selectedPieceId);
    if (remainingPieces.length === 0) {
      const nextBatch = generatePieces();
      setAvailablePieces(nextBatch);
      setSelectedPieceId(null);
      if (checkGameOver(finalGrid, nextBatch)) setGameOver(true);
    } else {
      setAvailablePieces(remainingPieces);
      setSelectedPieceId(null);
      if (checkGameOver(finalGrid, remainingPieces)) setGameOver(true);
    }
  };

  const resetGame = () => {
    setGrid(Array(SIZE).fill(null).map(() => Array(SIZE).fill(null)));
    setScore(0);
    onScoreChange(0);
    setGameOver(false);
    const initial = generatePieces();
    setAvailablePieces(initial);
    setSelectedPieceId(null);
  };

  return (
    <div 
      className={`relative p-8 flex flex-col items-center gap-12 ${selectedPieceId ? 'cursor-none' : ''}`}
    >
      {/* Floating Piece following cursor - Optimized with Ref */}
      {selectedPieceId && !hoveredCell && (
        <div 
          ref={floatingRef}
          className="fixed pointer-events-none z-[1000] -translate-x-1/2 -translate-y-1/2 will-change-transform"
          style={{ left: 0, top: 0 }}
        >
          {(() => {
            const p = availablePieces.find(p => p.id === selectedPieceId);
            if (!p) return null;
            return (
              <div 
                className="grid gap-[2px] opacity-80"
                style={{
                  gridTemplateColumns: `repeat(${p.shape[0].length}, ${BLOCK_SIZE}px)`,
                }}
              >
                {p.shape.map((row, py) => (
                  row.map((val, px) => (
                    <div 
                      key={`${py}-${px}`}
                      className="w-[35px] h-[35px] border border-white/20"
                      style={{ backgroundColor: val ? p.color : 'transparent' }}
                    />
                  ))
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* 8x8 Grid */}
      <div 
        className="grid gap-[2px] bg-white/5 p-1 backdrop-blur-sm border border-neon-cyan shadow-[0_0_20px_#00ffff,inset_0_0_20px_#00ffff]"
        style={{ 
          gridTemplateColumns: `repeat(${SIZE}, ${BLOCK_SIZE}px)`,
        }}
      >
        {(() => {
          const selectedPiece = availablePieces.find(p => p.id === selectedPieceId);
          return grid.map((row, y) => (
            row.map((cell, x) => {
              let isHoveredPiecePart = false;
              let isValidHover = false;

              if (hoveredCell && selectedPiece) {
                const py = y - hoveredCell.y;
                const px = x - hoveredCell.x;
                isHoveredPiecePart = py >= 0 && py < selectedPiece.shape.length && 
                                    px >= 0 && px < selectedPiece.shape[0].length && 
                                    !!selectedPiece.shape[py][px];
                
                if (isHoveredPiecePart) {
                  isValidHover = canPlace(selectedPiece, hoveredCell.x, hoveredCell.y, grid);
                }
              }

              return (
                <div 
                  key={`${y}-${x}`}
                  onMouseEnter={() => setHoveredCell({ x, y })}
                  onMouseLeave={() => setHoveredCell(null)}
                  onClick={() => handlePlace(x, y)}
                  className="w-[35px] h-[35px] relative hover:bg-white/5 cursor-crosshair transition-colors"
                  style={{ 
                    backgroundColor: cell || (isHoveredPiecePart ? (isValidHover ? selectedPiece!.color : 'rgba(255,0,0,0.3)') : 'rgba(255,255,255,0.02)'),
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {cell && (
                    <div className="absolute inset-0 border border-white/20">
                       <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent" />
                    </div>
                  )}
                </div>
              );
            })
          ));
        })()}
      </div>

      {/* Selectable Pieces - Under the grid */}
      <div className="flex gap-4 min-h-[120px] items-start justify-center w-full">
        {availablePieces.map((p) => (
          <motion.div
            key={p.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedPieceId(prev => prev === p.id ? null : p.id)}
            className={`cursor-pointer p-6 border transition-all duration-300 min-w-[100px] flex items-center justify-center bg-white/[0.02] ${
              selectedPieceId === p.id 
              ? 'border-neon-cyan shadow-[0_0_10px_rgba(0,255,255,0.3)] bg-neon-cyan/5' 
              : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div 
              className="grid gap-[2px]"
              style={{
                gridTemplateColumns: `repeat(${p.shape[0].length}, 20px)`,
              }}
            >
              {p.shape.map((row, y) => (
                row.map((val, x) => (
                  <div 
                    key={`${y}-${x}`}
                    className="w-[20px] h-[20px]"
                    style={{ backgroundColor: val ? p.color : 'transparent' }}
                  />
                ))
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 z-50 backdrop-blur-md"
          >
            <h2 className="text-4xl text-neon-magenta font-bold glitch-effect mb-2 underline tracking-widest leading-none">SYSTEM_OVERLOAD</h2>
            <p className="text-xs mb-8 opacity-60 tracking-[0.3em]">NO_VALID_MOVES_REMAIN</p>
            <button 
              onClick={resetGame}
              className="px-10 py-3 neon-border hover:bg-neon-cyan hover:text-black transition-all uppercase font-bold tracking-widest"
            >
              RESTART_SYSTEM
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


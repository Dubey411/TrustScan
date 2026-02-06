'use client';

import { useState, useEffect, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';

export default function ScanGame() {
  const [score, setScore] = useState(0);
  const [grid, setGrid] = useState<number[]>(new Array(8).fill(0)); // 8 slots (4x2)
  const [combo, setCombo] = useState(0);

  // Game loop
  useEffect(() => {
    const interval = setInterval(() => {
        setGrid(prev => {
            const newGrid = [...prev];
            
            // 70% chance to clear an existing bug to keep it dynamic
            if (Math.random() > 0.3) {
                 const filledIndices = newGrid.map((v, i) => v === 1 ? i : -1).filter(i => i !== -1);
                 if (filledIndices.length > 0) {
                     const removeIdx = filledIndices[Math.floor(Math.random() * filledIndices.length)];
                     newGrid[removeIdx] = 0;
                 }
            }

            // Spawn a new bug
            const emptyIndices = newGrid.map((v, i) => v === 0 ? i : -1).filter(i => i !== -1);
            if (emptyIndices.length > 0) {
                 const randomSlot = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
                 newGrid[randomSlot] = 1; 
            }
            
            return newGrid;
        });
    }, 700); 

    return () => clearInterval(interval);
  }, []);

  const handleWhack = (index: number) => {
      if (grid[index] === 1) {
          setScore(s => s + 100 + (combo * 10));
          setCombo(c => c + 1);
          setGrid(prev => {
              const newGrid = [...prev];
              newGrid[index] = 2; // 2 = explosion/hit state
              return newGrid;
          });
          
          // Reset hit state after short delay
          setTimeout(() => {
              setGrid(prev => {
                  const newGrid = [...prev];
                  if (newGrid[index] === 2) newGrid[index] = 0;
                  return newGrid;
              });
          }, 200);
      } else {
          setCombo(0); // Miss resets combo
      }
  };

  return (
    <div className="bg-slate-950/90 rounded-2xl p-4 h-auto min-h-[12rem] border border-primary/20 shadow-2xl overflow-hidden relative select-none ring-1 ring-white/5 flex flex-col">
        <div className="flex justify-between items-center mb-3 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
                 <div className="p-1 bg-red-500/10 rounded">
                    <Icon name="BugAntIcon" size={14} className="text-red-500" />
                 </div>
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Threat Neutralization
                 </span>
            </div>
            <div className="flex items-baseline gap-2">
                {combo > 1 && <span className="text-[10px] font-bold text-yellow-500 animate-pulse">{combo}x COMBO</span>}
                <div className="text-sm font-mono font-bold text-primary">
                    {score.toLocaleString()}
                </div>
            </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 md:gap-3 flex-1">
            {grid.map((status, i) => (
                <button 
                    key={i}
                    onClick={() => handleWhack(i)}
                    className={`relative rounded-lg flex items-center justify-center transition-all duration-100 overflow-hidden aspect-[1.3/1] md:aspect-auto ${
                        status === 1 
                        ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                        : status === 2
                            ? 'bg-green-500/20 border-green-500/50 scale-95'
                            : 'bg-white/5 border-white/5 hover:bg-white/10'
                    } border`}
                >
                    {status === 1 && (
                        <div className="animate-bounce-short">
                             <Icon name="BugAntIcon" size={20} className="text-red-400" variant="solid" />
                        </div>
                    )}
                    {status === 2 && (
                         <div className="animate-ping">
                             <Icon name="CheckCircleIcon" size={20} className="text-green-400" variant="solid" />
                        </div>
                    )}
                </button>
            ))}
        </div>
    </div>
  );
}

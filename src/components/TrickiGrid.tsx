/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Trophy, RotateCcw, User, Info, Check, X as CloseIcon, AlertCircle } from 'lucide-react';
import { Pokemon, Category, Player, CellState, ALL_CATEGORIES } from '../types';
import { getAllPokemonNames, getPokemonDetails, validatePokemon } from '../services/pokemonService';

const getRandomCategories = (count: number, exclude: Category[] = []): Category[] => {
  const available = ALL_CATEGORIES.filter(c => !exclude.find(e => e.id === c.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export default function TrickiGrid() {
  const [rowCategories, setRowCategories] = useState<Category[]>([]);
  const [colCategories, setColCategories] = useState<Category[]>([]);
  const [grid, setGrid] = useState<CellState[][]>(
    Array(3).fill(null).map(() => Array(3).fill({ player: null, pokemon: null }))
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'Draw' | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<{ name: string; url: string }[]>([]);
  const [allPokemon, setAllPokemon] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAllPokemonNames().then(setAllPokemon);
    const rows = getRandomCategories(3);
    const cols = getRandomCategories(3, rows);
    setRowCategories(rows);
    setColCategories(cols);
  }, []);

  useEffect(() => {
    if (searchTerm.length > 1) {
      const filtered = allPokemon
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 8);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, allPokemon]);

  const checkWinner = (newGrid: CellState[][]) => {
    // Rows
    for (let i = 0; i < 3; i++) {
      if (newGrid[i][0].player && newGrid[i][0].player === newGrid[i][1].player && newGrid[i][0].player === newGrid[i][2].player) {
        return newGrid[i][0].player;
      }
    }
    // Cols
    for (let i = 0; i < 3; i++) {
      if (newGrid[0][i].player && newGrid[0][i].player === newGrid[1][i].player && newGrid[0][i].player === newGrid[2][i].player) {
        return newGrid[0][i].player;
      }
    }
    // Diagonals
    if (newGrid[0][0].player && newGrid[0][0].player === newGrid[1][1].player && newGrid[0][0].player === newGrid[2][2].player) {
      return newGrid[0][0].player;
    }
    if (newGrid[0][2].player && newGrid[0][2].player === newGrid[1][1].player && newGrid[0][2].player === newGrid[2][0].player) {
      return newGrid[0][2].player;
    }

    // Draw
    const isFull = newGrid.every(row => row.every(cell => cell.player !== null));
    if (isFull) return 'Draw';

    return null;
  };

  const handleSelectPokemon = async (pokemonName: string) => {
    if (!selectedCell || winner || rowCategories.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const details = await getPokemonDetails(pokemonName);
      const isValid = validatePokemon(details, rowCategories[selectedCell.r], colCategories[selectedCell.c]);

      if (isValid) {
        const newGrid = [...grid.map(row => [...row])];
        newGrid[selectedCell.r][selectedCell.c] = { player: currentPlayer, pokemon: details };
        setGrid(newGrid);
        
        const winResult = checkWinner(newGrid);
        if (winResult) {
          setWinner(winResult);
        } else {
          setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
        }
        setSelectedCell(null);
        setSearchTerm('');
      } else {
        setError(`¡${details.name.toUpperCase()} no cumple las condiciones! Pierdes el turno.`);
        setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
        setSelectedCell(null);
        setSearchTerm('');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      setError('Pokémon no encontrado o error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    const rows = getRandomCategories(3);
    const cols = getRandomCategories(3, rows);
    setRowCategories(rows);
    setColCategories(cols);
    setGrid(Array(3).fill(null).map(() => Array(3).fill({ player: null, pokemon: null })));
    setCurrentPlayer('X');
    setWinner(null);
    setSelectedCell(null);
    setSearchTerm('');
    setError(null);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8">
      <div className="relative w-full max-w-2xl">
        {/* Status Bar */}
        <div className="flex flex-col gap-4 mb-6 px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 ${currentPlayer === 'X' ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
                X
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 ${currentPlayer === 'O' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
                O
              </div>
            </div>
            
            <button 
              onClick={resetGame}
              className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white"
            >
              <RotateCcw size={24} />
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm overflow-hidden"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          {/* Empty corner */}
          <div className="aspect-square"></div>
          
          {/* Column Headers */}
          {colCategories.map(cat => (
            <div key={cat.id} className="flex items-center justify-center text-center p-2 text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">
              {cat.label}
            </div>
          ))}

          {/* Rows */}
          {grid.map((row, rIdx) => (
            <React.Fragment key={`row-${rIdx}`}>
              {/* Row Header */}
              <div className="flex items-center justify-center text-center p-2 text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">
                {rowCategories[rIdx]?.label}
              </div>
              
              {/* Cells */}
              {row.map((cell, cIdx) => (
                <motion.button
                  key={`${rIdx}-${cIdx}`}
                  whileHover={!cell.player && !winner ? { scale: 1.02, backgroundColor: 'rgba(255,255,255,0.05)' } : {}}
                  whileTap={!cell.player && !winner ? { scale: 0.98 } : {}}
                  onClick={() => !cell.player && !winner && setSelectedCell({ r: rIdx, c: cIdx })}
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${
                    selectedCell?.r === rIdx && selectedCell?.c === cIdx 
                      ? 'border-yellow-400 bg-yellow-400/10 shadow-[0_0_20px_rgba(250,204,21,0.2)]' 
                      : cell.player === 'X' 
                        ? 'border-blue-500/50 bg-blue-500/5' 
                        : cell.player === 'O'
                          ? 'border-red-500/50 bg-red-500/5'
                          : 'border-slate-800 bg-slate-900/50'
                  }`}
                >
                  {cell.pokemon ? (
                    <>
                      <img 
                        src={cell.pokemon.imageUrl} 
                        alt={cell.pokemon.name}
                        className="w-4/5 h-4/5 object-contain drop-shadow-lg"
                        referrerPolicy="no-referrer"
                      />
                      <div className={`absolute top-1 right-2 font-black text-lg ${cell.player === 'X' ? 'text-blue-500' : 'text-red-500'}`}>
                        {cell.player}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 py-0.5 text-[8px] md:text-[10px] uppercase font-bold truncate px-1">
                        {cell.pokemon.name}
                      </div>
                    </>
                  ) : (
                    !winner && <div className="text-slate-700 font-black text-2xl opacity-20">?</div>
                  )}
                </motion.button>
              ))}
            </React.Fragment>
          ))}
        </div>

        {/* Search Modal / Overlay */}
        <AnimatePresence>
          {selectedCell && !winner && rowCategories.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Search size={20} className="text-yellow-400" />
                  Elegir Pokémon para {rowCategories[selectedCell.r].label} + {colCategories[selectedCell.c].label}
                </h3>
                <button onClick={() => setSelectedCell(null)} className="text-slate-500 hover:text-white">
                  <CloseIcon size={20} />
                </button>
              </div>

              <div className="relative" ref={searchRef}>
                <input
                  autoFocus
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Escribe el nombre del Pokémon..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                />
                
                {suggestions.length > 0 && (
                  <div className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
                    {suggestions.map(p => (
                      <button
                        key={p.name}
                        onClick={() => handleSelectPokemon(p.name)}
                        className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors flex items-center justify-between group"
                      >
                        <span className="capitalize font-medium">{p.name}</span>
                        <Check size={16} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {loading && (
                <div className="mt-4 flex items-center justify-center gap-2 text-slate-400">
                  <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  Validando...
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Winner Screen */}
        <AnimatePresence>
          {winner && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <div className="bg-slate-900 border-2 border-yellow-400 rounded-3xl p-8 md:p-12 text-center max-w-md w-full shadow-[0_0_50px_rgba(250,204,21,0.3)]">
                <div className="mb-6 inline-block p-4 bg-yellow-400/20 rounded-full">
                  <Trophy size={64} className="text-yellow-400" />
                </div>
                <h2 className="text-4xl font-display font-black mb-2">
                  {winner === 'Draw' ? '¡EMPATE!' : `¡GANADOR ${winner}!`}
                </h2>
                <p className="text-slate-400 mb-8">
                  {winner === 'Draw' 
                    ? 'Nadie logró el tres en línea esta vez.' 
                    : `¡El jugador ${winner} ha dominado el tablero Pokémon!`}
                </p>
                <button
                  onClick={resetGame}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-950 font-bold py-4 rounded-xl hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} />
                  Jugar de Nuevo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      <div className="mt-12 max-w-lg text-center text-slate-500 text-sm flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 font-bold text-slate-400">
          <Info size={16} />
          ¿Cómo jugar?
        </div>
        <p>
          Haz clic en una casilla y escribe el nombre de un Pokémon que cumpla las condiciones de su fila y columna. 
          ¡El primero en hacer 3 en línea (X o O) gana!
        </p>
      </div>
    </div>
  );
}

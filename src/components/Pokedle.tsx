import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Trophy, RotateCcw, Check, X as CloseIcon, AlertCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { Pokemon } from '../types';
import { getAllPokemonNames, getPokemonDetails } from '../services/pokemonService';

const MAX_GUESSES = 8;

export default function Pokedle() {
  const [mysteryPokemon, setMysteryPokemon] = useState<Pokemon | null>(null);
  const [guesses, setGuesses] = useState<Pokemon[]>([]);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<{ name: string; url: string }[]>([]);
  const [allPokemon, setAllPokemon] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAllPokemonNames().then(names => {
      setAllPokemon(names);
      startNewGame(names);
    });
  }, []);

  const startNewGame = async (pokemonList = allPokemon) => {
    if (pokemonList.length === 0) return;
    setLoading(true);
    try {
      // Pick a random pokemon from the full filtered list
      const randomIdx = Math.floor(Math.random() * pokemonList.length);
      const randomName = pokemonList[randomIdx].name;
      const details = await getPokemonDetails(randomName);
      setMysteryPokemon(details);
      setGuesses([]);
      setGameState('playing');
      setSearchTerm('');
      setError(null);
    } catch (err) {
      console.error("Error starting game", err);
    } finally {
      setLoading(false);
    }
  };

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

  const handleSelectPokemon = async (pokemonName: string) => {
    if (gameState !== 'playing' || !mysteryPokemon) return;
    
    // Check if already guessed
    if (guesses.some(g => g.name === pokemonName)) {
      setError(`¡Ya intentaste con ${pokemonName.toUpperCase()}!`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setError(null);
    setSearchTerm('');

    try {
      const details = await getPokemonDetails(pokemonName);
      const newGuesses = [details, ...guesses];
      setGuesses(newGuesses);

      if (details.id === mysteryPokemon.id) {
        setGameState('won');
      } else if (newGuesses.length >= MAX_GUESSES) {
        setGameState('lost');
      }
    } catch (err) {
      setError('Error al cargar el Pokémon.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (guessType: string | undefined, index: number) => {
    if (!mysteryPokemon) return 'bg-slate-800';
    const mysteryType = mysteryPokemon.types[index];
    
    if (guessType === mysteryType) return 'bg-green-500';
    if (guessType && mysteryPokemon.types.includes(guessType)) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center p-4 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-5xl font-display font-black text-white mb-2">
          POKÉDLE
        </h2>
        <p className="text-slate-400">Adivina el Pokémon misterioso en {MAX_GUESSES} intentos o menos.</p>
        <p className="text-sm text-slate-500 mt-1">Intentos restantes: <span className="font-bold text-white">{MAX_GUESSES - guesses.length}</span></p>
      </div>

      {/* Search Input */}
      {gameState === 'playing' && (
        <div className="w-full max-w-md relative mb-8" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Escribe un Pokémon..."
              disabled={loading || !mysteryPokemon}
              className="w-full bg-slate-800 border-2 border-slate-700 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-yellow-400 transition-all text-lg font-medium shadow-xl disabled:opacity-50"
            />
          </div>
          
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 w-full mt-2 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl"
              >
                {suggestions.map(p => (
                  <button
                    key={p.name}
                    onClick={() => handleSelectPokemon(p.name)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors flex items-center justify-between group"
                  >
                    <span className="capitalize font-medium text-white">{p.name}</span>
                    <Check size={16} className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm overflow-hidden"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Guesses Grid */}
      <div className="w-full overflow-x-auto pb-4">
        <div className="min-w-[800px] flex flex-col gap-2">
          {/* Header */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
            <div>Pokémon</div>
            <div>Región</div>
            <div>Tipo 1</div>
            <div>Tipo 2</div>
            <div>Etapa</div>
            <div>Rareza</div>
            <div>BST</div>
          </div>

          {/* Rows */}
          <AnimatePresence>
            {guesses.map((guess, idx) => (
              <motion.div 
                key={guess.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-7 gap-2"
              >
                {/* Pokemon Name/Img */}
                <div className="bg-slate-800 rounded-lg p-2 flex flex-col items-center justify-center border border-slate-700">
                  <img src={guess.imageUrl} alt={guess.name} className="w-12 h-12 object-contain" />
                  <span className="text-[10px] font-bold uppercase truncate w-full text-center mt-1">{guess.name}</span>
                </div>

                {/* Region */}
                <motion.div 
                  initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} transition={{ delay: 0.1 }}
                  className={`rounded-lg p-2 flex items-center justify-center text-xs font-bold text-white shadow-inner ${
                    guess.region === mysteryPokemon?.region ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {guess.region}
                </motion.div>

                {/* Type 1 */}
                <motion.div 
                  initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} transition={{ delay: 0.2 }}
                  className={`rounded-lg p-2 flex items-center justify-center text-xs font-bold text-white uppercase shadow-inner ${getTypeColor(guess.types[0], 0)}`}
                >
                  {guess.types[0]}
                </motion.div>

                {/* Type 2 */}
                <motion.div 
                  initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} transition={{ delay: 0.3 }}
                  className={`rounded-lg p-2 flex items-center justify-center text-xs font-bold text-white uppercase shadow-inner ${
                    (!guess.types[1] && !mysteryPokemon?.types[1]) ? 'bg-green-500' : getTypeColor(guess.types[1], 1)
                  }`}
                >
                  {guess.types[1] || 'Ninguno'}
                </motion.div>

                {/* Evolution Stage */}
                <motion.div 
                  initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} transition={{ delay: 0.4 }}
                  className={`rounded-lg p-2 flex items-center justify-center text-xs font-bold text-white shadow-inner ${
                    guess.evolutionStage === mysteryPokemon?.evolutionStage ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {guess.evolutionStage}
                </motion.div>

                {/* Rarity */}
                <motion.div 
                  initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} transition={{ delay: 0.5 }}
                  className={`rounded-lg p-2 flex items-center justify-center text-xs font-bold text-white shadow-inner ${
                    guess.rarity === mysteryPokemon?.rarity ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {guess.rarity}
                </motion.div>

                {/* BST */}
                <motion.div 
                  initial={{ rotateX: 90 }} animate={{ rotateX: 0 }} transition={{ delay: 0.6 }}
                  className={`rounded-lg p-2 flex items-center justify-center gap-1 text-sm font-bold text-white shadow-inner ${
                    guess.bst === mysteryPokemon?.bst ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {guess.bst}
                  {mysteryPokemon && guess.bst < mysteryPokemon.bst && <ArrowUp size={16} />}
                  {mysteryPokemon && guess.bst > mysteryPokemon.bst && <ArrowDown size={16} />}
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Game Over / Win Screen */}
      <AnimatePresence>
        {gameState !== 'playing' && mysteryPokemon && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md bg-slate-900 border-2 border-slate-700 rounded-2xl p-8 text-center shadow-2xl mt-8"
          >
            {gameState === 'won' ? (
              <>
                <div className="mb-4 inline-block p-4 bg-green-500/20 rounded-full">
                  <Trophy size={48} className="text-green-400" />
                </div>
                <h3 className="text-3xl font-black text-green-400 mb-2">¡LO ADIVINASTE!</h3>
                <p className="text-slate-400 mb-6">¡Descubriste a {mysteryPokemon.name.toUpperCase()} en {guesses.length} intentos!</p>
              </>
            ) : (
              <>
                <div className="mb-4 inline-block p-4 bg-red-500/20 rounded-full">
                  <CloseIcon size={48} className="text-red-400" />
                </div>
                <h3 className="text-3xl font-black text-red-400 mb-2">¡FIN DEL JUEGO!</h3>
                <p className="text-slate-400 mb-2">El Pokémon misterioso era:</p>
                <div className="flex flex-col items-center justify-center mb-6">
                  <img src={mysteryPokemon.imageUrl} alt={mysteryPokemon.name} className="w-32 h-32 object-contain drop-shadow-xl" />
                  <span className="text-2xl font-bold uppercase text-white">{mysteryPokemon.name}</span>
                </div>
              </>
            )}
            
            <button
              onClick={() => startNewGame()}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-950 font-bold py-4 rounded-xl hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <RotateCcw size={20} />
              Jugar de Nuevo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

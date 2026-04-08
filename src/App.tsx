import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Grid3X3, HelpCircle } from 'lucide-react';
import TrickiGrid from './components/TrickiGrid';
import Pokedle from './components/Pokedle';

export default function App() {
  const [currentView, setCurrentView] = useState<'tricki' | 'pokedle'>('tricki');

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      {/* Top Navigation */}
      <nav className="w-full bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-900"></div>
            </div>
            <h1 className="text-xl font-display font-black tracking-tight text-white">
              POKÉMON <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-500">MINIGAMES</span>
            </h1>
          </div>
          
          <div className="flex bg-slate-800 p-1 rounded-xl overflow-x-auto max-w-full">
            <button
              onClick={() => setCurrentView('tricki')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                currentView === 'tricki' 
                  ? 'bg-slate-700 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <Grid3X3 size={18} />
              Tricki Grid
            </button>
            <button
              onClick={() => setCurrentView('pokedle')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                currentView === 'pokedle' 
                  ? 'bg-slate-700 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
              }`}
            >
              <HelpCircle size={18} />
              Pokédle
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-x-hidden">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full"
        >
          {currentView === 'tricki' && <TrickiGrid />}
          {currentView === 'pokedle' && <Pokedle />}
        </motion.div>
      </main>
    </div>
  );
}

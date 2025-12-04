import React, { useState, useEffect, useMemo } from 'react';
import { INITIAL_GAMES, APP_NAME, STREAMER_NAME } from './constants';
import { Game, GameStatus, STATUS_LABELS } from './types';
import GameCard from './components/GameCard';
import AdminPanel from './components/AdminPanel';
import AssistantModal from './components/AssistantModal';

// Determine if we are in the "Dev" environment (AI Studio)
// Logic: If API_KEY is present in env, we allow admin. 
// Otherwise, check for URL hash override (user manual override).
const IS_DEV_ENV = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? true : false;

const App: React.FC = () => {
  const [games, setGames] = useState<Game[]>(INITIAL_GAMES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<GameStatus | 'ALL'>('ALL');
  
  // Modals state
  const [showAdmin, setShowAdmin] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);

  // Check permissions on mount
  useEffect(() => {
    // If not in standard dev env, check if user manually forced admin mode via hash
    if (!IS_DEV_ENV && window.location.hash === '#admin') {
       // We can enable a flag here if we want to support hash-based admin access on public site
       // But user asked to hide it on Github. 
       // So we will strictly stick to IS_DEV_ENV for the automatic button, 
       // but maybe allow a secret key sequence or just keep it simple.
       // Let's assume IS_DEV_ENV is the primary gatekeeper as requested.
    }
  }, []);

  // Filter Logic
  const filteredGames = useMemo(() => {
    return games.filter(game => {
      const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            game.genre?.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'ALL' || game.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [games, searchTerm, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = games.length;
    const completed = games.filter(g => g.status === GameStatus.COMPLETED).length;
    return { total, completed };
  }, [games]);

  return (
    <div className="min-h-screen bg-gaming-dark font-sans text-slate-200">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/30">
                <i className="fas fa-gamepad text-xl text-white"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight leading-none">{APP_NAME}</h1>
                <p className="text-xs text-slate-400">La bibliothèque de {STREAMER_NAME}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
               {/* Stats (Hidden on mobile) */}
               <div className="hidden md:flex gap-4 text-xs font-semibold text-slate-400 mr-4">
                 <span className="flex items-center gap-1"><i className="fas fa-layer-group"></i> {stats.total} Jeux</span>
                 <span className="flex items-center gap-1 text-green-400"><i className="fas fa-check-circle"></i> {stats.completed} Finis</span>
               </div>

               {/* Assistant Button */}
               {IS_DEV_ENV && (
                 <button 
                  onClick={() => setShowAssistant(true)}
                  className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-violet-400 flex items-center justify-center transition-colors border border-slate-700"
                  title="Ask AI"
                 >
                   <i className="fas fa-sparkles"></i>
                 </button>
               )}

               <a href="https://twitch.tv" target="_blank" rel="noreferrer" className="text-purple-400 hover:text-white transition-colors">
                 <i className="fab fa-twitch text-xl"></i>
               </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero / Filter Section */}
      <div className="bg-slate-900 border-b border-slate-800 pt-8 pb-8 px-4">
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search */}
              <div className="relative w-full md:w-96 group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-slate-500 group-focus-within:text-violet-400 transition-colors"></i>
                </div>
                <input 
                  type="text" 
                  placeholder="Rechercher un jeu, un genre..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-800 focus:ring-2 focus:ring-violet-500 focus:border-violet-500 sm:text-sm transition-all shadow-sm"
                />
              </div>

              {/* Status Filter */}
              <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 w-full md:w-auto hide-scrollbar">
                <button 
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${statusFilter === 'ALL' ? 'bg-white text-slate-900 border-white' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                >
                  Tous
                </button>
                {Object.values(GameStatus).map(status => {
                   const config = STATUS_LABELS[status];
                   const isActive = statusFilter === status;
                   return (
                     <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${isActive ? config.color + ' bg-opacity-20 border-opacity-100 ring-1' : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                     >
                       <i className={`fas ${config.icon}`}></i>
                       {config.label}
                     </button>
                   );
                })}
              </div>

            </div>
         </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGames.map(game => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 opacity-50">
            <i className="fas fa-ghost text-6xl mb-4 text-slate-600"></i>
            <p className="text-xl">Aucun jeu trouvé pour cette recherche.</p>
          </div>
        )}
      </main>

      {/* Floating Admin Button (Only visible in Dev/AI Studio environment) */}
      {IS_DEV_ENV && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
          <button 
            onClick={() => setShowAdmin(true)}
            className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-500/40 hover:scale-110 transition-transform flex items-center justify-center text-xl"
            title="Admin Panel (Dev Only)"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      )}

      {/* Modals */}
      {showAdmin && IS_DEV_ENV && (
        <AdminPanel games={games} setGames={setGames} onClose={() => setShowAdmin(false)} />
      )}

      {showAssistant && IS_DEV_ENV && (
        <AssistantModal games={games} onClose={() => setShowAssistant(false)} />
      )}
      
      {/* Public Assistant Trigger (Always available if API key were available, but per prompt requirement, we limit editing capabilities. 
          However, for a truly static site exported to GitHub, the AI features won't work without a proxy or exposed key.
          I will make the Assistant available ONLY if API key exists (Dev env) to satisfy the constraint of "exporting" removing sensitive features.) 
      */}

      <footer className="bg-slate-900 border-t border-slate-800 mt-12 py-8 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. Fait avec <i className="fas fa-heart text-red-500"></i> et React.</p>
        {!IS_DEV_ENV && <p className="text-xs mt-2 opacity-50">Mode Public (Github/Static)</p>}
        {IS_DEV_ENV && <p className="text-xs mt-2 text-yellow-500">Mode Édition (AI Studio)</p>}
      </footer>
    </div>
  );
};

export default App;
import React, { useState } from 'react';
import { Game, GameStatus, STATUS_LABELS } from '../types';
import { suggestGameDetails } from '../services/geminiService';

interface AdminPanelProps {
  games: Game[];
  setGames: React.Dispatch<React.SetStateAction<Game[]>>;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ games, setGames, onClose }) => {
  const [activeTab, setActiveTab] = useState<'add' | 'export'>('add');
  
  // Form State
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<GameStatus>(GameStatus.PLANNED);
  const [rating, setRating] = useState<string>('');
  const [description, setDescription] = useState('');
  const [genreInput, setGenreInput] = useState('');
  const [releaseYear, setReleaseYear] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // AI Auto-fill handler
  const handleAiFill = async () => {
    if (!title) return alert("Entrez d'abord un titre de jeu !");
    setIsLoadingAI(true);
    try {
      const details = await suggestGameDetails(title);
      if (details.description) setDescription(details.description);
      if (details.releaseYear) setReleaseYear(details.releaseYear.toString());
      if (details.genre) setGenreInput(details.genre.join(', '));
    } catch (e) {
      alert("Erreur lors de la récupération des infos IA");
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleAddGame = () => {
    if (!title) return;

    const newGame: Game = {
      id: Date.now().toString(),
      title,
      status,
      rating: rating ? parseFloat(rating) : undefined,
      description,
      genre: genreInput.split(',').map(g => g.trim()).filter(g => g),
      releaseYear: releaseYear ? parseInt(releaseYear) : undefined,
      coverUrl: `https://picsum.photos/300/400?random=${Date.now()}` // Placeholder logic
    };

    setGames(prev => [newGame, ...prev]);
    
    // Reset form
    setTitle('');
    setStatus(GameStatus.PLANNED);
    setRating('');
    setDescription('');
    setGenreInput('');
    setReleaseYear('');
    alert("Jeu ajouté ! N'oublie pas d'exporter le JSON.");
  };

  const generateJsonExport = () => {
    return JSON.stringify(games, null, 2);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateJsonExport());
    alert("JSON copié ! Colle-le dans constants.ts avant de push sur Github.");
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-2xl border border-slate-600 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
            <i className="fas fa-tools mr-2"></i>Admin Dashboard
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button 
            onClick={() => setActiveTab('add')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'add' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}
          >
            Ajouter un Jeu
          </button>
          <button 
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'export' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}
          >
            Exporter (JSON)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          
          {activeTab === 'add' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Titre du Jeu</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Ex: Elden Ring"
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    onClick={handleAiFill}
                    disabled={isLoadingAI || !title}
                    className="h-[50px] px-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded text-white font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                    title="Remplir auto via Gemini"
                  >
                    {isLoadingAI ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-magic"></i>}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Statut</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value as GameStatus)}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none"
                  >
                    {Object.values(GameStatus).map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                   <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Note (0-10)</label>
                   <input 
                    type="number" 
                    min="0" max="10" step="0.5"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Genres (séparés par virgule)</label>
                   <input 
                    type="text" 
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none"
                    placeholder="RPG, Action..."
                  />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Année de Sortie</label>
                   <input 
                    type="number"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none"
                  />
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-400 mb-1 uppercase">Description / Avis</label>
                 <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white outline-none"
                    placeholder="Mon avis sur le jeu..."
                 />
              </div>

              <button 
                onClick={handleAddGame}
                className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded shadow-lg transition-colors mt-4"
              >
                Ajouter à la liste
              </button>
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-200 text-sm">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                <strong>Important:</strong> Ce site est statique. Pour sauvegarder tes modifications, copie ce JSON et remplace le contenu de <code>INITIAL_GAMES</code> dans le fichier <code>constants.ts</code>.
              </div>
              <textarea 
                readOnly
                value={generateJsonExport()}
                className="w-full h-64 bg-slate-950 text-green-400 font-mono text-xs p-4 rounded border border-slate-700"
              />
              <button 
                onClick={copyToClipboard}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded transition-colors"
              >
                <i className="fas fa-copy mr-2"></i> Copier dans le presse-papier
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
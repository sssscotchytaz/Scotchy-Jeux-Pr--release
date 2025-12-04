import React from 'react';
import { Game, STATUS_LABELS } from '../types';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const statusConfig = STATUS_LABELS[game.status];

  return (
    <div className="bg-gaming-card rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 border border-slate-700 group flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={game.coverUrl || `https://picsum.photos/seed/${game.id}/300/200`} 
          alt={game.title}
          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
        />
        <div className="absolute top-2 right-2">
           <span className={`px-2 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${statusConfig.color}`}>
             <i className={`fas ${statusConfig.icon} mr-1`}></i>
             {statusConfig.label}
           </span>
        </div>
        {game.rating && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-yellow-400 px-2 py-1 rounded-lg text-sm font-bold flex items-center">
            <i className="fas fa-star mr-1"></i> {game.rating}/10
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-white leading-tight">{game.title}</h3>
          {game.releaseYear && <span className="text-xs text-slate-400 mt-1">{game.releaseYear}</span>}
        </div>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {game.genre?.map((g, idx) => (
            <span key={idx} className="text-[10px] uppercase tracking-wider text-slate-300 bg-slate-700 px-2 py-0.5 rounded">
              {g}
            </span>
          ))}
        </div>

        <p className="text-slate-400 text-sm line-clamp-3 mb-4 flex-grow">
          {game.description || "Aucune description disponible."}
        </p>

        {game.review && (
           <div className="mt-auto pt-3 border-t border-slate-700">
             <p className="text-xs text-slate-500 italic">"{game.review}"</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;
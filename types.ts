export enum GameStatus {
  COMPLETED = 'COMPLETED',
  PLAYING = 'PLAYING',
  PLANNED = 'PLANNED',
  DROPPED = 'DROPPED',
  ON_HOLD = 'ON_HOLD'
}

export interface Game {
  id: string;
  title: string;
  coverUrl?: string;
  status: GameStatus;
  rating?: number; // 0-10, optional
  review?: string;
  genre?: string[];
  platform?: string;
  completionDate?: string;
  releaseYear?: number;
  description?: string;
}

export const STATUS_LABELS: Record<GameStatus, { label: string; color: string; icon: string }> = {
  [GameStatus.COMPLETED]: { label: 'Terminé', color: 'bg-green-500/20 text-green-400 border-green-500/50', icon: 'fa-check-circle' },
  [GameStatus.PLAYING]: { label: 'En Cours', color: 'bg-purple-500/20 text-purple-400 border-purple-500/50', icon: 'fa-gamepad' },
  [GameStatus.PLANNED]: { label: 'Prévu', color: 'bg-blue-500/20 text-blue-400 border-blue-500/50', icon: 'fa-calendar' },
  [GameStatus.DROPPED]: { label: 'Abandonné', color: 'bg-red-500/20 text-red-400 border-red-500/50', icon: 'fa-ban' },
  [GameStatus.ON_HOLD]: { label: 'En Pause', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', icon: 'fa-pause' },
};
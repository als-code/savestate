import { Link } from 'react-router-dom';
import { getCoverUrl } from '../../utils/coverUrl';

export function GameCard({ game }) {
  return (
    <Link
      to={`/games/${game.id}`}
      className="overflow-hidden rounded-card border border-retro-border/80 bg-retro-surface/80 shadow-card backdrop-blur transition hover:border-retro-accent"
    >
      <div className="aspect-[3/4] w-full bg-black/20">
        {getCoverUrl(game.cover) ? (
          <img
            alt={game.title}
            className="h-full w-full object-cover"
            src={getCoverUrl(game.cover)}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            Sin carátula
          </div>
        )}
      </div>
      <div className="space-y-1 p-4">
        <h2 className="line-clamp-2 text-sm font-semibold">{game.title}</h2>
        <div className="text-xs text-gray-300">
          {game.release_year ? `Año ${game.release_year}` : 'Año desconocido'}
          {game.platform_name ? ` · ${game.platform_name}` : ''}
          {game.genre_name ? ` · ${game.genre_name}` : ''}
        </div>
      </div>
    </Link>
  );
}


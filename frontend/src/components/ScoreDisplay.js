import { FiStar, FiTrendingUp } from 'react-icons/fi';

const ScoreDisplay = ({ score, size = 'md', showDetails = false }) => {
  const getScoreLevel = (score) => {
    if (score >= 751) return { level: 'Platino', color: 'score-platinum', icon: '💎' };
    if (score >= 501) return { level: 'Oro', color: 'score-gold', icon: '🥇' };
    if (score >= 251) return { level: 'Plata', color: 'score-silver', icon: '🥈' };
    return { level: 'Bronce', color: 'score-bronze', icon: '🥉' };
  };

  const scoreInfo = getScoreLevel(score);
  
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3',
  };

  return (
    <div className="flex items-center space-x-3">
      <div className={`${scoreInfo.color} ${sizeClasses[size]} rounded-xl font-bold flex items-center space-x-2`}>
        <span>{scoreInfo.icon}</span>
        <span>{score}</span>
        <FiStar className="h-4 w-4" />
      </div>
      
      {showDetails && (
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            Score Katupyry {scoreInfo.level}
          </span>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <FiTrendingUp className="h-3 w-3" />
            <span>
              {score >= 751 ? 'Excelente' : 
               score >= 501 ? 'Muy Bueno' : 
               score >= 251 ? 'Bueno' : 'Regular'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay; 